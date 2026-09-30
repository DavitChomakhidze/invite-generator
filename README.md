# occasion

A birthday invitation website with a live preview and an animated envelope reveal. Create an invitation, copy its link, and send it to guests. Guests can view the event details and open the location in Google Maps. The site has no accounts, RSVP form, replies, or database.

## Run locally

Use Node.js 22.13 or newer. Node 24 is recommended.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. No environment variables are required. Development uses Webpack because Turbopack's hot reload has crashed on Windows in this project. Production builds use the default Next.js build.

## How invitation links work

The browser validates the form and creates a URL beginning with `/invite#v1.`. The details are compressed and encoded in the part of the link after `#`. A guest's browser reads those details and displays the invitation. There is no stored invitation to retrieve from a server.

- Share the **entire URL**, including everything after `#`.
- Create invitations on the deployed site. Links made on `localhost` only point to your own computer.
- Guests can reopen the same link later or on another device while the site remains available at that address. Event dates do not expire the link.
- Changing the details creates a new link. The old link stays as it was and cannot be edited or revoked.
- Anyone with the link can read the invitation. Encoding is not encryption.
- JavaScript and a browser with the Compression Streams API are required to create and open links.

The animation plays when the invitation enters view. Guests can skip or replay it. Reduced-motion settings show the settled invitation immediately, with a **Play animation** button for anyone who wants to watch it.

## Publish

Push the repository to GitHub, then import it as a Next.js project in Vercel. Keep the repository root as the project root and use the default build command. No database, server secret, or environment variable is needed. Vercel deploys new commits to the production branch automatically.

After deployment, open the public site and create a fresh invitation there. Check the complete link in a private window or on another device before sharing it.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

Playwright uses a running server on port 3000 or starts one. For a mobile Lighthouse audit, start the production build with `npm run start -- --port 3200` and run `npm run audit:mobile`. Reports are written to `test-results/`.
