"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { InvitationCard } from "@/components/invitation-card";
import { decodeInvitation } from "@/lib/invite-link";
import type { InvitationInput } from "@/lib/invitation";

export function GuestInvitation() {
  const [invite, setInvite] = useState<InvitationInput | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    let generation = 0;
    async function load() {
      const current = ++generation;
      try {
        const data = await decodeInvitation(window.location.hash);
        if (active && current === generation) {
          setInvite(data);
          setError("");
          setRevision((value) => value + 1);
        }
      } catch (cause) {
        if (active && current === generation) {
          setInvite(null);
          setError(
            cause instanceof Error
              ? cause.message
              : "This invitation couldn't be opened.",
          );
        }
      }
    }
    void load();
    window.addEventListener("hashchange", load);
    return () => {
      active = false;
      window.removeEventListener("hashchange", load);
    };
  }, []);
  return (
    <div className="guest-page">
      <header className="guest-header">
        <span className="guest-edition">A SPECIAL CELEBRATION</span>
        <span>An invitation for you</span>
      </header>
      <main id="main-content" className="guest-main">
        {invite ? (
          <>
            <h1 className="sr-only">
              You’re invited to {invite.host_name}’s{" "}
              {invite.event_title || "Birthday celebration"}
            </h1>
            <InvitationCard key={revision} invite={invite} />
          </>
        ) : error ? (
          <section className="status-card">
            <h1>This invitation isn’t available.</h1>
            <p role="alert">{error}</p>
            <Link href="/" className="text-link">
              Create an invitation
            </Link>
          </section>
        ) : (
          <p className="invite-loading" role="status">
            Opening your invitation…
          </p>
        )}
        <noscript>
          <p className="form-notice">
            Enable JavaScript to open this invitation. Its details are contained
            in the link and are read directly in your browser.
          </p>
        </noscript>
      </main>
    </div>
  );
}
