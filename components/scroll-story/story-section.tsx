"use client";
import { motion } from "motion/react";
import { useStoryReducedMotion } from "@/lib/use-story-motion";
import { Children, type ReactNode, type RefObject } from "react";
import {
  storyReveal,
  storyItemReveal,
  storyViewport,
  storySettled,
} from "@/lib/story-animation";
import styles from "./story.module.css";
import { StorySparkles } from "./story-sparkles";

export function StorySection({
  children,
  label,
  number,
  scrollRoot,
  tinted = false,
}: {
  children: ReactNode;
  label: string;
  number: string;
  scrollRoot?: RefObject<HTMLDivElement | null>;
  tinted?: boolean;
}) {
  const reduced = useStoryReducedMotion();
  return (
    <motion.section
      aria-label={label}
      data-motion-scope
      className={`${styles.section} ${tinted ? styles.tinted : ""}`}
      initial={reduced ? false : "hidden"}
      whileInView="visible"
      animate={reduced ? "visible" : undefined}
      variants={reduced ? storySettled : storyReveal}
      viewport={{ ...storyViewport, root: scrollRoot }}
    >
      <StorySparkles />
      <span className={styles.sectionNumber} aria-hidden="true">
        ✦ {number} ✦
      </span>
      <div className={styles.sectionInner}>
        {Children.toArray(children).map((child, index) => (
          <motion.div
            key={index}
            variants={reduced ? storySettled : storyItemReveal}
          >
            {child}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
