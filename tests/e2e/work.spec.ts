/**
 * work.spec.ts (TKT-101, Tushar direction 2026-09-26) — `/work` is the Experience page: the Work
 * Experience collage timeline, a torn paper cut-out, then the Education timeline on `paper-2`, which
 * slides up over the Work section on scroll (the TKT-96 CSS scroll-driven mechanism). The project index
 * that used to live here is covered by projects.spec.ts; case studies stay at `/work/<slug>`.
 *
 *   @EVAL-006 — axe clean at 390 and 1440; the timelines are ordered lists under real headings.
 *   @EVAL-008 — no horizontal overflow at 390 / 768 / 1024 / 1440; card text ≥ 14 px.
 *   @EVAL-010 — reduced motion: no scroll-driven drift (plain scroll).
 *   @EVAL-013 — logos carry the organisation's name as alt; every logo file serves.
 *   @EVAL-018 — Work 3 decorations, Education 4 (torn · note · annotation · collage) at 390 and 1440.
 */
import { test, expect } from "./fixtures";
import { experience } from "@/data/experience";
import { education } from "@/data/credentials";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

test("the page is Experience: sr-only h1, Work Experience then Education, newest role first", async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/work", { waitUntil: "load" });
  await expect(page).toHaveTitle(/^Experience · /);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Experience");
  const h2s = page.getByRole("heading", { level: 2 });
  await expect(h2s.nth(0)).toHaveText("Work Experience");
  await expect(page.locator("main h2").filter({ hasText: "Education" })).toHaveCount(1);

  const work = page.locator("section#work-experience");
  const newestFirst = [...experience].sort((a, b) => b.dates.start.localeCompare(a.dates.start));
  await expect(work.locator("ol > li h3")).toHaveText(
    newestFirst.map((r) => (r.companyNote ? `${r.company} (${r.companyNote})` : r.company)),
  );
  await expect(page.locator("section#education ol > li")).toHaveCount(education.length);
  // no project index on this page any more
  await expect(page.getByRole("tablist")).toHaveCount(0);
});

test("@EVAL-013 logos: alt = organisation name, and every logo file serves", { tag: "@EVAL-013" }, async ({ page, request }) => {
  test.skip(width(page) !== 1440, "checked once at w1440");
  await page.goto("/work", { waitUntil: "load" });
  const logos = page.locator(".ct-logo img");
  await expect(logos).toHaveCount(3);
  const alts = await logos.evaluateAll((els) => els.map((el) => el.getAttribute("alt")));
  expect(alts).toEqual(["American Express", "Godrej", "National Institute of Technology Calicut"]);
  const srcs = await page.locator(".ct-logo img, .ct-mark").evaluateAll((els) => els.map((el) => el.getAttribute("src")!));
  for (const src of srcs) {
    const res = await request.get(src);
    expect(res.status(), `${src} must serve`).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/svg+xml");
  }
});

test("@EVAL-018 decoration counts: Work 3 · Education 4", { tag: "@EVAL-018" }, async ({ page }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "counts asserted at the two boundary widths");
  await page.goto("/work", { waitUntil: "load" });
  const counts = await page.evaluate(() => {
    const decor = (id: string) =>
      Array.from(document.querySelectorAll(`section#${id} [data-decor]`))
        .filter((d) => d.closest("section")?.id === id)
        .map((d) => d.getAttribute("data-decor"));
    return { work: decor("work-experience"), edu: decor("education") };
  });
  expect(counts).toEqual({ work: ["note", "annotation", "collage"], edu: ["torn", "note", "annotation", "collage"] });
});

test("@EVAL-008 no horizontal overflow; card copy ≥ 14 px", { tag: "@EVAL-008" }, async ({ page, noOverflow, minTargets }) => {
  await page.goto("/work", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await noOverflow(page);
  await minTargets(page);
  const smallest = await page.locator(".ct-card").evaluateAll((cards) =>
    Math.min(
      ...cards.flatMap((c) =>
        Array.from(c.querySelectorAll("h3, p, li"))
          .filter((el) => !el.closest(".sr-only") && !el.hasAttribute("data-micro-label"))
          .map((el) => parseFloat(getComputedStyle(el).fontSize)),
      ),
    ),
  );
  expect(smallest).toBeGreaterThanOrEqual(14);
});

test("< 768 the timeline is one column: date → logo → card, no rail", async ({ page }) => {
  test.skip(width(page) !== 390, "the single-column layout is the < 768 case");
  await page.goto("/work", { waitUntil: "load" });
  const first = page.locator("section#work-experience ol > li").first();
  const box = async (sel: string) => (await first.locator(sel).first().boundingBox())!;
  const date = await box(".ct-date");
  const logo = await box(".ct-logo");
  const card = await box(".ct-card");
  expect(card.y).toBeGreaterThan(Math.max(date.y + date.height, logo.y + logo.height) - 1);
  expect(card.width).toBeGreaterThan(300);
  await expect(first.locator(".ct-pin")).toBeHidden();
});

test("parallax: Education drives a scroll-driven drift on the Work content; reduced motion = none", {
  tag: "@EVAL-010",
}, async ({ page, browser }) => {
  test.skip(width(page) !== 1440, "one width is enough for the motion contract");
  await page.goto("/work", { waitUntil: "load" });
  const wrap = page.locator("section#work-experience > .ct-wrap");
  expect(await wrap.evaluate((el) => getComputedStyle(el).animationName)).toBe("xp-drift");
  // the Education sheet paints above the Work section (it is the paper that slides over)
  const z = await page.evaluate(() => ({
    work: getComputedStyle(document.querySelector("section#work-experience")!).zIndex,
    edu: getComputedStyle(document.querySelector("section#education")!).zIndex,
  }));
  expect(Number(z.edu)).toBeGreaterThan(Number(z.work));

  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const reduced = await ctx.newPage();
  await reduced.goto("/work", { waitUntil: "load" });
  expect(await reduced.locator("section#work-experience > .ct-wrap").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  await ctx.close();
});

test("@EVAL-006 /work is axe-clean", { tag: "@EVAL-006" }, async ({ page, axe }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe run at the two boundary widths");
  await page.goto("/work", { waitUntil: "load" });
  await axe(page);
});
