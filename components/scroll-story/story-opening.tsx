"use client";
import { motion } from "motion/react";
import { useStoryReducedMotion } from "@/lib/use-story-motion";
import type { ScrollInvitationData } from "@/lib/invitation-model";
import { storyOpeningTiming, storyTitleTiming } from "@/lib/story-animation";
import { Portrait } from "@/components/portrait";
import { CutoutText } from "./cutout-text";
import { DiscoBall, Kiss, PartyGlass, PartyHat, RibbonBow } from "./party-art";
import styles from "./story.module.css";
import { StorySparkles } from "./story-sparkles";

export function StoryOpening({
  invite,
  opened,
  hasMusic,
  onOpen,
}: {
  invite: ScrollInvitationData;
  opened: boolean;
  hasMusic: boolean;
  onOpen: (withMusic: boolean) => void;
}) {
  const reduced = useStoryReducedMotion();
  return (
    <section
      className={styles.hero}
      aria-label="Story opening"
      data-motion-scope
    >
      <div className={styles.heroDecor} aria-hidden="true">
        <StorySparkles opening />
        <RibbonBow className={`${styles.bow} ${styles.ambient}`} />
        <DiscoBall className={`${styles.disco} ${styles.ambient}`} />
        <Kiss className={`${styles.kissLeft} ${styles.ambient}`} />
        <Kiss className={`${styles.kissRight} ${styles.ambient}`} />
        <PartyGlass className={`${styles.glassLeft} ${styles.ambient}`} />
        <PartyGlass className={`${styles.glassRight} ${styles.ambient}`} />
      </div>
      <p className={styles.inviteLabel}>YOU’RE INVITED!</p>
      <motion.div
        className={styles.portraitFrame}
        initial={reduced ? false : { scale: 0.95, rotate: -5 }}
        animate={{ scale: 1, rotate: -3 }}
        transition={storyOpeningTiming}
      >
        <Portrait
          portrait={invite.scroll.portrait}
          name={invite.host_name}
          className={styles.portrait}
        />
        <PartyHat className={`${styles.partyHat} ${styles.ambient}`} />
      </motion.div>
      {invite.scroll.age !== undefined && (
        <motion.span
          className={styles.age}
          role="img"
          aria-label={`Turning ${invite.scroll.age}`}
          initial={reduced ? false : { opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: -4 }}
          transition={storyOpeningTiming}
        >
          {invite.scroll.age}
        </motion.span>
      )}
      <motion.h2
        className={styles.name}
        aria-label={invite.host_name || "Your name"}
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={storyOpeningTiming}
      >
        <CutoutText text={invite.host_name || "Your name"} />
      </motion.h2>
      <motion.p
        className={styles.birthdayLabel}
        initial={reduced ? false : { opacity: 0, y: 12, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={storyTitleTiming}
      >
        <span className="sr-only">Birthday party</span>
        <CutoutText text="birthday" animated />
        <CutoutText text="party" animated />
      </motion.p>
      {invite.event_title && (
        <p className={styles.eventTitle}>{invite.event_title}</p>
      )}
      {!opened ? (
        <div className={styles.openActions}>
          <button
            type="button"
            className={styles.action}
            onClick={() => onOpen(hasMusic)}
          >
            {hasMusic ? "Open invitation with music" : "Open invitation"}
          </button>
          {hasMusic && (
            <button
              type="button"
              className={styles.quietAction}
              onClick={() => onOpen(false)}
            >
              Open without music
            </button>
          )}
        </div>
      ) : (
        <p className={styles.scrollCue}>
          Scroll to discover{" "}
          <span className={styles.ambient} aria-hidden="true">
            ↓
          </span>
        </p>
      )}
    </section>
  );
}
