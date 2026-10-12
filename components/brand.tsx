import Link from "next/link";
export function Brand({ linked = true }: { linked?: boolean }) {
  const mark = (
    <>
      occasion<span className="brand-dot">.</span>
    </>
  );
  // Public pages must not lead customers back to the private generator.
  return linked ? (
    <Link href="/" className="brand" aria-label="Occasion home">
      {mark}
    </Link>
  ) : (
    <span className="brand">{mark}</span>
  );
}
export function Header({ simple = false }: { simple?: boolean }) {
  return (
    <header className="site-header">
      <Brand linked={!simple} />
      <nav aria-label="Main navigation">
        {!simple && (
          <>
            <a href="#how-it-works">How it works</a>
            <a href="#experience">The invitation</a>
          </>
        )}
        <span className="header-note">An occasion worth celebrating</span>
      </nav>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <span>
        occasion.{" "}
        <span className="footer-muted">An invitation to remember.</span>
      </span>
      <span>
        For your favorite people. <Link href="/privacy">Privacy</Link>
      </span>
    </footer>
  );
}
