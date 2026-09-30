"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import type { FieldErrors, InvitationInput } from "@/lib/invitation";
import { emptyInvitation, sampleInvitation } from "@/lib/presentation";
import { InvitationCard } from "@/components/invitation-card";
import { ShareControls } from "@/components/share-controls";
import { useBrowser } from "@/lib/use-browser";

export function InvitationForm() {
  const [draft, setValues] = useState<InvitationInput>({
    ...emptyInvitation,
    time_zone: "",
  });
  const browser = useBrowser();
  const values = {
    ...draft,
    time_zone:
      draft.time_zone ||
      (browser ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"),
  };
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [success, setSuccess] = useState<{
    guestUrl: string;
  } | null>(null);
  const zones = useMemo(
    () =>
      browser && typeof Intl.supportedValuesOf === "function"
        ? ["UTC", ...Intl.supportedValuesOf("timeZone")]
        : ["UTC", "Asia/Tbilisi", "Europe/London", "America/New_York"],
    [browser],
  );
  const formRef = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  const successRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (success) successRef.current?.focus();
  }, [success]);

  function change(key: keyof InvitationInput, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setMessage("");
  }
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
  function focusError(next: FieldErrors = {}) {
    const key = Object.keys(next)[0];
    if (key)
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>(`[name="${key}"]`)?.focus(),
      );
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setMessage("");
    setErrors({});
    try {
      const { validateInvitation } = await import("@/lib/invitation");
      const validated = validateInvitation(values);
      if (!validated.ok) {
        setErrors(validated.errors || {});
        setMessage(validated.message);
        focusError(validated.errors);
        return;
      }
      const { encodeInvitation } = await import("@/lib/invite-link");
      const fragment = await encodeInvitation(validated.data);
      const url = new URL("/invite", window.location.origin);
      url.hash = fragment;
      setSuccess({ guestUrl: url.href });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The invitation link could not be created. Your details are still here.",
      );
    } finally {
      setPending(false);
      submitting.current = false;
    }
  }

  const preview = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      value || sampleInvitation[key as keyof InvitationInput],
    ]),
  ) as InvitationInput;
  // Optional text should disappear when deliberately left blank; sample copy only accompanies an untouched form.
  if (values.host_name) {
    preview.message = values.message;
    preview.dress_code = values.dress_code;
    preview.event_title = values.event_title;
  }

  return (
    <div className="studio-grid">
      <div className="editor-column">
        {success ? (
          <section
            ref={successRef}
            tabIndex={-1}
            className="editor-card success-card"
            aria-labelledby="success-title"
          >
            <p className="eyebrow">SEALED WITH A LITTLE LOVE</p>
            <h2 id="success-title">Your invitation is ready.</h2>
            <p>Let the lovely people in your life know they’re invited.</p>
            <ShareControls url={success.guestUrl} />
            <Link className="text-link" href={success.guestUrl} target="_blank">
              Take a look at your invitation{" "}
            </Link>
            <p className="link-explanation">
              Keep this link: it contains your invitation. If plans change,
              create and share a new link. Previously shared links stay
              unchanged.
            </p>
            <button
              className="text-link"
              type="button"
              onClick={() => setSuccess(null)}
            >
              Change details and make a new link
            </button>
            <button
              className="text-link"
              type="button"
              onClick={() => {
                setSuccess(null);
                setValues((previous) => ({
                  ...emptyInvitation,
                  time_zone: previous.time_zone,
                }));
              }}
            >
              Create another invitation{" "}
            </button>
          </section>
        ) : (
          <form
            ref={formRef}
            className="editor-card"
            onSubmit={submit}
            noValidate
          >
            <div className="card-heading">
              <div>
                <h2>Make it yours</h2>
                <p>
                  An invitation that feels like you. Start with the details.
                </p>
              </div>
            </div>
            <fieldset disabled={!browser || pending}>
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
            <fieldset disabled={!browser || pending}>
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
            <fieldset disabled={!browser || pending}>
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
            {message && (
              <p
                className={`form-notice ${message.startsWith("Saved!") ? "is-success" : ""}`}
                role="status"
              >
                {message}
              </p>
            )}
            <button
              type="submit"
              className="button primary generate-button"
              disabled={!browser || pending}
            >
              {pending ? "Creating your link?" : "Generate my invitation"}
            </button>
            <noscript>
              <p className="form-notice">
                Enable JavaScript to create and open invitation links.
              </p>
            </noscript>
            <p className="form-footnote">No account needed. Ready to share.</p>
            <p className="unlisted-note">
              Your invitation is unlisted. Anyone with the guest link can view
              it.
            </p>
          </form>
        )}
        <div className="below-form-note">
          <span>Made for your once-in-a-lifetime kind of moment.</span>
        </div>
      </div>
      <aside
        id="experience"
        className={`preview-column ${previewOpen ? "preview-open" : ""}`}
        aria-label="Invitation preview"
      >
        <div className="preview-heading">
          <span>
            <span className="live-dot" /> LIVE PREVIEW
          </span>
          <button
            className="preview-toggle"
            type="button"
            onClick={() => setPreviewOpen(!previewOpen)}
            aria-expanded={previewOpen}
            aria-controls="preview-content"
          >
            {previewOpen ? "Hide preview" : "Show preview"}
          </button>
          <span className="desktop-preview-note">See how it opens</span>
        </div>
        <div id="preview-content" className="preview-content">
          <div className="preview-stage">
            <div className="preview-sticker">made just for you</div>
            <InvitationCard
              key={previewOpen ? "open" : "closed"}
              invite={preview}
              preview
            />
          </div>
          <p className="preview-caption">
            A preview of the invitation your guests will open.
          </p>
        </div>
      </aside>
    </div>
  );
}
