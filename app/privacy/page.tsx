import type { Metadata } from "next";
import { RETENTION_DAYS_AFTER_EVENT } from "@/lib/rsvp-store";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What occasion stores when you open or reply to an invitation.",
};

// Keep this page in step with lib/rsvp-store.ts and lib/rsvp-local.ts.
export default function PrivacyPage() {
  return (
    <div className="guest-page">
      <main id="main-content" className="legal-page">
        <article className="legal-card">
          <p className="eyebrow">PRIVACY</p>
          <h1>Your privacy, in plain words</h1>
          <p className="legal-updated">Last updated: October 2026</p>

          <h2>Invitation details stay in the link</h2>
          <p>
            The event details, message and photo link are stored inside the
            invitation link itself, after the <code>#</code>. That part of the
            link is read by your browser and is not sent to our server. Anyone
            who has the link can read the invitation, so share it only with
            people you invite.
          </p>

          <h2>What we store when a guest replies</h2>
          <ul>
            <li>the name the guest types,</li>
            <li>whether they accepted or declined,</li>
            <li>the time of the reply,</li>
            <li>a random reply ID, so a guest can change their answer.</li>
          </ul>
          <p>
            Only the person who created the invitation can see replies, using
            their private responses link. Guests cannot see each other’s
            replies.
          </p>

          <h2>How long replies are kept</h2>
          <p>
            Replies are deleted automatically {RETENTION_DAYS_AFTER_EVENT} days
            after the event. If a guest replies after the event, that
            invitation’s replies are kept {RETENTION_DAYS_AFTER_EVENT} days from
            the latest reply.
          </p>

          <h2>Where data is stored</h2>
          <p>
            The website is hosted by Vercel. Replies are stored with Upstash
            (Redis) in the United States. Photos are loaded directly from the
            image service they are hosted on (Cloudinary or Unsplash), which
            receives a normal request from your browser.
          </p>

          <h2>On your device</h2>
          <p>
            Your browser remembers your own reply so you can change it later,
            and remembers invitations created on that device. This uses your
            browser’s local storage, not cookies. Clearing your browser data
            removes it.
          </p>

          <h2>What we don’t do</h2>
          <p>
            No accounts, no advertising, no analytics or tracking cookies, and
            we never sell or share replies.
          </p>

          <h2>Questions or early deletion</h2>
          <p>
            To correct or remove a reply before it is deleted automatically, you
            can change your reply from the invitation, or ask the person who
            invited you to contact us.
          </p>
        </article>
      </main>
    </div>
  );
}
