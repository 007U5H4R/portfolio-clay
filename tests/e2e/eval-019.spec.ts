/**
 * eval-019.spec.ts (`@EVAL-019`, technical-plan.md S73.07; Design.md §5; decisions S14, D10, TP13;
 * TC-139 step 1, TC-140, TC-141, TC-142) — the hero once-and-hold contract, measured on `/` in the
 * four modes at w390 and w1440 (w768 / w1024 skip: the case's `viewport` is ["390", "1440"]).
 *
 *   default          — w1440 only (w390 is the touch project): `video[data-hero-clip]` mounts with the
 *                      exact attribute set, no `loop`/`controls`, webm → mp4; `ended` within 4 000 ms of
 *                      navigation; over the next 3 s (scroll + `visibilitychange` + `resize`) currentTime
 *                      never decreases and the element stays paused on its last frame; the held frame
 *                      is screenshotted to docs/screenshots/m-009/tracer/hero-end-1440.png.
 *   reduced motion   — `test.use({ reducedMotion: "reduce" })` → 0 `<video>` at both widths.
 *   touch / coarse   — the w390 project (`hasTouch`, `isMobile`) → 0 `<video>`.
 *   Save-Data        — the `saveData` fixture (navigator.connection.saveData = true) → 0 `<video>`.
 *   play() rejected  — `HTMLMediaElement.prototype.play` overridden to reject → 0 `<video>` (poster).
 *   SSR              — `request.get("/")`: the poster `<img>` is in the static HTML with
 *                      fetchpriority="high", loading="eager", 1280×684 and the manifest alt; no `<video`.
 *   caps             — `fs.statSync` on the three shipped renditions.
 *
 * "After hydration" for the poster-only modes = the load event + a 2 s settle (TC-140 steps 2–4);
 * the default-mode test proves hydration happens well inside that window (the clip has *ended*).
 * Every measured number is pushed into `test.info().annotations` (type `eval-019`) so
 * `.eval/playwright.json` carries the evidence `pnpm eval` summarises.
 */
import { statSync } from "node:fs";
import { resolve } from "node:path";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
// The manifest directly, not `lib/illustrations.ts` — that module statically imports the scene JPEGs
// for `next/image`, which Playwright's TypeScript transform cannot load (only the built app can).
import { ILLUSTRATIONS, type Illustration } from "@/content/media/illustrations/manifest";

const MEASURED_WIDTHS = [390, 1440];
const VIDEO = "video[data-hero-clip]";
const entry = (id: Illustration["id"]): Illustration => {
  const found = ILLUSTRATIONS.find((e) => e.id === id);
  if (!found) throw new Error(`manifest has no "${id}"`);
  return found;
};
const POSTER = entry("hero-desk");
const CLIP = entry("hero-clip");
const PUBLIC_DIR = resolve(process.cwd(), "public");
const HELD_FRAME_SHOT = resolve(process.cwd(), "docs/screenshots/m-009/tracer/hero-end-1440.png");

/** EVAL-019 thresholds (evals/eval-cases.json `threshold`). */
const ENDED_WITHIN_MS = 4000;
const CAPS_BYTES = { webm: 200 * 1024, mp4: 350 * 1024, poster: 120 * 1024 };
const SETTLE_MS = 2000;

const width = (page: Page) => page.viewportSize()?.width ?? 0;

function skipUnmeasured(page: Page) {
  test.skip(!MEASURED_WIDTHS.includes(width(page)), "EVAL-019 measures w390 and w1440 only");
}

function note(type: string, description: string) {
  test.info().annotations.push({ type, description });
}

/** Load `/`, wait for hydration to have had its chance, and return the `<video>` count. */
async function videoCountAfterSettle(page: Page): Promise<number> {
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(SETTLE_MS);
  return page.locator("video").count();
}

// ---------------------------------------------------------------------------
// Default mode (TC-140 step 1, TC-141 steps 1–4) — w1440. The w390 project is the touch mode.
// ---------------------------------------------------------------------------
test("@EVAL-019 default mode mounts the once-and-hold clip: exact attributes, ended ≤ 4 s, 0 restarts", async ({
  page,
}) => {
  skipUnmeasured(page);
  test.skip(width(page) !== 1440, "w390 is the touch/coarse-pointer mode (hasTouch) — see the touch test");

  await page.goto("/", { waitUntil: "commit" });
  const video = page.locator(VIDEO);
  await video.waitFor({ state: "attached", timeout: ENDED_WITHIN_MS });

  // The §5.2 contract, attribute by attribute.
  await expect(video).toHaveAttribute("autoplay", "");
  await expect(video).toHaveAttribute("muted", "");
  await expect(video).toHaveAttribute("playsinline", "");
  await expect(video).toHaveAttribute("preload", "metadata");
  await expect(video).toHaveAttribute("poster", POSTER.publicSrc!);
  await expect(video).toHaveAttribute("aria-hidden", "true");
  await expect(video).toHaveAttribute("tabindex", "-1");
  await expect(video).not.toHaveAttribute("loop");
  await expect(video).not.toHaveAttribute("controls");
  const sources = await video.locator("source").evaluateAll((els) =>
    els.map((el) => [el.getAttribute("src"), el.getAttribute("type")]),
  );
  expect(sources, "sources in order webm → mp4").toEqual([
    [CLIP.publicSrc, "video/webm"],
    [CLIP.publicSrc!.replace(/\.webm$/, ".mp4"), "video/mp4"],
  ]);
  expect(await video.evaluate((v: HTMLVideoElement) => v.loop)).toBe(false);
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);

  // ended within 4 s of arrival — measured in-page from the navigation time origin.
  const endedAtMs = await video.evaluate(
    (v: HTMLVideoElement, timeout) =>
      new Promise<number>((done, fail) => {
        const settle = () => done(Math.round(performance.now()));
        if (v.ended) return settle();
        v.addEventListener("ended", settle, { once: true });
        setTimeout(() => fail(new Error(`video not ended after ${timeout} ms (currentTime ${v.currentTime.toFixed(2)}, readyState ${v.readyState}, paused ${v.paused})`)), timeout);
      }),
    ENDED_WITHIN_MS,
  );
  note("eval-019", `ended at ${endedAtMs} ms after navigation start (threshold ${ENDED_WITHIN_MS})`);
  expect(endedAtMs, "ended must fire within 4 s of arrival").toBeLessThanOrEqual(ENDED_WITHIN_MS);

  // 0 restarts: sample currentTime every 250 ms for 3 s while poking the page.
  const samples: number[] = [];
  const read = () => video.evaluate((v: HTMLVideoElement) => v.currentTime);
  samples.push(await read());
  for (let i = 0; i < 12; i++) {
    if (i === 1) await page.mouse.wheel(0, 600);
    if (i === 4) await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    if (i === 7) await page.evaluate(() => window.dispatchEvent(new Event("resize")));
    if (i === 9) await page.mouse.wheel(0, -600);
    await page.waitForTimeout(250);
    samples.push(await read());
  }
  const decreases = samples.filter((t, i) => i > 0 && t < samples[i - 1]!);
  note("eval-019", `currentTime samples (s): ${samples.map((t) => t.toFixed(3)).join(" ")}`);
  expect(decreases, `currentTime must never decrease (samples ${samples.join(", ")})`).toEqual([]);

  const state = await video.evaluate((v: HTMLVideoElement) => ({ paused: v.paused, ended: v.ended, loop: v.loop, duration: v.duration }));
  note("eval-019", `after 3 s: ${JSON.stringify(state)}`);
  expect(state.paused, "stays paused on the last frame").toBe(true);
  expect(state.ended, "stays ended").toBe(true);
  expect(state.loop).toBe(false);
  await expect(page.locator(VIDEO)).toHaveCount(1);

  // The held frame — compared visually with Portfolio-illustration/animation/export/hero-end.webp.
  // Instant scroll to the top (a wheel scroll is smooth and could still be mid-flight, letting the
  // sticky header overlap the frame in the capture), then the frame element alone.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(300);
  await page.locator(".hero-scene .frame").screenshot({ path: HELD_FRAME_SHOT });
});

// ---------------------------------------------------------------------------
// Reduced motion (TC-140 step 2) — both widths.
// ---------------------------------------------------------------------------
test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("@EVAL-019 prefers-reduced-motion: reduce never mounts a <video>", async ({ page }) => {
    skipUnmeasured(page);
    const count = await videoCountAfterSettle(page);
    note("eval-019", `reduced motion @${width(page)}: ${count} <video>`);
    expect(count).toBe(0);
    await expect(page.getByAltText(POSTER.alt)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Touch / coarse pointer (TC-140 step 3) — the w390 project (`hasTouch: true`, `isMobile: true`).
// ---------------------------------------------------------------------------
test("@EVAL-019 touch / coarse pointer (w390 project) never mounts a <video>", async ({ page }) => {
  skipUnmeasured(page);
  test.skip(width(page) !== 390, "the touch mode is the w390 project; w1440 has a fine pointer");
  const count = await videoCountAfterSettle(page);
  note("eval-019", `touch @${width(page)}: ${count} <video>`);
  expect(count).toBe(0);
  await expect(page.getByAltText(POSTER.alt)).toBeVisible();
});

// ---------------------------------------------------------------------------
// Save-Data (TC-140 step 4) — both widths, via the `saveData` fixture.
// ---------------------------------------------------------------------------
test("@EVAL-019 Save-Data never mounts a <video>", async ({ page, saveData }) => {
  void saveData;
  skipUnmeasured(page);
  const count = await videoCountAfterSettle(page);
  // The fixture's init script ran on this document (a stub that silently didn't would pass vacuously).
  expect(await page.evaluate(() => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)).toBe(true);
  note("eval-019", `saveData @${width(page)}: ${count} <video>`);
  expect(count).toBe(0);
  await expect(page.getByAltText(POSTER.alt)).toBeVisible();
});

// ---------------------------------------------------------------------------
// Autoplay rejected (TC-141 step 5) — the error state is the poster: the video unmounts.
// ---------------------------------------------------------------------------
test("@EVAL-019 a rejected play() unmounts the clip — the poster is the error state", async ({ page }) => {
  skipUnmeasured(page);
  test.skip(width(page) !== 1440, "only the default mode ever calls play()");
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException("autoplay blocked", "NotAllowedError"));
  });
  const count = await videoCountAfterSettle(page);
  note("eval-019", `play() rejected @${width(page)}: ${count} <video>`);
  expect(count).toBe(0);
  await expect(page.getByAltText(POSTER.alt)).toBeVisible();
});

// ---------------------------------------------------------------------------
// SSR (TC-139 step 1, TC-140/EVAL-019 "every mode") — the static HTML, no JavaScript.
// ---------------------------------------------------------------------------
test("@EVAL-019 static HTML carries the poster <img fetchpriority=high> and no <video>", async ({ page, request }) => {
  skipUnmeasured(page);
  test.skip(width(page) !== 1440, "the served HTML is viewport-independent; checked once");
  const html = await (await request.get("/")).text();

  expect((html.match(/<video/g) ?? []).length, "no <video> in the SSR HTML").toBe(0);

  const imgTags = html.match(/<img\b[^>]*>/g) ?? [];
  const posters = imgTags.filter((tag) => tag.includes("hero-poster"));
  expect(posters, "exactly one poster <img>").toHaveLength(1);
  const poster = posters[0]!;
  // React 19's server renderer emits the prop name as written (`fetchPriority="high"`); HTML
  // attribute names are case-insensitive, so the browser reads it as `fetchpriority` — the live-DOM
  // check below confirms `img.fetchPriority === "high"` where it matters.
  expect(poster).toMatch(/\bfetchpriority="high"/i);
  expect(poster).toMatch(/\bloading="eager"/);
  expect(poster).toMatch(/\bwidth="1280"/);
  expect(poster).toMatch(/\bheight="684"/);
  expect(poster).toMatch(/\bsizes="\(min-width: 1024px\) 58vw, 100vw"/);
  // The alt byte-equal to the manifest (HTML-escaped by React — decode the few entities it emits).
  const alt = /\balt="([^"]*)"/.exec(poster)?.[1] ?? "";
  const decoded = alt.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
  expect(decoded).toBe(POSTER.alt);
  // Rendered once in the markup. (The inline RSC flight payload in <script> repeats every prop
  // string, so scripts are stripped before counting — that copy is data, not a second <img>.)
  const markupOnly = html.replace(/<script\b[\s\S]*?<\/script>/g, "");
  expect(markupOnly.split(POSTER.alt).length - 1, "alt string once in the rendered markup").toBe(1);

  // Live DOM at w1440: the parsed attribute + the LCP-relevant IDL property.
  await page.goto("/", { waitUntil: "load" });
  const img = page.getByAltText(POSTER.alt);
  await expect(img).toHaveAttribute("fetchpriority", "high");
  expect(await img.evaluate((el: HTMLImageElement) => el.fetchPriority)).toBe("high");
  await expect(img).toHaveAttribute("loading", "eager");
});

// ---------------------------------------------------------------------------
// Asset caps (TC-142) — from disk, the shipped renditions.
// ---------------------------------------------------------------------------
test("@EVAL-019 shipped hero renditions stay inside their caps", async ({ page }) => {
  skipUnmeasured(page);
  test.skip(width(page) !== 1440, "file sizes are viewport-independent; checked once");
  const size = (publicSrc: string) => statSync(resolve(PUBLIC_DIR, `.${publicSrc}`)).size;
  const webm = size(CLIP.publicSrc!);
  const mp4 = size(CLIP.publicSrc!.replace(/\.webm$/, ".mp4"));
  const poster = size(POSTER.publicSrc!);
  note("eval-019", `bytes: webm ${webm} (≤ ${CAPS_BYTES.webm}) · mp4 ${mp4} (≤ ${CAPS_BYTES.mp4}) · poster ${poster} (≤ ${CAPS_BYTES.poster})`);
  expect(webm).toBeLessThanOrEqual(CAPS_BYTES.webm);
  expect(mp4).toBeLessThanOrEqual(CAPS_BYTES.mp4);
  expect(poster).toBeLessThanOrEqual(CAPS_BYTES.poster);
});
