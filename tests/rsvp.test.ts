import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createRsvpKeys,
  hostSecretSchema,
  randomToken,
  rsvpIdFromSecret,
  rsvpReplySchema,
} from "@/lib/rsvp";
import { encodeInvitation, decodeInvitation } from "@/lib/invite-link";
import { sampleInvitation } from "@/lib/presentation";

describe("RSVP keys", () => {
  it("derives the public id from the host secret", async () => {
    const { secret, id } = await createRsvpKeys();
    expect(hostSecretSchema.safeParse(secret).success).toBe(true);
    expect(id).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(await rsvpIdFromSecret(secret)).toBe(id);
    expect(id).not.toBe(secret.slice(0, 22));
  });
});

describe("RSVP replies", () => {
  const reply = {
    invite_id: randomToken(),
    reply_id: randomToken(),
    name: "  Nino  ",
    attending: true,
  };
  it("trims guest names", () => {
    const parsed = rsvpReplySchema.parse(reply);
    expect(parsed.name).toBe("Nino");
  });
  it.each([
    ["an empty name", { ...reply, name: "  " }],
    ["a too-long name", { ...reply, name: "x".repeat(81) }],
    ["a malformed invite id", { ...reply, invite_id: "abc" }],
    ["a missing answer", { ...reply, attending: undefined }],
  ])("rejects %s", (_label, input) => {
    expect(rsvpReplySchema.safeParse(input).success).toBe(false);
  });
});

describe("RSVP in invitation links", () => {
  const invite = {
    ...sampleInvitation,
    style: "scroll" as const,
    rsvp_id: randomToken(),
    scroll: {
      portrait: { kind: "default" as const },
      closing_message: "",
      music: null,
    },
  };
  it("round-trips the reply id for story invitations", async () => {
    expect(await decodeInvitation(await encodeInvitation(invite))).toEqual(
      invite,
    );
  });
  it("round-trips the reply id for card invitations", async () => {
    const card = {
      ...sampleInvitation,
      style: "card" as const,
      rsvp_id: randomToken(),
    };
    expect(await decodeInvitation(await encodeInvitation(card))).toEqual(card);
  });
  it("rejects a malformed reply id", async () => {
    await expect(
      encodeInvitation({ ...invite, rsvp_id: "not valid" }),
    ).rejects.toThrow();
  });
});

describe("RSVP retention", () => {
  const day = 24 * 60 * 60;
  const now = Date.UTC(2027, 0, 1);
  it("keeps replies until 20 days after the event", async () => {
    const { retentionSeconds } = await import("@/lib/rsvp-store");
    const event_at = now + 30 * day * 1000;
    expect(retentionSeconds({ event_at }, now)).toBe(50 * day);
  });
  it("keeps replies at least 20 days, even without or after the event", async () => {
    const { retentionSeconds } = await import("@/lib/rsvp-store");
    expect(retentionSeconds({}, now)).toBe(20 * day);
    expect(retentionSeconds({ event_at: now - 90 * day * 1000 }, now)).toBe(
      20 * day,
    );
  });
  it("caps retention for far-future events", async () => {
    const { retentionSeconds } = await import("@/lib/rsvp-store");
    expect(retentionSeconds({ event_at: now + 5000 * day * 1000 }, now)).toBe(
      400 * day,
    );
  });
});

describe("RSVP store (local development memory)", () => {
  beforeEach(() => {
    vi.resetModules();
    delete (globalThis as { __rsvpMemory?: unknown }).__rsvpMemory;
    vi.stubEnv("KV_REST_API_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  });

  it("updates a guest's reply instead of duplicating it", async () => {
    const { saveReply, listReplies } = await import("@/lib/rsvp-store");
    const invite_id = randomToken();
    const reply_id = randomToken();
    await saveReply({ invite_id, reply_id, name: "Nino", attending: true });
    await saveReply({ invite_id, reply_id, name: "Nino", attending: false });
    await saveReply({
      invite_id,
      reply_id: randomToken(),
      name: "Luka",
      attending: true,
    });
    const replies = await listReplies(invite_id);
    expect(replies).toHaveLength(2);
    expect(replies.find((r) => r.reply_id === reply_id)?.attending).toBe(false);
    expect(await listReplies(randomToken())).toEqual([]);
  });

  it("stops accepting new replies at the limit", async () => {
    const { saveReply, MAX_RESPONSES_PER_INVITE } =
      await import("@/lib/rsvp-store");
    const invite_id = randomToken();
    for (let index = 0; index < MAX_RESPONSES_PER_INVITE; index++)
      await saveReply({
        invite_id,
        reply_id: randomToken(),
        name: `Guest ${index}`,
        attending: true,
      });
    await expect(
      saveReply({
        invite_id,
        reply_id: randomToken(),
        name: "One more",
        attending: true,
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("refuses to fall back to memory in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { saveReply } = await import("@/lib/rsvp-store");
    await expect(
      saveReply({
        invite_id: randomToken(),
        reply_id: randomToken(),
        name: "Nino",
        attending: true,
      }),
    ).rejects.toMatchObject({ status: 503 });
    vi.unstubAllEnvs();
  });
});
