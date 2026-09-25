/**
 * artifacts.spec.ts (TKT-20; extended TKT-83) — the /dev/artifacts board QA gate PLUS the case-study
 * deep-dive contract on the real routes (TC-159 flat zones · TC-160 board EVAL-018 · TC-161 ChapterNav
 * · TC-162 Show the thinking).
 *
 * The `@artifacts` board tests are the QA-only route gate (routes.json `dev`): the board only exists in
 * an ALLOW_DEV_ROUTES build, so a plain run SKIPs them on the 404 — never fails. Everything tagged
 * `@EVAL-018` / `@EVAL-007` / `@EVAL-010` / `@EVAL-006` runs on `/work/<slug>` against the production
 * build like every other eval spec.
 *
 * Deep-dive state: the chapters live behind `OverviewToggle` (default "30-sec"), so every check here
 * first selects "Deep dive" — the EVAL-018 collector (`tests/e2e/eval-018-lib.ts`) is then run on the
 * page and read per unit: `section#deep` 0 · every `section.chapter` 0 · `section#show-the-thinking` 2
 * (Design.md §3.3), and `[data-flat] [data-decor]` is empty everywhere (§3.2 rule 4).
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { collectDecorations, RULE_LIMITS } from "./eval-018-lib";

const PATH = "/dev/artifacts";
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const isEdge = (page: Page) => width(page) === 390 || width(page) === 1440;

// Slugs that ship a full deep dive (chapters + an 8-node chain) — mirrors case-study.spec.ts DEEP_DIVE.
const DEEP_DIVE = ["teachspark", "railcite", "velora", "nuptis", "cubicle", "bhakti-vilas"] as const;
const RICH = "teachspark";
const NAV = 'nav[aria-label="Chapters"]';
const PANEL = "#show-the-thinking-panel";
const NODES = `${PANEL} li.thinking-node`;

async function gotoDev(page: Page): Promise<void> {
  const resp = await page.goto(PATH, { waitUntil: "load" });
  test.skip(
    (resp?.status() ?? 404) === 404,
    "/dev/artifacts 404s without ALLOW_DEV_ROUTES=1 — run the QA job to exercise it",
  );
}

/** Open `/work/<slug>` and switch the overview to "Deep dive" so the chapters are in the DOM. */
async function openDeepDive(page: Page, slug: string): Promise<void> {
  const res = await page.goto(`/work/${slug}`, { waitUntil: "load" });
  expect(res?.status(), `/work/${slug} must be 200`).toBe(200);
  await page.getByRole("radio", { name: "Deep dive" }).click();
  await expect(page.locator("section#deep")).toBeAttached();
  await page.evaluate(() => document.fonts.ready);
}

async function collect(page: Page) {
  return page.evaluate(collectDecorations, RULE_LIMITS);
}

// ---------------------------------------------------------------------------------------------------
// /dev/artifacts board (TKT-20 gate, TC-160 step 2)
// ---------------------------------------------------------------------------------------------------
test("artifacts board · no-overflow + min-targets + screenshots", { tag: "@artifacts" }, async ({
  page,
  noOverflow,
  minTargets,
}) => {
  await gotoDev(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Case-study artifacts");

  await noOverflow(page);
  await minTargets(page);

  const w = width(page);
  if (w === 390 || w === 1440) {
    await page.screenshot({
      path: `docs/screenshots/artifacts/${w}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
});

test("artifacts board · axe wcag2.1 AA", { tag: "@artifacts" }, async ({ page, axe }) => {
  test.skip(!isEdge(page), "axe runs at 390 and 1440");
  await gotoDev(page);
  await axe(page);
});

test("artifacts board · EVAL-018 collector: 0 violations, 0 decorations, all 8 forms on paper (TC-160)", {
  tag: "@artifacts",
}, async ({ page }) => {
  test.skip(!isEdge(page), "EVAL-018 is measured at 390 and 1440");
  await gotoDev(page);
  await page.evaluate(() => document.fonts.ready);
  const result = await collect(page);
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
  const board = result.units.find((u) => u.unit === "section#board-artifacts");
  expect(board?.count, "the board carries no decoration").toBe(0);
  const forms = await page.locator("#board-artifacts [data-paper]").evaluateAll((els) =>
    els.map((el) => Array.from(el.classList).find((c) => c.startsWith("artifact-") && c !== "artifact-eyebrow")),
  );
  for (const form of ["artifact-insight", "artifact-hyp", "artifact-metric", "artifact-dec", "artifact-eval", "artifact-exp", "artifact-proto", "artifact-doc"]) {
    expect(forms, `${form} is on the board`).toContain(form);
  }
});

// ---------------------------------------------------------------------------------------------------
// TC-159 — flat zones on every deep-dive slug at both widths: each chapter body is a `[data-flat]`
// `Prose` at 68ch with 0 `[data-decor]` inside; unit counts deep 0 · chapter 0 · thinking 2.
// ---------------------------------------------------------------------------------------------------
for (const slug of DEEP_DIVE) {
  test(`@EVAL-018 deep dive · ${slug}: chapter Prose is data-flat (68ch) with 0 decorations; deep 0 · chapter 0 · thinking 2`, {
    tag: "@EVAL-018",
  }, async ({ page }) => {
    test.skip(!isEdge(page), "EVAL-018 is measured at 390 and 1440");
    await openDeepDive(page, slug);

    const chapters = page.locator("section#deep section.chapter");
    expect(await chapters.count(), "a deep dive renders ≥ 1 chapter").toBeGreaterThanOrEqual(1);
    // Every chapter with a body wraps it in a flat zone; no decoration ever lands inside one.
    expect(await page.locator("section.chapter [data-flat]").count()).toBeGreaterThanOrEqual(1);
    await expect(page.locator("[data-flat] [data-decor]")).toHaveCount(0);

    // Prose measure ≈ 68ch: computed max-width equals 68 × the width of "0" in the Prose font (±2 px).
    const measure = await page.locator("section.chapter [data-flat]").first().evaluate((el) => {
      const probe = document.createElement("span");
      probe.textContent = "0";
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      el.appendChild(probe);
      const ch = probe.getBoundingClientRect().width;
      probe.remove();
      return { maxWidth: Number.parseFloat(getComputedStyle(el).maxWidth), ch };
    });
    expect(Math.abs(measure.maxWidth - 68 * measure.ch), `max-width ${measure.maxWidth}px vs 68ch = ${68 * measure.ch}px`).toBeLessThanOrEqual(2);

    const result = await collect(page);
    const unit = (name: string) => result.units.find((u) => u.unit === name);
    expect(unit("section#deep")?.count, "deep-dive outer section: 0 decorations").toBe(0);
    const chapterIds = await chapters.evaluateAll((els) => els.map((el) => el.id));
    for (const id of chapterIds) {
      expect(unit(`section#${id}`)?.count, `chapter ${id}: 0 decorations`).toBe(0);
    }
    const thinking = unit("section#show-the-thinking");
    expect(thinking, "show the thinking is a counting unit").toBeDefined();
    expect(thinking!.count, "thinking: annotation + chain sketch").toBe(2);
    expect(thinking!.decor.slice().sort()).toEqual(["annotation", "sketch"]);
    // No flat / caveat / hidden / budget hit anywhere in the deep dive.
    const mine = result.violations.filter((v) => v.unit === "section#deep" || v.unit === "section#show-the-thinking" || chapterIds.includes(v.unit.replace(/^section#/, "")));
    expect(mine, JSON.stringify(mine, null, 2)).toEqual([]);
    expect(result.violations.filter((v) => v.rule === "flat"), "no flat-zone violation on the page").toEqual([]);
  });
}

// ---------------------------------------------------------------------------------------------------
// TC-161 — ChapterNav: absent from the DOM < 1024 (MediaGate, Dev-09); at ≥ 1024 present, sticky,
// keyboard-reachable, `aria-current` follows the visible chapter, a click scrolls to the anchor.
// ---------------------------------------------------------------------------------------------------
test("@EVAL-007 ChapterNav · absent < 1024, present ≥ 1024 (TC-161 step 1)", { tag: "@EVAL-007" }, async ({ page }) => {
  await openDeepDive(page, RICH);
  if (width(page) < 1024) {
    // Removed from the DOM, not hidden with CSS (§3.2 rule 3 / TP14).
    await expect(page.locator(NAV)).toHaveCount(0);
    await expect(page.locator("section#deep section.chapter").first()).toBeVisible();
  } else {
    await expect(page.locator(NAV)).toBeVisible();
    const links = page.locator(`${NAV} a`);
    const chapters = page.locator("section#deep section.chapter");
    expect(await links.count()).toBe(await chapters.count());
    // Every link targets a chapter that exists (no dead anchor, EVAL-011).
    const hrefs = await links.evaluateAll((els) => els.map((a) => a.getAttribute("href") ?? ""));
    for (const href of hrefs) await expect(page.locator(`[id="${href.slice(1)}"]`)).toBeAttached();
    await expect(page.locator(NAV)).toHaveCSS("position", "sticky");
  }
});

test("@EVAL-007 ChapterNav · Tab reaches every link with the focus ring; aria-current tracks the visible chapter; click scrolls to the anchor (TC-161 steps 2–3)", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) < 1024, "the chapter nav exists only at ≥ 1024");
  await openDeepDive(page, RICH);
  // MediaGate mounts the rail one effect after the deep view appears — wait for it before counting.
  await expect(page.locator(NAV)).toBeVisible();
  const links = page.locator(`${NAV} a`);
  const count = await links.count();
  expect(count).toBeGreaterThanOrEqual(4);

  // Keyboard: Tab out of the (checked) "Deep dive" radio lands on the first link — a KEYBOARD move, so
  // `:focus-visible` matches (a programmatic `.focus()` after the mouse click above would not show the
  // ring) — then Tab walks every following link in order, each with the shared 2 px solid rust ring.
  const accent = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "var(--color-rust)";
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  });
  await page.getByRole("radio", { name: "Deep dive" }).focus();
  await page.keyboard.press("Tab");
  for (let i = 0; i < count; i++) {
    await expect(links.nth(i)).toBeFocused();
    const ring = await links.nth(i).evaluate((el) => {
      const s = getComputedStyle(el);
      return { w: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
    });
    expect(ring).toEqual({ w: "2px", style: "solid", color: accent });
    if (i < count - 1) await page.keyboard.press("Tab");
  }

  // The real user path, through SmoothScroll → lib/smooth-scroll.ts scrollToTarget (TKT-94): click the
  // 04 link → the hash updates, the chapter lands clear of the sticky header (scroll-margin 7 rem),
  // focus moves to it, and the IntersectionObserver marks that link — and only that link — current.
  const fourth = links.nth(3);
  const fourthId = (await fourth.getAttribute("href"))!.slice(1);
  await fourth.click();
  await expect(page).toHaveURL(new RegExp(`#${fourthId}$`));
  const target = page.locator(`[id="${fourthId}"]`);
  await expect
    .poll(async () => target.evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 5000 })
    .toBeLessThanOrEqual(200);
  await expect(target).toBeFocused();
  await expect(fourth).toHaveAttribute("aria-current", "location", { timeout: 5000 });
  await expect(page.locator(`${NAV} a[aria-current]`)).toHaveCount(1);
  // Settled position: below the 72 px header (never hidden under it), at or near the 7 rem margin.
  await expect
    .poll(async () => target.evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 5000 })
    .toBeGreaterThanOrEqual(72);
});

// ---------------------------------------------------------------------------------------------------
// TC-162 — Show the thinking on paper: click-only reveal, in-order 120 ms stagger, keyboard path,
// reduced motion all-at-once, axe with everything open.
// ---------------------------------------------------------------------------------------------------
test("@EVAL-007 Show the thinking · closed on load and after scrolling into view; Enter opens; Tab reaches the source links; 8 nodes staggered 120 ms (TC-162 steps 1–3)", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(!isEdge(page), "checked at 390 and 1440");
  await openDeepDive(page, RICH);
  const trigger = page.getByRole("button", { name: /Show the thinking/ });
  const nodes = page.locator(NODES);

  // Never auto-plays: not on load, not after the section scrolls into view and a second passes.
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(nodes).toHaveCount(8);
  await expect(nodes.first()).toBeHidden();

  // Keyboard: Enter opens, focus stays on the toggle (a disclosure), Tab lands on the first source link.
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger).toBeFocused();
  for (let i = 0; i < 8; i++) await expect(nodes.nth(i)).toBeVisible();
  const links = page.locator(`${PANEL} a`);
  if ((await links.count()) > 0) {
    await page.keyboard.press("Tab");
    await expect(links.first()).toBeFocused();
  }

  // In-order stagger: node i transitions opacity with a 120 ms × i delay (Design.md §8 row).
  const delays = await nodes.evaluateAll((els) => els.map((el) => getComputedStyle(el).transitionDelay));
  expect(delays).toEqual(["0s", "0.12s", "0.24s", "0.36s", "0.48s", "0.6s", "0.72s", "0.84s"]);
  const props = await nodes.evaluateAll((els) => els.map((el) => getComputedStyle(el).transitionProperty));
  for (const p of props) expect(p).toBe("opacity");
  // The medallions read 1–8 in order; every label tag is Inter.
  await expect(page.locator(`${PANEL} .node-med`)).toHaveText(["1", "2", "3", "4", "5", "6", "7", "8"]);
  const labFonts = await page.locator(`${PANEL} .node-lab`).evaluateAll((els) => els.map((el) => getComputedStyle(el).fontFamily));
  for (const f of labFonts) expect(f).not.toMatch(/Caveat/i);
});

test("@EVAL-010 Show the thinking · reduced motion: all 8 nodes appear at once, opacity only, no stagger (TC-162 step 4)", {
  tag: "@EVAL-010",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "reduced-motion check runs at w1440");
  await withReducedMotion(page);
  await openDeepDive(page, RICH);
  const trigger = page.getByRole("button", { name: /Show the thinking/ });
  const nodes = page.locator(NODES);
  await trigger.click();
  // Every node is already at full opacity — no stagger, no interpolation to wait for.
  await expect.poll(async () => nodes.evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity)), { timeout: 500 }).toEqual(
    Array.from({ length: 8 }, () => "1"),
  );
  const styles = await nodes.evaluateAll((els) => els.map((el) => ({ p: getComputedStyle(el).transitionProperty, d: getComputedStyle(el).transitionDelay })));
  for (const s of styles) {
    expect(s.p).toBe("opacity");
    expect(s.d).toMatch(/^0s?$/);
  }
});

test("@EVAL-006 case study · axe clean with the deep dive and the thinking chain open (TC-162 step 6)", {
  tag: "@EVAL-006",
}, async ({ page, axe, noOverflow, minTargets }) => {
  test.skip(!isEdge(page), "axe runs at 390 and 1440");
  await openDeepDive(page, RICH);
  await page.getByRole("button", { name: /Show the thinking/ }).click();
  await expect(page.locator(NODES).last()).toBeVisible();
  // Let the 220 ms × 120 ms-stagger fade settle: axe must measure the resting colours, not a mid-fade
  // blend (the first gate's 1.4–4.4:1 hits were nodes at partial opacity).
  await expect
    .poll(async () => page.locator(NODES).evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity)))
    .toEqual(Array.from({ length: 8 }, () => "1"));
  await axe(page);
  await noOverflow(page);
  await minTargets(page);
  await page.screenshot({
    path: `docs/screenshots/m-009/tkt-83/deep-dive-${width(page)}.png`,
    fullPage: true,
    animations: "disabled",
  });
});
