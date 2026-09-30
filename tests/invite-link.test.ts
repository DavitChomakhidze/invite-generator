import { describe, expect, it } from "vitest";
import { gzipSync } from "node:zlib";
import {
  encodeInvitation,
  decodeInvitation,
  MAX_FRAGMENT_LENGTH,
} from "@/lib/invite-link";
import { sampleInvitation } from "@/lib/presentation";

describe("self-contained invitation links", () => {
  it("round trips every detail, including Unicode and line breaks", async () => {
    const invite = {
      ...sampleInvitation,
      host_name: "სოფია 🌷",
      message: "You're invited!\nმოდი ჩემთან!",
      address: "24 Rose Street, Tbilisi",
      dress_code: "Pink & cream",
    };
    const link = await encodeInvitation(invite);
    expect(link).toMatch(/^v1\.[A-Za-z0-9_-]+$/);
    expect(link.length).toBeLessThan(1200);
    expect(await decodeInvitation(`#${link}`)).toEqual(invite);
  });
  it("reopens old events and preserves optional empty fields", async () => {
    const invite = {
      ...sampleInvitation,
      event_date: "2020-01-01",
      message: "",
      dress_code: "",
      event_title: "",
    };
    expect(await decodeInvitation(await encodeInvitation(invite))).toEqual(
      invite,
    );
  });
  it("generates a different link for edits without changing the original", async () => {
    const before = await encodeInvitation(sampleInvitation);
    const after = await encodeInvitation({
      ...sampleInvitation,
      host_name: "Sofia",
    });
    expect(before).not.toBe(after);
    expect((await decodeInvitation(before)).host_name).toBe("Isabella");
    expect((await decodeInvitation(after)).host_name).toBe("Sofia");
  });
  it.each([
    "",
    "#",
    "v2.test",
    "v1.%%%",
    "v1.a",
    "v1.abcd",
    `v1.${"a".repeat(MAX_FRAGMENT_LENGTH)}`,
  ])("rejects invalid or oversized link %s", async (value) => {
    await expect(decodeInvitation(value)).rejects.toThrow();
  });
  it("caps decompressed data before JSON parsing", async () => {
    const oversized = gzipSync("x".repeat(1_000_000)).toString("base64url");
    await expect(decodeInvitation(`v1.${oversized}`)).rejects.toThrow();
  });
  it("validates untrusted embedded data and rejects unsafe map URLs", async () => {
    const invalid = gzipSync(
      JSON.stringify({ ...sampleInvitation, maps_url: "javascript:alert(1)" }),
    ).toString("base64url");
    await expect(decodeInvitation(`v1.${invalid}`)).rejects.toThrow();
  });
});
