"use client";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { randomToken } from "@/lib/rsvp";
import { savedGuestReply, saveGuestReply } from "@/lib/rsvp-local";
import styles from "./story.module.css";

type Reply = { reply_id: string; name: string; attending: boolean };

export function StoryRsvp({
  inviteId,
  preview = false,
}: {
  inviteId: string;
  preview?: boolean;
}) {
  // Sections only mount in the browser after the guest opens the story.
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

  async function submit(event: FormEvent) {
    event.preventDefault();
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
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_id: inviteId, ...reply }),
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
      <div className={styles.rsvp}>
        <p ref={status} tabIndex={-1} className={styles.rsvpDone} role="status">
          {saved.attending
            ? `Yay, ${saved.name}! You’re on the list.`
            : `Thanks for letting us know, ${saved.name}. You’ll be missed!`}
        </p>
        <button
          type="button"
          className={styles.quietAction}
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
      <div className={styles.rsvp}>
        <div className={styles.rsvpChoices}>
          <button
            type="button"
            className={styles.action}
            disabled={preview}
            onClick={() => setAttending(true)}
          >
            Joyfully accept
          </button>
          <button
            type="button"
            className={styles.secondaryAction}
            disabled={preview}
            onClick={() => setAttending(false)}
          >
            Regretfully decline
          </button>
        </div>
        {preview && <p className={styles.rsvpNote}>Guests will reply here.</p>}
      </div>
    );

  return (
    <form className={styles.rsvp} onSubmit={submit} noValidate>
      <p className={styles.rsvpNote}>
        {attending ? "Wonderful! Who’s coming?" : "Sorry you can’t make it."}
      </p>
      <label className={styles.rsvpLabel} htmlFor={nameId}>
        Your name
      </label>
      <input
        ref={nameInput}
        id={nameId}
        className={styles.rsvpInput}
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
        <p id={`${nameId}-error`} className={styles.rsvpError} role="alert">
          {error}
        </p>
      )}
      <div className={styles.rsvpChoices}>
        <button type="submit" className={styles.action} disabled={pending}>
          {pending ? "Sending…" : attending ? "Send my yes" : "Send my regrets"}
        </button>
        <button
          type="button"
          className={styles.quietAction}
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
