import type { ScrollSettings } from "@/lib/invitation-model";
import { DEFAULT_STORY_THEME, type StoryTheme } from "@/lib/story-themes";

export type ScrollDraft = {
  age: string;
  portrait_url: string;
  closing_message: string;
  music: ScrollSettings["music"];
  theme: StoryTheme;
};
export function defaultScrollDraft(): ScrollDraft {
  return {
    age: "",
    portrait_url: "",
    closing_message: "",
    music: null,
    theme: DEFAULT_STORY_THEME,
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
    theme: draft.theme,
  };
}
