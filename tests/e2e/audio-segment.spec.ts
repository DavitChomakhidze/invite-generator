import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { createServer, type Server } from "node:http";

// Original synthesized tone, generated only inside tests. No music asset is
// downloaded, licensed by inference, or installed in the production catalog.
function syntheticWav() {
  const rate = 8000,
    samples = rate * 4;
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++)
    wav.writeInt16LE(
      Math.round(Math.sin((2 * Math.PI * 440 * i) / rate) * 500),
      44 + i * 2,
    );
  return wav;
}
const controller = ts
  .transpileModule(
    readFileSync("lib/audio-segment.ts", "utf8").replace(
      "export class AudioSegmentPlayer",
      "class AudioSegmentPlayer",
    ),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
    },
  )
  .outputText.replace(/export\s*\{\s*\};?/g, "");

let server: Server;
let fixtureUrl: string;
let requests = 0;
test.beforeAll(async () => {
  // Windows WebKit's media engine bypasses Playwright request interception.
  // Serve the original synthetic fixture over a real, test-only HTTP socket.
  const wav = syntheticWav();
  server = createServer((request, response) => {
    requests++;
    const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range || "");
    if (range) {
      const start = Number(range[1]);
      const end = Math.min(
        range[2] ? Number(range[2]) : wav.length - 1,
        wav.length - 1,
      );
      response.writeHead(206, {
        "Content-Type": "audio/wav",
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes ${start}-${end}/${wav.length}`,
        "Content-Length": end - start + 1,
      });
      response.end(wav.subarray(start, end + 1));
    } else {
      response.writeHead(200, {
        "Content-Type": "audio/wav",
        "Accept-Ranges": "bytes",
        "Content-Length": wav.length,
      });
      response.end(wav);
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Test audio server failed to start.");
  fixtureUrl = `http://127.0.0.1:${address.port}/synthetic-test.wav`;
});
test.afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test("native browser playback seeks, mutes, pauses, stops and replays the chosen segment", async ({
  page,
}) => {
  await page.route("**/audio-fixture", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<html lang="en"><title>Audio test</title><button id="play">Play</button><button id="pause">Pause</button><button id="mute">Mute</button><button id="dispose">Dispose</button><output id="status"></output></html>',
    }),
  );
  requests = 0;
  await page.goto(new URL("/audio-fixture", fixtureUrl).href);
  await page.addScriptTag({
    content:
      controller +
      `
    const track = { id: 'test-tone', title: 'Test tone', file: ${JSON.stringify(fixtureUrl)}, duration_seconds: 4, license: { name: 'Original test fixture', source_url: 'local:test' } };
    const player = new AudioSegmentPlayer(track, { song_id: 'test-tone', start_seconds: 1, end_seconds: 2 }, () => { window.fixtureAudio = new Audio(); return window.fixtureAudio; });
    window.fixturePlayer = player;
    player.subscribe(() => { document.querySelector('#status').textContent = player.getSnapshot().status; });
    document.querySelector('#play').onclick = player.replay;
    document.querySelector('#pause').onclick = player.pause;
    document.querySelector('#mute').onclick = player.toggleMute;
    document.querySelector('#dispose').onclick = player.dispose;
  `,
  });
  expect(requests).toBe(0);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator("#status")).toHaveText("playing");
  const media = () =>
    page.evaluate(() => {
      const audio = (window as unknown as { fixtureAudio: HTMLAudioElement })
        .fixtureAudio;
      return {
        time: audio.currentTime,
        muted: audio.muted,
        paused: audio.paused,
        src: audio.getAttribute("src"),
      };
    });
  expect((await media()).time).toBeGreaterThanOrEqual(1);
  await page.getByRole("button", { name: "Mute", exact: true }).click();
  expect((await media()).muted).toBe(true);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.locator("#status")).toHaveText("paused");
  expect((await media()).paused).toBe(true);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator("#status")).toHaveText("finished");
  const ended = await media();
  expect(ended.paused).toBe(true);
  expect(ended.time).toBeLessThan(2.3);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.locator("#status")).toHaveText("playing");
  await page.getByRole("button", { name: "Mute", exact: true }).click();
  expect((await media()).muted).toBe(false);
  await page.getByRole("button", { name: "Dispose", exact: true }).click();
  expect((await media()).src).toBeNull();
});

test("a native media load failure becomes a nonthrowing error state", async ({
  page,
}) => {
  await page.goto("/");
  await page.route("**/missing-test.wav", (route) =>
    route.fulfill({ status: 404, body: "missing" }),
  );
  await page.addScriptTag({
    content:
      controller +
      `
    const button = document.createElement('button'); button.textContent = 'Test unavailable audio'; document.body.appendChild(button);
    const player = new AudioSegmentPlayer({ id: 'missing', file: '/missing-test.wav', duration_seconds: 4 }, { song_id: 'missing', start_seconds: 1, end_seconds: 2 });
    player.subscribe(() => { button.dataset.status = player.getSnapshot().status; }); button.onclick = player.play;
  `,
  });
  const button = page.getByRole("button", { name: "Test unavailable audio" });
  await button.click();
  await expect(button).toHaveAttribute("data-status", "error");
  await expect(
    page.getByRole("heading", { name: "Make it yours" }),
  ).toBeVisible();
});
