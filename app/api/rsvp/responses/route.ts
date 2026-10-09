import { z } from "zod";
import { hostSecretSchema, rsvpIdFromSecret } from "@/lib/rsvp";
import { listReplies, RsvpStoreError } from "@/lib/rsvp-store";

const noStore = { "Cache-Control": "no-store" };

/** The host proves ownership with the secret from their private link; it is POSTed to keep it out of URLs and logs. */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = z.object({ secret: hostSecretSchema }).safeParse(body);
  if (!parsed.success)
    return Response.json(
      { error: "This responses link is incomplete. Copy the full link again." },
      { status: 400, headers: noStore },
    );
  try {
    const replies = await listReplies(
      await rsvpIdFromSecret(parsed.data.secret),
    );
    return Response.json({ replies }, { headers: noStore });
  } catch (error) {
    const status = error instanceof RsvpStoreError ? error.status : 500;
    const message =
      error instanceof RsvpStoreError
        ? error.message
        : "Replies couldn’t be loaded. Please try again.";
    return Response.json({ error: message }, { status, headers: noStore });
  }
}
