import { describe, expect, it } from "vitest";
import {
  defaultScrollSettings,
  normalizedInvitationSchema,
  validateNormalizedInvitation,
} from "@/lib/invitation-model";
import { sampleInvitation } from "@/lib/presentation";
import { isPortraitUrl } from "@/lib/portrait";

const scroll = {
  ...sampleInvitation,
  event_date: "2035-06-19",
  style: "scroll",
  scroll: defaultScrollSettings(),
};
describe("multi-style model", () => {
  it("keeps new card invitations simple and strips inactive settings", () => {
    const card = normalizedInvitationSchema.parse({
      ...sampleInvitation,
      style: "card",
      scroll: { age: -1 },
    });
    expect(card).not.toHaveProperty("scroll");
  });
  it("validates optional age and closing message", () => {
    expect(normalizedInvitationSchema.safeParse(scroll).success).toBe(true);
    for (const age of [0, 151, 1.5, "16", NaN])
      expect(
        normalizedInvitationSchema.safeParse({
          ...scroll,
          scroll: { ...scroll.scroll, age },
        }).success,
      ).toBe(false);
    expect(
      normalizedInvitationSchema.safeParse({
        ...scroll,
        scroll: { ...scroll.scroll, closing_message: "x".repeat(301) },
      }).success,
    ).toBe(false);
  });
  it("preserves event future validation and full nested error paths", () => {
    const result = validateNormalizedInvitation({
      ...scroll,
      scroll: {
        ...scroll.scroll,
        portrait: { kind: "remote", url: "data:image/png;base64,test" },
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors["scroll.portrait.url"]).toBeTruthy();
    expect(
      validateNormalizedInvitation({ ...scroll, event_date: "2020-01-01" }).ok,
    ).toBe(false);
  });
  it.each([
    "https://images.unsplash.com/photo-1",
    "https://res.cloudinary.com/demo/image/upload/a.jpg",
  ])("allows %s", (url) => expect(isPortraitUrl(url)).toBe(true));
  it.each([
    "http://images.unsplash.com/a",
    "https://images.unsplash.com.evil.test/a",
    "https://user@res.cloudinary.com/a",
    "https://images.unsplash.com:444/a",
    "blob:a",
    "data:image/png;base64,a",
    "/images/a.png",
  ])("rejects %s", (url) => expect(isPortraitUrl(url)).toBe(false));
  it("rejects unknown styles and unpublished music", () => {
    expect(
      normalizedInvitationSchema.safeParse({ ...scroll, style: "unknown" })
        .success,
    ).toBe(false);
    expect(
      normalizedInvitationSchema.safeParse({
        ...scroll,
        scroll: {
          ...scroll.scroll,
          music: { song_id: "missing", start_seconds: 0, end_seconds: 10 },
        },
      }).success,
    ).toBe(false);
  });
});
