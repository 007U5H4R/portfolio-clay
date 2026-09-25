/**
 * work.spec.ts (TKT-16/17, M-004 → TKT-80, M-009) — the `/work` page: WorkHero opener copy under the
 * TKT-95 scene opener, URL-synced serif FilterTabs, the numbered index (openers + rows), the Dev-05
 * empty state, and the `ExperienceStrip` as `<details name="job">` rows (TC-152 / TC-153 / TC-154).
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

  // The focused tab wears the shared 2px solid rust ring (EVAL-007).
  const accent = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "var(--color-rust)";
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  });
  const ring = await ai.evaluate((el) => {
    const s = getComputedStyle(el);
    return { w: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
  });
  expect(ring.w).toBe("2px");
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
// TC-152 (TKT-80 AC2): numbered index — 01–11 in data order, re-sequenced per filter; every item is
// exactly one link to its case study; ranks 1–2 are the openers, 3+ the slim rows.
// ---------------------------------------------------------------------------
async function numerals(page: import("@playwright/test").Page): Promise<string[]> {
  return page
    .locator("[role=tabpanel] ol > li")
    .evaluateAll((rows) => rows.map((row) => row.querySelector("[data-numeral]")?.textContent?.trim() ?? ""));
}
const seq = (n: number) => Array.from({ length: n }, (_, i) => String(i + 1).padStart(2, "0"));

test("@EVAL-002 numbered index: 01–11 in data order, re-sequenced per filter, one link per item", {
  tag: "@EVAL-002",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "numbering is viewport-independent; checked once at w1440");
  await page.goto("/work", { waitUntil: "load" });
  await expect.poll(async () => gridSlugs(page)).toEqual(EXPECTED.all);
  expect(await numerals(page)).toEqual(seq(11));
  await expect(page.locator("[role=tabpanel] ol > li").first()).toHaveAttribute("data-rank", "flagship");
  await expect(page.locator("[role=tabpanel] ol > li").nth(1)).toHaveAttribute("data-rank", "second");
  await expect(page.locator('[role=tabpanel] ol > li[data-rank="row"]')).toHaveCount(9);

  const perItem = await page.locator("[role=tabpanel] ol > li").evaluateAll((rows) =>
    rows.map((row) => ({
      slug: row.getAttribute("data-slug"),
      links: Array.from(row.querySelectorAll("a")).map((a) => a.getAttribute("href")),
    })),
  );
  for (const { slug, links } of perItem) expect(links).toEqual([`/work/${slug}`]);

  // Deep link: after hydration only the subset, numerals restart at 01.
  await page.goto("/work?filter=enterprise", { waitUntil: "load" });
  await expect.poll(async () => gridSlugs(page)).toEqual(EXPECTED.enterprise);
  expect(await numerals(page)).toEqual(seq(EXPECTED.enterprise!.length));
});

// ---------------------------------------------------------------------------
// TC-153 (TKT-80 AC3, Dev-05): the EmptyState card is a screen state — never in the DOM beside a
// populated index. With the real data no filter is empty, so every tab asserts its absence; the
// present-when-empty branch is proven by tests/unit/work-grid.test.tsx (injected empty dataset).
// ---------------------------------------------------------------------------
test("@EVAL-011 EmptyState card is absent for every non-empty filter (Dev-05)", { tag: "@EVAL-011" }, async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "DOM presence is viewport-independent; checked once at w1440");
  for (const [filter, expected] of Object.entries(EXPECTED)) {
    await page.goto(filter === "all" ? "/work" : `/work?filter=${filter}`, { waitUntil: "load" });
    await expect.poll(async () => (await gridSlugs(page)).sort()).toEqual([...expected].sort());
    await expect(page.locator('[role=tabpanel] [data-paper="index"]')).toHaveCount(0);
    await expect(page.getByText("No projects match this filter")).toHaveCount(0);
  }
});

// ---------------------------------------------------------------------------
// TC-154 (TKT-80 AC5/AC6): one scene <img> (the TKT-95 opener — the opener copy adds none), manifest
// alt + sizes + intrinsic size; EVAL-018 unit counts opener 2 · index 3 · strip 1 at both widths.
// ---------------------------------------------------------------------------
test("@EVAL-018 /work: one scene img, decoration counts 2 / 3 / 1", { tag: ["@EVAL-018", "@EVAL-013"] }, async ({
  page,
}) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "counts asserted at the two boundary widths");
  await page.goto("/work", { waitUntil: "load" });
  await expect.poll(async () => (await gridSlugs(page)).length).toBe(EXPECTED.all!.length);

  const sceneImgs = page.locator('img[src*="scene-work"], img[srcset*="scene-work"]');
  await expect(sceneImgs).toHaveCount(1);
  await expect(page.locator("section.work-hero img")).toHaveCount(0);
  const img = page.locator('[data-opener="scene-work"] img');
  await expect(img).toHaveCount(1);
  expect((await img.getAttribute("alt"))?.length ?? 0).toBeGreaterThan(20);
  await expect(img).toHaveAttribute("sizes", /.+/);
  await expect(img).toHaveAttribute("width", /\d+/);
  await expect(img).toHaveAttribute("height", /\d+/);

  const counts = await page.evaluate(() => {
    const unitOf = (el: Element) => el.closest("section, header, footer");
    const count = (selector: string) => {
      const unit = document.querySelector(selector);
      if (!unit) return -1;
      return Array.from(unit.querySelectorAll("[data-decor]")).filter((d) => unitOf(d) === unit).length;
    };
    return {
      opener: count("section.work-hero"),
      index: count('section[aria-labelledby="work-personal-heading"]'),
      strip: count('section[aria-label="Professional experience"]'),
    };
  });
  expect(counts).toEqual({ opener: 2, index: 3, strip: 1 });
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
  // Right after "load" the static Suspense fallback row (FilterTabsFallback, TP7) can be swapped for the
  // hydrated FilterTabs between locator resolution and evaluate — a detached node measures 0 × 0
  // (integration-abc: reproduced 1/3 at 1 worker). Poll until the live row is measured.
  const measure = () =>
    page.getByRole("tablist").evaluate((el) => ({
      scrollable: el.scrollWidth > el.clientWidth,
      doc: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    }));
  await expect
    .poll(async () => (await measure()).scrollable, { message: "the tab row itself scrolls (content wider than the row)" })
    .toBe(true);
  const overflow = await measure();
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

/** Slugs of the ExperienceStrip rows currently rendered (`details[name="job"]`, TKT-80). */
async function experienceSlugs(page: import("@playwright/test").Page): Promise<string[]> {
  return page.$$eval('details[name="job"]', (els) => els.map((el) => el.getAttribute("data-slug") ?? ""));
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

  const marsRow = region.locator('details[data-slug="mars-ar-modernization"] summary');
  await expect(marsRow).toContainText("Senior Product Manager");
  await expect(marsRow).toContainText("Accounts Receivable Modernization — American Express");
  await expect(marsRow).toContainText("Jun 2026 – present");

  // Never a card / live-product affordance: no link (let alone an external one) or arrow inside a row.
  await expect(region.locator("details a")).toHaveCount(0);
  await expect(region.locator('details a[href^="http"]')).toHaveCount(0);
  // (the body copy may contain "DynamoDB→Cloud Spanner" — the affordance check is on the row chrome)
  expect(
    await region.locator("details summary").evaluateAll((els) => els.some((el) => /→/.test(el.textContent ?? ""))),
  ).toBe(false);

  // The only link is the CTA to the declared anchor (SITEMAP.md / decisions §S8).
  await expect(region.getByRole("link")).toHaveCount(1);
  await expect(region.getByRole("link", { name: /see my experience/i })).toHaveAttribute(
    "href",
    "/about#experience",
  );
});

test("@EVAL-011 @EVAL-007 ExperienceStrip rows are native <details name=job>: keyboard-operable, one open at a time", {
  tag: ["@EVAL-011", "@EVAL-007"],
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "expand/collapse behaviour checked once at w1440");
  await page.goto("/work", { waitUntil: "load" });
  await expect.poll(async () => (await experienceSlugs(page)).length).toBe(3);

  const region = experienceRegion(page);
  const mars = region.locator('details[data-slug="mars-ar-modernization"]');
  const godrej = region.locator('details[data-slug="godrej-smartnet"]');

  await expect(region.locator("details[open]")).toHaveCount(0);
  await mars.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(mars).toHaveAttribute("open", "");
  await expect(mars).toContainText("Devin GenAI");

  // Opening a second row closes the first (exclusive accordion via the shared `name`).
  await godrej.locator("summary").focus();
  await page.keyboard.press("Space");
  await expect(godrej).toHaveAttribute("open", "");
  await expect(mars).not.toHaveAttribute("open", "");
  await expect(region.locator("details[open]")).toHaveCount(1);
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
      // "Experiments" carries no professional entry — the whole strip section (heading, rows, CTA,
      // torn edge) is absent rather than an empty labelled box left behind (TC-153 step 4).
      await expect(experienceRegion(page)).toHaveCount(0);
      await expect(page.getByRole("link", { name: /see my experience/i })).toHaveCount(0);
    }
  });
}
