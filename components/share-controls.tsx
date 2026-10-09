"use client";
import { useRef, useState } from "react";

export function ShareControls({
  url,
  label = "Invitation link",
  copyLabel = "Copy invitation link",
}: {
  url: string;
  label?: string;
  copyLabel?: string;
}) {
  const [status, setStatus] = useState("");
  const input = useRef<HTMLInputElement>(null);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Copied!");
    } catch {
      input.current?.focus();
      input.current?.select();
      setStatus("Select and copy the link above.");
    }
  }
  async function share() {
    if (!navigator.share) {
      await copy();
      return;
    }
    try {
      await navigator.share({ title: "You're invited · occasion", url });
      setStatus("Shared!");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        await copy();
    }
  }
  return (
    <div className="share-controls">
      <label>
        {label}
        <input
          ref={input}
          aria-label={label}
          value={url}
          readOnly
          onFocus={(event) => event.target.select()}
        />
      </label>
      <div className="share-actions">
        <button type="button" className="button primary" onClick={copy}>
          {status === "Copied!" ? "Copied!" : copyLabel}
        </button>
        <button type="button" className="button secondary" onClick={share}>
          Share
        </button>
      </div>
      <p className="copy-status" role="status">
        {status}
      </p>
    </div>
  );
}
