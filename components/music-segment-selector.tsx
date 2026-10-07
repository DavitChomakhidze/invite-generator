"use client";
import { useEffect } from "react";
import type { InvitationErrors, MusicSegment } from "@/lib/invitation-model";
import {
  musicCatalog,
  findMusicTrack,
  type MusicTrack,
} from "@/lib/music-catalog";
import { useAudioSegment } from "@/lib/use-audio-segment";
import { MusicControls } from "@/components/music-controls";

export function formatSongTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "—";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export function MusicSegmentSelector({
  value,
  onChange,
  errors,
}: {
  value: MusicSegment | null;
  onChange: (segment: MusicSegment | null) => void;
  errors: InvitationErrors;
}) {
  const track = value && findMusicTrack(value.song_id);
  return (
    <div className="form-field">
      <label htmlFor="scroll.music.song_id">Background music</label>
      <select
        id="scroll.music.song_id"
        name="scroll.music.song_id"
        value={value?.song_id || ""}
        disabled={!musicCatalog.length}
        aria-invalid={Boolean(errors["scroll.music.song_id"])}
        aria-describedby={
          errors["scroll.music.song_id"] ? "music-song-error" : "music-help"
        }
        onChange={(e) => {
          const selected = findMusicTrack(e.target.value);
          onChange(
            selected
              ? {
                  song_id: selected.id,
                  start_seconds: 0,
                  end_seconds: Math.min(30, selected.duration_seconds),
                }
              : null,
          );
        }}
      >
        <option value="">No music</option>
        {musicCatalog.map((song) => (
          <option key={song.id} value={song.id}>
            {song.title}
          </option>
        ))}
      </select>
      <p id="music-help" className="field-help">
        {musicCatalog.length
          ? "Choose the part you want to play. Guests choose whether to listen."
          : "No approved songs are available yet. Your invitation will open without music."}
      </p>
      {errors["scroll.music.song_id"] && (
        <p id="music-song-error" className="field-error">
          {errors["scroll.music.song_id"]}
        </p>
      )}
      {track && value && (
        <SegmentEditor
          key={track.id}
          track={track}
          segment={value}
          onChange={onChange}
          errors={errors}
        />
      )}
    </div>
  );
}

function SegmentEditor({
  track,
  segment,
  onChange,
  errors,
}: {
  track: MusicTrack;
  segment: MusicSegment;
  onChange: (segment: MusicSegment) => void;
  errors: InvitationErrors;
}) {
  const audio = useAudioSegment(track, segment);
  const { prepare } = audio;
  useEffect(() => {
    prepare();
  }, [prepare]);
  return (
    <div className="segment-editor">
      {(["start_seconds", "end_seconds"] as const).map((key) => {
        const path = `scroll.music.${key}`;
        const start = key === "start_seconds";
        return (
          <div className="form-field" key={key}>
            <label htmlFor={path}>
              {start ? "Start position" : "End position"} ·{" "}
              {formatSongTime(segment[key])}
            </label>
            <input
              id={path}
              name={path}
              type="number"
              min={0}
              max={track.duration_seconds}
              step={1}
              value={Number.isFinite(segment[key]) ? segment[key] : ""}
              aria-invalid={Boolean(errors[path])}
              aria-describedby={errors[path] ? `${path}-error` : undefined}
              onChange={(e) =>
                onChange({
                  ...segment,
                  [key]: e.target.value === "" ? NaN : Number(e.target.value),
                })
              }
            />
            <input
              type="range"
              aria-label={
                start ? "Start position timeline" : "End position timeline"
              }
              min={
                start
                  ? 0
                  : Math.min(track.duration_seconds, segment.start_seconds + 1)
              }
              max={
                start
                  ? Math.max(0, segment.end_seconds - 1)
                  : track.duration_seconds
              }
              step={1}
              value={Number.isFinite(segment[key]) ? segment[key] : 0}
              onChange={(e) =>
                onChange({ ...segment, [key]: Number(e.target.value) })
              }
            />
            {errors[path] && (
              <p id={`${path}-error`} className="field-error">
                {errors[path]}
              </p>
            )}
          </div>
        );
      })}
      {audio.duration !== null && (
        <p className="field-help">
          Song length: {formatSongTime(audio.duration)}
        </p>
      )}
      {audio.error ? (
        <p role="status" className="field-error">
          {audio.error} Select No music to continue without sound.
        </p>
      ) : (
        <div aria-label="Audio preview">
          <button
            className="button secondary"
            type="button"
            disabled={
              audio.duration === null ||
              !Number.isFinite(segment.start_seconds) ||
              segment.end_seconds - segment.start_seconds < 1
            }
            onClick={
              audio.status === "playing" || audio.status === "loading"
                ? audio.pause
                : audio.replay
            }
          >
            {audio.status === "playing" || audio.status === "loading"
              ? "Pause segment"
              : "Preview segment"}
          </button>
          {audio.duration !== null && <MusicControls {...audio} />}
        </div>
      )}
      {track.license.attribution && (
        <p className="field-help">{track.license.attribution}</p>
      )}
    </div>
  );
}
