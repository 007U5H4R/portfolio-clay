/**
 * about.spec.ts (TASK-136 — Tushar's About redesign spec 2026-09-29; supersedes the TSK-23 / TKT-86 /
 * TASK-117 contract) — `/about` as WHO Tushar is: the hero and the page-wide layout, accessibility and
 * motion. The section-by-section content contract is in about-part2.spec.ts.
 *
 * Each viewport project (w390/w768/w1024/w1440) runs this file once, so plain overflow / target checks
 * cover all four widths; axe and reduced motion run at 390 and 1440 (EVAL-006 / EVAL-010 pattern).
 *
 *   @EVAL-008 — no horizontal overflow at any width; every control ≥ 44×44.
 *   @EVAL-006 — axe WCAG 2.1 AA clean at 390 and 1440.
 *   @EVAL-010 — reduced motion: every Reveal shows at once (opacity-only), the career thread is drawn,
 *               nothing moves.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { ILLUSTRATIONS } from "@/content/media/illustrations/manifest";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const SCENE_ABOUT_ALT = ILLUSTRATIONS.find((entry) => entry.id === "scene-about")!.alt;

/** Scroll the page through once so every one-shot `Reveal` fires, then return to the top. */
async function revealAll(page: Page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);
}

test("hero: eyebrow ABOUT, the approved h1 and copy; the scene renders once, in the opener", async ({ page }) => {
  await page.goto("/about", { waitUntil: "load" });
  const hero = page.locator('section[aria-labelledby="about-hero-heading"]');
  await expect(hero.locator(".ab-eyebrow")).toHaveText("About");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("A builder who connects deep tech to real-world impact.");
  await expect(hero.locator(".abh-lead")).toHaveText(
    "From research labs to production systems, I’ve always been drawn to solving complex problems and turning them into products people actually use.",
  );
  // no biography paragraph (spec §2): one paragraph of copy besides the eyebrow
  await expect(hero.locator(".abh-copy > p")).toHaveCount(2);
  // the scene is TKT-95's opener above — one scene <img>, never inside the hero
  await expect(page.getByRole("img", { name: SCENE_ABOUT_ALT })).toHaveCount(1);
  await expect(hero.getByRole("img", { name: SCENE_ABOUT_ALT })).toHaveCount(0);
  // the collage is decoration: out of the a11y tree, every piece alt=""
  const collage = hero.locator('[data-decor="collage"]');
  await expect(collage).toHaveAttribute("aria-hidden", "true");
  await expect(collage.locator("img")).toHaveCount(4);
  await expect(collage.locator("img:not([alt=''])")).toHaveCount(0);
});

test("hero layout: ≥ 1024 copy left (~44–46 %) and collage right; < 1024 copy first, collage below", async ({ page }) => {
  await page.goto("/about", { waitUntil: "load" });
  await revealAll(page);
  const copy = await page.locator(".abh-copy").boundingBox();
  const stage = await page.locator(".abh-stage").boundingBox();
  expect(copy && stage).toBeTruthy();
  if (width(page) >= 1024) {
    expect(stage!.x).toBeGreaterThan(copy!.x + copy!.width - 1);
    const ratio = copy!.width / (stage!.x + stage!.width - copy!.x);
    expect(ratio).toBeGreaterThan(0.36);
    expect(ratio).toBeLessThan(0.5);
  } else {
    expect(stage!.y).toBeGreaterThanOrEqual(copy!.y + copy!.height - 1);
  }
  // the hero title sits in the spec's size band (~42–70 px)
  const size = await page.locator(".abh-title").evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(size).toBeGreaterThanOrEqual(40);
  expect(size).toBeLessThanOrEqual(70);
  // phones get a simpler collage (spec §45): the sketches and the desk drop out, the city + books stay
  const shown = await page
    .locator(".abh-collage img")
    .evaluateAll((els) => els.filter((el) => getComputedStyle(el).display !== "none").map((el) => el.getAttribute("data-about-art")));
  expect(shown).toEqual(width(page) < 640 ? ["systems-collage", "books-stack"] : ["research-sketches", "systems-collage", "product-desk", "books-stack"]);
});

test("the page stays compact: about 4–5 viewport heights of content at 1440 (spec §39–§41)", async ({ page }) => {
  test.skip(width(page) !== 1440, "measured at 1440×900");
  await page.goto("/about", { waitUntil: "load" });
  const { main, opener } = await page.evaluate(() => ({
    main: document.querySelector("main")!.getBoundingClientRect().height,
    opener: document.querySelector('[data-opener="scene-about"]')!.getBoundingClientRect().height,
  }));
  expect((main - opener) / 900).toBeLessThanOrEqual(5.5);
});

test("@EVAL-008 /about has no horizontal overflow and every control clears 44×44", {
  tag: "@EVAL-008",
}, async ({ page, noOverflow, minTargets }) => {
  await page.goto("/about", { waitUntil: "load" });
  await revealAll(page);
  await noOverflow(page);
  await minTargets(page);
});

test("@EVAL-006 /about axe WCAG2.1AA clean", { tag: "@EVAL-006" }, async ({ page, axe }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440 (EVAL-006)");
  await page.goto("/about", { waitUntil: "load" });
  await revealAll(page);
  await axe(page);
});

test("@EVAL-010 reduced motion: every Reveal is shown at once, the career thread is drawn, nothing moves", {
  tag: "@EVAL-010",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "checked at 390 and 1440");
  await withReducedMotion(page);
  await page.goto("/about", { waitUntil: "load" });
  await page.waitForTimeout(300);
  const reveals = page.locator("main .reveal");
  expect(await reveals.count()).toBeGreaterThan(5);
  const states = await reveals.evaluateAll((els) =>
    els.map((el) => ({ o: getComputedStyle(el).opacity, t: getComputedStyle(el).transform, p: getComputedStyle(el).transitionProperty })),
  );
  for (const s of states) {
    expect(s.o).toBe("1");
    expect(s.t).toBe("none");
    expect(s.p).toBe("opacity");
  }
  const dash = await page.locator(".crx-thread path").evaluate((el) => getComputedStyle(el).strokeDashoffset);
  expect(parseFloat(dash)).toBe(0);
  const card = page.locator(".chx-card").first();
  const before = await card.boundingBox();
  await page.waitForTimeout(300);
  const after = await card.boundingBox();
  expect(Math.abs((after?.y ?? 0) - (before?.y ?? 0))).toBeLessThan(1);
});

test("entrance: with motion allowed the chapters, thread and artifacts settle visible once in view", async ({ page }) => {
  test.skip(width(page) !== 1440, "entrance timing is width-independent; checked at 1440");
  await page.goto("/about", { waitUntil: "load" });
  await revealAll(page);
  for (const sel of [".chx-rv", ".crx-strip", ".rvx-rv", ".rcx-rv"]) {
    const els = page.locator(sel);
    const n = await els.count();
    for (let i = 0; i < n; i++) {
      await expect(els.nth(i)).toHaveAttribute("data-revealed", "");
      await expect.poll(() => els.nth(i).evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    }
  }
  await expect.poll(() => page.locator(".crx-thread path").evaluate((el) => parseFloat(getComputedStyle(el).strokeDashoffset))).toBe(0);
});
