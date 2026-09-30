import { describe, expect, it } from "vitest";
import {
  eventInstant,
  formatEventDate,
  formatEventTime,
  isGoogleMapsUrl,
  sampleInvitation,
  validateInvitation,
} from "@/lib/invitation";

const valid = { ...sampleInvitation, event_date: "2035-06-19" };
const now = Date.parse("2030-01-01T00:00:00Z");

describe("Google Maps links", () => {
  it.each([
    "https://google.com/maps",
    "https://www.google.com/maps/place/Rose+Garden",
    "https://maps.google.com/?q=park",
    "https://maps.app.goo.gl/Ab12",
    "https://goo.gl/maps/Ab12",
  ])("accepts %s", (url) => expect(isGoogleMapsUrl(url)).toBe(true));
  it.each([
    "javascript:alert(1)",
    "http://maps.google.com",
    "https://google.com.evil.com/maps",
    "https://evil.com/?next=google.com/maps",
    "https://google.com@evil.com/maps",
    "https://user:password@google.com/maps",
    "https://google.com/mapsfake",
    "https://goo.gl/other",
    "https://maps.app.goo.gl/",
    "https://maps.google.com:444/",
    "not a URL",
  ])("rejects %s", (url) => expect(isGoogleMapsUrl(url)).toBe(false));
});

describe("invitation validation", () => {
  it("trims text and removes unknown input fields", () => {
    const result = validateInvitation(
      {
        ...valid,
        host_name: "  Isabella  ",
        management_token_hash: "injected",
      },
      undefined,
      now,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.host_name).toBe("Isabella");
      expect(result.data).not.toHaveProperty("management_token_hash");
    }
  });
  it.each([
    { host_name: " " },
    { address: "" },
    { event_date: "2035-02-30" },
    { event_date: "2020-01-01" },
    { event_time: "24:00" },
    { time_zone: "Somewhere/Invalid" },
    { message: "x".repeat(601) },
    { event_title: "x".repeat(101) },
    { dress_code: "x".repeat(101) },
  ])("rejects invalid fields %j", (patch) =>
    expect(validateInvitation({ ...valid, ...patch }, undefined, now).ok).toBe(
      false,
    ),
  );
  it("uses event timezone rather than the server timezone", () => {
    expect(
      eventInstant({
        event_date: "2035-06-19",
        event_time: "18:00",
        time_zone: "Asia/Tbilisi",
      }),
    ).toBe(Date.parse("2035-06-19T14:00:00Z"));
  });
  it("rejects skipped and ambiguous daylight-saving times", () => {
    expect(
      validateInvitation(
        {
          ...valid,
          event_date: "2030-03-10",
          event_time: "02:30",
          time_zone: "America/New_York",
        },
        undefined,
        now,
      ).ok,
    ).toBe(false);
    expect(
      validateInvitation(
        {
          ...valid,
          event_date: "2030-11-03",
          event_time: "01:30",
          time_zone: "America/New_York",
        },
        undefined,
        now,
      ).ok,
    ).toBe(false);
  });
  it("allows copy edits after an event but rejects changing to a past event time", () => {
    const past = { ...valid, event_date: "2025-06-19" };
    expect(
      validateInvitation(
        { ...past, message: "Thank you for celebrating!" },
        past,
        now,
      ).ok,
    ).toBe(true);
    expect(
      validateInvitation({ ...past, event_time: "19:00" }, past, now).ok,
    ).toBe(false);
  });
  it("formats the event's calendar date and time without a guest-timezone shift", () => {
    expect(formatEventDate("2035-06-19")).toBe("Tuesday, June 19, 2035");
    expect(formatEventTime("00:15")).toBe("12:15 AM");
    expect(formatEventTime("18:00")).toBe("6:00 PM");
    expect(formatEventDate("")).toBe("Your special day");
  });
});
