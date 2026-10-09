# occasion

A backend-free birthday invitation generator with two styles:

- **Animated Card:** the original illustrated host, envelope delivery, skip/replay, and event details.
- **Scroll Story:** a mobile-first portrait opening, optional age, animated story sections, location action, and optional closing message.

Shared event fields stay intact while switching styles. The generator keeps a live card preview or a scrollable phone preview; previews remain collapsible on mobile. Scroll Story preview stays silent and can be restarted.

There are no accounts or invitation records. Invitation contents live only in the link. The single server-side feature is optional Scroll Story RSVPs (see below), stored in a small Redis key-value store. Nothing reads the retired local `.data/` SQLite files.

## RSVPs (Scroll Story)

When "Let guests accept or decline" is checked (the default), generating a Scroll Story creates two links:

- **Guest link:** carries only a public reply ID. Guests choose _Joyfully accept_ or _Regretfully decline_, enter their name and send. Their browser remembers the reply so they can change it later. It updates the same entry instead of adding a duplicate.
- **Private responses link** (`/responses#<secret>`): shows who is coming and who can't make it. The reply ID is a SHA-256 hash of this secret, so guests cannot read the list. The creator's browser also remembers it at `/responses`.

Only the reply ID, guest name, answer and time are stored. Each invitation accepts up to 300 replies, which expire 400 days after the latest reply. Card invitations and older links show no RSVP section.

Storage uses the Upstash Redis REST API over `fetch`, with no SDK and no database schema. On Vercel, add an Upstash Redis store from the Marketplace (free tier). It sets `KV_REST_API_URL`/`KV_REST_API_TOKEN`; `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` also work. Without these variables, local development keeps replies in memory until restart, and production returns "Replies aren't set up on this site yet."

## Run locally

Use Node.js 22.13 or newer. Node 24 is recommended.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. No environment variables are required. RSVPs use in-memory storage locally. Development uses Webpack because Turbopack hot reload previously crashed on Windows. Production builds use the default Next.js build.

## Invitation links and compatibility

New links use `/invite#v2.`. The browser validates the selected style and shared event fields, serializes JSON, compresses it with gzip, and encodes it as URL-safe Base64 in the fragment after `#`.

Existing `/invite#v1.` links continue to use the frozen nine-field legacy schema and normalize to Animated Card. New Card and Scroll links use a discriminated `v2` model. Unknown versions, invalid fields/styles, and malformed media settings show the unavailable-invitation message. Old events still open; only creation requires a future event time.

- Share the **entire URL**, including everything after `#`.
- Create real invitations on the deployed origin. A localhost link points to the receiving device's localhost.
- Links work in a fresh browser/on another device while the site remains available at their origin. No localStorage or cookies are needed.
- Editing creates a new link; previously shared links cannot be edited or revoked.
- Invitation contents are readable by anyone possessing the link. Encoding is **not encryption or proof of authorship**.
- The fragment is processed in the browser and is not sent in the HTTP request to the host. Guest social-preview metadata remains generic.
- JavaScript and Compression Streams API support are required.
- Existing limits remain: 8,192 fragment characters and 16,384 decompressed bytes. Image/audio bytes never go into the URL.

## Portraits

The bundled default is an **original illustrated demo portrait**, not a photograph of the birthday person. Its provenance and CC0 dedication are recorded in `public/media-licenses.json`.

Creators may enter stable public HTTPS portrait URLs hosted on exactly `images.unsplash.com` or `res.cloudinary.com`, without URL credentials or a custom port. Invalid configurations are rejected. Image load failures fall back to the demo illustration without changing its reserved aspect ratio.

External portraits load directly in the visitor's browser, without an application-server image proxy or referrer. The image host still receives the request and may change/remove the asset. Never paste secret-bearing or temporary access URLs. There is no image upload in this release.

## Music infrastructure and missing assets

**The production music catalog is empty.** No locally available songs had verified redistribution rights, so no starter audio files or nonexistent file references are shipped. The generator explains this and creates invitations without music.

The infrastructure is implemented: a typed catalog, song/segment validation, numeric and range controls, explicit editor preview, guest opening with/without music, play/pause/mute/replay, metadata checks, and playback cleanup. Native audio plays the selected segment once, then stops. Guests can replay it. Playback failure never prevents reading the invitation.

To activate music in a future asset-only change:

1. Obtain approved MP3 files with clearly documented redistribution rights; place them in `public/music/`.
2. Add stable IDs, titles, paths, measured durations, and license/required attribution to `lib/music-catalog.ts` and `public/media-licenses.json`.
3. Retain released IDs and file paths so old links remain valid.
4. Verify duration, seeking, attribution, browser playback and physical iOS/Android behavior before shipping.

No remote audio inputs, uploaded MP3s, waveform editor, physical trimming, autoplay on page load, or audio dependencies are included. Editor metadata loads after song selection. Guest audio loads only after an explicit music interaction. Preparation stays muted until seeking is confirmed; hidden pages pause and do not automatically resume.

Automated audio tests synthesize an original WAV tone in memory and serve it from a temporary test-only HTTP server. It is not part of the production catalog or application routes.

## Animation and accessibility

Scroll Story uses a pink scrapbook party design inspired by the supplied video reference: star-patterned paper, original vector disco/bow/party decorations, a grayscale portrait with a party hat, patterned age numbers, cutout name lettering, and compact scrolling event sections. The portrait is cropped in the browser; remote photos are not automatically background-removed. Names retain their accessible text and Unicode grapheme clusters. The existing message, date/time, location/Maps, optional dress code and closing fields drive the content; the reference's separate itinerary is not part of the current data model. No video footage, third-party character artwork, or soundtrack is bundled.

Animated Card keeps its original timed envelope reveal and reduced-motion play/skip/replay behavior. Scroll Story has its own opening interaction and independent once-only Motion viewport reveals. Its preview observes the phone container; guests use document scrolling. Reduced motion shows the final section content immediately. Scrolling is native; there is no scroll hijacking, parallax or new animation dependency.

Scroll Story's stars have an irregular flickering twinkle, the disco ball sways with shimmering highlights, and the bows, glasses, kisses, party hat and birthday lettering keep moving. Decorations start automatically before opening the invitation and loop while visible, including when the browser requests reduced motion, as required by this design. A pause/resume decorations button remains available. One IntersectionObserver per story pauses off-screen decoration groups (including inside the phone preview); a single visibility listener pauses them in hidden tabs. There are no per-frame React updates, scroll listeners or animated full-page textures. Small CSS transform/opacity animations keep movement bounded, while an SVG tile pattern reduces the disco ball's markup. Animation timings live in `lib/story-animation.ts` for reveals and `components/scroll-story/story.module.css` for decorations.

The automatic decoration policy is specific to Scroll Story. Section reveals and the original Animated Card continue to honor reduced motion. Pausing affects only the current view; reopening the link starts decorations again. Music still requires an explicit user interaction, and no OS setting is changed.

## Architecture

```text
InvitationForm
  -> shared event draft + selected style + retained Scroll draft
  -> active-style validation
  -> encodeInvitation() -> /invite#v2... -> ShareControls

GuestInvitation
  -> decodeInvitation() -> v1 normalization / v2 validation
  -> InvitationRenderer
      -> InvitationCard -> BirthdayGirl + existing CSS animation
      -> ScrollInvitation -> opening + independent StorySections
                         -> optional native segment playback
```

## Publish and checks

Import the repository into Vercel as a Next.js project, or build/start it on a Node host. Invitations need no environment variables. RSVPs need the Redis REST variables described above. Create a fresh invitation on the public origin and check its complete link on another device before sharing.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Playwright targets desktop Chromium and mobile WebKit and uses a server on port 3000 or starts one. If browser binaries are absent, install them separately with `npx playwright install chromium webkit`. Existing card coverage is retained alongside v1/v2 compatibility, style selection, story layout/reveals, portraits, accessibility, and native audio tests.

For mobile Lighthouse reports, start the production build with `npm run start -- --port 3200` and run `npm run audit:mobile`. The audit checks both the homepage and a self-contained Scroll Story fixture; reports go to `test-results/`. Physical iOS/Android audio testing remains necessary before enabling licensed tracks; automated WebKit is not a physical iPhone test.

## Future upload release - Phase 9 (not implemented)

The planned next release may use signed direct Cloudinary portrait uploads, returning a stable image URL stored in the existing remote portrait descriptor. It would add a narrow server-side signing route, provider-enforced file restrictions, Turnstile verification, Vercel perimeter rate limits, and usage controls. Invitation records/accounts/database storage would remain unnecessary.

That release must handle credential protection, public storage abuse, durable image delivery and abandoned uploads. Assets must not expire automatically because there is no invitation registry to determine which old links still reference them.

This repository currently includes **none** of that upload implementation: no signing endpoint, upload component, Turnstile integration, Cloudinary SDK, or upload environment configuration.
