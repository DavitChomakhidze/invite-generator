import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/music-catalog", () => ({
  findMusicTrack: (id: string) =>
    id === "test-tone" ? { duration_seconds: 90 } : undefined,
}));
import { musicSegmentSchema } from "@/lib/invitation-model";
import { encodeInvitation, decodeInvitation } from "@/lib/invite-link";
import { sampleInvitation } from "@/lib/presentation";

describe("approved music segments", () => {
  it("preserves the song and segment in v2 without embedding audio", async () => {
    const invite = {
      ...sampleInvitation,
      style: "scroll" as const,
      scroll: {
        portrait: { kind: "default" as const },
        closing_message: "",
        music: { song_id: "test-tone", start_seconds: 38, end_seconds: 75 },
      },
    };
    expect(await decodeInvitation(await encodeInvitation(invite))).toEqual(
      invite,
    );
  });
  it("accepts a selected track with a bounded segment", () => {
    expect(
      musicSegmentSchema.safeParse({
        song_id: "test-tone",
        start_seconds: 38,
        end_seconds: 75,
      }).success,
    ).toBe(true);
  });
  it.each([
    { song_id: "missing", start_seconds: 0, end_seconds: 10 },
    { song_id: "test-tone", start_seconds: -1, end_seconds: 10 },
    { song_id: "test-tone", start_seconds: 38, end_seconds: 38 },
    { song_id: "test-tone", start_seconds: 38, end_seconds: 38.5 },
    { song_id: "test-tone", start_seconds: 38, end_seconds: 91 },
    { song_id: "test-tone", start_seconds: NaN, end_seconds: Infinity },
  ])("rejects invalid segment %j", (segment) =>
    expect(musicSegmentSchema.safeParse(segment).success).toBe(false),
  );
});
