import { describe, expect, it } from "vitest";
import {
  invitationAudience,
  invitationTheme,
  type NormalizedInvitation,
} from "@/lib/invitation-model";
import { decodeInvitation, encodeInvitation } from "@/lib/invite-link";
import { sampleInvitation } from "@/lib/presentation";
import { THEMES, themesFor } from "@/lib/themes";

const story = {
  ...sampleInvitation,
  style: "scroll" as const,
  scroll: {
    portrait: { kind: "default" as const },
    closing_message: "",
    music: null,
  },
};

describe("invitation designs", () => {
  it("defaults links without a design to Pink Party for her", () => {
    const card: NormalizedInvitation = { ...sampleInvitation, style: "card" };
    expect(invitationTheme(card)).toBe("pink");
    expect(invitationAudience(card)).toBe("her");
  });

  it("round-trips a card design and resolves its audience", async () => {
    const card = {
      ...sampleInvitation,
      style: "card" as const,
      theme: "midnight" as const,
    };
    const decoded = await decodeInvitation(await encodeInvitation(card));
    expect(invitationTheme(decoded)).toBe("midnight");
    expect(invitationAudience(decoded)).toBe("him");
  });

  it("still reads the design from older story links that stored it in scroll settings", async () => {
    const legacy = {
      ...story,
      scroll: { ...story.scroll, theme: "ocean" as const },
    };
    const decoded = await decodeInvitation(await encodeInvitation(legacy));
    expect(invitationTheme(decoded)).toBe("ocean");
  });

  it("prefers the shared design over the legacy story setting", () => {
    const invite: NormalizedInvitation = {
      ...story,
      theme: "lavender",
      scroll: { ...story.scroll, theme: "ocean" },
    };
    expect(invitationTheme(invite)).toBe("lavender");
  });

  it("rejects unknown designs", async () => {
    await expect(
      encodeInvitation({
        ...story,
        theme: "neon",
      } as unknown as NormalizedInvitation),
    ).rejects.toThrow();
  });

  it("offers two designs for each audience", () => {
    expect(themesFor("her").map((id) => THEMES[id].name)).toEqual([
      "Pink Party",
      "Lavender Dream",
    ]);
    expect(themesFor("him").map((id) => THEMES[id].name)).toEqual([
      "Midnight Gold",
      "Blue Party",
    ]);
  });
});
