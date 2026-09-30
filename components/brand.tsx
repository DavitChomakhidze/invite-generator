import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Sixteen home">
      sixteen<span className="brand-dot">.</span>
    </Link>
  );
}
export function Header({ simple = false }: { simple?: boolean }) {
  return (
    <header className="site-header">
      <Brand />
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
        sixteen.{" "}
        <span className="footer-muted">An invitation to remember.</span>
      </span>
      <span>For your favorite people.</span>
    </footer>
  );
}
