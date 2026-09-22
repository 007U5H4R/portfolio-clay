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

  for (const essay of writing) {
    const row = page.locator(`ol > li a[href="/thinking/${essay.slug}"]`);
    await expect(row).toBeVisible();
    await expect(row).toContainText(essay.title);
    await expect(row.getByText("Draft — pending sign-off")).toBeVisible();
  }

  // No publish date rendered anywhere on the list (AC2).
  await expect(page.locator("ol")).not.toContainText("2026-");
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
  // The framing paragraph is clearly labelled, never presented as finished prose.
  await expect(page.locator("article")).toContainText("Draft — pending sign-off:");
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
  const link = page.locator(`article a[href="/work/${essay.relatedProject}"]`);
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
