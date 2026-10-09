import { z } from "zod";

/** 128 bits of URL-safe Base64, used for invitation and reply identifiers. */
const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{22}$/);
export const hostSecretSchema = z.string().regex(/^[A-Za-z0-9_-]{32}$/);

export const rsvpReplySchema = z.object({
  invite_id: tokenSchema,
  reply_id: tokenSchema,
  name: z
    .string()
    .trim()
    .min(1, "Please add your name.")
    .max(80, "Keep your name under 80 characters."),
  attending: z.boolean(),
});
export const rsvpIdSchema = tokenSchema;

export type RsvpReply = z.infer<typeof rsvpReplySchema>;
export type RsvpResponse = Omit<RsvpReply, "invite_id"> & {
  replied_at: number;
};

function base64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export function randomToken(byteLength = 16) {
  return base64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

/**
 * The public invitation only carries a hash of the host's secret, so guests can
 * reply but cannot read other replies. No server-side registration is needed.
 */
export async function rsvpIdFromSecret(secret: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret),
  );
  return base64Url(new Uint8Array(digest)).slice(0, 22);
}

export async function createRsvpKeys() {
  const secret = randomToken(24);
  return { secret, id: await rsvpIdFromSecret(secret) };
}

export function responsesUrl(origin: string, secret: string) {
  const url = new URL("/responses", origin);
  url.hash = secret;
  return url.href;
}
