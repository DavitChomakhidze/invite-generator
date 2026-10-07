"use client";
import { useRef, useState } from "react";
import { InvitationRenderer } from "@/components/invitation-renderer";
import type { NormalizedInvitation } from "@/lib/invitation-model";

export function InvitationPreview({
  invite,
}: {
  invite: NormalizedInvitation;
}) {
  const [open, setOpen] = useState(false);
  const [restart, setRestart] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const story = invite.style === "scroll";
  return (
    <aside
      id="experience"
      className={`preview-column ${open ? "preview-open" : ""}`}
      aria-label="Invitation preview"
    >
      <div className="preview-heading">
        <span>
          <span className="live-dot" /> LIVE PREVIEW
        </span>
        <button
          className="preview-toggle"
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="preview-content"
        >
          {open ? "Hide preview" : "Show preview"}
        </button>
        <span className="desktop-preview-note">
          {story ? "Scroll to explore" : "See how it opens"}
        </span>
      </div>
      <div id="preview-content" className="preview-content">
        <div className={story ? "story-preview-stage" : "preview-stage"}>
          {story && (
            <div className="story-preview-toolbar">
              <span>Phone preview · sound off</span>
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  root.current?.scrollTo({ top: 0 });
                  setRestart((n) => n + 1);
                }}
              >
                Restart story
              </button>
            </div>
          )}
          {story ? (
            <div
              className="story-phone"
              ref={root}
              tabIndex={0}
              role="region"
              aria-label="Scrollable phone preview"
            >
              <InvitationRenderer
                key={`${open}-${restart}`}
                invite={invite}
                preview
                scrollRoot={root}
              />
            </div>
          ) : (
            <InvitationRenderer
              key={open ? "open" : "closed"}
              invite={invite}
              preview
            />
          )}
        </div>
        <p className="preview-caption">
          A preview of the invitation your guests will open.
        </p>
      </div>
    </aside>
  );
}
