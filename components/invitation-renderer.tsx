"use client";
import dynamic from "next/dynamic";
import type { RefObject } from "react";
import { InvitationCard } from "@/components/invitation-card";
import type { NormalizedInvitation } from "@/lib/invitation-model";

const ScrollInvitation = dynamic(
  () =>
    import("@/components/scroll-invitation").then((m) => m.ScrollInvitation),
  {
    loading: () => (
      <p role="status" className="invite-loading">
        Opening your story…
      </p>
    ),
  },
);

export function InvitationRenderer({
  invite,
  preview = false,
  scrollRoot,
}: {
  invite: NormalizedInvitation;
  preview?: boolean;
  scrollRoot?: RefObject<HTMLDivElement | null>;
}) {
  return invite.style === "card" ? (
    <InvitationCard invite={invite} preview={preview} />
  ) : (
    <ScrollInvitation
      invite={invite}
      preview={preview}
      scrollRoot={scrollRoot}
    />
  );
}
