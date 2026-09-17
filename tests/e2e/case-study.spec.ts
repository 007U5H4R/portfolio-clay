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
// rather than backed into a `MetricCard`.
const DEEP_DIVE = new Set<string>(["teachspark", "railcite", "velora", "nuptis"]);

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
    // Uses a still-thin slug (cubicle) so the "Deep dive coming" static-content assertion holds;
    // velora became a full deep dive with TKT-30, so its page no longer renders that note.
    await p.goto("/work/cubicle", { waitUntil: "domcontentloaded" });
    await expect(p.getByRole("heading", { level: 1 })).toHaveText("Cubicle");
    // 30-second overview text is in the static HTML (content, not a JS-gated reveal).
    await expect(p.getByText("Deep dive coming")).toBeVisible();
    await expect(p.getByRole("link", { name: /^Next project:/ })).toBeVisible();
  } finally {
    await context.close();
  }
});
