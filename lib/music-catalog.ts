export type MusicTrack = {
  id: string;
  title: string;
  file: string;
  duration_seconds: number;
  license: { name: string; attribution?: string; source_url: string };
};

// No local tracks have verified redistribution rights. Add approved assets and
// their measured durations here; never remove released IDs or change their files.
export const musicCatalog: readonly MusicTrack[] = [];

export function findMusicTrack(id: string): MusicTrack | undefined {
  return musicCatalog.find((track) => track.id === id);
}
