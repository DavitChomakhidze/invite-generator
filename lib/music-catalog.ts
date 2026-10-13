export type MusicTrack = {
  id: string;
  title: string;
  file: string;
  duration_seconds: number;
  license: { name: string; attribution?: string; source_url: string };
};

// Released tracks: never remove an ID or change its file, or older links break.
// Durations are measured from the MP3 frames and rounded down.
function kevinMacLeod(
  slug: string,
  title: string,
  duration_seconds: number,
  sourceName: string,
): MusicTrack {
  return {
    id: `kevin-macleod-${slug}`,
    title,
    file: `/music/${slug}.mp3`,
    duration_seconds,
    license: {
      name: "CC BY 4.0",
      // CC BY requires this credit wherever the track plays.
      attribution: `"${title}" Kevin MacLeod (incompetech.com), licensed under Creative Commons: By Attribution 4.0 (creativecommons.org/licenses/by/4.0/)`,
      source_url: `https://incompetech.com/music/royalty-free/mp3-royaltyfree/${sourceName}.mp3`,
    },
  };
}

const releasedTracks: readonly MusicTrack[] = [
  kevinMacLeod("carefree", "Carefree", 205, "Carefree"),
  kevinMacLeod(
    "monkeys-spinning-monkeys",
    "Monkeys Spinning Monkeys",
    125,
    "Monkeys%20Spinning%20Monkeys",
  ),
  kevinMacLeod("fluffing-a-duck", "Fluffing a Duck", 67, "Fluffing%20a%20Duck"),
  kevinMacLeod(
    "gymnopedie-no-1",
    "Gymnopedie No. 1",
    187,
    "Gymnopedie%20No%201",
  ),
];

// Personal, non-commercial family use only; not covered by a license.
const personalTracks: readonly MusicTrack[] = [
  {
    id: "local-dancing-queen",
    title: "Dancing Queen",
    file: "/music/dancing-queen.mp3",
    duration_seconds: 230,
    license: {
      name: "Personal use only — not licensed",
      source_url: "https://example.invalid/personal",
    },
  },
];

export const musicCatalog: readonly MusicTrack[] = [
  ...releasedTracks,
  ...personalTracks,
];

export function findMusicTrack(id: string): MusicTrack | undefined {
  return musicCatalog.find((track) => track.id === id);
}
