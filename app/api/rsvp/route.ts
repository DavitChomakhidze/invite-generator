import { rsvpReplySchema } from "@/lib/rsvp";
import { RsvpStoreError, saveReply } from "@/lib/rsvp-store";

const noStore = { "Cache-Control": "no-store" };

/** Guests record or update their own reply. Invitation contents never reach the server. */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = rsvpReplySchema.safeParse(body);
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message || "Check your reply." },
      { status: 400, headers: noStore },
    );
  try {
    await saveReply(parsed.data);
    return Response.json({ ok: true }, { headers: noStore });
  } catch (error) {
    const status = error instanceof RsvpStoreError ? error.status : 500;
    const message =
      error instanceof RsvpStoreError
        ? error.message
        : "Your reply couldn’t be saved. Please try again.";
    return Response.json({ error: message }, { status, headers: noStore });
  }
}
