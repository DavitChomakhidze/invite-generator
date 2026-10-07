"use client";
import type { InvitationInput } from "@/lib/invitation";
import type { InvitationErrors } from "@/lib/invitation-model";

export function SharedEventFields({
  values,
  errors,
  onChange: change,
  zones,
  disabled,
}: {
  values: InvitationInput;
  errors: InvitationErrors;
  onChange: (key: keyof InvitationInput, value: string) => void;
  zones: string[];
  disabled: boolean;
}) {
  function field(key: keyof InvitationInput) {
    return {
      id: key,
      name: key,
      value: values[key],
      onChange: (
        event: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => change(key, event.target.value),
      "aria-invalid": Boolean(errors[key]),
      "aria-describedby": errors[key] ? `${key}-error` : undefined,
    };
  }
  function error(key: keyof InvitationInput) {
    return errors[key] ? (
      <p className="field-error" id={`${key}-error`}>
        {errors[key]}
      </p>
    ) : null;
  }
  return (
    <>
      <fieldset disabled={disabled}>
        <legend>
          <span>01</span> The birthday details
        </legend>
        <div className="form-field">
          <label htmlFor="host_name">
            Name to celebrate <span className="required">*</span>
          </label>
          <input
            {...field("host_name")}
            placeholder="e.g. Isabella"
            maxLength={80}
            autoComplete="given-name"
            required
          />
          {error("host_name")}
        </div>
        <div className="field-row">
          <div className="form-field">
            <label htmlFor="event_date">
              The date <span className="required">*</span>
            </label>
            <input {...field("event_date")} type="date" required />
            {error("event_date")}
          </div>
          <div className="form-field">
            <label htmlFor="event_time">
              The time <span className="required">*</span>
            </label>
            <input {...field("event_time")} type="time" required />
            {error("event_time")}
          </div>
        </div>
        <div className="form-field timezone-field">
          <label htmlFor="time_zone">Event timezone</label>
          <div className="select-wrap">
            <select {...field("time_zone")}>
              {[...new Set([values.time_zone, ...zones])].map((zone) => (
                <option key={zone} value={zone}>
                  {zone.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          {error("time_zone")}
        </div>
      </fieldset>
      <fieldset disabled={disabled}>
        <legend>
          <span>02</span> The lovely location
        </legend>
        <div className="form-field">
          <label htmlFor="address">
            Venue or address <span className="required">*</span>
          </label>
          <div className="address-input">
            <input
              {...field("address")}
              placeholder="e.g. The Rose Garden, 24 Bloom Street"
              maxLength={300}
              required
            />
          </div>
          {error("address")}
        </div>
        <div className="form-field">
          <label htmlFor="maps_url">
            Google Maps link <span className="required">*</span>
          </label>
          <input
            {...field("maps_url")}
            type="url"
            placeholder="https://maps.app.goo.gl/…"
            maxLength={2048}
            required
          />
          {error("maps_url")}
          <p className="field-help">
            Find your venue in Google Maps → Share → Copy link.
          </p>
        </div>
      </fieldset>
      <fieldset disabled={disabled}>
        <legend>
          <span>03</span> A personal touch{" "}
          <span className="optional-tag">OPTIONAL</span>
        </legend>
        <div className="form-field">
          <label htmlFor="message">A little note to your guests </label>
          <textarea
            {...field("message")}
            placeholder="A little sparkle, a lot of love, and my favorite people…"
            rows={3}
            maxLength={600}
          />
          <div className="textarea-footer">
            {error("message")}
            <span>{values.message.length}/600</span>
          </div>
        </div>
        <div className="field-row">
          <div className="form-field">
            <label htmlFor="event_title">Event title</label>
            <input
              {...field("event_title")}
              placeholder="Birthday celebration"
              maxLength={100}
            />
            {error("event_title")}
          </div>
          <div className="form-field">
            <label htmlFor="dress_code">Dress code</label>
            <input
              {...field("dress_code")}
              placeholder="e.g. A touch of pink"
              maxLength={100}
            />
            {error("dress_code")}
          </div>
        </div>
      </fieldset>
    </>
  );
}
