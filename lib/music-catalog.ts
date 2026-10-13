export type MusicTrack = {
  id: string;
  title: string;
  file: string;
  duration_seconds: number;
  license: { name: string; attribution?: string; source_url: string };
};

// No local tracks have verified redistribution rights. Add approved assets and
// their measured durations here; never remove released IDs or change their files.
const releasedTracks: readonly MusicTrack[] = [];

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
