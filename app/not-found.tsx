import Link from "next/link";
import { Header, Footer } from "@/components/brand";

export default function NotFound() {
  return (
    <>
      <Header simple />
      <main id="main-content" className="status-card not-found">
        <p className="eyebrow">A LITTLE LOST IN THE POST</p>
        <h1>This invitation isn’t available.</h1>
        <p>
          This link is incomplete or belongs to an older invitation. Ask your
          host for a new invitation link.
        </p>
        <Link className="button primary" href="/">
          Back to occasion
        </Link>
      </main>
      <Footer />
    </>
  );
}
