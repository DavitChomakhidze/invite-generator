import type { Metadata } from "next";
import { RsvpResponses } from "@/components/rsvp-responses";

export const metadata: Metadata = {
  title: "Guest replies",
  robots: { index: false, follow: false },
};
export default function ResponsesPage() {
  return (
    <div className="guest-page">
      <main id="main-content" className="responses-page">
        <RsvpResponses />
      </main>
    </div>
  );
}
