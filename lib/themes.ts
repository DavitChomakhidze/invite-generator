export const THEME_IDS = ["pink", "lavender", "midnight", "ocean"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export type Audience = "her" | "him";

export const DEFAULT_THEME: ThemeId = "pink";

/**
 * Designs shared by both invitation styles. Swatches mirror the tokens in
 * story.module.css (Scroll Story) and globals.css (Animated Card).
 */
export const THEMES: Record<
  ThemeId,
  { name: string; audience: Audience; swatches: [string, string, string] }
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

export function themesFor(audience: Audience) {
  return THEME_IDS.filter((id) => THEMES[id].audience === audience);
}
