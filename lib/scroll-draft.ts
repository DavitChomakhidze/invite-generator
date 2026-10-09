import type { ScrollSettings } from "@/lib/invitation-model";

export type ScrollDraft = {
  age: string;
  portrait_url: string;
  closing_message: string;
  music: ScrollSettings["music"];
  collect_rsvp: boolean;
};
export function defaultScrollDraft(): ScrollDraft {
  return {
    age: "",
    portrait_url: "",
    closing_message: "",
    music: null,
    collect_rsvp: true,
  };
}
export function scrollDraftSettings(draft: ScrollDraft): ScrollSettings {
  return {
    age: draft.age.trim() ? Number(draft.age) : undefined,
    portrait: draft.portrait_url.trim()
      ? { kind: "remote", url: draft.portrait_url.trim() }
      : { kind: "default" },
    closing_message: draft.closing_message,
    music: draft.music,
  };
}
