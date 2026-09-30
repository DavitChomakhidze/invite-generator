import type { Metadata } from "next";
import { GuestInvitation } from "@/components/guest-invitation";

export const metadata: Metadata = {
  title: "You're invited",
  robots: { index: false, follow: false },
};
export default function InvitePage() {
  return <GuestInvitation />;
}
