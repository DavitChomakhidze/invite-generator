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

/**
 * Songs without redistribution rights, for trying the music feature on your own
 * computer. The files live in the git-ignored public/music/local/ folder. Entries
 * appear only in `next dev` with NEXT_PUBLIC_LOCAL_TEST_MUSIC=1 (set in the
 * git-ignored .env.local), so they never reach production or automated tests.
 */
const localTestTracks: readonly MusicTrack[] =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_LOCAL_TEST_MUSIC === "1"
    ? [
        {
          id: "local-dancing-queen",
          title: "Dancing Queen (local test only)",
          file: "/music/local/dancing-queen.mp3",
          duration_seconds: 230,
          license: {
            name: "Not licensed — local testing only",
            source_url: "https://example.invalid/local-test",
          },
        },
      ]
    : [];

export const musicCatalog: readonly MusicTrack[] = [
  ...releasedTracks,
  ...localTestTracks,
];

export function findMusicTrack(id: string): MusicTrack | undefined {
  return musicCatalog.find((track) => track.id === id);
}
