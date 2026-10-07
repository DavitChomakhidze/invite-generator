import { afterEach, describe, expect, it, vi } from "vitest";
import { AudioSegmentPlayer } from "@/lib/audio-segment";
import type { MusicTrack } from "@/lib/music-catalog";

const track: MusicTrack = {
  id: "test-tone",
  title: "Synthetic test tone",
  file: "/test-tone.wav",
  duration_seconds: 90,
  license: { name: "Original test fixture", source_url: "local:test" },
};
class FakeAudio extends EventTarget {
  src = "";
  preload = "";
  loop = false;
  muted = false;
  readyState = 0;
  duration = 90;
  currentTime = 0;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  load = vi.fn();
  removeAttribute = vi.fn(() => {
    this.src = "";
  });
  metadata() {
    this.readyState = 2;
    this.dispatchEvent(new Event("loadedmetadata"));
  }
}
function setup() {
  const audio = new FakeAudio();
  const factory = vi.fn(() => audio as unknown as HTMLAudioElement);
  const player = new AudioSegmentPlayer(
    track,
    { song_id: track.id, start_seconds: 38, end_seconds: 75 },
    factory,
  );
  return { audio, factory, player };
}
afterEach(() => vi.useRealTimers());
describe("native audio segment lifecycle", () => {
  it("waits for seekable data and ignores an early seek that snaps to zero", async () => {
    const { audio, player } = setup();
    player.play();
    await Promise.resolve();
    audio.readyState = 1;
    audio.dispatchEvent(new Event("loadedmetadata"));
    audio.dispatchEvent(new Event("seeked"));
    expect(audio.muted).toBe(true);
    expect(player.getSnapshot().status).toBe("loading");
    audio.readyState = 2;
    audio.dispatchEvent(new Event("loadeddata"));
    expect(audio.currentTime).toBe(38);
    audio.dispatchEvent(new Event("seeked"));
    expect(player.getSnapshot().status).toBe("playing");
    expect(audio.muted).toBe(false);
    player.dispose();
  });
  it("rejects invalid segments before instantiating media", () => {
    const factory = vi.fn();
    const player = new AudioSegmentPlayer(
      track,
      { song_id: track.id, start_seconds: NaN, end_seconds: 10 },
      factory,
    );
    player.play();
    expect(player.getSnapshot().status).toBe("error");
    expect(factory).not.toHaveBeenCalled();
  });
  it("does not instantiate or fetch audio before prepare/play", () => {
    const { player, factory } = setup();
    expect(factory).not.toHaveBeenCalled();
    player.prepare();
    expect(factory).toHaveBeenCalledOnce();
  });
  it("selects the source and stays silent until seeking to the start completes", async () => {
    const { audio, player } = setup();
    player.play();
    expect(audio.src).toBe(track.file);
    expect(audio.play).toHaveBeenCalledOnce();
    expect(audio.muted).toBe(true);
    await Promise.resolve();
    audio.metadata();
    expect(audio.currentTime).toBe(38);
    expect(audio.muted).toBe(true);
    audio.dispatchEvent(new Event("seeked"));
    expect(audio.muted).toBe(false);
    expect(player.getSnapshot().status).toBe("playing");
    player.dispose();
  });
  it("pauses, resumes, respects mute, stops at the end and replays from start", async () => {
    const { audio, player } = setup();
    audio.readyState = 2;
    player.play();
    audio.dispatchEvent(new Event("seeked"));
    await Promise.resolve();
    player.toggleMute();
    expect(audio.muted).toBe(true);
    audio.currentTime = 50;
    player.pause();
    expect(player.getSnapshot().status).toBe("paused");
    player.play();
    await Promise.resolve();
    expect(audio.currentTime).toBe(50);
    player.toggleMute();
    expect(audio.muted).toBe(false);
    audio.currentTime = 75;
    audio.dispatchEvent(new Event("timeupdate"));
    expect(player.getSnapshot().status).toBe("finished");
    player.replay();
    expect(audio.currentTime).toBe(38);
    player.dispose();
  });
  it("uses an end timer even without timeupdate events", async () => {
    vi.useFakeTimers();
    const { audio, player } = setup();
    audio.readyState = 2;
    player.play();
    audio.dispatchEvent(new Event("seeked"));
    await Promise.resolve();
    audio.currentTime = 76;
    vi.advanceTimersByTime(500);
    expect(player.getSnapshot().status).toBe("finished");
    expect(vi.getTimerCount()).toBe(0);
    player.dispose();
  });
  it("handles rejection and insufficient metadata without throwing", async () => {
    const { audio, player } = setup();
    audio.play.mockRejectedValueOnce(new Error("NotAllowedError"));
    player.play();
    await Promise.resolve();
    await Promise.resolve();
    expect(player.getSnapshot().status).toBe("error");
    player.dispose();
    const other = setup();
    other.player.play();
    other.audio.duration = 40;
    other.audio.metadata();
    expect(other.player.getSnapshot().status).toBe("error");
    other.player.dispose();
  });
  it("ignores stale promises and releases listeners, timers and the source", async () => {
    vi.useFakeTimers();
    const { audio, player } = setup();
    let resolve!: () => void;
    audio.play.mockImplementation(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    player.play();
    player.dispose();
    resolve();
    await Promise.resolve();
    expect(player.getSnapshot().status).toBe("idle");
    expect(audio.src).toBe("");
    audio.dispatchEvent(new Event("error"));
    expect(player.getSnapshot().status).toBe("idle");
    expect(vi.getTimerCount()).toBe(0);
  });
  it("pauses on visibility loss without automatically resuming", async () => {
    const document = new EventTarget() as EventTarget & { hidden: boolean };
    document.hidden = false;
    vi.stubGlobal("document", document);
    try {
      const { audio, player } = setup();
      audio.readyState = 2;
      player.play();
      audio.dispatchEvent(new Event("seeked"));
      await Promise.resolve();
      document.hidden = true;
      document.dispatchEvent(new Event("visibilitychange"));
      expect(player.getSnapshot().status).toBe("paused");
      document.hidden = false;
      document.dispatchEvent(new Event("visibilitychange"));
      expect(player.getSnapshot().status).toBe("paused");
      player.dispose();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
