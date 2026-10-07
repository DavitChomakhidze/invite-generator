import type { MusicTrack } from "@/lib/music-catalog";
import type { MusicSegment } from "@/lib/invitation-model";

export type AudioStatus =
  "idle" | "loading" | "playing" | "paused" | "finished" | "error";
export type AudioSnapshot = {
  status: AudioStatus;
  muted: boolean;
  currentTime: number;
  duration: number | null;
  error: string;
};

// Imperative native-media lifecycle, shared by the editor and guest hook.
// Creation is deferred so SSR and silent invitations never instantiate/fetch audio.
export class AudioSegmentPlayer {
  private audio: HTMLAudioElement | null = null;
  private listeners = new Set<() => void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private generation = 0;
  private seeking = false;
  private wantsPlay = false;
  private playReady = false;
  private seekTarget = 0;
  private seekAttempts = 0;
  private cleanup: (() => void) | undefined;
  private snapshot: AudioSnapshot;

  constructor(
    private track: MusicTrack,
    private segment: MusicSegment,
    private createAudio: () => HTMLAudioElement = () => new Audio(),
  ) {
    this.snapshot = {
      status: "idle",
      muted: false,
      currentTime: segment.start_seconds,
      duration: null,
      error: "",
    };
  }
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private update(patch: Partial<AudioSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((listener) => listener());
  }
  private clearTimer() {
    clearTimeout(this.timer);
    this.timer = undefined;
  }
  private fail(
    message = "Music unavailable. You can still enjoy the invitation.",
  ) {
    this.wantsPlay = false;
    this.generation++;
    this.clearTimer();
    this.audio?.pause();
    this.update({ status: "error", error: message });
  }
  private create() {
    if (this.audio) return this.audio;
    const audio = this.createAudio();
    this.audio = audio;
    audio.preload = "none";
    audio.src = this.track.file;
    audio.loop = false;
    const metadata = () => {
      if (
        !Number.isFinite(audio.duration) ||
        audio.duration < this.segment.end_seconds - 0.05
      ) {
        this.fail(
          "The selected music segment is unavailable. The invitation is still ready to read.",
        );
        return;
      }
      this.update({ duration: audio.duration });
      if (this.wantsPlay && audio.readyState >= 2) this.seekForPlayback();
    };
    const ready = () => {
      if (this.wantsPlay && this.seeking) this.seekForPlayback();
    };
    const seeked = () => {
      if (!this.wantsPlay) return;
      // Some browsers snap a seek back to zero before data is seekable.
      // Do not expose sound until a subsequent ready/seek event confirms it.
      if (audio.currentTime < this.seekTarget - 0.05) {
        if (audio.readyState >= 2) this.seekForPlayback();
        return;
      }
      this.seeking = false;
      audio.muted = this.snapshot.muted;
      this.markPlaying();
    };
    const progress = () => {
      if (this.seeking || !this.wantsPlay) return;
      if (audio.currentTime >= this.segment.end_seconds) this.finish();
      else this.update({ currentTime: audio.currentTime });
    };
    const ended = () => {
      if (this.wantsPlay) this.finish();
    };
    const error = () => this.fail();
    const hidden = () => {
      if (document.hidden && this.wantsPlay) this.pause();
    };
    audio.addEventListener("loadedmetadata", metadata);
    audio.addEventListener("loadeddata", ready);
    audio.addEventListener("canplay", ready);
    audio.addEventListener("seeked", seeked);
    audio.addEventListener("timeupdate", progress);
    audio.addEventListener("ended", ended);
    audio.addEventListener("error", error);
    if (typeof document !== "undefined")
      document.addEventListener("visibilitychange", hidden);
    this.cleanup = () => {
      audio.removeEventListener("loadedmetadata", metadata);
      audio.removeEventListener("loadeddata", ready);
      audio.removeEventListener("canplay", ready);
      audio.removeEventListener("seeked", seeked);
      audio.removeEventListener("timeupdate", progress);
      audio.removeEventListener("ended", ended);
      audio.removeEventListener("error", error);
      if (typeof document !== "undefined")
        document.removeEventListener("visibilitychange", hidden);
    };
    return audio;
  }
  prepare = () => {
    const audio = this.create();
    audio.preload = "metadata";
    audio.load();
  };
  private seekForPlayback() {
    const audio = this.audio!;
    const target = this.seekTarget;
    const bounded =
      target >= this.segment.end_seconds
        ? this.segment.start_seconds
        : Math.max(this.segment.start_seconds, target);
    this.seekTarget = bounded;
    try {
      if (Math.abs(audio.currentTime - bounded) > 0.01) {
        if (audio.seeking) return;
        if (++this.seekAttempts > 3) {
          this.fail();
          return;
        }
        this.seeking = true;
        audio.currentTime = bounded;
      } else {
        this.seeking = false;
        audio.muted = this.snapshot.muted;
        this.markPlaying();
      }
    } catch {
      this.fail();
    }
  }
  private markPlaying() {
    if (!this.wantsPlay || !this.playReady || this.seeking) return;
    this.update({
      status: "playing",
      currentTime: this.audio!.currentTime,
      error: "",
    });
    this.scheduleEnd();
  }
  private scheduleEnd() {
    this.clearTimer();
    if (!this.wantsPlay || !this.audio || this.seeking) return;
    const remaining = this.segment.end_seconds - this.audio.currentTime;
    if (remaining <= 0) {
      this.finish();
      return;
    }
    this.timer = setTimeout(
      () => this.scheduleEnd(),
      Math.max(50, Math.min(remaining * 1000, 500)),
    );
  }
  play = () => {
    if (
      !Number.isFinite(this.segment.start_seconds) ||
      !Number.isFinite(this.segment.end_seconds) ||
      this.segment.start_seconds < 0 ||
      this.segment.end_seconds - this.segment.start_seconds < 1 ||
      this.segment.end_seconds > this.track.duration_seconds ||
      this.segment.song_id !== this.track.id
    ) {
      this.fail("Choose a valid music segment before playing.");
      return;
    }
    const audio = this.create();
    if (
      this.snapshot.status === "loading" ||
      this.snapshot.status === "playing"
    )
      return;
    const current = ++this.generation;
    this.wantsPlay = true;
    this.playReady = false;
    this.seekAttempts = 0;
    this.seekTarget =
      this.snapshot.status === "paused"
        ? this.snapshot.currentTime
        : this.segment.start_seconds;
    this.seeking = true;
    audio.muted = true; // Never play an audible prefix while metadata/seeking loads.
    if (audio.readyState >= 2) this.seekForPlayback();
    this.update({ status: "loading", error: "" });
    // Called synchronously by a user interaction, preserving browser activation.
    try {
      void audio
        .play()
        .then(() => {
          if (current !== this.generation || !this.wantsPlay) return;
          this.playReady = true;
          this.markPlaying();
        })
        .catch(() => {
          if (current === this.generation) this.fail();
        });
    } catch {
      this.fail();
    }
  };
  pause = () => {
    this.generation++;
    this.wantsPlay = false;
    this.clearTimer();
    this.audio?.pause();
    this.update({
      status: "paused",
      currentTime: this.seeking
        ? this.segment.start_seconds
        : (this.audio?.currentTime ?? this.segment.start_seconds),
    });
  };
  private finish() {
    this.generation++;
    this.wantsPlay = false;
    this.clearTimer();
    this.audio?.pause();
    this.update({ status: "finished", currentTime: this.segment.end_seconds });
  }
  replay = () => {
    this.pause();
    this.update({
      status: "finished",
      currentTime: this.segment.start_seconds,
    });
    this.play();
  };
  toggleMute = () => {
    const muted = !this.snapshot.muted;
    if (this.audio && !this.seeking) this.audio.muted = muted;
    this.update({ muted });
  };
  dispose = () => {
    this.generation++;
    this.wantsPlay = false;
    this.clearTimer();
    this.cleanup?.();
    this.cleanup = undefined;
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute("src");
      this.audio.load();
    }
    this.audio = null;
    this.update({ status: "idle", duration: null });
  };
}
