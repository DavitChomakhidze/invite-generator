"use client";
import type { InvitationErrors } from "@/lib/invitation-model";
import type { ScrollDraft } from "@/lib/scroll-draft";
import { MusicSegmentSelector } from "@/components/music-segment-selector";

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
      <div className="form-field">
        <label className="checkbox-field">
          <input
            type="checkbox"
            name="scroll.collect_rsvp"
            checked={draft.collect_rsvp}
            onChange={(e) =>
              onChange({ ...draft, collect_rsvp: e.target.checked })
            }
          />
          Let guests accept or decline
        </label>
        <p className="field-help">
          Guests add their name when they reply. You’ll get a private link to
          see who’s coming.
        </p>
      </div>
      <MusicSegmentSelector
        value={draft.music}
        onChange={(music) => onChange({ ...draft, music })}
        errors={errors}
      />
    </fieldset>
  );
}
