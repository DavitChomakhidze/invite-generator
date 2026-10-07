"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { ScrollInvitationData } from "@/lib/invitation-model";
import { StoryOpening } from "@/components/scroll-story/story-opening";
import { StorySections } from "@/components/scroll-story/story-sections";
import styles from "@/components/scroll-story/story.module.css";
import { findMusicTrack, type MusicTrack } from "@/lib/music-catalog";
import { useAudioSegment } from "@/lib/use-audio-segment";
import { MusicControls } from "@/components/music-controls";
import type { MusicSegment } from "@/lib/invitation-model";
import { useStoryMotion } from "@/lib/use-story-motion";

export function ScrollInvitation({
  invite,
  preview = false,
  scrollRoot,
}: {
  invite: ScrollInvitationData;
  preview?: boolean;
  scrollRoot?: RefObject<HTMLDivElement | null>;
}) {
  const track =
    !preview && invite.scroll.music
      ? findMusicTrack(invite.scroll.music.song_id)
      : undefined;
  return track && invite.scroll.music ? (
    <MusicalStory
      invite={invite}
      scrollRoot={scrollRoot}
      track={track}
      segment={invite.scroll.music}
    />
  ) : (
    <Story invite={invite} preview={preview} scrollRoot={scrollRoot} />
  );
}

function MusicalStory({
  track,
  segment,
  ...props
}: {
  invite: ScrollInvitationData;
  scrollRoot?: RefObject<HTMLDivElement | null>;
  track: MusicTrack;
  segment: MusicSegment;
}) {
  const audio = useAudioSegment(track, segment);
  return (
    <Story
      {...props}
      onMusicOpen={audio.play}
      musicControls={
        <>
          <MusicControls {...audio} />
          {track.license.attribution && (
            <p className="music-attribution">{track.license.attribution}</p>
          )}
        </>
      }
    />
  );
}

function Story({
  invite,
  preview = false,
  scrollRoot,
  onMusicOpen,
  musicControls,
}: {
  invite: ScrollInvitationData;
  preview?: boolean;
  scrollRoot?: RefObject<HTMLDivElement | null>;
  onMusicOpen?: () => void;
  musicControls?: React.ReactNode;
}) {
  const [opened, setOpened] = useState(false);
  const [decorationsPaused, setDecorationsPaused] = useState(false);
  const story = useRef<HTMLElement>(null);
  useStoryMotion(story, scrollRoot, decorationsPaused, opened);
  const sections = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (opened) sections.current?.focus({ preventScroll: true });
  }, [opened]);
  return (
    <article
      ref={story}
      // Decorations autoplay by design; section reveals still handle reduced motion.
      className={`${styles.story} ${preview ? styles.preview : ""} motion-requested`}
      aria-label="Scroll Story"
    >
      <div className={styles.motionToolbar}>
        <button
          type="button"
          className={styles.motionToggle}
          aria-pressed={decorationsPaused}
          onClick={() => setDecorationsPaused((paused) => !paused)}
        >
          {decorationsPaused ? "Resume decorations" : "Pause decorations"}
        </button>
      </div>
      <StoryOpening
        invite={invite}
        opened={opened}
        hasMusic={Boolean(onMusicOpen)}
        onOpen={(music) => {
          setOpened(true);
          if (music) onMusicOpen?.();
        }}
      />
      {opened && (
        <div ref={sections} tabIndex={-1} className={styles.sections}>
          <StorySections invite={invite} scrollRoot={scrollRoot} />
        </div>
      )}
      {opened && musicControls && (
        <div className={styles.musicDock}>{musicControls}</div>
      )}
    </article>
  );
}
