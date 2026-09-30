import { invitationSchema, type InvitationInput } from "@/lib/invitation";

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
  input: InvitationInput,
): Promise<string> {
  const invite = invitationSchema.parse(input);
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
  const fragment = `v1.${payload}`;
  if (fragment.length > MAX_FRAGMENT_LENGTH)
    throw new Error(
      "The link is too long. Please shorten your message or use a shorter Google Maps share link.",
    );
  return fragment;
}

export async function decodeInvitation(
  fragment: string,
): Promise<InvitationInput> {
  const value = fragment.replace(/^#/, "");
  if (value.length > MAX_FRAGMENT_LENGTH || !/^v1\.[A-Za-z0-9_-]+$/.test(value))
    throw new Error("This invitation link is incomplete or invalid.");
  try {
    const encoded = value.slice(3).replaceAll("-", "+").replaceAll("_", "/");
    const bytes = Uint8Array.from(atob(encoded), (character) =>
      character.charCodeAt(0),
    );
    const decoded = await readBounded(
      new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")),
      MAX_DECODED_BYTES,
    );
    return invitationSchema.parse(
      JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(decoded)),
    );
  } catch {
    throw new Error(
      "This invitation link is incomplete or invalid. Ask your host to send the full link again.",
    );
  }
}
