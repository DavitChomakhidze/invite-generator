"use client";

import { useEffect, useSyncExternalStore, type RefObject } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
function reducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}
const serverReducedMotion = () => true;

// Motion's installed hook snapshots the initial preference. Also follow live changes.
export function useStoryReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionSnapshot,
    serverReducedMotion,
  );
}

/** One observer per story, no scroll listeners or per-frame React updates. */
export function useStoryMotion(
  story: RefObject<HTMLElement | null>,
  scrollRoot: RefObject<HTMLDivElement | null> | undefined,
  paused: boolean,
  opened: boolean,
) {
  useEffect(() => {
    const element = story.current;
    if (!element) return;
    const updateVisibility = () => {
      element.setAttribute(
        "data-motion",
        paused || document.hidden ? "paused" : "running",
      );
    };
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);

    // Sections mount on opening; reconnect then to include their decorations.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.setAttribute(
            "data-motion-visible",
            String(entry.isIntersecting),
          );
        }
      },
      { root: scrollRoot?.current ?? null, threshold: 0 },
    );
    element
      .querySelectorAll<HTMLElement>("[data-motion-scope]")
      .forEach((section) => {
        observer.observe(section);
      });
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
      element.setAttribute("data-motion", "paused");
    };
  }, [story, scrollRoot, paused, opened]);
}
