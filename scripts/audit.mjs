import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import { gzipSync } from "node:zlib";

// Playwright owns the browser lifecycle, avoiding Chrome Launcher's Windows
// temporary-profile cleanup race. Run against a running production build.
const url = process.argv[2] || "http://127.0.0.1:3200";
const storyUrl = new URL("/invite", url);
storyUrl.hash = `v2.${gzipSync(
  JSON.stringify({
    host_name: "Isabella",
    event_date: "2035-06-19",
    event_time: "18:00",
    time_zone: "Asia/Tbilisi",
    address: "The Rose Garden · 24 Bloom Street",
    maps_url: "https://www.google.com/maps",
    message: "Come make a wish with me!",
    event_title: "Birthday celebration",
    dress_code: "A touch of pink",
    style: "scroll",
    scroll: {
      age: 16,
      portrait: { kind: "default" },
      closing_message: "See you there!",
      music: null,
    },
  }),
).toString("base64url")}`;
const port = await new Promise((resolve, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});
const browser = await chromium.launch({
  headless: true,
  args: [`--remote-debugging-port=${port}`],
});
try {
  await mkdir("test-results", { recursive: true });
  for (const [name, target] of [
    ["home", url],
    ["scroll", storyUrl.href],
  ]) {
    const result = await lighthouse(target, {
      port,
      onlyCategories: ["performance", "accessibility"],
      output: ["json", "html"],
      logLevel: "error",
    });
    if (!result || result.lhr.runtimeError)
      throw new Error(result?.lhr.runtimeError?.message || "Audit failed");
    await writeFile(
      `test-results/lighthouse-${name}.json`,
      JSON.stringify(result.lhr, null, 2),
    );
    await writeFile(`test-results/lighthouse-${name}.html`, result.report[1]);
    console.log(
      JSON.stringify(
        {
          page: name,
          url: target,
          performance: Math.round(
            result.lhr.categories.performance.score * 100,
          ),
          accessibility: Math.round(
            result.lhr.categories.accessibility.score * 100,
          ),
          lcp: result.lhr.audits["largest-contentful-paint"].displayValue,
          cls: result.lhr.audits["cumulative-layout-shift"].displayValue,
          report: `test-results/lighthouse-${name}.html`,
        },
        null,
        2,
      ),
    );
  }
} finally {
  await browser.close();
}
