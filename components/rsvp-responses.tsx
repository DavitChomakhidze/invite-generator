"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { hostSecretSchema, type RsvpResponse } from "@/lib/rsvp";
import { savedHostInvites, type SavedHostInvite } from "@/lib/rsvp-local";
import { formatEventDate } from "@/lib/presentation";

type State =
  | { kind: "loading" }
  | { kind: "pick"; invites: SavedHostInvite[] }
  | { kind: "error"; message: string }
  | { kind: "ready"; replies: RsvpResponse[] };

const repliedAt = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function RsvpResponses() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const [secret, setSecret] = useState("");
  const [saved, setSaved] = useState<SavedHostInvite>();

  const load = useCallback(async (value: string) => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/rsvp/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: value }),
        cache: "no-store",
      });
      const body = (await response.json().catch(() => ({}))) as {
        replies?: RsvpResponse[];
        error?: string;
      };
      if (!response.ok || !body.replies)
        throw new Error(body.error || "Replies couldn’t be loaded.");
      setState({ kind: "ready", replies: body.replies });
    } catch (cause) {
      setState({
        kind: "error",
        message:
          cause instanceof Error && cause.message !== "Failed to fetch"
            ? cause.message
            : "Replies couldn’t be loaded. Check your connection and try again.",
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    function read() {
      const value = window.location.hash.replace(/^#/, "");
      setSecret(value);
      setSaved(savedHostInvites().find((invite) => invite.secret === value));
      if (!value) {
        setState({ kind: "pick", invites: savedHostInvites() });
        return;
      }
      if (!hostSecretSchema.safeParse(value).success) {
        setState({
          kind: "error",
          message:
            "This responses link is incomplete. Copy the full link again.",
        });
        return;
      }
      setState({ kind: "loading" });
      void load(value);
    }
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [load]);

  const going =
    state.kind === "ready" ? state.replies.filter((r) => r.attending) : [];
  const notGoing =
    state.kind === "ready" ? state.replies.filter((r) => !r.attending) : [];

  return (
    <section className="responses-card" aria-labelledby="responses-title">
      <p className="eyebrow">PRIVATE · ONLY FOR YOU</p>
      <h1 id="responses-title">
        {saved ? `${saved.host_name}’s guest list` : "Guest replies"}
      </h1>
      {saved && (
        <p className="field-help">
          {saved.event_title || "Birthday celebration"} ·{" "}
          {formatEventDate(saved.event_date)}
        </p>
      )}

      {state.kind === "loading" && <p role="status">Loading replies…</p>}

      {state.kind === "error" && (
        <>
          <p className="form-notice" role="alert">
            {state.message}
          </p>
          {secret && (
            <button
              type="button"
              className="button secondary"
              onClick={() => void load(secret)}
            >
              Try again
            </button>
          )}
        </>
      )}

      {state.kind === "pick" &&
        (state.invites.length ? (
          <>
            <p className="field-help">Invitations created in this browser:</p>
            <ul className="responses-saved">
              {state.invites.map((invite) => (
                <li key={invite.secret}>
                  <a className="text-link" href={`#${invite.secret}`}>
                    {invite.host_name} ·{" "}
                    {invite.event_title || formatEventDate(invite.event_date)}
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="field-help">
            Open the private responses link you got when you created your
            invitation.
          </p>
        ))}

      {state.kind === "ready" && (
        <>
          <div className="responses-summary" role="status">
            <div>
              <strong>{going.length}</strong>
              <span>Coming</span>
            </div>
            <div>
              <strong>{notGoing.length}</strong>
              <span>Can’t make it</span>
            </div>
          </div>
          {state.replies.length === 0 ? (
            <p className="field-help">
              No replies yet. Share your invitation link and check back soon.
            </p>
          ) : (
            <>
              <ReplyList title="COMING" replies={going} />
              <ReplyList title="CAN’T MAKE IT" replies={notGoing} />
            </>
          )}
          <button
            type="button"
            className="button secondary"
            disabled={refreshing}
            onClick={() => void load(secret)}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </>
      )}
      <p>
        <Link href="/" className="text-link">
          Create an invitation
        </Link>
      </p>
    </section>
  );
}

function ReplyList({
  title,
  replies,
}: {
  title: string;
  replies: RsvpResponse[];
}) {
  if (!replies.length) return null;
  return (
    <div className="responses-list">
      <h2>{title}</h2>
      <ul className="responses-list">
        {replies.map((reply) => (
          <li key={reply.reply_id}>
            <span>{reply.name}</span>
            <span>{repliedAt.format(reply.replied_at)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
