# occasion

A birthday invitation generator with a custom illustrated host and an animated envelope reveal. Guests can read the details and open Google Maps. There are no replies, RSVPs, accounts, analytics, or database connections.

## Run

Use Node.js 22.13+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables or external services are needed.

Development uses Webpack (`next dev --webpack`) to avoid a Turbopack hot-reload crash on Windows. After changing bundlers, stop the old development server and restart with `npm run dev`. Production builds still use the default Next.js bundler.

## Share links

The creator fills in the details and generates a link like `/invite#v1.…`. The browser validates, compresses, and encodes the details into the URL fragment. The guest browser reads that fragment; invitation details are never sent to the hosting server.

- Save and share the **entire link**, including everything after `#`.
- Links work on another device without cookies or local storage, as long as the site is hosted at a publicly reachable address.
- Changing the details generates a new link. Old links stay unchanged and cannot be revoked.
- There is no private management link or stored invitation record.
- The encoding is not encryption or proof of authorship. Anyone with the link can read the details.
- JavaScript is required to create and open links. Chrome, Edge, Firefox, and Safari versions supporting the Compression Streams API are supported.
- Old `/i/…` and `/manage/…` database-backed links are retired. Previously created local database files are left untouched but are no longer read.

## Animation

The sequence starts when the illustration enters the viewport, including when a hidden mobile preview opens. The host arrives, presents an envelope, the seal releases, the flap opens, and the card rises out. Details unfold below. Skip and replay are available. Reduced-motion preferences show the settled invitation immediately and pause autoplay; guests can explicitly choose **Play animation** to watch the full sequence. Playing manually scrolls the scene into view.

## Deploy

Import the repository into Vercel as a Next.js project, or run `npm run build` and `npm start` on a Node host. No Supabase project, database, server secret, or API key is needed. Create real invitations from the public domain, because locally generated links point to localhost.

Both pages are prerendered by Next.js. Guest metadata is generic and `noindex`; the URL fragment is only processed in the browser. Google Maps links use an HTTPS host/path allowlist, text is rendered as plain text, and decompressed payloads are size-limited before parsing.

## Checks

```sh
npm run build
npm run typecheck
npm run lint
npm test
npx playwright install chromium webkit
npm run test:e2e
```

Playwright uses the running server on port 3000, or starts one when needed. Tests cover cross-browser link creation and reopening in a fresh browser, no response controls or POST requests, edits producing new links, malformed links, mobile animation visibility, moving envelope/flap, skip/replay, reduced motion, clipboard fallback, and accessibility.

To audit the production homepage, start `npm run start -- --port 3200` then run `npm run audit:mobile`. Reports appear in `test-results/`.
