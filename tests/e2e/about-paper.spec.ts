/**
 * about-paper.spec.ts (TASK-196 — the About body redesign: origami layered research notebook).
 *
 * Each viewport project (w390 / w768 / w1024 / w1440) runs this file once.
 *   - the seven body sections render, with their art loaded, sized and decorative;
 *   - the hero (opener + About hero) and the band footer are byte-for-byte what main shipped (fingerprint);
 *   - no horizontal overflow in light and dark, at rest and with a career era selected;
 *   - the era buttons show the shared focus ring; selection emphasises the era's string;
 *   - the P1 hover contract: a 4 px lift on a fine pointer, none under reduced motion;
 *   - the desk, map and notebook swap with the theme.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { fingerprint } from "./about-paper-lib";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const SECTIONS = ["desk", "chapters", "career", "research-values", "recognition", "testimonials"] as const;

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
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);

test("the seven body sections render, in order, with their headings", async ({ page }) => {
  await page.goto("/about", { waitUntil: "load" });
  for (const id of SECTIONS) await expect(page.locator(`main section#${id}`)).toHaveCount(1);
  await expect(page.locator("section#research-values #research")).toHaveAttribute("role", "region");
  await expect(page.locator("section#research-values #values")).toHaveCount(0); // TASK-213: What Drives Me removed
  const h2s = await page.locator("main h2").allTextContents();
  expect(h2s).toEqual([
    "Where the work starts.",
    "The arc of my journey.",
    "Different problems, common thread.",
    "From labs to lasting ideas.",
    "Recognized for impact.",
    "In their words.",
    "Want the full story with roles, achievements and metrics?",
  ]);
});

test("the art is sized, decorative and loads (no layout shift, nothing baked in as text)", async ({ page }) => {
  await page.goto("/about", { waitUntil: "load" });
  await revealAll(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  const imgs = await page.locator("img[data-paper-art]").evaluateAll((els) =>
    els.map((el) => {
      const img = el as HTMLImageElement;
      return {
        id: img.dataset.paperArt,
        alt: img.getAttribute("alt"),
        w: img.getAttribute("width"),
        h: img.getAttribute("height"),
        loading: img.getAttribute("loading"),
        shown: img.getClientRects().length > 0,
        ok: img.complete && img.naturalWidth > 0,
        ratio: img.naturalWidth / img.naturalHeight,
        attrRatio: Number(img.getAttribute("width")) / Number(img.getAttribute("height")),
        natW: img.naturalWidth,
        cssW: img.getBoundingClientRect().width,
      };
    }),
  );
  expect(imgs.length).toBeGreaterThanOrEqual(15); // TASK-213 removed the three principle pieces (was > 15)
  for (const img of imgs) {
    expect(img.alt, img.id).toBe("");
    expect(img.w && img.h, img.id).toBeTruthy();
    expect(img.loading, img.id).toBe("lazy");
    if (img.shown) expect(img.ok, `${img.id} loads`).toBe(true);
    if (img.shown) expect(Math.abs(img.ratio - img.attrRatio), `${img.id} width/height match the file`).toBeLessThan(0.01);
    // TASK-345: decode cost scales with intrinsic pixels — a piece must not ship far above its display size (2x DPR, or 3x on the smallest pieces).
    if (img.shown && img.cssW > 0) expect(img.natW, `${img.id} intrinsic ${img.natW}px vs ${Math.round(img.cssW)} CSS px`).toBeLessThanOrEqual(img.cssW * 5);
  }
});

test("the opener and the footer are exactly what main shipped (the hero changed on purpose: TASK-212) (fingerprint of HTML + computed style)", async ({ page, browser }) => {
  // ABOUT_BASELINE_URL (a running origin/main build) is the live baseline; otherwise the committed snapshot.
  const live = process.env.ABOUT_BASELINE_URL;
  let expected: Awaited<ReturnType<typeof fingerprint>> | undefined;
  if (live) {
    const ctx = await browser.newContext({ viewport: page.viewportSize() });
    try {
      expected = await fingerprint(await ctx.newPage(), live.replace(/\/$/, ""));
    } finally {
      await ctx.close();
    }
  } else {
    const baseline = JSON.parse(readFileSync(join(process.cwd(), "tests/e2e/about-paper-baseline.json"), "utf8")) as Record<string, Awaited<ReturnType<typeof fingerprint>>>;
    expected = baseline[String(width(page))];
  }
  expect(expected, `baseline for w${width(page)}`).toBeTruthy();
  const actual = await fingerprint(page);
  for (const region of ["opener", "footer"] as const) {
    expect(actual[region].elements, `${region} element count`).toBe(expected![region].elements);
    expect(actual[region].html, `${region} markup`).toBe(expected![region].html);
    expect(actual[region].style, `${region} computed style`).toBe(expected![region].style);
  }
});

for (const theme of ["light", "dark"] as const) {
  test(`no horizontal overflow in ${theme}, at rest and with an era selected; targets stay ≥ 44 px`, async ({ page, noOverflow, minTargets }) => {
    await page.goto("/about", { waitUntil: "load" });
    await setTheme(page, theme);
    await revealAll(page);
    await noOverflow(page);
    await minTargets(page);
    await page.locator(".crx-pick").nth(1).click();
    await expect(page.locator(".crx-board")).toHaveAttribute("data-selected", "cloud");
    await noOverflow(page);
    for (const sel of ["section#desk", "section#career", "section#research-values", "section#recognition"]) {
      const box = await page.locator(sel).boundingBox();
      expect(box!.x, sel).toBeGreaterThanOrEqual(-1);
      expect(box!.x + box!.width, sel).toBeLessThanOrEqual(width(page) + 1);
    }
  });
}

test("the desk, the map and the notebook swap with the theme; the box never changes size", async ({ page }) => {
  await page.goto("/about", { waitUntil: "load" });
  const boxes: Record<string, number[]> = {};
  for (const theme of ["light", "dark"] as const) {
    await setTheme(page, theme);
    await page.locator("section#desk").scrollIntoViewIfNeeded();
    // TASK-254: phones (< 640) hide the research notebook, so it is checked only where it shows.
    const pieces = [[".bdx-art", "desk"], [".crx-map", "map"], [".rvx-notebook", "notebook"]] as const;
    for (const [sel, name] of pieces.filter(([, n]) => n !== "notebook" || page.viewportSize()!.width >= 640)) {
      await page.locator(sel).scrollIntoViewIfNeeded();
      const shown = await page.locator(`${sel} img.pa-light, ${sel} img.pa-dark`).evaluateAll((els) => els.filter((e) => getComputedStyle(e).display !== "none").map((e) => (e as HTMLImageElement).dataset.paperArt));
      expect(shown, `${name} in ${theme}`).toEqual([`${name === "map" ? "pin-map" : name}-${theme}`]);
      const b = await page.locator(sel).boundingBox();
      (boxes[name] ??= []).push(Math.round(b!.width), Math.round(b!.height));
    }
  }
  for (const [name, [w1, h1, w2, h2]] of Object.entries(boxes) as [string, number[]][]) expect([name, w1, h1]).toEqual([name, w2, h2]);
});

test("era buttons: shared focus ring, aria-pressed, selection emphasises the era's string", async ({ page }) => {
  await page.goto("/about", { waitUntil: "load" });
  await revealAll(page);
  const picks = page.locator(".crx-pick");
  await expect(picks).toHaveCount(4);
  await picks.first().focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  const ring = await picks.first().evaluate((el) => {
    const cs = getComputedStyle(el);
    return { style: cs.outlineStyle, width: cs.outlineWidth };
  });
  expect(ring).toEqual({ style: "solid", width: "2px" });
  await picks.first().press("Enter");
  await expect(picks.first()).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".crx-board")).toHaveAttribute("data-selected", "research");
  await picks.first().press("Enter");
  await expect(page.locator(".crx-board")).toHaveAttribute("data-selected", "");
  if (width(page) >= 900) {
    await picks.nth(3).click();
    await expect.poll(() => page.locator('.crx-link[data-era="ai"] .crx-link-hi').evaluate((el) => getComputedStyle(el).opacity)).not.toBe("0");
    await expect(page.locator('.crx-link[data-era="cloud"] .crx-link-hi')).toHaveCSS("opacity", "0");
  }
  // all four eras stay visible and in the tree
  for (const name of ["Research & Engineering", "Cloud & Data", "Enterprise Platforms", "AI Products"]) await expect(page.getByRole("heading", { level: 3, name })).toBeVisible();
});

test("P1 hover contract: a 4 px lift on a fine pointer with a crossfading shadow; none under reduced motion", async ({ page, withReducedMotion }) => {
  test.skip(width(page) < 1024, "hover is a desktop (fine pointer) behaviour");
  await page.goto("/about", { waitUntil: "load" });
  await revealAll(page);
  const card = page.locator(".chx-card").first();
  await card.scrollIntoViewIfNeeded();
  const before = await card.evaluate((el) => getComputedStyle(el).translate);
  expect(before === "none" || before === "0px").toBe(true);
  await card.hover();
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el).translate)).toBe("0px -4px");
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el, "::before").opacity)).toBe("1");
  const shadow = await card.evaluate((el) => getComputedStyle(el, "::before").transitionProperty);
  expect(shadow).toBe("opacity");
  // never a box-shadow or filter transition on hover
  const props = await page.locator(".crx-card, .rvx-plist li").evaluateAll((els) => els.map((el) => getComputedStyle(el).transitionProperty));
  for (const p of props) expect(p).not.toMatch(/box-shadow|filter|all/);
  await page.mouse.move(2, 2);
  await withReducedMotion(page);
  await card.hover();
  await page.waitForTimeout(500);
  const reduced = await card.evaluate((el) => getComputedStyle(el).translate);
  expect(reduced === "none" || reduced === "0px").toBe(true);
});

test("reduced motion: every About reveal is shown at once, no section animates or moves", async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "checked at 390 and 1440");
  await withReducedMotion(page);
  await page.goto("/about", { waitUntil: "load" });
  await page.waitForTimeout(300);
  for (const sel of ["section#desk .reveal", "section#career .reveal"]) {
    const states = await page.locator(sel).evaluateAll((els) => els.map((el) => ({ o: getComputedStyle(el).opacity, t: getComputedStyle(el).transform })));
    expect(states.length).toBeGreaterThan(0);
    for (const s of states) expect(s).toEqual({ o: "1", t: "none" });
  }
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running" && a.effect && (a.effect as KeyframeEffect).target?.closest?.("main")).length);
  expect(running).toBe(0);
});

test("no infinite animation anywhere in the About body (TASK-143)", async ({ page }) => {
  await page.goto("/about", { waitUntil: "load" });
  await revealAll(page);
  const infinite = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.effect?.getComputedTiming().iterations === Infinity)
      .map((a) => ((a.effect as KeyframeEffect).target as Element | null)?.className?.toString?.() ?? "?"),
  );
  expect(infinite.filter((c) => /\b(bdx|chx|crx|rvx|rcx|tsx)-/.test(c))).toEqual([]);
});
