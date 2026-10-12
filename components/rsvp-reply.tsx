"use client";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { InvitationInput } from "@/lib/invitation";
import { randomToken } from "@/lib/rsvp";
import { savedGuestReply, saveGuestReply } from "@/lib/rsvp-local";

type Reply = { reply_id: string; name: string; attending: boolean };

/** Each invitation style supplies its own look for the same reply flow. */
export type RsvpClasses = Record<
  | "root"
  | "choices"
  | "primary"
  | "secondary"
  | "quiet"
  | "note"
  | "label"
  | "input"
  | "error"
  | "done",
  string
>;

export function RsvpReply({
  inviteId,
  event,
  classes: styles,
  preview = false,
}: {
  inviteId: string;
  event: Pick<InvitationInput, "event_date" | "event_time" | "time_zone">;
  classes: RsvpClasses;
  preview?: boolean;
}) {
  // Guest invitations only render in the browser, after the link is decoded.
  const [saved, setSaved] = useState<Reply | null>(() =>
    preview || typeof window === "undefined" ? null : savedGuestReply(inviteId),
  );
  const [editing, setEditing] = useState(false);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const nameId = useId();

  useEffect(() => {
    if (attending !== null) nameInput.current?.focus();
  }, [attending]);

  async function submit(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (pending || attending === null || preview) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please add your name.");
      nameInput.current?.focus();
      return;
    }
    setPending(true);
    setError("");
    // Reusing the reply id lets a guest change their answer instead of adding a duplicate.
    const reply: Reply = {
      reply_id: saved?.reply_id ?? randomToken(),
      name: trimmed,
      attending,
    };
    try {
      const { eventInstant } = await import("@/lib/invitation");
      let event_at: number | undefined;
      try {
        event_at = eventInstant(event);
      } catch {
        // The server falls back to its minimum retention.
      }
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_id: inviteId, event_at, ...reply }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error || "Your reply couldn’t be sent.");
      }
      saveGuestReply(inviteId, reply);
      setSaved(reply);
      setEditing(false);
      setAttending(null);
      requestAnimationFrame(() => status.current?.focus());
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message !== "Failed to fetch"
          ? cause.message
          : "Your reply couldn’t be sent. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  if (saved && !editing)
    return (
      <div className={styles.root}>
        <p ref={status} tabIndex={-1} className={styles.done} role="status">
          {saved.attending
            ? `Yay, ${saved.name}! You’re on the list.`
            : `Thanks for letting us know, ${saved.name}. You’ll be missed!`}
        </p>
        <button
          type="button"
          className={styles.quiet}
          onClick={() => {
            setName(saved.name);
            setEditing(true);
          }}
        >
          Change my reply
        </button>
      </div>
    );

  if (attending === null)
    return (
      <div className={styles.root}>
        <div className={styles.choices}>
          <button
            type="button"
            className={styles.primary}
            disabled={preview}
            onClick={() => setAttending(true)}
          >
            Joyfully accept
          </button>
          <button
            type="button"
            className={styles.secondary}
            disabled={preview}
            onClick={() => setAttending(false)}
          >
            Regretfully decline
          </button>
        </div>
        {preview && <p className={styles.note}>Guests will reply here.</p>}
      </div>
    );

  return (
    <form className={styles.root} onSubmit={submit} noValidate>
      <p className={styles.note}>
        {attending ? "Wonderful! Who’s coming?" : "Sorry you can’t make it."}
      </p>
      <label className={styles.label} htmlFor={nameId}>
        Your name
      </label>
      <input
        ref={nameInput}
        id={nameId}
        className={styles.input}
        value={name}
        maxLength={80}
        autoComplete="name"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${nameId}-error` : undefined}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
      />
      {error && (
        <p id={`${nameId}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
      <p className={`${styles.note} rsvp-privacy`}>
        Only the host sees your reply. It’s deleted 20 days after the event.{" "}
        <a href="/privacy" target="_blank" rel="noopener">
          Privacy
        </a>
      </p>
      <div className={styles.choices}>
        <button type="submit" className={styles.primary} disabled={pending}>
          {pending ? "Sending…" : attending ? "Send my yes" : "Send my regrets"}
        </button>
        <button
          type="button"
          className={styles.quiet}
          disabled={pending}
          onClick={() => {
            setAttending(null);
            setError("");
            if (saved) setEditing(false);
          }}
        >
          Back
        </button>
      </div>
    </form>
  );
}
