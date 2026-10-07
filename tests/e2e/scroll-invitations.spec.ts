import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { gzipSync } from "node:zlib";
import { sampleInvitation } from "../../lib/presentation";
import { legacyFragment } from "../fixtures/legacy-invitation";

const story = {
  ...sampleInvitation,
  style: "scroll",
  scroll: {
    age: 16,
    portrait: { kind: "default" },
    closing_message: "See you under the stars!",
    music: null,
  },
};
const link = (data: unknown) =>
  `/invite#v2.${gzipSync(JSON.stringify(data)).toString("base64url")}`;
async function fillShared(page: Page) {
  await page.getByLabel("Name to celebrate").fill("Sofia");
  await page.getByLabel("The date", { exact: false }).fill("2035-06-19");
  await page.getByLabel("The time", { exact: false }).fill("18:00");
  await page.getByLabel("Event timezone").selectOption("Asia/Tbilisi");
  await page
    .getByLabel("Venue or address")
    .fill("Rose Garden, 24 Bloom Street");
  await page
    .getByLabel("Google Maps link")
    .fill("https://maps.app.goo.gl/TestParty");
}

test("legacy cards and v2 cards keep their renderer, including hash replacements", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`/invite#${legacyFragment}`);
  await expect(page.getByTestId("delivery-scene")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Isabella’s", exact: true }),
  ).toBeVisible();
  await page.evaluate((hash) => {
    window.location.hash = hash;
  }, link(story).split("#")[1]);
  await expect(
    page.getByRole("article", { name: "Scroll Story" }),
  ).toBeVisible();
  await page.evaluate(
    (hashes) => {
      for (const hash of hashes) window.location.hash = hash;
    },
    ["v2.broken", legacyFragment],
  );
  await expect(page.getByTestId("delivery-scene")).toBeVisible();
  await expect(page.getByRole("article", { name: "Scroll Story" })).toHaveCount(
    0,
  );
});

test("style switching retains drafts, switches preview, and generates a backend-free story", async ({
  page,
  browser,
}) => {
  const posts: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });
  await page.goto("/");
  await fillShared(page);
  await page.getByRole("radio", { name: /Scroll Story/ }).check();
  await page.getByLabel("Birthday age").fill("16");
  await page.getByLabel("Closing message").fill("See you under the stars!");
  await page.getByRole("radio", { name: /Animated Card/ }).check();
  await expect(page.getByLabel("Birthday age")).toHaveCount(0);
  await expect(page.getByLabel("Name to celebrate")).toHaveValue("Sofia");
  await page.getByRole("radio", { name: /Scroll Story/ }).check();
  await expect(page.getByLabel("Birthday age")).toHaveValue("16");
  const toggle = page.getByRole("button", { name: "Show preview" });
  if (await toggle.isVisible()) await toggle.click();
  await expect(
    page.getByRole("region", { name: "Scrollable phone preview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("article", { name: "Scroll Story" }),
  ).toBeVisible();
  await expect(page.getByLabel("Background music")).toBeDisabled();
  await page.getByRole("button", { name: "Generate my invitation" }).click();
  const url = await page
    .getByRole("textbox", { name: "Invitation link", exact: true })
    .inputValue();
  expect(new URL(url).hash).toMatch(/^#v2\./);
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const guest = await context.newPage();
  await guest.goto(url);
  await expect(
    guest.getByRole("heading", { name: "Sofia", exact: true }),
  ).toBeVisible();
  await guest
    .getByRole("button", { name: "Open invitation", exact: true })
    .click();
  await expect(
    guest.getByText("See you under the stars!", { exact: true }),
  ).toBeVisible();
  await expect(
    guest.getByRole("link", { name: "Open in Maps" }),
  ).toHaveAttribute("href", "https://maps.app.goo.gl/TestParty");
  await guest.reload();
  await expect(
    guest.getByRole("button", { name: "Open invitation", exact: true }),
  ).toBeVisible();
  expect(posts).toEqual([]);
  await context.close();
});

test("inactive scroll errors do not prevent cards, while active errors focus their field", async ({
  page,
}) => {
  await page.goto("/");
  await fillShared(page);
  await page.getByRole("radio", { name: /Scroll Story/ }).check();
  await page
    .getByLabel("Portrait image URL")
    .fill("https://evil.example/image.jpg");
  await page.getByRole("button", { name: "Generate my invitation" }).click();
  await expect(page.getByLabel("Portrait image URL")).toBeFocused();
  await expect(page.getByLabel("Portrait image URL")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByRole("radio", { name: /Animated Card/ }).check();
  await page.getByRole("button", { name: "Generate my invitation" }).click();
  await expect(
    page.getByRole("heading", { name: "Your invitation is ready." }),
  ).toBeVisible();
});

test("story sections, optional content, accessibility, and narrow layouts work without music", async ({
  page,
}) => {
  const musicRequests: string[] = [];
  page.on("request", (request) => {
    if (/\.(mp3|wav|ogg)(\?|$)/.test(request.url()))
      musicRequests.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(link(story));
  await expect(page.getByAltText("Illustrated demo portrait")).toBeVisible();
  await page
    .getByRole("button", { name: "Open invitation", exact: true })
    .click();
  for (const name of [
    "Birthday introduction",
    "Date and time",
    "Location",
    "Dress code",
    "Closing message",
  ])
    await expect(
      page.getByRole("region", { name, exact: true }),
    ).toBeAttached();
  await expect(
    page.getByText("See you under the stars!", { exact: true }),
  ).toBeVisible();
  for (const width of [320, 375, 390]) {
    await page.setViewportSize({ width, height: 850 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      targets: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  expect(musicRequests).toEqual([]);
  await page.goto(
    link({
      ...story,
      dress_code: "",
      message: "",
      scroll: { ...story.scroll, age: undefined, closing_message: "" },
    }),
  );
  await page
    .getByRole("button", { name: "Open invitation", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Dress code", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByLabel(/Turning/)).toHaveCount(0);
  await expect(
    page.getByText("Can’t wait to celebrate with you.", { exact: true }),
  ).toBeVisible();
});

test("approved remote portraits load and broken portraits fall back", async ({
  page,
}) => {
  const remote = "https://images.unsplash.com/test-portrait";
  await page.route(remote, (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="pink"/></svg>',
    }),
  );
  await page.goto(
    link({
      ...story,
      scroll: { ...story.scroll, portrait: { kind: "remote", url: remote } },
    }),
  );
  const image = page.getByAltText("Portrait of Isabella");
  await expect(image).toBeVisible();
  expect(
    await image.evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBe(600);
  await page.unroute(remote);
  await page.route(remote, (route) => route.abort());
  await page.reload();
  await expect(page.getByAltText("Illustrated demo portrait")).toBeVisible();
  await page.goto(
    link({
      ...story,
      scroll: {
        ...story.scroll,
        portrait: {
          kind: "remote",
          url: "https://images.unsplash.com.evil.test/a",
        },
      },
    }),
  );
  await expect(
    page.getByRole("heading", { name: "This invitation isn’t available." }),
  ).toBeVisible();
});

test("story reveals observe the phone preview root and guest viewport", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 375, height: 850 });
  await page.goto("/");
  await page.getByRole("radio", { name: /Scroll Story/ }).check();
  await page.getByRole("button", { name: "Show preview" }).click();
  const opening = page.getByRole("region", {
    name: "Story opening",
    exact: true,
  });
  await expect(opening).toHaveAttribute("data-motion-visible", "true");
  await page
    .getByRole("button", { name: "Open invitation", exact: true })
    .click();
  const intro = page.getByRole("region", {
    name: "Birthday introduction",
    exact: true,
  });
  await expect
    .poll(() => intro.evaluate((el) => getComputedStyle(el).opacity))
    .toBe("0");
  await page
    .getByRole("region", { name: "Scrollable phone preview" })
    .evaluate((el) => {
      el.scrollTop = 700;
    });
  await expect
    .poll(() => intro.evaluate((el) => getComputedStyle(el).opacity))
    .toBe("1");
  await page
    .getByRole("region", { name: "Scrollable phone preview" })
    .evaluate((el) => {
      el.scrollTop = 1300;
    });
  await expect(opening).toHaveAttribute("data-motion-visible", "false");
  await expect(opening.locator('[data-decoration="disco"]')).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  await page.getByRole("button", { name: "Restart story" }).click();
  await expect(
    page.getByRole("button", { name: "Open invitation", exact: true }),
  ).toBeVisible();
  await expect(opening).toHaveAttribute("data-motion-visible", "true");
  await page.goto(link(story));
  await page
    .getByRole("button", { name: "Open invitation", exact: true })
    .click();
  await page
    .getByRole("region", { name: "Location", exact: true })
    .scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .getByRole("region", { name: "Location", exact: true })
        .evaluate((el) => getComputedStyle(el).opacity),
    )
    .toBe("1");
  await page.screenshot({
    path: `test-results/scroll-story-${test.info().project.name}.png`,
    fullPage: true,
  });
});

test("decorations move, pause offscreen and in hidden tabs, and respect user controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(link(story));
  const article = page.getByRole("article", { name: "Scroll Story" });
  const opening = page.getByRole("region", {
    name: "Story opening",
    exact: true,
  });
  const disco = opening.locator('[data-decoration="disco"]');
  const bow = opening.locator('[data-decoration="bow"]');
  const star = opening.locator('[data-decoration="star"]').first();
  await expect(opening).toHaveAttribute("data-motion-visible", "true");
  for (const art of [disco, bow, star]) {
    await expect(art).toHaveCSS("animation-play-state", "running");
    const transform = await art.evaluate(
      (el) => getComputedStyle(el).transform,
    );
    await expect
      .poll(() => art.evaluate((el) => getComputedStyle(el).transform))
      .not.toBe(transform);
  }
  const opacity = await star.evaluate((el) => getComputedStyle(el).opacity);
  await expect
    .poll(() => star.evaluate((el) => getComputedStyle(el).opacity))
    .not.toBe(opacity);
  await page.getByRole("button", { name: "Pause decorations" }).click();
  await expect(
    page.getByRole("button", { name: "Resume decorations" }),
  ).toHaveAttribute("aria-pressed", "true");
  for (const art of [disco, bow, star])
    await expect(art).toHaveCSS("animation-play-state", "paused");
  await page.getByRole("button", { name: "Resume decorations" }).click();
  await expect(disco).toHaveCSS("animation-play-state", "running");

  // Exercise the browser visibility notification deterministically in both engines.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(article).toHaveAttribute("data-motion", "paused");
  await expect(disco).toHaveCSS("animation-play-state", "paused");
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(disco).toHaveCSS("animation-play-state", "running");
  await page
    .getByRole("button", { name: "Open invitation", exact: true })
    .click();
  await page
    .getByRole("region", { name: "Location", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(opening).toHaveAttribute("data-motion-visible", "false");
  await expect(disco).toHaveCSS("animation-play-state", "paused");
  await opening.scrollIntoViewIfNeeded();
  await expect(disco).toHaveCSS("animation-play-state", "running");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", { name: "Pause decorations" }),
  ).toBeVisible();
  for (const art of [disco, bow, star])
    await expect(art).toHaveCSS("animation-play-state", "running");
  await expect(
    page.getByRole("region", { name: "Closing message", exact: true }),
  ).toHaveCSS("opacity", "1");
});

test("guest decorations autoplay and keep looping with reduced motion without any activation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(link(story));
  const opening = page.getByRole("region", {
    name: "Story opening",
    exact: true,
  });
  await expect(opening).toHaveAttribute("data-motion-visible", "true");
  // No clicks, including Open invitation: all decorative effects run on arrival.
  for (const name of [
    "disco",
    "bow",
    "star",
    "hat",
    "glass",
    "kiss",
    "lettering",
  ]) {
    const art = opening.locator(`[data-decoration="${name}"]`).first();
    await expect(art).toHaveCSS("animation-play-state", "running");
    await expect(art).toHaveCSS("animation-iteration-count", "infinite");
    expect(
      parseFloat(
        await art.evaluate((el) => getComputedStyle(el).animationDuration),
      ),
    ).toBeGreaterThan(1);
    const transform = await art.evaluate(
      (el) => getComputedStyle(el).transform,
    );
    await expect
      .poll(() => art.evaluate((el) => getComputedStyle(el).transform))
      .not.toBe(transform);
  }
  const star = opening.locator('[data-decoration="star"]').first();
  const opacity = await star.evaluate((el) => getComputedStyle(el).opacity);
  await expect
    .poll(() => star.evaluate((el) => getComputedStyle(el).opacity))
    .not.toBe(opacity);
  await page.getByRole("button", { name: "Pause decorations" }).click();
  await expect(star).toHaveCSS("animation-play-state", "paused");
  await page.reload();
  await expect(star).toHaveCSS("animation-play-state", "running");
});

test("invalid music and unsupported versions use the invitation failure UI", async ({
  page,
}) => {
  await page.goto(
    link({
      ...story,
      scroll: {
        ...story.scroll,
        music: { song_id: "unpublished", start_seconds: 0, end_seconds: 30 },
      },
    }),
  );
  await expect(
    page.getByRole("heading", { name: "This invitation isn’t available." }),
  ).toBeVisible();
  await page.goto("/invite#v9.test");
  await expect(page.locator(".status-card [role='alert']")).toContainText(
    "unsupported link version",
  );
});

test("scrapbook lettering preserves Unicode names and fits narrow screens", async ({
  page,
}) => {
  const name = "მარიამი Ána 👩🏽‍🎤 ".repeat(3).trim();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(
    link({ ...story, host_name: name, scroll: { ...story.scroll, age: 150 } }),
  );
  const heading = page.getByRole("heading", { name, exact: true });
  await expect(heading).toBeVisible();
  await expect(page.getByRole("img", { name: "Turning 150" })).toBeVisible();
  // The visible collage must preserve combined emoji, not split skin tones/ZWJ.
  await expect(heading.getByText("👩🏽‍🎤", { exact: true })).toHaveCount(3);
  await expect(heading).toHaveText(name.replaceAll(" ", ""));
  for (const width of [320, 375, 390]) {
    await page.setViewportSize({ width, height: 850 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await expect(
    page.getByRole("button", { name: "Open invitation", exact: true }),
  ).toBeEnabled();
});
