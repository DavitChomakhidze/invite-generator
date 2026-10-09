"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import type { InvitationInput } from "@/lib/invitation";
import { emptyInvitation, sampleInvitation } from "@/lib/presentation";
import { SharedEventFields } from "@/components/shared-event-fields";
import { InvitationStyleSelector } from "@/components/invitation-style-selector";
import { InvitationPreview } from "@/components/invitation-preview";
import dynamic from "next/dynamic";
import {
  type InvitationErrors,
  type InvitationStyle,
  type NormalizedInvitation,
} from "@/lib/invitation-model";
import {
  defaultScrollDraft,
  scrollDraftSettings,
  type ScrollDraft,
} from "@/lib/scroll-draft";
const ScrollSettingsFields = dynamic(
  () =>
    import("@/components/scroll-settings-fields").then(
      (m) => m.ScrollSettingsFields,
    ),
  {
    loading: () => <p role="status">Loading story settings…</p>,
  },
);
import { ShareControls } from "@/components/share-controls";
import { isPortraitUrl } from "@/lib/portrait";
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
  const [style, setStyle] = useState<InvitationStyle>("card");
  const [scrollDraft, setScrollDraft] =
    useState<ScrollDraft>(defaultScrollDraft);
  const [errors, setErrors] = useState<InvitationErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<{
    guestUrl: string;
    responsesUrl?: string;
  } | null>(null);
  const zones = useMemo(
    () =>
      browser && typeof Intl.supportedValuesOf === "function"
        ? ["UTC", ...Intl.supportedValuesOf("timeZone")]
        : ["UTC", "Asia/Tbilisi", "Europe/London", "America/New_York"],
    [browser],
  );
  const formRef = useRef<HTMLFormElement>(null);
  const errorFocus = useRef<string | null>(null);
  const submitting = useRef(false);
  const successRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (success) successRef.current?.focus();
  }, [success]);
  useEffect(() => {
    // Wait for errors and enabled controls to commit before focusing a field.
    if (pending || !errorFocus.current) return;
    const key = errorFocus.current;
    errorFocus.current = null;
    formRef.current?.querySelector<HTMLElement>(`[name="${key}"]`)?.focus();
  }, [errors, pending]);

  function change(key: keyof InvitationInput, value: string) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setMessage("");
  }
  function focusError(next: InvitationErrors = {}) {
    errorFocus.current = Object.keys(next)[0] || null;
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setMessage("");
    setErrors({});
    try {
      const { validateNormalizedInvitation } =
        await import("@/lib/invitation-model");
      const rsvp =
        style === "scroll" && scrollDraft.collect_rsvp
          ? await import("@/lib/rsvp").then((m) => m.createRsvpKeys())
          : null;
      const candidate =
        style === "card"
          ? { ...values, style }
          : {
              ...values,
              style,
              scroll: {
                ...scrollDraftSettings(scrollDraft),
                rsvp_id: rsvp?.id,
              },
            };
      const validated = validateNormalizedInvitation(candidate);
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
      if (!rsvp) {
        setSuccess({ guestUrl: url.href });
        return;
      }
      const [{ responsesUrl }, { saveHostInvite }] = await Promise.all([
        import("@/lib/rsvp"),
        import("@/lib/rsvp-local"),
      ]);
      saveHostInvite({
        secret: rsvp.secret,
        host_name: validated.data.host_name,
        event_title: validated.data.event_title,
        event_date: validated.data.event_date,
      });
      setSuccess({
        guestUrl: url.href,
        responsesUrl: responsesUrl(window.location.origin, rsvp.secret),
      });
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

  const previewSettings = scrollDraftSettings(scrollDraft);
  const previewInvite: NormalizedInvitation =
    style === "card"
      ? { ...preview, style }
      : {
          ...preview,
          style,
          scroll: {
            ...previewSettings,
            age:
              Number.isInteger(previewSettings.age) &&
              previewSettings.age! >= 1 &&
              previewSettings.age! <= 150
                ? previewSettings.age
                : undefined,
            portrait:
              previewSettings.portrait.kind === "remote" &&
              !isPortraitUrl(previewSettings.portrait.url)
                ? { kind: "default" }
                : previewSettings.portrait,
            // The preview shows a disabled RSVP section; the real id is created on submit.
            rsvp_id: scrollDraft.collect_rsvp ? "preview" : undefined,
          },
        };

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
            {success.responsesUrl && (
              <div className="private-link-panel">
                <h3>See who’s coming</h3>
                <p>
                  This private link shows every accept and decline. Keep it to
                  yourself — don’t send it to guests. It’s also remembered in
                  this browser.
                </p>
                <ShareControls
                  url={success.responsesUrl}
                  label="Your private responses link"
                  copyLabel="Copy responses link"
                />
                <Link
                  className="text-link"
                  href={success.responsesUrl}
                  target="_blank"
                >
                  Open responses
                </Link>
              </div>
            )}
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
                setScrollDraft(defaultScrollDraft());
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
            <InvitationStyleSelector
              value={style}
              disabled={!browser || pending}
              onChange={(next) => {
                setStyle(next);
                setErrors({});
                setMessage("");
              }}
            />
            <SharedEventFields
              values={values}
              errors={errors}
              onChange={change}
              zones={zones}
              disabled={!browser || pending}
            />
            {style === "scroll" && (
              <ScrollSettingsFields
                draft={scrollDraft}
                onChange={(next) => {
                  setScrollDraft(next);
                  setErrors({});
                  setMessage("");
                }}
                errors={errors}
                disabled={!browser || pending}
              />
            )}
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
      <InvitationPreview invite={previewInvite} />
    </div>
  );
}
