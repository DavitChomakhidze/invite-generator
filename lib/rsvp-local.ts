import type { RsvpResponse } from "@/lib/rsvp";

/**
 * Browser-only conveniences. Losing them never loses replies: hosts keep their
 * private link, and guests can simply reply again.
 */
const HOST_KEY = "occasion.rsvp-hosts";
const MAX_SAVED_INVITES = 20;

export type SavedHostInvite = {
  secret: string;
  host_name: string;
  event_title: string;
  event_date: string;
  created_at: number;
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing or full storage: the feature still works without it.
  }
}

export function savedHostInvites(): SavedHostInvite[] {
  const value = read<unknown>(HOST_KEY, []);
  return Array.isArray(value) ? (value as SavedHostInvite[]) : [];
}
export function saveHostInvite(details: Omit<SavedHostInvite, "created_at">) {
  const invite = { ...details, created_at: Date.now() };
  write(
    HOST_KEY,
    [
      invite,
      ...savedHostInvites().filter((i) => i.secret !== invite.secret),
    ].slice(0, MAX_SAVED_INVITES),
  );
}

type GuestReply = Pick<RsvpResponse, "reply_id" | "name" | "attending">;
const guestKey = (inviteId: string) => `occasion.rsvp-reply.${inviteId}`;

export function savedGuestReply(inviteId: string): GuestReply | null {
  return read<GuestReply | null>(guestKey(inviteId), null);
}
export function saveGuestReply(inviteId: string, reply: GuestReply) {
  write(guestKey(inviteId), reply);
}
