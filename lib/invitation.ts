import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";

import { isGoogleMapsUrl } from "@/lib/presentation";
export {
  isGoogleMapsUrl,
  emptyInvitation,
  sampleInvitation,
  formatEventDate,
  formatEventTime,
} from "@/lib/presentation";

export const invitationSchema = z.object({
  host_name: z
    .string()
    .trim()
    .min(1, "Add the birthday girl's name.")
    .max(80, "Keep the name under 80 characters."),
  event_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.")
    .refine((value) => {
      try {
        Temporal.PlainDate.from(value);
        return true;
      } catch {
        return false;
      }
    }, "Choose a valid date."),
  event_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid time."),
  time_zone: z
    .string()
    .min(1, "Choose the event timezone.")
    .max(100)
    .refine((value) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: value });
        return !/^[+-]/.test(value);
      } catch {
        return false;
      }
    }, "Choose a valid timezone, such as Asia/Tbilisi."),
  address: z
    .string()
    .trim()
    .min(1, "Add the venue or address.")
    .max(300, "Keep the address under 300 characters."),
  maps_url: z
    .string()
    .trim()
    .max(2048, "This link is too long.")
    .refine(
      isGoogleMapsUrl,
      "Use a Google Maps share link, such as https://maps.app.goo.gl/…",
    ),
  message: z.string().trim().max(600, "Keep the message under 600 characters."),
  event_title: z
    .string()
    .trim()
    .max(100, "Keep the title under 100 characters."),
  dress_code: z
    .string()
    .trim()
    .max(100, "Keep the dress code under 100 characters."),
});

export type InvitationInput = z.infer<typeof invitationSchema>;
export type FieldErrors = Partial<Record<keyof InvitationInput, string>>;
export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; message: string; errors?: FieldErrors };

export function eventInstant(
  input: Pick<InvitationInput, "event_date" | "event_time" | "time_zone">,
) {
  return Temporal.PlainDateTime.from(
    `${input.event_date}T${input.event_time}`,
  ).toZonedDateTime(input.time_zone, { disambiguation: "reject" })
    .epochMilliseconds;
}

export function validateInvitation(
  input: unknown,
  previous?: InvitationInput,
  now = Date.now(),
): ActionResult<InvitationInput> {
  const parsed = invitationSchema.safeParse(input);
  if (!parsed.success) {
    const errors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof InvitationInput;
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, message: "A few details need your attention.", errors };
  }
  const data = parsed.data;
  const timeChanged =
    !previous ||
    ["event_date", "event_time", "time_zone"].some(
      (key) =>
        data[key as keyof InvitationInput] !==
        previous[key as keyof InvitationInput],
    );
  if (timeChanged) {
    try {
      if (eventInstant(data) <= now)
        return {
          ok: false,
          message: "Choose an upcoming date and time.",
          errors: { event_date: "Your celebration must be in the future." },
        };
    } catch {
      return {
        ok: false,
        message: "Check the event time.",
        errors: {
          event_time:
            "This time is skipped or repeated by daylight saving. Choose another time.",
        },
      };
    }
  }
  return { ok: true, data };
}
