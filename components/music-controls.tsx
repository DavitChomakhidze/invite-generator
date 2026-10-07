"use client";
import type { AudioStatus } from "@/lib/audio-segment";

export function MusicControls({
  status,
  muted,
  error,
  play,
  pause,
  replay,
  toggleMute,
}: {
  status: AudioStatus;
  muted: boolean;
  error: string;
  play: () => void;
  pause: () => void;
  replay: () => void;
  toggleMute: () => void;
}) {
  return (
    <div className="music-controls" aria-label="Music controls">
      {status === "error" ? (
        <p role="status">{error}</p>
      ) : (
        <>
          <button
            type="button"
            onClick={
              status === "playing" || status === "loading"
                ? pause
                : status === "finished"
                  ? replay
                  : play
            }
          >
            {status === "loading"
              ? "Cancel music"
              : status === "playing"
                ? "Pause music"
                : status === "finished"
                  ? "Replay music"
                  : "Play music"}
          </button>
          <button type="button" aria-pressed={muted} onClick={toggleMute}>
            {muted ? "Unmute music" : "Mute music"}
          </button>
          <span role="status">
            {status === "loading" ? "Preparing music…" : ""}
          </span>
        </>
      )}
    </div>
  );
}
