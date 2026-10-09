import { z } from "zod";
import {
  invitationSchema,
  validateInvitation,
  type InvitationInput,
} from "@/lib/invitation";
import { findMusicTrack } from "@/lib/music-catalog";
import { isPortraitUrl } from "@/lib/portrait";
import { rsvpIdSchema } from "@/lib/rsvp";

export const portraitSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("default") }),
  z.object({
    kind: z.literal("remote"),
    url: z
      .string()
      .trim()
      .max(2048)
      .refine(
        isPortraitUrl,
        "Use an HTTPS image URL from images.unsplash.com or res.cloudinary.com, without credentials or a custom port.",
      ),
  }),
]);

export const musicSegmentSchema = z
  .object({
    song_id: z.string().min(1).max(100),
    start_seconds: z.number().finite().min(0),
    end_seconds: z.number().finite().min(1),
  })
  .superRefine((segment, ctx) => {
    const track = findMusicTrack(segment.song_id);
    if (!track)
      ctx.addIssue({
        code: "custom",
        path: ["song_id"],
        message: "Choose an available song.",
      });
    if (segment.end_seconds - segment.start_seconds < 1)
      ctx.addIssue({
        code: "custom",
        path: ["end_seconds"],
        message: "Choose a segment of at least one second.",
      });
    if (track && segment.end_seconds > track.duration_seconds)
      ctx.addIssue({
        code: "custom",
        path: ["end_seconds"],
        message: "The segment must end within the song.",
      });
  });

export const scrollSettingsSchema = z.object({
  age: z
    .number()
    .int()
    .min(1, "Use an age from 1 to 150.")
    .max(150, "Use an age from 1 to 150.")
    .optional(),
  portrait: portraitSchema.default({ kind: "default" }),
  closing_message: z
    .string()
    .trim()
    .max(300, "Keep the closing message under 300 characters.")
    .default(""),
  music: musicSegmentSchema.nullable().default(null),
  // Present only when the host chose to collect replies; links without it show no RSVP section.
  rsvp_id: rsvpIdSchema.optional(),
});

export const normalizedInvitationSchema = z.discriminatedUnion("style", [
  invitationSchema.extend({ style: z.literal("card") }),
  invitationSchema.extend({
    style: z.literal("scroll"),
    scroll: scrollSettingsSchema,
  }),
]);

export type NormalizedInvitation = z.infer<typeof normalizedInvitationSchema>;
export type InvitationStyle = NormalizedInvitation["style"];
export type ScrollSettings = z.infer<typeof scrollSettingsSchema>;
export type MusicSegment = z.infer<typeof musicSegmentSchema>;
export type InvitationErrors = Partial<Record<string, string>>;
export type ScrollInvitationData = Extract<
  NormalizedInvitation,
  { style: "scroll" }
>;

export function defaultScrollSettings(): ScrollSettings {
  return { portrait: { kind: "default" }, closing_message: "", music: null };
}

export function normalizeLegacyInvitation(
  input: InvitationInput,
): NormalizedInvitation {
  return { ...input, style: "card" };
}

export function validateNormalizedInvitation(
  input: unknown,
  now = Date.now(),
):
  | { ok: true; data: NormalizedInvitation }
  | { ok: false; message: string; errors: InvitationErrors } {
  const parsed = normalizedInvitationSchema.safeParse(input);
  if (!parsed.success) {
    const errors: InvitationErrors = {};
    for (const issue of parsed.error.issues)
      errors[issue.path.join(".")] ??= issue.message;
    return { ok: false, message: "A few details need your attention.", errors };
  }
  const event = validateInvitation(parsed.data, undefined, now);
  if (!event.ok)
    return { ok: false, message: event.message, errors: event.errors || {} };
  return { ok: true, data: parsed.data };
}
