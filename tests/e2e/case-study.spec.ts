/**
 * case-study.spec.ts (TKT-19, `pnpm test:e2e --grep 'case-study'`) — the full case-study template
 * gate. Every test title starts with "case-study" so the ticket's `--grep 'case-study'` selects
 * exactly this suite.
 *
 * Covers all 11 personal slugs (TSK-18): each renders the header (h1 = project name), the graceful
 * thin-content path (30-sec overview + a labelled "Deep dive coming" note, never a broken/empty
 * chapter section — chapters/metrics/thinking are empty until M-005), a valid NextProject band, and
 * passes axe + no-overflow + min-targets at 390 & 1440. Plus the View-Transition fallback (card →
 * study lands on the identical end state, EXE-5/EVAL-015), JS-off static content (EVAL-015), and the
 * thin-content invariant that ChapterNav is absent while no chapter has content (so no anchor link
 * is ever dead — EVAL-011).
 *
 * Chapter-anchor resolution (AC 5) is exercised for real once M-005 fills chapter bodies; today the
 * honest assertion is that the nav and its `#anchor` links do not render while every chapter is empty.
 */
import { test, expect } from "./fixtures";

const BASE_URL = process.env.PW_BASE_URL ?? "http://127.0.0.1:3000";
const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;
const isEdge = (page: import("@playwright/test").Page) => width(page) === 390 || width(page) === 1440;

// Personal slugs in /work grid order → display name (data/projects.ts). Hard-coded rather than
// imported so the spec never pulls the zod/next data module into the Playwright runtime.
// Slugs that now ship a full deep dive (chapters + thinking; metrics only where sourced). TeachSpark
// landed with TKT-28 (M-005); the thin-content assertions below branch on this set so a filled study
// is checked for its real deep-dive path, not the "Deep dive coming" placeholder. Nuptis (TKT-31)
// ships chapters + an 8-node thinking chain but deliberately zero header metrics — its PRD success
// metrics stayed defined-but-unmeasured, so `metrics: []` and "none measured" is stated in prose
// rather than backed into a `MetricCard`. Cubicle (TKT-32) ships chapters + an 8-node thinking chain
// with exactly 2 header metrics, both build-quality only (tests, contrast) — it was never deployed,
// so status stays "Built, not launched" and no live/usage number is ever shown. Bhakti Vilas (TKT-33)
// ships a shorter full deep dive (8 chapters, 8-node thinking chain, evaluation/outcome chapters brief)
// with zero header metrics — product metrics are MISSING per CONTENT_INVENTORY §8.6, and there are no
// UI screenshots anywhere in the source project, so no `PrototypeFrame` is used either.
const DEEP_DIVE = new Set<string>(["teachspark", "railcite", "velora", "nuptis", "cubicle", "bhakti-vilas"]);

const CASE_STUDIES = [
  { slug: "teachspark", name: "TeachSpark" },
  { slug: "railcite", name: "RailCite" },
  { slug: "velora", name: "Nuptis → Velora" },
  { slug: "cubicle", name: "Cubicle" },
  { slug: "nuptis", name: "Nuptis" },
  { slug: "bhakti-vilas", name: "Bhakti Vilas" },
  { slug: "token-toli", name: "Token Toli" },
  { slug: "pratyasa", name: "Pratyasa" },
  { slug: "tegaki", name: "Tegaki" },
  { slug: "dino-arcade-pwa", name: "Dino Arcade" },
  { slug: "cinematic-portfolio", name: "Cinematic Portfolio" },
] as const;

// ---------------------------------------------------------------------------
// Every slug: header + thin-content note + NextProject + no-overflow + min-targets (390 & 1440)
// ---------------------------------------------------------------------------
for (const study of CASE_STUDIES) {
  test(`case-study · ${study.slug} renders header, thin-content note and NextProject`, async ({
    page,
    noOverflow,
    minTargets,
    consoleErrors,
  }) => {
    test.skip(!isEdge(page), "case-study render pack runs at 390 and 1440");
    const res = await page.goto(`/work/${study.slug}`, { waitUntil: "load" });
    expect(res?.status(), `/work/${study.slug} must be 200`).toBe(200);

    // Header: the h1 is the project's display name (the VT landing target).
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(study.name);
    // Hero media placeholder present (no real media until M-005) — never a broken image.
    await expect(page.getByText("Hero media coming")).toBeVisible();

    if (DEEP_DIVE.has(study.slug)) {
      // A filled study shows the depth toggle (default 30-sec), never the "coming" placeholder.
      await expect(page.getByRole("radiogroup", { name: "Case-study depth" })).toBeVisible();
      await expect(page.getByText("Deep dive coming")).toHaveCount(0);
    } else {
      // Thin content today → labelled "Deep dive coming" note, never an empty chapter section.
      await expect(page.getByText("Deep dive coming")).toBeVisible();
      // No chapters exist yet, so the chapter navigation must not render (no dead anchor links).
      await expect(page.locator('nav[aria-label="Chapters"]')).toHaveCount(0);
    }

    // NextProject band → a valid personal case-study route.
    const next = page.getByRole("link", { name: /^Next project:/ });
    await expect(next).toBeVisible();
    const href = await next.getAttribute("href");
    expect(href, "NextProject must link to a /work/<slug> route").toMatch(/^\/work\/[a-z0-9-]+$/);

    await noOverflow(page);
    await minTargets(page);
    expect(consoleErrors, "no console errors on the case study (TC-155 step 1)").toEqual([]);
  });
}

// ---------------------------------------------------------------------------
// TeachSpark full deep dive (TKT-28 / M-005): the previously-BLOCKED TC-075/076/077 now run for
// real — header metrics carry every sourced field, the OverviewToggle reveals the chapters, the
// ChapterNav anchors resolve, and ShowTheThinking exposes the 8-node reasoning chain.
// ---------------------------------------------------------------------------
test("case-study · teachspark deep dive: metrics (TC-075), OverviewToggle (TC-076), ChapterNav anchors + ShowTheThinking (TC-077)", async ({
  page,
  noOverflow,
}) => {
  test.skip(!isEdge(page), "deep-dive pack runs at 390 and 1440");
  const res = await page.goto("/work/teachspark", { waitUntil: "load" });
  expect(res?.status(), "/work/teachspark must be 200").toBe(200);

  // TC-075 — header metrics never appear naked: value + label + context + dated "as of" caption.
  // Exact match: the label text also appears inside each metric's context sentence.
  await expect(page.getByText("Teachers joined", { exact: true })).toBeVisible();
  await expect(page.getByText("Median time saved", { exact: true })).toBeVisible();
  await expect(page.getByText(/as of 24 Aug 2026/i).first()).toBeVisible();

  // TC-076 — OverviewToggle defaults to 30-sec; chapters are hidden until "Deep dive" is chosen.
  const group = page.getByRole("radiogroup", { name: "Case-study depth" });
  await expect(group).toBeVisible();
  await expect(page.locator('nav[aria-label="Chapters"]')).toHaveCount(0);
  await page.getByRole("radio", { name: "Deep dive" }).click();

  // TC-077 — deep view reveals the ChapterNav and the chapter sections resolve by anchor id.
  await expect(page.locator('nav[aria-label="Chapters"]')).toBeVisible();
  // Attribute selector, not `#id`: the anchor ids start with a digit (invalid CSS id selector).
  for (const id of ["01-context", "03-discovery", "05-what-i-built", "08-what-i-learned"]) {
    await expect(page.locator(`[id="${id}"]`)).toBeAttached();
  }

  // ShowTheThinking exposes the 8-node chain (present only on slugs with a full chain).
  await expect(page.getByRole("button", { name: /Show the thinking/ })).toBeVisible();

  await noOverflow(page);
});

// ---------------------------------------------------------------------------
// RailCite full deep dive (TKT-29 / M-005): header metrics carry every sourced field, the
// OverviewToggle reveals the chapters, the ChapterNav anchors resolve, and ShowTheThinking exposes
// the 8-node reasoning chain — the same deep-dive contract exercised for TeachSpark (TC-075/076/077).
// ---------------------------------------------------------------------------
test("case-study · railcite deep dive: metrics (TC-075), OverviewToggle (TC-076), ChapterNav anchors + ShowTheThinking (TC-077)", async ({
  page,
  noOverflow,
}) => {
  test.skip(!isEdge(page), "deep-dive pack runs at 390 and 1440");
  const res = await page.goto("/work/railcite", { waitUntil: "load" });
  expect(res?.status(), "/work/railcite must be 200").toBe(200);

  // TC-075 — header metrics never appear naked: value + label + context + dated "as of" caption.
  await expect(page.getByText("Documents indexed", { exact: true })).toBeVisible();
  await expect(page.getByText("Invented citations", { exact: true })).toBeVisible();
  await expect(page.getByText(/as of 15 Sep 2026/i).first()).toBeVisible();

  // TC-076 — OverviewToggle defaults to 30-sec; chapters are hidden until "Deep dive" is chosen.
  const group = page.getByRole("radiogroup", { name: "Case-study depth" });
  await expect(group).toBeVisible();
  await expect(page.locator('nav[aria-label="Chapters"]')).toHaveCount(0);
  await page.getByRole("radio", { name: "Deep dive" }).click();

  // TC-077 — deep view reveals the ChapterNav and the chapter sections resolve by anchor id.
  await expect(page.locator('nav[aria-label="Chapters"]')).toBeVisible();
  for (const id of ["01-context", "03-discovery", "05-what-i-built", "08-what-i-learned"]) {
    await expect(page.locator(`[id="${id}"]`)).toBeAttached();
  }

  // ShowTheThinking exposes the 8-node chain (present only on slugs with a full chain).
  await expect(page.getByRole("button", { name: /Show the thinking/ })).toBeVisible();

  await noOverflow(page);
});

// ---------------------------------------------------------------------------
// Velora (Nuptis → Velora) full deep dive (TKT-30 / M-005): header metrics carry every sourced
// field, the OverviewToggle reveals the chapters, the ChapterNav anchors resolve, and
// ShowTheThinking exposes the 8-node reasoning chain — the same deep-dive contract as TeachSpark
// and RailCite (TC-075/076/077).
// ---------------------------------------------------------------------------
test("case-study · velora deep dive: metrics (TC-075), OverviewToggle (TC-076), ChapterNav anchors + ShowTheThinking (TC-077)", async ({
  page,
  noOverflow,
}) => {
  test.skip(!isEdge(page), "deep-dive pack runs at 390 and 1440");
  const res = await page.goto("/work/velora", { waitUntil: "load" });
  expect(res?.status(), "/work/velora must be 200").toBe(200);

  // TC-075 — header metrics never appear naked: value + label + context + dated "as of" caption.
  await expect(page.getByText("Products in nine days", { exact: true })).toBeVisible();
  await expect(page.getByText("Gzipped bundle", { exact: true })).toBeVisible();
  await expect(page.getByText(/as of 15 Sep 2026/i).first()).toBeVisible();

  // TC-076 — OverviewToggle defaults to 30-sec; chapters are hidden until "Deep dive" is chosen.
  const group = page.getByRole("radiogroup", { name: "Case-study depth" });
  await expect(group).toBeVisible();
  await expect(page.locator('nav[aria-label="Chapters"]')).toHaveCount(0);
  await page.getByRole("radio", { name: "Deep dive" }).click();

  // TC-077 — deep view reveals the ChapterNav and the chapter sections resolve by anchor id.
  await expect(page.locator('nav[aria-label="Chapters"]')).toBeVisible();
  for (const id of ["01-context", "03-discovery", "05-what-i-built", "08-what-i-learned"]) {
    await expect(page.locator(`[id="${id}"]`)).toBeAttached();
  }

  // ShowTheThinking exposes the 8-node chain (present only on slugs with a full chain).
  await expect(page.getByRole("button", { name: /Show the thinking/ })).toBeVisible();

  await noOverflow(page);
});

// ---------------------------------------------------------------------------
// Nuptis full deep dive (TKT-31 / M-005): chapters + an 8-node thinking chain, but deliberately no
// header `MetricCard`s — all three PRD success metrics stayed defined-but-unmeasured, so this page
// states "none measured" in prose instead of fabricating a metric. Same OverviewToggle/ChapterNav/
// ShowTheThinking contract as TC-076/077, minus the metrics half of TC-075 (there is nothing to show).
// ---------------------------------------------------------------------------
test("case-study · nuptis deep dive: no fabricated metrics, OverviewToggle (TC-076), ChapterNav anchors + ShowTheThinking (TC-077)", async ({
  page,
  noOverflow,
}) => {
  test.skip(!isEdge(page), "deep-dive pack runs at 390 and 1440");
  const res = await page.goto("/work/nuptis", { waitUntil: "load" });
  expect(res?.status(), "/work/nuptis must be 200").toBe(200);

  // No header metrics render — Nuptis ships zero MetricCards by design (PRD §11 metrics unmeasured).
  // `formatAsOf()` ("as of 24 Aug 2026") is the only place a dated metric caption appears in this UI.
  await expect(page.getByText(/as of \d/i)).toHaveCount(0);

  // TC-076 — OverviewToggle defaults to 30-sec; chapters are hidden until "Deep dive" is chosen.
  const group = page.getByRole("radiogroup", { name: "Case-study depth" });
  await expect(group).toBeVisible();
  await expect(page.locator('nav[aria-label="Chapters"]')).toHaveCount(0);
  await page.getByRole("radio", { name: "Deep dive" }).click();

  // TC-077 — deep view reveals the ChapterNav and the chapter sections resolve by anchor id.
  await expect(page.locator('nav[aria-label="Chapters"]')).toBeVisible();
  for (const id of ["01-context", "03-discovery", "05-what-i-built", "08-what-i-learned"]) {
    await expect(page.locator(`[id="${id}"]`)).toBeAttached();
  }

  // The evaluation chapter states the metrics gap honestly rather than showing a fabricated number.
  await expect(page.getByText(/none measured/i).first()).toBeVisible();

  // ShowTheThinking exposes the 8-node chain (present only on slugs with a full chain).
  await expect(page.getByRole("button", { name: /Show the thinking/ })).toBeVisible();

  await noOverflow(page);
});

// ---------------------------------------------------------------------------
// Cubicle full deep dive (TKT-32 / M-005): chapters + an 8-node thinking chain, exactly 2 header
// metrics (build-quality only: tests, contrast) — never a product/usage number. Cubicle was never
// deployed, so this test also asserts the honest "built, not launched" framing renders and no live
// link or fabricated usage number ever appears (highest overclaim-risk record, per the brief).
// ---------------------------------------------------------------------------
test("case-study · cubicle deep dive: built-not-launched honesty, build-quality metrics only (TC-075), OverviewToggle (TC-076), ChapterNav anchors + ShowTheThinking (TC-077)", async ({
  page,
  noOverflow,
}) => {
  test.skip(!isEdge(page), "deep-dive pack runs at 390 and 1440");
  const res = await page.goto("/work/cubicle", { waitUntil: "load" });
  expect(res?.status(), "/work/cubicle must be 200").toBe(200);

  // Honest status badge — never implies a live product.
  await expect(page.getByText("Built, not launched", { exact: true }).first()).toBeVisible();

  // TC-075 — header metrics never appear naked: value + label + context + dated "as of" caption.
  // Both metrics are build-quality only (tests, contrast) — never a product/usage number.
  await expect(page.getByText("Automated tests passing", { exact: true })).toBeVisible();
  await expect(page.getByText(/as of 12 Sep 2026/i).first()).toBeVisible();

  // TC-076 — OverviewToggle defaults to 30-sec; chapters are hidden until "Deep dive" is chosen.
  const group = page.getByRole("radiogroup", { name: "Case-study depth" });
  await expect(group).toBeVisible();
  await expect(page.locator('nav[aria-label="Chapters"]')).toHaveCount(0);
  await page.getByRole("radio", { name: "Deep dive" }).click();

  // TC-077 — deep view reveals the ChapterNav and the chapter sections resolve by anchor id.
  await expect(page.locator('nav[aria-label="Chapters"]')).toBeVisible();
  for (const id of ["01-context", "03-discovery", "05-what-i-built", "08-what-i-learned"]) {
    await expect(page.locator(`[id="${id}"]`)).toBeAttached();
  }

  // The outcome chapter states the no-live-run outcome honestly.
  await expect(page.getByText(/no live run, no users/i).first()).toBeVisible();

  // ShowTheThinking exposes the 8-node chain (present only on slugs with a full chain).
  await expect(page.getByRole("button", { name: /Show the thinking/ })).toBeVisible();

  await noOverflow(page);
});

// ---------------------------------------------------------------------------
// Every slug: axe wcag2.1 AA at 390 & 1440
// ---------------------------------------------------------------------------
for (const study of CASE_STUDIES) {
  test(`case-study · ${study.slug} is axe-clean`, { tag: "@EVAL-006" }, async ({ page, axe }) => {
    test.skip(!isEdge(page), "axe runs at 390 and 1440");
    await page.goto(`/work/${study.slug}`, { waitUntil: "load" });
    await axe(page);
  });
}

// ---------------------------------------------------------------------------
// @EVAL-007 — OverviewToggle is a keyboard-operable WAI-ARIA radiogroup: roving tabindex, arrow
// keys move AND select, and the focused segment wears the shared 2px rust focus ring (TKT-48;
// checked once on teachspark — the same component every deep-dive study shares).
// ---------------------------------------------------------------------------
test("@EVAL-007 OverviewToggle: arrow keys move focus, select the segment, and show the focus ring", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "keyboard sweep runs once at a desktop width");
  await page.goto("/work/teachspark", { waitUntil: "load" });

  const summary = page.getByRole("radio", { name: "30-sec" });
  const deep = page.getByRole("radio", { name: "Deep dive" });

  await summary.focus();
  await expect(summary).toBeFocused();
  await expect(summary).toHaveAttribute("aria-checked", "true");

  // ArrowRight moves focus to "Deep dive" AND selects it (roving-tabindex radiogroup).
  await page.keyboard.press("ArrowRight");
  await expect(deep).toBeFocused();
  await expect(deep).toHaveAttribute("aria-checked", "true");
  await expect(page.locator('nav[aria-label="Chapters"]')).toBeVisible();

  // The focused segment wears the shared 2px solid rust ring (EVAL-007).
  const accent = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "var(--color-rust)";
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  });
  const ring = await deep.evaluate((el) => {
    const s = getComputedStyle(el);
    return { w: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
  });
  expect(ring.w).toBe("2px");
  expect(ring.style).toBe("solid");
  expect(ring.color).toBe(accent);

  // ArrowLeft returns focus to "30-sec" and re-selects it; only the checked radio is tabbable.
  await page.keyboard.press("ArrowLeft");
  await expect(summary).toBeFocused();
  await expect(summary).toHaveAttribute("aria-checked", "true");
  await expect(summary).toHaveAttribute("tabindex", "0");
  await expect(deep).toHaveAttribute("tabindex", "-1");
});

// ---------------------------------------------------------------------------
// @EVAL-007 — ShowTheThinking on a real case-study route (not the ALLOW_DEV_ROUTES-gated
// /dev/thinking board that thinking.spec.ts's keyboard test needs): the toggle is a native button,
// Enter opens it, and focus deliberately stays on the toggle (a disclosure, not a modal — same
// contract thinking.spec.ts documents for the essay-page instance of this shared component).
// ---------------------------------------------------------------------------
test("@EVAL-007 ShowTheThinking (case study): Enter opens the chain and focus stays on the toggle", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "keyboard sweep runs once at a desktop width");
  await page.goto("/work/teachspark", { waitUntil: "load" });
  await page.getByRole("radio", { name: "Deep dive" }).click();

  const trigger = page.getByRole("button", { name: /Show the thinking/ });
  await trigger.focus();
  await expect(trigger).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger).toBeFocused(); // focus remains on the toggle after open (disclosure, not modal)

  const firstNodeLink = page.locator("#show-the-thinking-panel").getByRole("link").first();
  await expect(firstNodeLink).toBeVisible();
});

// ---------------------------------------------------------------------------
// View-Transition fallback: /work card → case study lands on the identical end state (EXE-5).
// ---------------------------------------------------------------------------
test("case-study · VT off: /work card navigates to the study with identical end state", {
  tag: "@EVAL-015",
}, async ({ page, noViewTransitions, withReducedMotion }) => {
  test.skip(!isEdge(page), "VT fallback verified at 390 and 1440");
  await noViewTransitions(page);
  await withReducedMotion(page);
  await page.goto("/work", { waitUntil: "load" });

  const hasVT = await page.evaluate(() => typeof document.startViewTransition === "function");
  expect(hasVT, "startViewTransition must be absent so the EXE-5 fallback runs").toBeFalsy();

  await page.locator('a[href="/work/railcite"]').first().click();
  await page.waitForURL("**/work/railcite");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("RailCite");
  await expect(page.locator('[style*="project-railcite"]')).toBeVisible();
});

// ---------------------------------------------------------------------------
// JS disabled: the static HTML carries the case study's content and navigation (EVAL-015).
// ---------------------------------------------------------------------------
test("case-study · JS off: static HTML carries content and NextProject", { tag: "@EVAL-015" }, async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== "w1440", "no-JS static check runs once at w1440");
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: BASE_URL,
    viewport: { width: 1440, height: 900 },
  });
  try {
    const p = await context.newPage();
    // Uses a still-thin slug (token-toli) so the "Deep dive coming" static-content assertion holds;
    // velora (TKT-30), cubicle (TKT-32) and bhakti-vilas (TKT-33) are now full deep dives, so their
    // pages no longer render that note. token-toli stays thin permanently — TKT-54 authors it as a
    // deliberately short "Discovery only" page (deepDive:false), never a full case study.
    await p.goto("/work/token-toli", { waitUntil: "domcontentloaded" });
    await expect(p.getByRole("heading", { level: 1 })).toHaveText("Token Toli");
    // 30-second overview text is in the static HTML (content, not a JS-gated reveal).
    await expect(p.getByText("Deep dive coming")).toBeVisible();
    await expect(p.getByRole("link", { name: /^Next project:/ })).toBeVisible();
  } finally {
    await context.close();
  }
});

// ---------------------------------------------------------------------------
// TKT-81 (TC-155 / TC-156) — the paper template: header, metric strip, overview folder tabs,
// thin-project degradation and the next-project band. Decoration counts per unit follow Design.md
// §3.3, except the header: the taped photo (and its caption annotation) is superseded by the page's
// SceneOpener (TKT-95, Dev-24), so the header keeps only the media-tag sub-line annotation (1).
// ---------------------------------------------------------------------------
const decorCount = (page: import("@playwright/test").Page, unit: string) =>
  page.locator(unit).first().evaluate((el) =>
    Array.from(el.querySelectorAll("[data-decor]")).filter((d) => d.closest("section, header, footer") === el).length,
  );

test("case-study · TKT-81 rich project (teachspark): 3 pinned metric cards + annotation, Inter kind badges, unit counts", {
  tag: ["@EVAL-018", "@EVAL-013"],
}, async ({ page }) => {
  test.skip(!isEdge(page), "runs at 390 and 1440");
  await page.goto("/work/teachspark", { waitUntil: "load" });

  const strip = page.locator('section[aria-label="Headline metrics"]');
  await expect(strip).toHaveCount(1);
  await expect(strip.locator('[data-paper="index"]')).toHaveCount(3);
  await expect(strip.locator('[data-fastener="pin"]')).toHaveCount(3);
  await expect(strip.locator('[data-decor="annotation"]')).toHaveText(/the smaller, honest number/);
  // Every card carries its kind badge, dated caption and Source line (EVAL-013 — never a naked number).
  for (const card of await strip.locator('[data-paper="index"]').all()) {
    await expect(card.getByText(/^as of \d/)).toHaveCount(1);
    await expect(card.getByText(/^Source:/)).toHaveCount(1);
    const badgeFont = await card.locator(".cs-kind").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(badgeFont, "kind badge is Inter, never Caveat (Dev-04)").not.toMatch(/caveat/i);
  }

  // §3.3 counts (header 1 after Dev-24 · strip 2 · overview 2 · next 2).
  expect(await decorCount(page, "section.cs-head")).toBe(1);
  expect(await decorCount(page, 'section[aria-label="Headline metrics"]')).toBe(2);
  expect(await decorCount(page, 'section[aria-labelledby="ov-h"]')).toBe(2);
  expect(await decorCount(page, 'section[aria-label="Next project"]')).toBe(2);

  // The overview notebook carries the 30-second paragraphs on the ruled sheet.
  await expect(page.locator('section[aria-labelledby="ov-h"] [data-paper="notebook"] p').nth(1)).toBeVisible();
});

test("case-study · TKT-81 thin project (token-toli): no metric strip, no tabs, 'Deep dive coming' kraft tag with statusLabel", {
  tag: ["@EVAL-018", "@EVAL-013"],
}, async ({ page }) => {
  test.skip(!isEdge(page), "runs at 390 and 1440");
  await page.goto("/work/token-toli", { waitUntil: "load" });

  await expect(page.locator('section[aria-label="Headline metrics"]')).toHaveCount(0);
  await expect(page.getByRole("radiogroup", { name: "Case-study depth" })).toHaveCount(0);
  await expect(page.locator("section#deep")).toHaveCount(0);
  const tag = page.locator('section[aria-labelledby="ov-h"] [data-paper="tag"]');
  await expect(tag).toContainText("Deep dive coming");
  await expect(tag).toContainText("Discovery only");
  expect(await decorCount(page, 'section[aria-labelledby="ov-h"]')).toBe(2);
});

test("case-study · TKT-81 'Hero media coming' tag is navy on kraft (≥ 4.5:1) and axe-clean", {
  tag: ["@EVAL-006", "@EVAL-021"],
}, async ({ page, axe }) => {
  test.skip(!isEdge(page), "runs at 390 and 1440");
  await page.goto("/work/teachspark", { waitUntil: "load" });
  const tag = page.locator('section.cs-head .cs-media-tag [data-paper="tag"]');
  await expect(tag).toHaveText("Hero media coming");
  const colours = await tag.evaluate((el) => {
    const probe = (v: string) => {
      const s = document.createElement("span");
      s.style.color = v;
      document.body.appendChild(s);
      const c = getComputedStyle(s).color;
      s.remove();
      return c;
    };
    return {
      text: getComputedStyle(el).color,
      bg: getComputedStyle(el).backgroundColor,
      navy: probe("var(--color-navy)"),
      kraft: probe("var(--color-kraft)"),
    };
  });
  expect(colours.text, "tag text is navy (Dev-13)").toBe(colours.navy);
  expect(colours.bg, "tag paper is kraft").toBe(colours.kraft);
  await axe(page, { include: "section.cs-head" });
});

test("case-study · TKT-81 folder tabs open section#deep; a chapter hash opens it on load (TP8)", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "runs once at desktop width");
  await page.goto("/work/teachspark", { waitUntil: "load" });
  await expect(page.locator("section#deep")).toHaveCount(0);
  await page.getByRole("radio", { name: "Deep dive" }).focus();
  await page.keyboard.press("Space");
  await expect(page.locator("section#deep")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("section#deep")).toHaveCount(0);

  await page.goto("/work/teachspark#01-context", { waitUntil: "load" });
  await expect(page.getByRole("radio", { name: "Deep dive" })).toHaveAttribute("aria-checked", "true");
  await expect(page.locator('[id="01-context"]')).toBeAttached();
  await page.goto("/work/teachspark#deep", { waitUntil: "load" });
  await expect(page.locator("section#deep")).toBeVisible();
});

test("case-study · TKT-81 next band: the whole section is one link with a kraft focus ring", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "runs once at desktop width");
  await page.goto("/work/teachspark", { waitUntil: "load" });
  const band = page.locator('section[aria-label="Next project"]');
  await expect(band.locator("a")).toHaveCount(1);
  const link = band.locator("a");
  await expect(link).toHaveAttribute("href", "/work/railcite");
  await expect(link.locator("h2")).toContainText("RailCite");
  // Keyboard focus (not a click) so :focus-visible applies.
  await link.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(link).toBeFocused();
  const ring = await link.evaluate((el) => {
    const s = getComputedStyle(el);
    const probe = document.createElement("span");
    probe.style.color = "var(--color-kraft)";
    document.body.appendChild(probe);
    const kraft = getComputedStyle(probe).color;
    probe.remove();
    return { w: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor, kraft };
  });
  expect(ring.w).toBe("2px");
  expect(ring.style).toBe("solid");
  expect(ring.color).toBe(ring.kraft);
});
