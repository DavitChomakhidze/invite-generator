import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";

// Playwright owns the browser lifecycle, avoiding Chrome Launcher's Windows
// temporary-profile cleanup race. Run against a running production build.
const url = process.argv[2] || "http://127.0.0.1:3200";
const port = await new Promise((resolve, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});
const browser = await chromium.launch({
  headless: true,
  args: [`--remote-debugging-port=${port}`],
});
try {
  const result = await lighthouse(url, {
    port,
    onlyCategories: ["performance", "accessibility"],
    output: ["json", "html"],
    logLevel: "error",
  });
  if (!result || result.lhr.runtimeError)
    throw new Error(result?.lhr.runtimeError?.message || "Audit failed");
  await mkdir("test-results", { recursive: true });
  await writeFile(
    "test-results/lighthouse-home.json",
    JSON.stringify(result.lhr, null, 2),
  );
  await writeFile("test-results/lighthouse-home.html", result.report[1]);
  console.log(
    JSON.stringify(
      {
        url,
        performance: Math.round(result.lhr.categories.performance.score * 100),
        accessibility: Math.round(
          result.lhr.categories.accessibility.score * 100,
        ),
        lcp: result.lhr.audits["largest-contentful-paint"].displayValue,
        cls: result.lhr.audits["cumulative-layout-shift"].displayValue,
        report: "test-results/lighthouse-home.html",
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
