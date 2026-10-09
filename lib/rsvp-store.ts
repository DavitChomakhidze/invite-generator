import type { RsvpReply, RsvpResponse } from "@/lib/rsvp";

export const MAX_RESPONSES_PER_INVITE = 300;
// Replies are kept for a little over a year after the latest one, then expire.
const RESPONSE_TTL_SECONDS = 400 * 24 * 60 * 60;

export class RsvpStoreError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type Command = (string | number)[];

function redisConfig() {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

// Local development works without credentials; replies reset when the server restarts.
const memory = ((
  globalThis as { __rsvpMemory?: Map<string, Map<string, string>> }
).__rsvpMemory ??= new Map());

async function run(commands: Command[]): Promise<unknown[]> {
  const config = redisConfig();
  if (!config) {
    if (process.env.NODE_ENV === "production")
      throw new RsvpStoreError("Replies aren’t set up on this site yet.", 503);
    return commands.map(runInMemory);
  }
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!response.ok)
    throw new RsvpStoreError("Replies are unavailable right now.", 502);
  const results = (await response.json()) as {
    result?: unknown;
    error?: string;
  }[];
  if (results.some((item) => item.error))
    throw new RsvpStoreError("Replies are unavailable right now.", 502);
  return results.map((item) => item.result);
}

function runInMemory([name, key, ...args]: Command): unknown {
  const hash = memory.get(String(key));
  switch (name) {
    case "HEXISTS":
      return hash?.has(String(args[0])) ? 1 : 0;
    case "HLEN":
      return hash?.size ?? 0;
    case "HSET": {
      const next = hash ?? new Map<string, string>();
      next.set(String(args[0]), String(args[1]));
      memory.set(String(key), next);
      return 1;
    }
    case "HGETALL":
      return hash ? [...hash].flat() : [];
    default:
      return 1;
  }
}

const keyFor = (inviteId: string) => `rsvp:${inviteId}`;

export async function saveReply(reply: RsvpReply) {
  const key = keyFor(reply.invite_id);
  const [exists, count] = await run([
    ["HEXISTS", key, reply.reply_id],
    ["HLEN", key],
  ]);
  if (!Number(exists) && Number(count) >= MAX_RESPONSES_PER_INVITE)
    throw new RsvpStoreError(
      "This invitation isn’t accepting more replies.",
      409,
    );
  const value: Omit<RsvpResponse, "reply_id"> = {
    name: reply.name,
    attending: reply.attending,
    replied_at: Date.now(),
  };
  await run([
    ["HSET", key, reply.reply_id, JSON.stringify(value)],
    ["EXPIRE", key, RESPONSE_TTL_SECONDS],
  ]);
}

export async function listReplies(inviteId: string): Promise<RsvpResponse[]> {
  const [flat] = await run([["HGETALL", keyFor(inviteId)]]);
  const entries = Array.isArray(flat) ? (flat as string[]) : [];
  const replies: RsvpResponse[] = [];
  for (let index = 0; index + 1 < entries.length; index += 2) {
    try {
      replies.push({
        reply_id: entries[index],
        ...JSON.parse(entries[index + 1]),
      });
    } catch {
      // Skip a corrupted entry rather than hiding every other reply.
    }
  }
  return replies.sort((a, b) => b.replied_at - a.replied_at);
}
