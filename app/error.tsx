"use client";
import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="status-card not-found">
      <p className="eyebrow">A LITTLE PAUSE</p>
      <h1>We couldn’t open this page.</h1>
      <p>
        Please try again in a moment. Your invitation may still be available.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
      <Link className="text-link" href="/">
        Back to sixteen
      </Link>
    </main>
  );
}
