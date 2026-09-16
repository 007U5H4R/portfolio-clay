import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config (technical-plan.md §A9 / §B S07.01).
 *
 * Chromium only, four viewport projects (w390 / w768 / w1024 / w1440) that mirror the
 * responsive sweep the eval cases assert against (EVAL-006/008/010/015). Tests run against the
 * **production build** (`pnpm start`) so the DOM matches what Lighthouse measures — never `next dev`.
 *
 * E-DRIVE SCAR GUARD: `PLAYWRIGHT_BROWSERS_PATH` + `TMPDIR` are exported by `.env.tooling`
 * (the `test:e2e` / `eval` scripts wrap the command in `dotenv -e .env.tooling`), so the browser
 * binary and all traces/temp files live on `/Volumes/E Drive`, never the Mac internal disk.
 * The JSON reporter and Playwright output dir both stay inside git-ignored dirs the eval runner reads.
 */
export default defineConfig({
  testDir: "tests/e2e",
  // The tracer runs locally against a real build; keep it deterministic and serial-ish.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: [
    ["list"],
    ["json", { outputFile: ".eval/playwright.json" }],
  ],
  outputDir: "test-results",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.PW_BASE_URL ?? "http://127.0.0.1:3000",
    reducedMotion: "no-preference",
    trace: "retain-on-failure",
    screenshot: "off",
  },
  projects: [
    {
      name: "w390",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    {
      name: "w768",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } },
    },
    {
      name: "w1024",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 768 } },
    },
    {
      name: "w1440",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: "pnpm start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
