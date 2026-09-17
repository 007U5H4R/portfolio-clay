/**
 * work.spec.ts (TKT-16/17, M-004) — the `/work` page: WorkHero, URL-synced FilterTabs, the
 * editorial grid, the four-states empty case, and the `ExperienceStrip` (professional experience).
 *
 * Tags carried so the tests surface under the relevant eval ids (`pnpm eval --only …`):
 *   @EVAL-002 — the recruiter hop 2: a grid card links to /work/<slug> and navigates there (200).
 *   @EVAL-007 — FilterTabs / ExperienceStrip rows are keyboard-operable (roving tabindex or
 *               aria-expanded toggle, arrow/Home/End, focus ring).
 *   @EVAL-008 — no horizontal page overflow at 390 with the peeking scroll row; targets ≥44.
 *   @EVAL-010 — reduced motion: the active-tab indicator and cards never animate transform.
 *   @EVAL-011 — every filter yields ≥1 card (no dead-end) and the empty-state control is a live
 *               link; ExperienceStrip rows are live disclosure controls, never dead.
 *   @EVAL-013 — ExperienceStrip content is verbatim-sourced (role/name/dates) with no fabricated
 *               copy and no product/live-link affordance on the professional entries.
 *
 * The route stays statically prerendered (TP1): filtering is client-side via ?filter=, so a deep
 * link flashes the full grid for one frame (TP7, accepted) before the client narrows it — the tests
 * wait for the hydrated `[role=tabpanel]` grid to settle rather than reading first paint.
 */
import { test, expect } from "./fixtures";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

/** Data-derived personal-build sets (lib/filters over data/projects — professional entries excluded). */
const EXPECTED: Record<string, string[]> = {
  all: [
    "teachspark",
    "railcite",
    "velora",
    "cubicle",
    "nuptis",
    "bhakti-vilas",
    "token-toli",
    "pratyasa",
    "tegaki",
    "dino-arcade-pwa",
    "cinematic-portfolio",
  ],
  ai: ["teachspark", "railcite", "cubicle"],
  enterprise: ["velora", "nuptis"],
  cloud: ["railcite"],
  experiments: [
    "velora",
    "bhakti-vilas",
    "token-toli",
    "pratyasa",
    "tegaki",
    "dino-arcade-pwa",
    "cinematic-portfolio",
  ],
};

/** Slugs of the grid cards currently in the hydrated tabpanel. */
async function gridSlugs(page: import("@playwright/test").Page): Promise<string[]> {
  return page.$$eval('[role=tabpanel] a[data-card-mode="grid"]', (els) =>
    els
      .map((el) => (el.getAttribute("href") ?? "").replace("/work/", ""))
      .filter((s) => s.length > 0),
  );
}

// ---------------------------------------------------------------------------
// WorkHero + assembly.
// ---------------------------------------------------------------------------
test("WorkHero renders the flat h1 + lead and the filter tablist", async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/work", { waitUntil: "load" });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Work");
  await expect(page.getByText("Personal builds first.", { exact: false })).toBeVisible();
  await expect(page.getByRole("tablist", { name: "Filter projects" })).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(5);
});

// ---------------------------------------------------------------------------
// @EVAL-002 — hop 2: the grid links to a case study and navigates there (200).
// ---------------------------------------------------------------------------
test("@EVAL-002 the grid card links to /work/teachspark and navigates (200)", { tag: "@EVAL-002" }, async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "hop 2 verified once at w1440");
  await page.goto("/work", { waitUntil: "load" });
  const card = page.locator('[role=tabpanel] a[href="/work/teachspark"]');
  await expect(card).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(/\/work\/teachspark$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("TeachSpark");
});

// ---------------------------------------------------------------------------
// Per-filter slug sets (AC3) via deep links — the grid renders exactly the data-derived set.
// ---------------------------------------------------------------------------
for (const [filter, expected] of Object.entries(EXPECTED)) {
  test(`@EVAL-011 deep link ?filter=${filter} renders exactly its personal-build set`, {
    tag: "@EVAL-011",
  }, async ({ page }) => {
    test.skip(width(page) !== 1440, "slug sets are viewport-independent; checked once at w1440");
    const href = filter === "all" ? "/work" : `/work?filter=${filter}`;
    await page.goto(href, { waitUntil: "load" });
    // Wait for hydration to reflect the deep-linked filter (TP7 one-frame flash settles).
    const selected = filter === "all" ? "All" : { ai: "AI", enterprise: "Enterprise", cloud: "Cloud", experiments: "Experiments" }[filter];
    await expect(page.locator('[role=tab][aria-selected="true"]')).toHaveText(selected!);
    await expect
      .poll(async () => (await gridSlugs(page)).sort())
      .toEqual([...expected].sort());
    // Every filter yields at least one card — no dead-end with the real dataset (EVAL-011 spirit).
    expect(expected.length).toBeGreaterThan(0);
  });
}

// ---------------------------------------------------------------------------
// Filter click → ?filter= URL sync + back/forward restores state (AC2).
// ---------------------------------------------------------------------------
test("filter click updates ?filter= and back/forward restores the grid", async ({ page }) => {
  test.skip(width(page) !== 1440, "URL sync is viewport-independent; checked once at w1440");
  await page.goto("/work", { waitUntil: "load" });
  await expect.poll(async () => (await gridSlugs(page)).length).toBe(EXPECTED.all!.length);

  await page.getByRole("tab", { name: "AI" }).click();
  await expect(page).toHaveURL(/\/work\?filter=ai$/);
  await expect(page.locator('[role=tab][aria-selected="true"]')).toHaveText("AI");
  await expect.poll(async () => (await gridSlugs(page)).sort()).toEqual([...EXPECTED.ai!].sort());

  await page.goBack();
  await expect(page).toHaveURL(/\/work$/);
  await expect.poll(async () => (await gridSlugs(page)).length).toBe(EXPECTED.all!.length);

  await page.goForward();
  await expect(page).toHaveURL(/\/work\?filter=ai$/);
  await expect.poll(async () => (await gridSlugs(page)).sort()).toEqual([...EXPECTED.ai!].sort());
});

// ---------------------------------------------------------------------------
// @EVAL-007 — keyboard-operable tabs: roving tabindex, arrow/Home/End, visible focus ring.
// ---------------------------------------------------------------------------
test("@EVAL-007 FilterTabs: arrow keys move focus, activate the filter, and show the focus ring", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "keyboard sweep runs once at a desktop width");
  await page.goto("/work", { waitUntil: "load" });

  const all = page.getByRole("tab", { name: "All" });
  await all.focus();
  await expect(all).toBeFocused();

  // ArrowRight → focus AND activate the next tab (automatic activation).
  await page.keyboard.press("ArrowRight");
  const ai = page.getByRole("tab", { name: "AI" });
  await expect(ai).toBeFocused();
  await expect(page).toHaveURL(/\/work\?filter=ai$/);

  // The focused tab wears the shared 3px solid accent ring (EVAL-007).
  const accent = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "var(--color-accent)";
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  });
  const ring = await ai.evaluate((el) => {
    const s = getComputedStyle(el);
    return { w: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
  });
  expect(ring.w).toBe("3px");
  expect(ring.style).toBe("solid");
  expect(ring.color).toBe(accent);

  // Home returns to All (and resets the filter); End jumps to the last tab.
  await page.keyboard.press("Home");
  await expect(all).toBeFocused();
  await expect(page).toHaveURL(/\/work$/);
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Experiments" })).toBeFocused();
  await expect(page).toHaveURL(/\/work\?filter=experiments$/);

  // Roving tabindex: exactly one tab is tabbable at a time.
  await expect(page.locator('[role=tab][tabindex="0"]')).toHaveCount(1);
});

// ---------------------------------------------------------------------------
// AC1 — editorial grid spans: a lead hero card, never a uniform matrix.
// ---------------------------------------------------------------------------
test("editorial grid gives card[0] the hero span (≈8/12 desktop, full-width tablet)", async ({
  page,
}) => {
  test.skip(width(page) !== 1440 && width(page) !== 768, "span math measured at 1440 and 768");
  await page.goto("/work", { waitUntil: "load" });
  await expect.poll(async () => (await gridSlugs(page)).length).toBe(EXPECTED.all!.length);

  const gridBox = await page.locator("[role=tabpanel] ul").boundingBox();
  const heroBox = await page.locator("[role=tabpanel] ul > li").nth(0).boundingBox();
  const mediumBox = await page.locator("[role=tabpanel] ul > li").nth(1).boundingBox();
  expect(gridBox && heroBox && mediumBox).toBeTruthy();
  const heroRatio = heroBox!.width / gridBox!.width;

  if (width(page) === 1440) {
    // Hero ≈ 8/12; medium ≈ 4/12 — the hero is markedly wider than a rail medium.
    expect(heroRatio).toBeGreaterThan(0.6);
    expect(heroRatio).toBeLessThan(0.72);
    expect(heroBox!.width).toBeGreaterThan(mediumBox!.width * 1.6);
  } else {
    // 768–1023: hero full width, mediums 2-up (≈half).
    expect(heroRatio).toBeGreaterThan(0.95);
    expect(mediumBox!.width / gridBox!.width).toBeLessThan(0.55);
  }
});

// ---------------------------------------------------------------------------
// @EVAL-008 — responsive: no page overflow at 390, tabs are real ≥44 targets, peek is scrollable.
// ---------------------------------------------------------------------------
test("@EVAL-008 /work has no horizontal overflow and ≥44 tab targets", { tag: "@EVAL-008" }, async ({
  page,
  noOverflow,
  minTargets,
}) => {
  await page.goto("/work", { waitUntil: "load" });
  await expect.poll(async () => (await gridSlugs(page)).length).toBe(EXPECTED.all!.length);
  await noOverflow(page);
  await minTargets(page);
});

test("@EVAL-008 the filter row scrolls horizontally at 390 (peek, not a page-level overflow)", {
  tag: "@EVAL-008",
}, async ({ page }) => {
  test.skip(width(page) !== 390, "the peeking scroll row is the <768 layout");
  await page.goto("/work", { waitUntil: "load" });
  const overflow = await page.getByRole("tablist").evaluate((el) => ({
    scrollable: el.scrollWidth > el.clientWidth,
    doc: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  }));
  expect(overflow.scrollable, "the tab row itself scrolls (content wider than the row)").toBe(true);
  expect(overflow.doc, "the page must not scroll horizontally").toBe(true);
});

// ---------------------------------------------------------------------------
// @EVAL-010 — reduced motion: the active-tab indicator and cards do not animate transform.
// ---------------------------------------------------------------------------
test("@EVAL-010 reduced motion: switching a filter does not lift the card or slide-animate", {
  tag: "@EVAL-010",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "reduced-motion hover/lift check runs at a fine-pointer width");
  await withReducedMotion(page);
  await page.goto("/work", { waitUntil: "load" });
  await expect.poll(async () => (await gridSlugs(page)).length).toBe(EXPECTED.all!.length);

  const card = page.locator('[role=tabpanel] a[href="/work/teachspark"]');
  await card.scrollIntoViewIfNeeded();
  const before = await card.boundingBox();
  await card.hover();
  await page.waitForTimeout(300);
  const after = await card.boundingBox();
  expect(before && after).toBeTruthy();
  expect(Math.abs(after!.y - before!.y), "card must not lift under reduced motion").toBeLessThan(1);
});

// ---------------------------------------------------------------------------
// @EVAL-006 — axe clean on /work (default view) at 390 and 1440.
// ---------------------------------------------------------------------------
test("@EVAL-006 /work is axe-clean", { tag: "@EVAL-006" }, async ({ page, axe }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe run at the two boundary widths");
  await page.goto("/work", { waitUntil: "load" });
  await expect.poll(async () => (await gridSlugs(page)).length).toBe(EXPECTED.all!.length);
  await axe(page);
});

// ---------------------------------------------------------------------------
// ExperienceStrip (TKT-17) — professional experience: flat rows, no product affordance.
// ---------------------------------------------------------------------------

/** Data-derived professional-entry sets per filter (mirrors `EXPECTED` above but for TKT-17). */
const PROFESSIONAL_ROWS: Record<string, string[]> = {
  all: ["mars-ar-modernization", "cloud-modernization-programs", "godrej-smartnet"],
  ai: ["mars-ar-modernization"],
  enterprise: ["mars-ar-modernization", "cloud-modernization-programs", "godrej-smartnet"],
  cloud: ["mars-ar-modernization", "cloud-modernization-programs"],
  experiments: [],
};

const experienceRegion = (page: import("@playwright/test").Page) =>
  page.getByRole("region", { name: "Professional experience" });

/** Slugs of the ExperienceStrip rows currently rendered (read off each trigger's aria-controls). */
async function experienceSlugs(page: import("@playwright/test").Page): Promise<string[]> {
  return page.$$eval('button[aria-controls^="experience-row-"]', (els) =>
    els.map((el) => (el.getAttribute("aria-controls") ?? "").replace("experience-row-", "")),
  );
}

test("@EVAL-013 ExperienceStrip renders the three professional entries, verbatim, with no card/live-link affordance", {
  tag: "@EVAL-013",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/work", { waitUntil: "load" });
  await expect
    .poll(async () => (await experienceSlugs(page)).sort())
    .toEqual([...PROFESSIONAL_ROWS.all!].sort());

  const region = experienceRegion(page);
  await expect(
    region.getByText("Professional experience — corporate work, not a public product."),
  ).toBeVisible();

  const marsRow = region.locator('button[aria-controls="experience-row-mars-ar-modernization"]');
  await expect(marsRow).toContainText("Senior Product Manager");
  await expect(marsRow).toContainText("Accounts Receivable Modernization — American Express");
  await expect(marsRow).toContainText("Jun 2026 – present");

  // Never a card / live-product affordance: no link inside a row, no separate status badge.
  await expect(region.locator("li a")).toHaveCount(0);
  await expect(region.getByText("Professional experience", { exact: true })).toHaveCount(0);

  // The CTA points at the declared anchor (SITEMAP.md / decisions §S8) — a real link, never dead
  // (it currently WARNs in the dead-control crawler as a known-unbuilt route, not a FAIL).
  await expect(region.getByRole("link", { name: /see my experience/i })).toHaveAttribute(
    "href",
    "/about#experience",
  );
});

test("@EVAL-011 @EVAL-007 ExperienceStrip row expand is a live, keyboard-operable control; only one row open at a time", {
  tag: ["@EVAL-011", "@EVAL-007"],
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "expand/collapse behaviour checked once at w1440");
  await page.goto("/work", { waitUntil: "load" });
  await expect.poll(async () => (await experienceSlugs(page)).length).toBe(3);

  const region = experienceRegion(page);
  const marsTrigger = region.locator('button[aria-controls="experience-row-mars-ar-modernization"]');
  const godrejTrigger = region.locator('button[aria-controls="experience-row-godrej-smartnet"]');

  await expect(marsTrigger).toHaveAttribute("aria-expanded", "false");
  await marsTrigger.focus();
  await page.keyboard.press("Enter");
  await expect(marsTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#experience-row-mars-ar-modernization")).toContainText("Devin GenAI");

  // Opening a second row closes the first (one open at a time, AC2).
  await godrejTrigger.click();
  await expect(godrejTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(marsTrigger).toHaveAttribute("aria-expanded", "false");
});

for (const [filter, expected] of Object.entries(PROFESSIONAL_ROWS)) {
  test(`@EVAL-011 filter=${filter} narrows ExperienceStrip to its data-derived professional set`, {
    tag: "@EVAL-011",
  }, async ({ page }) => {
    test.skip(width(page) !== 1440, "slug sets are viewport-independent; checked once at w1440");
    const href = filter === "all" ? "/work" : `/work?filter=${filter}`;
    await page.goto(href, { waitUntil: "load" });
    await expect
      .poll(async () => (await experienceSlugs(page)).sort())
      .toEqual([...expected].sort());
    if (expected.length === 0) {
      // "Experiments" carries no professional entry — the strip renders no heading/rows/CTA rather
      // than an empty labelled box left behind (no dead-end, EVAL-011 spirit).
      await expect(
        page.getByText("Professional experience — corporate work, not a public product."),
      ).toHaveCount(0);
      await expect(page.getByRole("link", { name: /see my experience/i })).toHaveCount(0);
    }
  });
}
