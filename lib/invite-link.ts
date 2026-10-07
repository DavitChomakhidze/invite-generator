import { invitationSchema } from "@/lib/invitation";
import {
  normalizedInvitationSchema,
  normalizeLegacyInvitation,
  type NormalizedInvitation,
} from "@/lib/invitation-model";

export const MAX_FRAGMENT_LENGTH = 8192;
const MAX_DECODED_BYTES = 16384;

async function readBounded(stream: ReadableStream<Uint8Array>, limit: number) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > limit) throw new Error("The invitation link is too large.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

/** The fragment stays in the browser: no invitation contents are sent to a server. */
export async function encodeInvitation(
  input: NormalizedInvitation,
): Promise<string> {
  const invite = normalizedInvitationSchema.parse(input);
  const bytes = new TextEncoder().encode(JSON.stringify(invite));
  if (bytes.length > MAX_DECODED_BYTES)
    throw new Error("Please shorten your invitation details.");
  const compressed = await readBounded(
    new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip")),
    MAX_FRAGMENT_LENGTH,
  );
  const payload = btoa(String.fromCharCode(...compressed))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  const fragment = `v2.${payload}`;
  if (fragment.length > MAX_FRAGMENT_LENGTH)
    throw new Error(
      "The link is too long. Please shorten your message or use a shorter Google Maps share link.",
    );
  return fragment;
}

export async function decodeInvitation(
  fragment: string,
): Promise<NormalizedInvitation> {
  const value = fragment.replace(/^#/, "");
  if (
    value.length > MAX_FRAGMENT_LENGTH ||
    !/^v\d+\.[A-Za-z0-9_-]+$/.test(value)
  )
    throw new Error("This invitation link is incomplete or invalid.");
  const [version, payload] = value.split(".");
  if (version !== "v1" && version !== "v2")
    throw new Error(
      "This invitation uses an unsupported link version. Ask your host for a new link.",
    );
  try {
    const encoded = payload.replaceAll("-", "+").replaceAll("_", "/");
    const bytes = Uint8Array.from(atob(encoded), (character) =>
      character.charCodeAt(0),
    );
    const decoded = await readBounded(
      new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")),
      MAX_DECODED_BYTES,
    );
    const data: unknown = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(decoded),
    );
    return version === "v1"
      ? normalizeLegacyInvitation(invitationSchema.parse(data))
      : normalizedInvitationSchema.parse(data);
  } catch {
    throw new Error(
      "This invitation link is incomplete or invalid. Ask your host to send the full link again.",
    );
  }
}
