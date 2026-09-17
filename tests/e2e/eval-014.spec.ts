/**
 * eval-014.spec.ts (technical-plan.md §B S09.02 / TKT-18, `@EVAL-014`) — the `DemoVideo` four-state
 * matrix, exercised via the QA-only `/dev/video` fixture board.
 *
 * `/dev/video` only renders under an `ALLOW_DEV_ROUTES=1` build (TP1: dev-route gating resolves at
 * build time) — exactly the `primitives.spec.ts` / `ask-inline.spec.ts` pattern. Every test here
 * SKIPs (never fails) on a plain build via the `gotoDev` guard below; run the real assertions with
 * `ALLOW_DEV_ROUTES=1 pnpm build && ALLOW_DEV_ROUTES=1 pnpm test:e2e --grep 'eval-014|video'`.
 *
 * No video binary is committed (M-005 scope) — the "valid src plays" case intercepts the fixture's
 * request with a ~1.7KB silent clip generated on the fly by ffmpeg into the gitignored `.eval/`
 * directory (never written to `public/`, never staged, regenerated every run). The 404 case needs no
 * interception (the fixture path genuinely doesn't exist under `public/`); the throttled case
 * intercepts with an artificial delay before aborting the connection.
 */
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const width = (page: Page) => page.viewportSize()?.width ?? 0;

async function gotoDev(page: Page, path: string): Promise<boolean> {
  const resp = await page.goto(path, { waitUntil: "load" });
  const missing = (resp?.status() ?? 404) === 404;
  test.skip(missing, `${path} 404s without ALLOW_DEV_ROUTES=1 — run the QA job to exercise it`);
  return !missing;
}

/** A ~1.7KB, 1s, silent gray clip — generated at test time, never committed (TKT-18 rule). */
function ensureTinyMp4(): string {
  const dir = resolve(process.cwd(), ".eval/fixtures");
  const out = resolve(dir, "tiny-valid.mp4");
  if (existsSync(out)) return out;
  mkdirSync(dir, { recursive: true });
  execFileSync("ffmpeg", [
    "-y",
    "-f", "lavfi", "-i", "color=c=gray:s=64x36:d=1:r=5",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    out,
  ]);
  return out;
}

test("@EVAL-014 no-video: 'Demo coming' badge over poster, no video element, no play control", {
  tag: "@EVAL-014",
}, async ({ page }) => {
  test.skip(width(page) !== 390, "state verified once at w390 (touch — no pointer:fine IO auto-reveal to race the click)");
  if (!(await gotoDev(page, "/dev/video"))) return;

  const fixture = page.locator('[data-fixture="no-video"]');
  await expect(fixture.locator('[data-video-state="no-video"]')).toBeVisible();
  await expect(fixture.getByText("Demo coming")).toBeVisible();
  await expect(fixture.locator("video")).toHaveCount(0);
  await expect(fixture.getByRole("button")).toHaveCount(0);
});

test("@EVAL-014 no <video> before intent; preload=none, muted, playsInline, controls after intent", {
  tag: "@EVAL-014",
}, async ({ page }) => {
  test.skip(width(page) !== 390, "state verified once at w390 (touch — no pointer:fine IO auto-reveal to race the click)");
  if (!(await gotoDev(page, "/dev/video"))) return;

  const fixture = page.locator('[data-fixture="valid"]');
  await expect(fixture.locator("video")).toHaveCount(0);

  await fixture.getByRole("button", { name: /play demo:/i }).click();

  const video = fixture.locator("video");
  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute("preload", "none");
  await expect(video).toHaveAttribute("playsinline", "");
  await expect(video).toHaveAttribute("controls", "");
  await expect(video).toHaveJSProperty("muted", true);
});

test("@EVAL-014 valid src: loading then playing, native controls", {
  tag: "@EVAL-014",
}, async ({ page }) => {
  test.skip(width(page) !== 390, "state verified once at w390 (touch — no pointer:fine IO auto-reveal to race the click)");

  const fixturePath = ensureTinyMp4();
  await page.route("**/dev-fixtures/video/valid.mp4", async (route) => {
    // A short artificial delay so the `loading` phase is reliably observable before playback.
    await new Promise((r) => setTimeout(r, 500));
    await route.fulfill({ path: fixturePath, contentType: "video/mp4" });
  });

  if (!(await gotoDev(page, "/dev/video"))) return;

  const fixture = page.locator('[data-fixture="valid"]');
  await fixture.getByRole("button", { name: /play demo:/i }).click();

  await expect(fixture.locator('[data-video-state="loading"]')).toBeVisible();
  await expect(fixture.locator('[data-video-state="playing"]')).toBeVisible({ timeout: 10_000 });
  await expect(fixture.locator("video")).toHaveJSProperty("paused", false);
});

test("@EVAL-014 404 src: error overlay with a visible 'View live' fallback + console.warn('[video]')", {
  tag: "@EVAL-014",
}, async ({ page }) => {
  test.skip(width(page) !== 390, "state verified once at w390 (touch — no pointer:fine IO auto-reveal to race the click)");
  if (!(await gotoDev(page, "/dev/video"))) return;

  const warnings: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "warning" && msg.text().includes("[video]")) warnings.push(msg.text());
  });

  // Not intercepted: /dev-fixtures/video/missing.mp4 genuinely doesn't exist under public/ — a real 404.
  const fixture = page.locator('[data-fixture="error-404"]');
  await fixture.getByRole("button", { name: /play demo:/i }).click();

  const errorOverlay = fixture.getByRole("alert");
  await expect(errorOverlay).toBeVisible({ timeout: 10_000 });
  await expect(errorOverlay.getByText(/couldn't load the demo video/i)).toBeVisible();
  const link = errorOverlay.getByRole("link", { name: /view live/i });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", "https://example.com");

  await expect.poll(() => warnings.length, { timeout: 5000 }).toBeGreaterThan(0);
});

test("@EVAL-014 throttled src that ultimately fails: loading then error, 'Demo coming' when no live URL", {
  tag: "@EVAL-014",
}, async ({ page }) => {
  test.skip(width(page) !== 390, "state verified once at w390 (touch — no pointer:fine IO auto-reveal to race the click)");

  await page.route("**/dev-fixtures/video/throttled.mp4", async (route) => {
    await new Promise((r) => setTimeout(r, 800));
    await route.abort("failed");
  });

  if (!(await gotoDev(page, "/dev/video"))) return;

  const fixture = page.locator('[data-fixture="error-throttled"]');
  await fixture.getByRole("button", { name: /play demo:/i }).click();

  await expect(fixture.locator('[data-video-state="loading"]')).toBeVisible();
  await expect(fixture.locator('[data-video-state="error"]')).toBeVisible({ timeout: 10_000 });
  // This fixture has no liveUrl — the error overlay falls back to "Demo coming", not a link.
  await expect(fixture.getByRole("alert").getByText("Demo coming")).toBeVisible();
  await expect(fixture.getByRole("link", { name: /view live/i })).toHaveCount(0);
});

test("@EVAL-014 pointer:fine desktop: scrolling a video fixture into view auto-reveals native controls, no click needed", {
  tag: "@EVAL-014",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "IO auto-reveal only applies on pointer:fine desktop — verified once at w1440");
  if (!(await gotoDev(page, "/dev/video"))) return;

  // The last, furthest-down fixture — reliably below the fold at load, unlike the earlier ones.
  const fixture = page.locator('[data-fixture="error-throttled"]');
  await expect(fixture.locator("video")).toHaveCount(0);

  // No click — scrolling ≥50% into view is the desktop intent signal (technical-plan.md §B TKT-18).
  await fixture.scrollIntoViewIfNeeded();

  const video = fixture.locator("video");
  await expect(video).toHaveCount(1);
  // preload="none" means it never fetches on its own — paused, showing the poster, until the user
  // presses the native play control themselves.
  await expect(video).toHaveJSProperty("paused", true);
});

test("@EVAL-014 shipped videos ≤ 4MB and posters ≤ 120kB", {
  tag: "@EVAL-014",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "file-size sweep runs once");
  void page;

  const videoDir = resolve(process.cwd(), "public/video");
  if (!existsSync(videoDir)) return; // no shipped videos yet (M-005) — nothing to check.

  const MAX_VIDEO_BYTES = 4 * 1024 * 1024;
  const MAX_POSTER_BYTES = 120 * 1024;
  const oversized: string[] = [];

  for (const name of readdirSync(videoDir)) {
    const full = resolve(videoDir, name);
    const size = statSync(full).size;
    if (name.endsWith(".mp4") && size > MAX_VIDEO_BYTES) oversized.push(`${name}: ${size} bytes`);
    if (name.endsWith("-poster.webp") && size > MAX_POSTER_BYTES) oversized.push(`${name}: ${size} bytes`);
  }

  expect(oversized, `oversized media:\n${oversized.join("\n")}`).toEqual([]);
});
