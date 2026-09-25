/**
 * case-study-learned.spec.ts (TKT-82) — "What I learned" + "Sources" on the built case-study pages.
 * Titles start with "case-study" so `--grep 'case-study'` still selects the whole case-study gate.
 *
 *   TC-157 step 3 (S18 regression, kept permanently): every `teachspark.learnings[i]` is on the page
 *     exactly once, inside `section.learned`; a slug with `learnings: []` renders no such section.
 *   TC-158 steps 3–4: `section.sources ol li` count equals `projectSources(teachspark)` (10, asserted
 *     against the data in tests/unit/case-study-sources.test.ts); labels only, `ref` never; the
 *     section owns 0 `[data-decor]`; the one public URL (railcite) is an external https link.
 *
 * Data strings are copied from data/projects.ts rather than imported, so the spec never pulls the
 * zod/next data module into the Playwright runtime (same convention as case-study.spec.ts).
 */
import { test, expect } from "./fixtures";

const BASE_URL = process.env.PW_BASE_URL ?? "http://127.0.0.1:3000";

const TEACHSPARK_LEARNINGS = [
  "A teacher buys a worksheet good enough for tomorrow, not \"AI\" — lead with the artifact and deliver learning as the trust mechanism (mentor, 2026-08-29).",
  "Green tests prove it runs; they don't prove it's right — 335 passing tests still shipped a broken, case-sensitive city lookup.",
  "Honest smaller numbers earn more trust than impressive fake ones — excluding my own handsets the day before submission was the right call.",
  "Distribution (WhatsApp) is a strong wedge, but it must not become the entire product differentiation.",
];

test("case-study · teachspark renders every learning exactly once (TC-157, S18) and the Sources index (TC-158)", async ({
  page,
  noOverflow,
}) => {
  await page.goto(`${BASE_URL}/work/teachspark`);
  const learned = page.locator("section.learned");
  await expect(learned).toHaveCount(1);
  await expect(learned.getByRole("heading", { level: 2, name: "What I learned" })).toBeVisible();
  const items = learned.locator("ol > li");
  await expect(items).toHaveCount(TEACHSPARK_LEARNINGS.length);
  // Rendered text only: `innerText` skips <script> (the RSC flight payload repeats the props verbatim).
  const body = await page.locator("body").innerText();
  for (const [i, learning] of TEACHSPARK_LEARNINGS.entries()) {
    expect(body.split(learning).length - 1, `learning ${i + 1} occurs once on the page`).toBe(1);
    await expect(page.getByText(learning, { exact: true })).toHaveCount(1);
    await expect(items.nth(i)).toContainText(learning);
  }
  await expect(learned.locator("[data-decor]")).toHaveCount(1);

  const sources = page.locator("section.sources");
  await expect(sources.getByRole("heading", { level: 2, name: "Where every line on this page comes from" })).toBeVisible();
  await expect(sources.locator("ol > li")).toHaveCount(10);
  await expect(sources.locator("ol > li").first()).toBeVisible();
  await expect(sources.locator("[data-decor]")).toHaveCount(0);
  await expect(sources.locator("a")).toHaveCount(0); // teachspark cites no SourceRef with a public url

  // §7.3 order: learned → sources → next project.
  const order = await page.evaluate(() => {
    const sel = ["section.learned", "section.sources"].map((s) => document.querySelector(s));
    const next = document.querySelector('a[aria-label^="Next project"]') ?? document.querySelector("section.next");
    return [...sel, next].map((el) => (el ? Array.from(document.querySelectorAll("*")).indexOf(el) : -1));
  });
  expect(order.every((v) => v >= 0)).toBe(true);
  expect(order[0]!).toBeLessThan(order[1]!);
  expect(order[1]!).toBeLessThan(order[2]!);
  await noOverflow(page);
});

test("case-study · railcite Sources links only its public-URL source (TC-158)", async ({ page }) => {
  await page.goto(`${BASE_URL}/work/railcite`);
  const links = page.locator("section.sources a");
  await expect(links).toHaveCount(1);
  await expect(links).toHaveAttribute("href", "https://railcite.vercel.app");
  await expect(links).toContainText("RailCite live /api/stats");
});

test("case-study · a slug with learnings: [] renders no What I learned and no Sources section (TC-157)", async ({
  page,
}) => {
  await page.goto(`${BASE_URL}/work/tegaki`);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("section.learned")).toHaveCount(0);
  await expect(page.locator("section.sources")).toHaveCount(0);
});
