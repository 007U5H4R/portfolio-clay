/**
 * band-verb.spec.ts — TASK-118 (Tushar 2026-09-28: "change the italics text from Build, design etc.").
 * The band headline "Let's *build* / something people can use." cycles its italic verb
 * build → ship → design → fix → create → rethink (2.5 s per verb, CSS keyframes, `BandVerb` island).
 *
 *   - motion: once the band is in view the visible verb changes over time, in `BAND_VERBS` order;
 *   - accessibility: the heading's accessible name stays "Let's build something people can use.", axe clean;
 *   - no layout shift: the h2 box (and "Let's" / line 2) stays put across a full 15 s cycle;
 *   - reduced motion: static "build", no animation on the stack at all.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { BAND_VERBS } from "@/components/layout/BandVerb";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const NAME = /^Let.s build\s*something people can use\.$/;

/** The verb currently showing: the stacked word with the highest computed opacity (null while between verbs). */
async function visibleVerb(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    let best: { text: string; opacity: number } | null = null;
    for (const el of document.querySelectorAll<HTMLElement>("#band-h .band-verbs-word")) {
      const opacity = parseFloat(getComputedStyle(el).opacity);
      if (!best || opacity > best.opacity) best = { text: el.textContent ?? "", opacity };
    }
    return best && best.opacity > 0.9 ? best.text : null;
  });
}

async function headlineGeometry(page: Page) {
  return page.evaluate(() => {
    const r = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
    const h2 = r("#band-h");
    const dim = r("#band-h .dim");
    const hire = r(".band-hire");
    return { h2Height: h2.height, h2Width: h2.width, dimX: dim.x - h2.x, dimY: dim.y - h2.y, hireY: hire.y - h2.y };
  });
}

async function scrollToBand(page: Page) {
  await page.goto("/", { waitUntil: "load" });
  await page.locator("footer.band").scrollIntoViewIfNeeded();
  await page.locator("#band-h").scrollIntoViewIfNeeded();
}

test("TASK-118 band verb cycles in order once in view; accessible name stable; axe clean", async ({ page, axe }) => {
  test.skip(width(page) !== 1440, "motion sampled once at w1440");
  test.setTimeout(60_000);
  await page.goto("/", { waitUntil: "load" });
  const stack = page.locator("#band-h .band-verbs");
  await expect(stack, "nothing runs before the band is in view").not.toHaveAttribute("data-cycle", /.+/);

  await scrollToBand(page);
  await expect(stack).toHaveAttribute("data-cycle", "run");
  await expect(page.locator("#band-h")).toHaveAccessibleName(NAME);
  await expect(page.locator("#band-h [aria-live]")).toHaveCount(0);

  const seen: string[] = [];
  const deadline = Date.now() + 8_000; // > 3 verbs
  while (Date.now() < deadline) {
    const verb = await visibleVerb(page);
    if (verb && seen.at(-1) !== verb) seen.push(verb);
    await page.waitForTimeout(100);
  }
  expect(seen.length, `verbs seen: ${seen.join(" → ")}`).toBeGreaterThanOrEqual(3);
  expect(seen[0]).toBe("build");
  expect(seen, "cycle follows BAND_VERBS order").toEqual(BAND_VERBS.slice(0, seen.length));
  await expect(page.locator("#band-h")).toHaveAccessibleName(NAME);
  await axe(page, { include: "footer.band" });
});

test("TASK-118 band headline height and line 2 stay put across a full cycle (CLS 0)", async ({ page }) => {
  test.skip(width(page) !== 1440, "full 15 s cycle sampled once at w1440");
  test.setTimeout(60_000);
  await scrollToBand(page);
  await expect(page.locator("#band-h .band-verbs")).toHaveAttribute("data-cycle", "run");
  const first = await headlineGeometry(page);
  const deadline = Date.now() + 15_500;
  let samples = 0;
  while (Date.now() < deadline) {
    const now = await headlineGeometry(page);
    expect(now, `sample ${samples}`).toEqual(first);
    samples += 1;
    await page.waitForTimeout(150);
  }
  expect(samples).toBeGreaterThan(50);
});

test("TASK-118 the verb box is as wide as the widest verb and clips the slide (every width)", async ({ page, noOverflow }) => {
  await scrollToBand(page);
  const boxes = await page.evaluate(() => {
    const stack = document.querySelector<HTMLElement>("#band-h .band-verbs")!;
    const words = Array.from(stack.querySelectorAll<HTMLElement>(".band-verbs-word"));
    return {
      overflow: getComputedStyle(stack).overflow,
      stackWidth: stack.getBoundingClientRect().width,
      widest: Math.max(...words.map((w) => w.getBoundingClientRect().width)),
    };
  });
  expect(boxes.overflow).toBe("clip");
  expect(boxes.stackWidth).toBeGreaterThanOrEqual(boxes.widest);
  await noOverflow(page);
});

test("TASK-118 reduced motion: the verb stays 'build' and nothing animates", async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "reduced-motion check runs at w1440");
  await withReducedMotion(page);
  await scrollToBand(page);
  const stack = page.locator("#band-h .band-verbs");
  for (let i = 0; i < 6; i++) {
    expect(await visibleVerb(page)).toBe("build");
    await page.waitForTimeout(500);
  }
  await expect(stack).not.toHaveAttribute("data-cycle", /.+/);
  const running = await stack.evaluate((el) => el.getAnimations({ subtree: true }).length);
  expect(running).toBe(0);
  await expect(page.locator("#band-h")).toHaveAccessibleName(NAME);
});
