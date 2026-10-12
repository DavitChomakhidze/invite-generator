import type { InvitationInput } from "@/lib/invitation";
import type { Audience } from "@/lib/themes";

export function isGoogleMapsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port)
      return false;
    const mapsPath =
      url.pathname === "/maps" || url.pathname.startsWith("/maps/");
    if (["google.com", "www.google.com", "goo.gl"].includes(url.hostname))
      return mapsPath;
    if (url.hostname === "maps.google.com") return true;
    return url.hostname === "maps.app.goo.gl" && url.pathname.length > 1;
  } catch {
    return false;
  }
}

export const emptyInvitation: InvitationInput = {
  host_name: "",
  event_date: "",
  event_time: "",
  time_zone: "UTC",
  address: "",
  maps_url: "",
  message: "",
  event_title: "",
  dress_code: "",
};

export const sampleInvitation: InvitationInput = {
  host_name: "Isabella",
  event_date: "2027-06-19",
  event_time: "18:00",
  time_zone: "Asia/Tbilisi",
  address: "The Rose Garden · 24 Bloom Street",
  maps_url: "https://www.google.com/maps",
  message:
    "A little sparkle, a lot of love, and my favorite people. Come make a wish with me!",
  event_title: "",
  dress_code: "A touch of pink",
};

/** Preview content shown until the creator fills a field, matched to the chosen design. */
export const sampleInvitations: Record<Audience, InvitationInput> = {
  her: sampleInvitation,
  him: {
    ...sampleInvitation,
    host_name: "Alexander",
    address: "The Oak Terrace · 12 Harbor Street",
    message:
      "Good friends, great music and plenty of cake. Come celebrate with me!",
    dress_code: "Smart casual",
  },
};

/** Example text inside empty form fields. */
export const fieldHints: Record<
  Audience,
  Record<"host_name" | "address" | "message" | "dress_code", string>
> = {
  her: {
    host_name: "e.g. Isabella",
    address: "e.g. The Rose Garden, 24 Bloom Street",
    message: "A little sparkle, a lot of love, and my favorite people…",
    dress_code: "e.g. A touch of pink",
  },
  him: {
    host_name: "e.g. Alexander",
    address: "e.g. The Oak Terrace, 12 Harbor Street",
    message: "Good friends, great music and plenty of cake…",
    dress_code: "e.g. Smart casual",
  },
};

export function formatEventDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Your special day";
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "Your special day";
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatEventTime(value: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return "Time to celebrate";
  const [hour, minute] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}
