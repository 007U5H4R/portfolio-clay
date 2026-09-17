import { defineConfig, devices } from "@playwright/test";

// When PW_BASE_URL points at a remote origin (a deployed preview, via `pnpm eval --base-url`), do
// NOT start the local `pnpm start` server — tests run against that origin directly. A local/unset
// base URL keeps the production-build webServer so `pnpm test:e2e` and `pnpm eval` work offline.
const baseURL = process.env.PW_BASE_URL ?? "http://127.0.0.1:3000";
const isLocalBaseURL = /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(baseURL);

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
  // Cap workers even outside CI: running all 4 viewport projects fully parallel with no cap
  // causes host resource contention on this machine — `browserContext.close` trace-write races
  // that surface as spurious cross-project timeouts/`toBeTruthy()` failures (M-003 QA gate,
  // docs/reports/M003-qa.md / TC-051-fix.md). workers:2 still reproduced failures on this host;
  // only workers:1 was reliably green across repeated full runs. Never disables a test.
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: ".eval/playwright.json" }],
  ],
  outputDir: "test-results",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
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
  ...(isLocalBaseURL
    ? {
        webServer: {
          command: "pnpm start",
          url: "http://127.0.0.1:3000",
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }
    : {}),
});
