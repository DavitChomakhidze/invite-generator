"use client";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { AudioSegmentPlayer } from "@/lib/audio-segment";
import type { MusicTrack } from "@/lib/music-catalog";
import type { MusicSegment } from "@/lib/invitation-model";

export function useAudioSegment(track: MusicTrack, segment: MusicSegment) {
  const player = useMemo(
    () => new AudioSegmentPlayer(track, segment),
    [track, segment],
  );
  const state = useSyncExternalStore(
    player.subscribe,
    player.getSnapshot,
    player.getSnapshot,
  );
  useEffect(() => () => player.dispose(), [player]);
  return {
    ...state,
    play: player.play,
    pause: player.pause,
    replay: player.replay,
    toggleMute: player.toggleMute,
    prepare: player.prepare,
  };
}
