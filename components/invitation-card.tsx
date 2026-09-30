"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { BirthdayGirl } from "@/components/birthday-girl";
import {
  formatEventDate,
  formatEventTime,
  isGoogleMapsUrl,
} from "@/lib/presentation";
import type { InvitationInput } from "@/lib/invitation";
import { useBrowser } from "@/lib/use-browser";

export function InvitationCard({
  invite,
  preview = false,
}: {
  invite: InvitationInput;
  preview?: boolean;
}) {
  const reduced = useReducedMotion();
  const browser = useBrowser();
  const scene = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [sequence, setSequence] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const motionAllowed = browser && (!reduced || sequence > 0);
  useEffect(() => {
    if (!motionAllowed || !scene.current) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame: number | undefined;
    const start = () => {
      setPlaying(true);
      setHasPlayed(true);
      timer = setTimeout(() => setPlaying(false), 6200);
    };
    // A direct request must work even when system preferences disable autoplay.
    if (sequence > 0) {
      scene.current.scrollIntoView({ behavior: "instant", block: "center" });
      frame = requestAnimationFrame(start);
      return () => {
        cancelAnimationFrame(frame!);
        clearTimeout(timer);
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        start();
        observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(scene.current);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [motionAllowed, sequence]);
  const animate = playing && motionAllowed;
  return (
    <div
      className={`invitation-experience ${preview ? "is-preview" : ""} ${animate ? "is-opening" : ""} ${sequence > 0 ? "motion-requested" : ""}`}
    >
      <div className="animation-toolbar">
        <span>
          {animate
            ? "A special delivery…"
            : browser && reduced && !hasPlayed
              ? "Animation is paused"
              : "An invitation for you"}
        </span>
        <button
          className="replay-button"
          type="button"
          onClick={() =>
            animate ? setPlaying(false) : setSequence((value) => value + 1)
          }
        >
          {animate
            ? "Skip animation"
            : hasPlayed
              ? "Replay animation"
              : "Play animation"}
        </button>
      </div>
      <div className="invitation-frame">
        <div className="paper-corner bottom-left" />
        <div className="paper-corner bottom-right" />
        <p className="invite-eyebrow">
          <span /> YOU’RE INVITED <span />
        </p>
        <div
          ref={scene}
          className="delivery-scene"
          key={sequence}
          data-testid="delivery-scene"
          data-animating={animate}
        >
          <div className="delivery-host">
            <BirthdayGirl animate={animate} />
          </div>
          {animate && (
            <div className="delivery-envelope" aria-hidden="true">
              <div className="envelope-back" />
              <div className="envelope-letter">
                <span>You’re invited</span>
                <strong>{invite.host_name || "Your name"}</strong>
                <i>{invite.event_title || "Birthday celebration"}</i>
              </div>
              <div className="envelope-front" />
              <div className="envelope-flap" />
              <div className="envelope-seal" />
            </div>
          )}
          <span className="delivery-caption">
            {animate
              ? "Something lovely is on its way"
              : "a very special celebration"}
          </span>
        </div>
        <div className="invitation-paper">
          <p className="invite-pretitle">Join us for</p>
          <h2 className="invite-name">
            {invite.host_name || "Your name"}
            <span>’s</span>
          </h2>
          <p className="invite-title">
            {invite.event_title || "Birthday celebration"}
          </p>
          <div className="invitation-rule" aria-hidden="true" />
          {invite.message && <p className="invite-message">{invite.message}</p>}
          <div className="event-details">
            <div>
              <span>{formatEventDate(invite.event_date)}</span>
            </div>
            <div>
              <span>
                {formatEventTime(invite.event_time)}{" "}
                <span className="timezone-label">
                  · {invite.time_zone.replaceAll("_", " ")}
                </span>
              </span>
            </div>
            <div>
              <span>{invite.address || "Somewhere wonderful"}</span>
            </div>
          </div>
          {invite.dress_code && (
            <p className="dress-code">
              <span>THE DRESS CODE</span>
              {invite.dress_code}
            </p>
          )}
          {isGoogleMapsUrl(invite.maps_url) ? (
            <a
              className="map-button"
              href={invite.maps_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
            </a>
          ) : (
            <span className="map-placeholder">
              Your map link will appear here
            </span>
          )}
          <p className="invite-signoff">Can’t wait to celebrate with you.</p>
        </div>
      </div>
    </div>
  );
}
