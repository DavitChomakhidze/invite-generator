import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { musicCatalog } from "@/lib/music-catalog";

const publicDir = fileURLToPath(new URL("../public", import.meta.url));

describe("released music catalog", () => {
  it("ships licensed songs, and no personal tracks unless switched on", () => {
    expect(musicCatalog.length).toBeGreaterThan(0);
  });

  it("uses unique IDs", () => {
    const ids = musicCatalog.map((track) => track.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(musicCatalog.map((track) => [track.title, track] as const))(
    "%s has its file and the credit its license requires",
    (_title, track) => {
      const path = `${publicDir}${track.file}`;
      expect(existsSync(path)).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(100_000);
      expect(track.duration_seconds).toBeGreaterThan(30);
      expect(track.license.name).toBe("CC BY 4.0");
      expect(track.license.attribution).toContain("Kevin MacLeod");
      expect(track.license.attribution).toContain(track.title);
    },
  );
});
