"use client";
import type { InvitationErrors } from "@/lib/invitation-model";
import type { ScrollDraft } from "@/lib/scroll-draft";
import { MusicSegmentSelector } from "@/components/music-segment-selector";
import {
  STORY_THEMES,
  themesFor,
  type StoryAudience,
} from "@/lib/story-themes";

export function ScrollSettingsFields({
  draft,
  onChange,
  errors,
  disabled,
}: {
  draft: ScrollDraft;
  onChange: (draft: ScrollDraft) => void;
  errors: InvitationErrors;
  disabled: boolean;
}) {
  function error(path: string) {
    return errors[path] ? (
      <p id={`${path}-error`} className="field-error">
        {errors[path]}
      </p>
    ) : null;
  }
  function a11y(path: string) {
    return {
      id: path,
      name: path,
      "aria-invalid": Boolean(errors[path]),
      "aria-describedby": errors[path] ? `${path}-error` : undefined,
    };
  }
  return (
    <fieldset disabled={disabled}>
      <legend>
        <span>04</span> Your Scroll Story{" "}
        <span className="optional-tag">OPTIONAL</span>
      </legend>
      <StoryDesignPicker
        theme={draft.theme}
        onChange={(theme) => onChange({ ...draft, theme })}
      />
      <div className="form-field">
        <label htmlFor="scroll.age">Birthday age</label>
        <input
          {...a11y("scroll.age")}
          type="number"
          min={1}
          max={150}
          step={1}
          placeholder="e.g. 16 — or leave blank"
          value={draft.age}
          onChange={(e) => onChange({ ...draft, age: e.target.value })}
        />
        {error("scroll.age")}
        <p className="field-help">
          Leave blank to celebrate without displaying an age.
        </p>
      </div>
      <div className="form-field">
        <label htmlFor="scroll.portrait.url">Portrait image URL</label>
        <input
          {...a11y("scroll.portrait.url")}
          type="url"
          maxLength={2048}
          value={draft.portrait_url}
          placeholder="https://images.unsplash.com/…"
          onChange={(e) => onChange({ ...draft, portrait_url: e.target.value })}
        />
        {error("scroll.portrait.url")}
        <p className="field-help">
          Leave blank for the illustrated demo portrait. Use a public image from
          images.unsplash.com or res.cloudinary.com. The host receives image
          requests and may change or remove the image. Never include
          credentials.
        </p>
      </div>
      <div className="form-field">
        <label htmlFor="scroll.closing_message">Closing message</label>
        <textarea
          {...a11y("scroll.closing_message")}
          rows={3}
          maxLength={300}
          value={draft.closing_message}
          placeholder="Can’t wait to celebrate with you."
          onChange={(e) =>
            onChange({ ...draft, closing_message: e.target.value })
          }
        />
        {error("scroll.closing_message")}
      </div>
      <MusicSegmentSelector
        value={draft.music}
        onChange={(music) => onChange({ ...draft, music })}
        errors={errors}
      />
    </fieldset>
  );
}

function StoryDesignPicker({
  theme,
  onChange,
}: {
  theme: ScrollDraft["theme"];
  onChange: (theme: ScrollDraft["theme"]) => void;
}) {
  const audience = STORY_THEMES[theme].audience;
  return (
    <fieldset className="design-picker">
      <legend>Design</legend>
      <div className="audience-switch">
        {(
          [
            ["her", "For her"],
            ["him", "For him"],
          ] as [StoryAudience, string][]
        ).map(([id, label]) => (
          <label key={id} className={audience === id ? "selected" : ""}>
            <input
              type="radio"
              name="scroll.audience"
              value={id}
              checked={audience === id}
              onChange={() => onChange(themesFor(id)[0])}
            />
            {label}
          </label>
        ))}
      </div>
      <div className="theme-options">
        {themesFor(audience).map((id) => (
          <label key={id} className={theme === id ? "selected" : ""}>
            <input
              type="radio"
              name="scroll.theme"
              value={id}
              checked={theme === id}
              onChange={() => onChange(id)}
            />
            <span className="theme-swatches" aria-hidden="true">
              {STORY_THEMES[id].swatches.map((color) => (
                <span key={color} style={{ background: color }} />
              ))}
            </span>
            {STORY_THEMES[id].name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
