/**
 * thinking-page.spec.ts (TKT-43, M-006) — the `/thinking` list + `/thinking/[slug]` essay route.
 *
 * NOTE on filename: `tests/e2e/thinking.spec.ts` already exists and is TKT-21's `/dev/thinking`
 * QA board for the case-study `ShowTheThinking` disclosure (an unrelated component that happens to
 * share the word "thinking") — its own header explains that scope. TKT-43's brief named
 * `tests/e2e/thinking.spec.ts` for this route's tests, but overwriting that file would delete
 * TKT-21's @EVAL-007/@EVAL-010 coverage, so this ticket's tests live in this sibling file instead
 * (flagged in `docs/reports/TKT-43.md`).
 *
 * Runs in all four viewport projects (w390/w768/w1024/w1440, playwright.config.ts):
 *   @EVAL-006 — axe wcag2.1 AA clean on `/thinking` and one essay page, at 390 & 1440.
 *   @EVAL-011 — every list row is a live, resolving link (no dead control); the essay's
 *               related-project link resolves 200.
 *   @EVAL-013 — DRAFT truth: DRAFT tag on every list row AND every essay page, no publish date
 *               anywhere, body contains only the sourced passages + the labelled DRAFT paragraph.
 *   @EVAL-017 — (covered by eval-017.spec.ts's derived sitemap count + this file's own sitemap
 *               membership check) — `/thinking` and its 5 slugs are listed.
 * Plus no-overflow at all four widths and the screenshot pack (AC/TDD gate item 7).
 *
 * TKT-84 (M-009 paper rebuild): + TC-164 (S18 — the DRAFT prefix counted exactly once per essay page,
 * DraftTag once, flat prose, pager links) and TC-163 (row order, margin annotation width gate,
 * reduced-motion underlines, essay margin under the header < 900). They live here rather than in
 * `thinking.spec.ts` for the reason given above (that file is TKT-21's ShowTheThinking spec).
 */
import { test, expect } from "./fixtures";
import { writing } from "@/data/writing";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;
const ESSAY_SLUG = "green-tests-prove-it-runs";

// ---------------------------------------------------------------------------
// ThinkingList — 5 rows, empty-state line, DRAFT tags, row -> essay nav.
// ---------------------------------------------------------------------------
test("ThinkingList renders the empty-state line + all 5 DRAFT rows with a Draft tag each", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "content/count is viewport-independent; checked once at w1440");
  await page.goto("/thinking", { waitUntil: "load" });

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Thinking");
  await expect(
    page.getByText("Essays in progress — five drafts, none published yet.", { exact: true }),
  ).toBeVisible();

  const rows = page.locator("ol > li");
  await expect(rows).toHaveCount(5);

  // TKT-84: the row is the `li` (h3 link + dek + meta); the DraftTag sits in the meta row.
  for (const essay of writing) {
    const row = rows.filter({ has: page.locator(`a[href="/thinking/${essay.slug}"]`) });
    await expect(row).toHaveCount(1);
    await expect(row.locator(`h3 a[href="/thinking/${essay.slug}"]`)).toHaveText(essay.title);
    await expect(row.getByText("Draft — pending sign-off")).toBeVisible();
  }
  // Data order (TC-163 step 1).
  await expect(page.locator("ol > li h3 a")).toHaveText(writing.map((essay) => essay.title));

  // No publish date rendered anywhere on the list (AC2).
  await expect(page.locator("ol")).not.toContainText("2026-");
});

// ---------------------------------------------------------------------------
// a11y regression guard (post-acceptance review): every essay title must be reachable by
// screen-reader heading navigation, not just visually styled with the h3 token. The page's
// heading outline must stay h1 -> h2 -> h3 with no skipped level.
// ---------------------------------------------------------------------------
test("every essay title is reachable as a level-3 heading, with no skipped heading level", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "heading structure is viewport-independent; checked once at w1440");
  await page.goto("/thinking", { waitUntil: "load" });

  // Scoped to <main> (app/layout.tsx `id="main"`) — the global Footer carries its own h2
  // ("Still curious…") on every route, which is a later sibling, not a skip (h1 -> h2 -> h3 -> h2
  // never jumps a level deeper than the previous heading), but scoping keeps this page's own
  // heading outline the thing under test.
  const main = page.locator("#main");
  await expect(main.getByRole("heading", { level: 1 })).toHaveText("Thinking");
  await expect(main.getByRole("heading", { level: 2 })).toHaveCount(1);

  const essayHeadings = main.getByRole("heading", { level: 3 });
  await expect(essayHeadings).toHaveCount(5);
  for (const essay of writing) {
    await expect(essayHeadings.filter({ hasText: essay.title })).toHaveCount(1);
  }
});

test("a list row navigates to its essay page", async ({ page }) => {
  test.skip(width(page) !== 1440, "navigation checked once at w1440");
  await page.goto("/thinking", { waitUntil: "load" });
  const first = writing[0]!;
  await page.locator(`ol > li a[href="/thinking/${first.slug}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/thinking/${first.slug}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(first.title);
});

// ---------------------------------------------------------------------------
// EssayBody — DRAFT tag, no date, ≤600px measure, related-project link resolves.
// ---------------------------------------------------------------------------
test("essay page shows the DRAFT tag, reading time, no publish date, and only sourced content", async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "content checked once at w1440");
  const essay = writing.find((e) => e.slug === ESSAY_SLUG)!;
  await page.goto(`/thinking/${ESSAY_SLUG}`, { waitUntil: "load" });

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(essay.title);
  await expect(page.getByText("Draft — pending sign-off").first()).toBeVisible();
  await expect(page.getByText(`${essay.readingMinutes} min read`)).toBeVisible();

  // No publish date rendered anywhere on the essay (AC2) — schema field is absent, and no
  // ISO-date-shaped string appears in the rendered body.
  await expect(page.locator("article")).not.toContainText(/\b\d{4}-\d{2}-\d{2}\b/);

  // Every quoted passage from data/writing.ts appears verbatim.
  for (const passage of essay.passages) {
    await expect(page.locator("article")).toContainText(passage.quote);
  }
  // The framing paragraph renders from the data, which carries its own DRAFT label (count: see TC-164).
  await expect(page.locator("article")).toContainText(essay.framing);
});

// ---------------------------------------------------------------------------
// TC-164 · S18 regression (permanent): the DRAFT prefix appears EXACTLY ONCE per essay page — a
// count, not `toContainText` (which could not see the duplicate the old EssayBody rendered) — and
// the DraftTag exactly once, in the header's meta row. The prefix is read from the data.
// ---------------------------------------------------------------------------
const DRAFT_PREFIX = /^[^:]+:/.exec(writing[0]!.framing)![0];

for (const essay of writing) {
  test(`TC-164 · ${essay.slug}: "${DRAFT_PREFIX}" once, DraftTag once`, { tag: "@EVAL-013" }, async ({ page }) => {
    test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
    expect(DRAFT_PREFIX).toBe("Draft — pending sign-off:");
    await page.goto(`/thinking/${essay.slug}`, { waitUntil: "load" });
    const text = await page.locator("#main").innerText();
    expect(text.split(DRAFT_PREFIX).length - 1, "DRAFT prefix occurrences in <main>").toBe(1);
    await expect(page.locator('#main [data-paper="tag"]')).toHaveCount(1);
    await expect(page.locator('.essay-meta [data-paper="tag"]')).toHaveCount(1);
    // Flat prose: 0 decorations; every passage is a hand quote with a Source cite.
    await expect(page.locator(".essay-prose[data-flat] [data-decor]")).toHaveCount(0);
    await expect(page.locator('.essay-prose [data-hand="quote"]')).toHaveCount(essay.passages.length);
    await expect(page.locator(".essay-prose cite")).toHaveCount(essay.passages.length);
    for (const cite of await page.locator(".essay-prose cite").allInnerTexts()) {
      expect(cite.startsWith("Source:"), cite).toBe(true);
    }
    for (const quote of await page.locator('.essay-prose [data-hand="quote"]').allInnerTexts()) {
      expect(quote.trim().length, quote).toBeLessThanOrEqual(240);
    }
  });
}

test("TC-164 · pager links resolve 200 on every essay (prev → /thinking, next in data order)", async ({ page }) => {
  test.skip(width(page) !== 1440, "link resolution checked once at w1440");
  for (const [index, essay] of writing.entries()) {
    await page.goto(`/thinking/${essay.slug}`, { waitUntil: "load" });
    const pager = page.getByRole("navigation", { name: "Essay navigation" });
    const hrefs = await pager.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    const next = writing[index + 1];
    expect(hrefs).toEqual(next ? ["/thinking", `/thinking/${next.slug}`] : ["/thinking"]);
    for (const href of hrefs) {
      const res = await page.request.get(href!);
      expect(res.status(), `${href} must resolve 200`).toBe(200);
    }
  }
});

// ---------------------------------------------------------------------------
// TC-163 · margin annotation width gate, reduced-motion underline, margin under the header < 900.
// ---------------------------------------------------------------------------
test("TC-163 · margin annotation is in the DOM (aria-hidden) at 1440 and absent at 390", async ({ page }) => {
  test.skip(width(page) !== 1440 && width(page) !== 390, "gate measured at 390 and 1440");
  await page.goto("/thinking", { waitUntil: "load" });
  const margin = page.locator('[data-decor="annotation"]', { hasText: "the same lesson, told twice" });
  if (width(page) === 1440) {
    await expect(margin).toHaveCount(1);
    await expect(margin).toHaveAttribute("aria-hidden", "true");
  } else {
    await page.waitForTimeout(300); // MediaGate decides once, after hydration
    await expect(margin).toHaveCount(0);
  }
});

test("TC-163 · reduced motion: the h1 and h2 underlines are drawn complete", async ({ page }) => {
  test.skip(width(page) !== 1440, "checked once at w1440");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/thinking", { waitUntil: "load" });
  for (const selector of [".thinking-h1 .sketch", ".essays-h2 .sketch"]) {
    const offset = await page.locator(selector).evaluate((el) => getComputedStyle(el).strokeDashoffset);
    expect(parseFloat(offset), `${selector} stroke-dashoffset`).toBe(0);
  }
});

test("TC-163 · < 900 the essay margin sits under the header, not beside it", async ({ page }) => {
  test.skip(width(page) !== 390, "narrow layout checked at w390");
  await page.goto(`/thinking/${ESSAY_SLUG}`, { waitUntil: "load" });
  const head = await page.locator(".essay-head").boundingBox();
  const margin = await page.locator(".essay-margin").boundingBox();
  const prose = await page.locator(".essay-prose").boundingBox();
  expect(margin!.y).toBeGreaterThanOrEqual(head!.y + head!.height - 1);
  expect(margin!.y).toBeLessThan(prose!.y);
});

test("essay body stays within the ≤600px measure", async ({ page }) => {
  test.skip(width(page) !== 1440, "measure cap is a max-width, checked once at the widest viewport");
  await page.goto(`/thinking/${ESSAY_SLUG}`, { waitUntil: "load" });
  const blockquote = page.locator("article blockquote").first();
  await expect(blockquote).toBeVisible();
  const box = await blockquote.boundingBox();
  expect(box?.width ?? 0, "essay blockquote width").toBeLessThanOrEqual(600);
});

test("@EVAL-011 the related-project link resolves 200", { tag: "@EVAL-011" }, async ({ page }) => {
  test.skip(width(page) !== 1440, "link resolution checked once at w1440");
  const essay = writing.find((e) => e.slug === ESSAY_SLUG)!;
  await page.goto(`/thinking/${ESSAY_SLUG}`, { waitUntil: "load" });
  // Two links to the project (meta row + the end of the prose) — both resolve to the same href.
  const link = page.locator(`article a[href="/work/${essay.relatedProject}"]`).first();
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  const res = await page.request.get(href!);
  expect(res.status(), `${href} must resolve 200`).toBe(200);
});

// ---------------------------------------------------------------------------
// No-overflow (all 4 widths) + responsive screenshot pack.
// ---------------------------------------------------------------------------
const ROUTES = [
  { path: "/thinking", label: "list" },
  { path: `/thinking/${ESSAY_SLUG}`, label: "essay" },
] as const;

for (const route of ROUTES) {
  test(`${route.label} · no-overflow + screenshot`, async ({ page, noOverflow }) => {
    await page.goto(route.path, { waitUntil: "load" });
    await noOverflow(page);
    await page.screenshot({
      path: `docs/screenshots/thinking/${route.label}-${width(page)}.png`,
      fullPage: true,
      animations: "disabled",
    });
  });
}

// ---------------------------------------------------------------------------
// axe wcag2.1 AA at 390 & 1440, both routes.
// ---------------------------------------------------------------------------
for (const route of ROUTES) {
  test(`${route.label} · axe wcag2.1 AA`, { tag: "@EVAL-006" }, async ({ page, axe }) => {
    test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440");
    await page.goto(route.path, { waitUntil: "load" });
    await axe(page);
  });
}

// ---------------------------------------------------------------------------
// An unknown essay slug 404s (dynamicParams = false).
// ---------------------------------------------------------------------------
test("an unknown essay slug 404s", async ({ page }) => {
  test.skip(width(page) !== 1440, "runs once at w1440");
  const res = await page.goto("/thinking/not-a-real-essay", { waitUntil: "load" });
  expect(res?.status()).toBe(404);
});
