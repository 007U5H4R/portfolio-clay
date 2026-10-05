/**
 * eval-019.spec.ts (`@EVAL-019`; evaluation-plan.md §9.2; decisions S24 / EV7; Design.md §5) — the paper-cut
 * hero STILL, measured on `/` at w390 and w1440 (w768 / w1024 skip: the case's `viewport` is ["390", "1440"]).
 * Rewritten in TASK-140 in the same change that retired clip A: the once-and-hold clip tests, the registration
 * guard and the clip caps are deleted (they remain in git at `a4f17c2`), not `fixme`'d.
 *
 *   no video          — default · reduced motion · touch (the w390 project) · Save-Data: 0 `<video>` inside
 *                       `.hero-banner` after hydration, 0 `[data-hero-clip]`, and the banner `<img>` is visible.
 *   SSR               — `request.get("/")`: exactly one banner `<img>` in the static HTML with
 *                       fetchpriority="high", loading="eager", 3168×1344, `sizes="100vw"` and the manifest alt
 *                       (once in the markup); 0 `<video` in the hero; 0 `data-hero-clip`.
 *   one hero image    — exactly one hero banner image is fetched before the load event (the dark twin, being
 *                       absent from the markup, is never requested).
 *   intro poster      — kept verbatim from TASK-138: the intro print's `<img class="pf-stage-poster">` is
 *                       `loading="lazy"` and never `fetchpriority="high"`.
 *   files             — 0 `hero-animation.*` and no clip mask under `public/`; every banner rendition
 *                       (light, dark, the two narrow crops) ≤ 350 kB on disk, light and dark 3168×1344.
 *
 * Every measured number is pushed into `test.info().annotations` (type `eval-019`) so `.eval/playwright.json`
 * carries the evidence `pnpm eval` summarises. The "LCP element on the preview = the banner in both themes"
 * half of the criterion is read from the preview Lighthouse run (EVAL-004/005), as before; the dark half
 * arrives with the theme wiring (TASK-141).
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
// The manifest directly, not `lib/illustrations.ts` — that module statically imports the scene JPEGs
// for `next/image`, which Playwright's TypeScript transform cannot load (only the built app can).
import { ILLUSTRATIONS, type Illustration } from "@/content/media/illustrations/manifest";

const MEASURED_WIDTHS = [390, 1440];
const SETTLE_MS = 2000;
const BANNER_CAP_BYTES = 350 * 1024;
const CONTENT_DIR = resolve(process.cwd(), "content/media/illustrations");
const MEDIA_DIR = resolve(process.cwd(), "public/media/illustrations");
const entry = (id: Illustration["id"]): Illustration => {
  const found = ILLUSTRATIONS.find((e) => e.id === id);
  if (!found) throw new Error(`manifest has no "${id}"`);
  return found;
};
const BANNER = entry("hero-banner");

const width = (page: Page) => page.viewportSize()?.width ?? 0;

function skipUnmeasured(page: Page) {
  test.skip(!MEASURED_WIDTHS.includes(width(page)), "EVAL-019 measures w390 and w1440 only");
}

function note(type: string, description: string) {
  test.info().annotations.push({ type, description });
}

/** Load `/`, let hydration have its chance, and count the hero's `<video>`s and clip hooks. */
async function heroVideosAfterSettle(page: Page): Promise<{ videos: number; clipHooks: number }> {
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(SETTLE_MS);
  return page.evaluate(() => ({
    videos: document.querySelectorAll(".hero-banner video").length,
    clipHooks: document.querySelectorAll("[data-hero-clip]").length,
  }));
}

async function expectStill(page: Page, mode: string) {
  const { videos, clipHooks } = await heroVideosAfterSettle(page);
  note("eval-019", `${mode} @${width(page)}: ${videos} <video> in the hero, ${clipHooks} [data-hero-clip]`);
  expect(videos, `${mode}: no <video> in the hero`).toBe(0);
  expect(clipHooks, `${mode}: no [data-hero-clip]`).toBe(0);
  await expect(page.getByAltText(BANNER.alt)).toBeVisible();
}

// ---------------------------------------------------------------------------
// The four modes — the hero is a still in every one of them.
// ---------------------------------------------------------------------------
test("@EVAL-019 default mode: the hero is a still — 0 <video>, 0 [data-hero-clip]", async ({ page }) => {
  skipUnmeasured(page);
  test.skip(width(page) !== 1440, "w390 is the touch/coarse-pointer mode (hasTouch) — see the touch test");
  await expectStill(page, "default");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("@EVAL-019 prefers-reduced-motion: reduce — the hero is a still", async ({ page }) => {
    skipUnmeasured(page);
    await expectStill(page, "reduced motion");
  });
});

test("@EVAL-019 touch / coarse pointer (w390 project) — the hero is a still", async ({ page }) => {
  skipUnmeasured(page);
  test.skip(width(page) !== 390, "the touch mode is the w390 project; w1440 has a fine pointer");
  await expectStill(page, "touch");
});

test("@EVAL-019 Save-Data — the hero is a still", async ({ page, saveData }) => {
  void saveData;
  skipUnmeasured(page);
  await expectStill(page, "save-data");
  // The fixture's init script ran on this document (a stub that silently didn't would pass vacuously).
  expect(await page.evaluate(() => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)).toBe(true);
});

// ---------------------------------------------------------------------------
// SSR — the static HTML, no JavaScript. The banner is the LCP image in every mode.
// ---------------------------------------------------------------------------
test("@EVAL-019 static HTML carries one banner <img fetchpriority=high> and no <video>", async ({ page, request }) => {
  skipUnmeasured(page);
  test.skip(width(page) !== 1440, "the served HTML is viewport-independent; checked once");
  const html = await (await request.get("/")).text();
  // The inline RSC flight payload in <script> repeats every prop string, so scripts are stripped before
  // counting — that copy is data, not markup.
  const markupOnly = html.replace(/<script\b[\s\S]*?<\/script>/g, "");

  expect((markupOnly.match(/<video/g) ?? []).length, "no <video> in the SSR HTML").toBe(0);
  expect(markupOnly, "no clip hook in the SSR HTML").not.toContain("data-hero-clip");

  const imgTags = markupOnly.match(/<img\b[^>]*>/g) ?? [];
  const banners = imgTags.filter((tag) => tag.includes("hero-banner"));
  expect(banners, "exactly one banner <img>").toHaveLength(1);
  const banner = banners[0]!;
  // React 19's server renderer emits the prop name as written (`fetchPriority="high"`); HTML attribute
  // names are case-insensitive, so the browser reads it as `fetchpriority` — the live-DOM check below
  // confirms `img.fetchPriority === "high"` where it matters.
  expect(banner).toMatch(/\bfetchpriority="high"/i);
  expect(banner).toMatch(/\bloading="eager"/);
  expect(banner).toMatch(/\bwidth="3168"/);
  expect(banner).toMatch(/\bheight="1344"/);
  expect(banner).toMatch(/\bsizes="100vw"/);
  expect(banner, "the dark twin is not in the markup until the theme wiring lands").not.toContain("hero-banner-dark");
  const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  const alt = /\balt="([^"]*)"/.exec(banner)?.[1] ?? "";
  expect(alt).toBe(escape(BANNER.alt));
  expect(markupOnly.split(escape(BANNER.alt)).length - 1, "alt string once in the rendered markup").toBe(1);

  // Intro-video rule (TASK-138), kept verbatim: its poster is lazy and never a high-priority candidate.
  for (const tag of imgTags.filter((t) => /\bclass="[^"]*pf-stage-poster/.test(t))) {
    expect(tag, "the intro print's poster is lazy, never an LCP candidate").toMatch(/\bloading="lazy"/);
    expect(tag).not.toMatch(/\bfetchpriority="high"/i);
  }

  // Live DOM at w1440: the parsed attribute + the LCP-relevant IDL property.
  await page.goto("/", { waitUntil: "load" });
  const img = page.getByAltText(BANNER.alt);
  await expect(img).toHaveAttribute("fetchpriority", "high");
  expect(await img.evaluate((el: HTMLImageElement) => el.fetchPriority)).toBe("high");
  await expect(img).toHaveAttribute("loading", "eager");
});

// ---------------------------------------------------------------------------
// One hero image fetched before the load event; the inactive (dark) twin is never requested.
// ---------------------------------------------------------------------------
test("@EVAL-019 exactly one hero banner image is fetched, and never the dark twin", async ({ page }) => {
  skipUnmeasured(page);
  const urls = new Set<string>();
  page.on("request", (req) => {
    if (req.url().includes("hero-banner")) urls.add(req.url());
  });
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(500);
  note("eval-019", `hero banner requests @${width(page)}: ${[...urls].join(" | ")}`);
  expect(urls.size, "one hero banner URL requested").toBe(1);
  expect([...urls].some((u) => u.includes("dark")), "the dark twin is not fetched").toBe(false);
});

// ---------------------------------------------------------------------------
// Files — from disk: clip A is gone; every banner rendition is inside the cap.
// ---------------------------------------------------------------------------
test("@EVAL-019 no clip files ship and every banner rendition stays inside its cap", async ({ page }) => {
  skipUnmeasured(page);
  test.skip(width(page) !== 1440, "file sizes are viewport-independent; checked once");
  const clipFiles = readdirSync(MEDIA_DIR).filter((name) => /^hero-animation\./.test(name) || name === "hero-clip-mask.png");
  note("eval-019", `clip files under public/media/illustrations: ${clipFiles.length}`);
  expect(clipFiles, "clip A is retired (S24)").toEqual([]);
  expect(ILLUSTRATIONS.some((e) => (e.id as string) === "hero-clip"), "no hero-clip manifest entry").toBe(false);

  const renditions = [
    resolve(CONTENT_DIR, BANNER.file),
    resolve(CONTENT_DIR, BANNER.darkFile ?? "missing-dark-twin"),
    resolve(MEDIA_DIR, "hero-banner-mobile.webp"),
    resolve(MEDIA_DIR, "hero-banner-dark-mobile.webp"),
  ];
  for (const file of renditions) {
    expect(existsSync(file), `${file} exists`).toBe(true);
    const bytes = statSync(file).size;
    note("eval-019", `${file.split("/").pop()}: ${bytes} bytes (cap ${BANNER_CAP_BYTES})`);
    expect(bytes, `${file} over the 350 kB cap`).toBeLessThanOrEqual(BANNER_CAP_BYTES);
  }
});
