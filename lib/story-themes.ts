export const STORY_THEME_IDS = [
  "pink",
  "lavender",
  "midnight",
  "ocean",
] as const;
export type StoryTheme = (typeof STORY_THEME_IDS)[number];
export type StoryAudience = "her" | "him";

export const DEFAULT_STORY_THEME: StoryTheme = "pink";

/** Swatches mirror the paper, accent and decoration tokens in story.module.css. */
export const STORY_THEMES: Record<
  StoryTheme,
  { name: string; audience: StoryAudience; swatches: [string, string, string] }
> = {
  pink: {
    name: "Pink Party",
    audience: "her",
    swatches: ["#edbedd", "#9d306b", "#c0d8f1"],
  },
  lavender: {
    name: "Lavender Dream",
    audience: "her",
    swatches: ["#d8ccf1", "#6a4bb3", "#f6c6df"],
  },
  midnight: {
    name: "Midnight Gold",
    audience: "him",
    swatches: ["#1c2440", "#d4ad55", "#3d4f86"],
  },
  ocean: {
    name: "Blue Party",
    audience: "him",
    swatches: ["#bcd8f1", "#2c69b0", "#ffd27a"],
  },
};

export function themesFor(audience: StoryAudience) {
  return STORY_THEME_IDS.filter((id) => STORY_THEMES[id].audience === audience);
}
