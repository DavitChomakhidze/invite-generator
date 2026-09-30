import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function create(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Make it yours" }),
  ).toBeVisible();
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
  await page
    .getByLabel("A little note to your guests")
    .fill("Come make a wish with me!");
  await page.getByRole("button", { name: "Generate my invitation" }).click();
  await expect(
    page.getByRole("heading", { name: "Your invitation is ready." }),
  ).toBeVisible();
  return page
    .getByRole("textbox", { name: "Invitation link", exact: true })
    .inputValue();
}

test("create and open a self-contained invitation in a fresh browser without responses or database requests", async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  const posts: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });
  const link = await create(page);
  expect(new URL(link).pathname).toBe("/invite");
  expect(new URL(link).hash).toMatch(/^#v1\./);
  await expect(
    page.getByRole("link", { name: "Take a look at your invitation" }),
  ).toHaveAttribute("href", link);
  await expect(
    page.getByRole("textbox", { name: "Private management link" }),
  ).toHaveCount(0);
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const guest = await context.newPage();
  guest.on("pageerror", (error) => errors.push(error.message));
  await guest.goto(link);
  await expect(
    guest.getByRole("heading", { name: "Sofia’s", exact: true }),
  ).toBeVisible();
  await expect(
    guest.getByText("Rose Garden, 24 Bloom Street", { exact: true }),
  ).toBeVisible();
  await expect(
    guest.getByRole("link", { name: "Open in Google Maps" }),
  ).toHaveAttribute("href", "https://maps.app.goo.gl/TestParty");
  await expect(guest.locator("form, input, textarea")).toHaveCount(0);
  await expect(guest.getByText(/RSVP|reply|attendance/i)).toHaveCount(0);
  await guest.reload();
  await expect(
    guest.getByRole("heading", { name: "Sofia’s", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(posts).toEqual([]);
  const audit = await new AxeBuilder({ page: guest })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await context.close();
});

test("editing produces a new link and the old link still opens", async ({
  page,
}) => {
  const original = await create(page);
  await page
    .getByRole("button", { name: "Change details and make a new link" })
    .click();
  await page.getByLabel("Name to celebrate").fill("Sofia Rose");
  await page.getByRole("button", { name: "Generate my invitation" }).click();
  await expect(
    page.getByRole("heading", { name: "Your invitation is ready." }),
  ).toBeVisible();
  const updated = await page
    .getByRole("textbox", { name: "Invitation link", exact: true })
    .inputValue();
  expect(updated).not.toBe(original);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(updated);
  await expect(
    page.getByRole("heading", { name: "Sofia Rose’s", exact: true }),
  ).toBeVisible();
  await page.goto(original);
  await expect(
    page.getByRole("heading", { name: "Sofia’s", exact: true }),
  ).toBeVisible();
});

test("the guest envelope moves, opens, and can be skipped and replayed", async ({
  page,
}) => {
  const link = await create(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(link);
  await expect(page.getByTestId("delivery-scene")).toHaveAttribute(
    "data-animating",
    "true",
  );
  const envelope = page.locator(".delivery-envelope");
  await expect(envelope).toBeVisible();
  const first = await envelope.evaluate((el) => getComputedStyle(el).transform);
  const closedFlap = await page
    .locator(".envelope-flap")
    .evaluate((el) => getComputedStyle(el).transform);
  await expect
    .poll(() => envelope.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(first);
  await expect
    .poll(() =>
      page
        .locator(".envelope-flap")
        .evaluate((el) => getComputedStyle(el).transform),
    )
    .not.toBe(closedFlap);
  await expect
    .poll(() =>
      page
        .locator(".envelope-letter")
        .evaluate(
          (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
        ),
    )
    .toBeLessThan(-30);
  await page.screenshot({
    path: `test-results/envelope-open-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Skip animation" }).click();
  await expect(envelope).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Sofia’s", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Replay animation" }).click();
  await expect(envelope).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Replay animation" }),
  ).toBeVisible({ timeout: 10000 });
  await expect(envelope).toHaveCount(0);
});

test("mobile preview starts its animation only when opened", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 850 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Show preview" }),
  ).toBeVisible();
  await expect(page.locator(".delivery-envelope")).toHaveCount(0);
  await page.getByRole("button", { name: "Show preview" }).click();
  await expect(
    page.getByRole("button", { name: "Skip animation" }),
  ).toBeVisible();
  await expect(page.locator(".delivery-envelope")).toBeVisible();
  await page.screenshot({
    path: `test-results/animation-${test.info().project.name}.png`,
  });
});

test("validation, invalid links, reduced motion, and icon-free narrow layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Generate my invitation" }).click();
  await expect(page.getByText("Add the name to celebrate.")).toBeVisible();
  await page.getByRole("button", { name: "Show preview" }).click();
  await expect(
    page.getByRole("heading", { name: "Isabella’s", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".delivery-envelope")).toHaveCount(0);
  await expect(page.locator(".brand svg, .lucide")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/invite#v1.broken");
  await expect(
    page.getByRole("heading", { name: "This invitation isn’t available." }),
  ).toBeVisible();
});

test("copy fallback and accessible homepage", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  expect(errors).toEqual([]);
  await create(page);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("Unavailable")) },
    });
  });
  await page.getByRole("button", { name: "Copy invitation link" }).click();
  await expect(page.getByText("Select and copy the link above.")).toBeVisible();
});

test("an explicit Play works with reduced motion and after closing and reopening the guest page", async ({
  page,
  context,
}) => {
  const link = await create(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(link);
  await expect(
    page.getByRole("button", { name: "Play animation", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".delivery-envelope")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Play animation", exact: true })
    .click();
  const envelope = page.locator(".delivery-envelope");
  await expect(envelope).toBeVisible();
  await expect(page.getByTestId("delivery-scene")).toBeInViewport();
  expect(
    await envelope.evaluate((el) => getComputedStyle(el).animationDuration),
  ).toBe("6.1s");
  const initial = await envelope.evaluate(
    (el) => getComputedStyle(el).transform,
  );
  await expect
    .poll(() => envelope.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(initial);
  await page.getByRole("button", { name: "Skip animation" }).click();
  await expect(
    page.getByRole("heading", { name: "Sofia’s", exact: true }),
  ).toBeVisible();
  await page.close();
  const reopened = await context.newPage();
  await reopened.emulateMedia({ reducedMotion: "reduce" });
  await reopened.goto(link);
  await expect(
    reopened.getByRole("heading", { name: "Sofia’s", exact: true }),
  ).toBeVisible();
  await expect(
    reopened.getByRole("button", { name: "Play animation", exact: true }),
  ).toBeVisible();
});
