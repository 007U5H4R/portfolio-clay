/**
 * about-part2.spec.ts (TASK-136 — supersedes the TKT-87 experience · proof · CTA contract) — `/about`'s
 * sections in the browser: order, the EVAL-018 unit counts, the real links, the facts from data, and the
 * About ↔ Experience split (the résumé record lives on `/work`).
 *
 *   @EVAL-018 — unit counts hero 4 · chapters 2 · career 2 · research-values 2 · recognition 2 · CTA 1 at 390
 *               and 1440; every text-bearing decoration is aria-hidden.
 *   @EVAL-011 — the patent link and the DOI link resolve to their records; "DOI pending" is Inter; the CTA
 *               buttons land on the existing Experience and Certifications tabs.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { experience } from "@/data/experience";
import { awards, papers, patent } from "@/data/credentials";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const MEASURED = [390, 1440];

/** Decorations owned by a unit under the nearest-ancestor rule (Design.md §3.2 rule 1). */
async function ownedDecor(page: Page, selector: string): Promise<string[]> {
  return page.locator(selector).evaluate((unit) =>
    [...unit.querySelectorAll("[data-decor]")]
      .filter((d) => d.closest("section, header, footer") === unit)
      .map((d) => d.getAttribute("data-decor") ?? ""),
  );
}

test("@EVAL-018 unit counts: hero 4 · chapters 2 · career 2 · research-values 2 · recognition 2 · CTA 1", {
  tag: "@EVAL-018",
}, async ({ page }) => {
  test.skip(!MEASURED.includes(width(page)), "EVAL-018 is measured at w390 and w1440");
  await page.goto("/about", { waitUntil: "load" });
  expect((await ownedDecor(page, 'section[aria-labelledby="about-hero-heading"]')).sort()).toEqual(["annotation", "annotation", "collage", "sketch"]);
  expect(await ownedDecor(page, "section#chapters")).toEqual(["torn", "annotation"]);
  expect(await ownedDecor(page, "section#career")).toEqual(["torn", "sketch"]);
  expect(await ownedDecor(page, "section#research-values")).toEqual(["torn", "annotation"]);
  expect(await ownedDecor(page, "section#recognition")).toEqual(["torn", "annotation"]);
  expect(await ownedDecor(page, "section#about-cta")).toEqual(["collage"]);
  for (const el of await page.locator("main [data-decor]").all()) await expect(el).toHaveAttribute("aria-hidden", "true");
});

test("page order: opener → hero → chapters → career → research + values → recognition → CTA → band", async ({ page }) => {
  test.skip(width(page) !== 1440, "DOM order is viewport-independent; checked once at w1440");
  await page.goto("/about", { waitUntil: "load" });
  const order = await page.evaluate(() =>
    [...document.querySelectorAll("main > section, footer.band")].map((el) =>
      el.tagName === "FOOTER" ? "band" : el.id || el.getAttribute("data-opener") || el.getAttribute("aria-labelledby"),
    ),
  );
  expect(order).toEqual(["scene-about", "about-hero-heading", "chapters", "career", "research-values", "recognition", "about-cta", "band"]);
});

test("@EVAL-011 the dark strip: See full experience → /work, View certifications → /certifications", {
  tag: "@EVAL-011",
}, async ({ page }) => {
  test.skip(width(page) !== 1440 && width(page) !== 390, "checked at one desktop + one mobile width");
  await page.goto("/about", { waitUntil: "load" });
  const cta = page.locator("section#about-cta");
  await expect(cta.getByRole("heading", { level: 2 })).toHaveText("Want the full story with roles, achievements and metrics?");
  await expect(cta.getByRole("link")).toHaveCount(2);
  await expect(cta.getByRole("link", { name: "See full experience" })).toHaveAttribute("href", "/work");
  await expect(cta.getByRole("link", { name: "View certifications" })).toHaveAttribute("href", "/certifications");
  // the strip is deep navy with cream text; the primary button is the terracotta one
  const [strip, primary] = await Promise.all([
    cta.locator(".acx-strip").evaluate((el) => getComputedStyle(el).backgroundColor),
    cta.locator(".acx-btn-primary").evaluate((el) => getComputedStyle(el).backgroundColor),
  ]);
  expect(strip).not.toBe(primary);
  await cta.getByRole("link", { name: "See full experience" }).click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.locator("section#work-experience")).toBeVisible();
});

test("@EVAL-011 research: the granted patent IN 429867, the patent record + DOI links, 'DOI pending' in Inter", {
  tag: "@EVAL-011",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/about", { waitUntil: "load" });
  const research = page.locator("#research");
  await expect(research).toContainText(patent.number);
  await expect(research).toContainText("Granted patent");
  await expect(research).not.toContainText(/patent filed/i);
  await expect(research.getByRole("link", { name: /Pratyasa/ })).toHaveAttribute("href", patent.href);
  for (const paper of papers) {
    await expect(research).toContainText(paper.title);
    if (paper.doi && paper.doiHref) {
      await expect(research.getByRole("link", { name: new RegExp(paper.doi.replace(/[.]/g, "\\.")) })).toHaveAttribute("href", paper.doiHref);
    }
  }
  const pending = research.getByText("DOI pending", { exact: true });
  await expect(pending).toBeVisible();
  expect((await pending.evaluate((el) => getComputedStyle(el).fontFamily)).toLowerCase()).not.toContain("caveat");
});

test("recognition shows only the recorded awards; About repeats no role, bullet, metric, education or badge", async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/about", { waitUntil: "load" });
  const names = await page.locator("#recognition .rcx-name").allTextContents();
  expect(names).toEqual(awards.map((a) => a.title));
  const text = (await page.locator("main").textContent()) ?? "";
  for (const role of experience) {
    expect(text).not.toContain(role.title);
    for (const o of role.outcomes) expect(text).not.toContain(o.text);
  }
  expect(text).not.toMatch(/M\.Tech|B\.E\.|Bhilai|Languages:|What I Bring|Nvidia|Star of the Month|Spot Award|\bHSBC\b|\bAIG\b/);
  await expect(page.locator("main a[href^='https://www.credly.com'], main [data-credential]")).toHaveCount(0);
});

test("Experience holds what left About: every role's scope & outcomes behind a keyboard-operable disclosure", async ({ page, axe }) => {
  test.skip(width(page) !== 1440 && width(page) !== 390, "checked at one desktop + one mobile width");
  await page.goto("/work", { waitUntil: "load" });
  for (const role of experience) {
    const details = page.locator(`details[data-details="${role.id}"]`);
    await expect(details).toHaveCount(1);
    await expect(details).not.toHaveAttribute("open", /.*/);
  }
  const first = page.locator(`details[data-details="${experience[experience.length - 1]!.id}"]`);
  await first.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(first).toHaveAttribute("open", "");
  const newest = experience[experience.length - 1]!;
  await expect(first.locator("dl")).toContainText(newest.whatChanged);
  for (const o of newest.outcomes) await expect(first.locator("dl")).toContainText(o.text);
  const box = await first.locator("summary").boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await expect(page.locator("section#skills h2")).toHaveText("What I Bring");
  await expect(page.locator("section#skills .acap-langs")).toHaveText(/^Languages: /);
  await axe(page);
});
