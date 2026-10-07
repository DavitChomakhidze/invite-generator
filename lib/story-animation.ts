export const storyReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.08 },
  },
};
export const storyViewport = { once: true, amount: 0.2 } as const;
export const storyItemReveal = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
export const storyOpeningTiming = { duration: 0.55 };
export const storyTitleTiming = { duration: 0.5, delay: 0.18 };
export const storySettled = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0 } },
};
