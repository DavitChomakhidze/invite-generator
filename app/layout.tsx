import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const body = localFont({
  src: "../node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2",
  weight: "200 900",
  style: "normal",
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  icons: { icon: "/occasion-mark.svg" },
  title: {
    default: "occasion · Birthday invitations worth opening",
    template: "%s · occasion",
  },
  description:
    "Create a beautiful animated birthday invitation. Made with a little love, ready to share.",
  referrer: "no-referrer",
  openGraph: {
    title: "You're invited · occasion",
    description:
      "A very special celebration, and a little invitation made with love.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={body.variable}>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
