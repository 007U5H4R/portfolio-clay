/**
 * about-part2.spec.ts (TKT-87, TC-168) — `/about` experience · proof · CTA in paper, and the page
 * assembly order (Design.md §7.4, §3.3). TKT-86 owns about.spec.ts (hero → impact); this file covers
 * this ticket's sections only.
 *
 *   @EVAL-018 — unit counts experience 1 · proof 2 · CTA 1 at 390 and 1440; every story-card `dl` is
 *               `[data-flat]` with 0 `[data-decor]` descendants.
 *   @EVAL-002 — the résumé control in `#about-cta` is `resumeAction()` (placeholder → /contact#resume).
 *   @EVAL-011 — the patent link and the DOI pill point at their records ("DOI pending" is Inter).
 *   @EVAL-006 — axe 0 critical/serious on the page at 390 and 1440.
 */
import { test, expect } from "./fixtures";
import { experience } from "@/data/experience";
import { papers, patent } from "@/data/credentials";
import { resumeAction } from "@/lib/site";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;
const MEASURED = [390, 1440];

/** Decorations owned by a unit under the nearest-ancestor rule (Design.md §3.2 rule 1). */
async function ownedDecor(page: import("@playwright/test").Page, selector: string): Promise<string[]> {
  return page.locator(selector).evaluate((unit) =>
    [...unit.querySelectorAll("[data-decor]")]
      .filter((d) => d.closest("section, header, footer") === unit)
      .map((d) => d.getAttribute("data-decor") ?? ""),
  );
}

test("@EVAL-018 unit counts: experience 1 · proof 2 · CTA 1; story dls are flat with 0 decorations", {
  tag: "@EVAL-018",
}, async ({ page }) => {
  test.skip(!MEASURED.includes(width(page)), "EVAL-018 is measured at w390 and w1440");
  await page.goto("/about", { waitUntil: "load" });

  expect(await ownedDecor(page, "section#experience")).toEqual(["torn"]);
  expect(await ownedDecor(page, "section.proof-s")).toEqual(["torn", "note"]);
  expect(await ownedDecor(page, "section#about-cta")).toEqual(["torn"]);

  const dls = page.locator('[data-paper="card"] dl');
  await expect(dls).toHaveCount(experience.length);
  for (let i = 0; i < experience.length; i++) {
    await expect(dls.nth(i)).toHaveAttribute("data-flat", "");
    await expect(dls.nth(i).locator("[data-decor]")).toHaveCount(0);
  }
});

test("@EVAL-002 #about-cta: Let's talk → /contact, résumé control = resumeAction(), TP10 colophon", {
  tag: "@EVAL-002",
}, async ({ page }) => {
  test.skip(width(page) !== 1440 && width(page) !== 390, "checked at one desktop + one mobile width");
  await page.goto("/about", { waitUntil: "load" });
  const cta = page.locator("section#about-cta");
  const resume = resumeAction();

  await expect(cta.getByRole("heading", { level: 2 })).toHaveText("Let's build what's next.");
  await expect(cta.getByRole("link", { name: "Let's talk" })).toHaveAttribute("href", "/contact");
  const resumeLink = cta.getByRole("link", { name: resume.label });
  await expect(resumeLink).toHaveAttribute("href", resume.href);
  if (resume.download) await expect(resumeLink).toHaveAttribute("download", /.*/);
  else await expect(resumeLink).not.toHaveAttribute("download", /.*/);
  await expect(cta.locator(".acta-colophon")).toHaveText("Designed and built with Claude Code.");

  // EVAL-002 path: the placeholder lands on the contact page's résumé row.
  if (!resume.download) {
    await resumeLink.click();
    await expect.poll(() => {
      const url = new URL(page.url());
      return url.pathname + url.hash;
    }).toBe(resume.href);
  }
});

test("@EVAL-011 proof: patent link + DOI pill resolve to their records; 'DOI pending' is Inter", {
  tag: "@EVAL-011",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/about", { waitUntil: "load" });
  const research = page.locator("#research");

  await expect(research.getByRole("link", { name: /Pratyasa/ })).toHaveAttribute("href", patent.href);
  for (const paper of papers) {
    if (paper.doi && paper.doiHref) {
      await expect(research.getByRole("link", { name: new RegExp(paper.doi.replace(/[.]/g, "\\.")) })).toHaveAttribute(
        "href",
        paper.doiHref,
      );
    }
  }
  const pending = research.getByText("DOI pending", { exact: true });
  await expect(pending).toBeVisible();
  const family = await pending.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family.toLowerCase()).not.toContain("caveat");
  await expect(pending).not.toHaveClass(/font-hand/);

  // The TP stamp is decoration only (aria-hidden); the patent number is in the text.
  await expect(research.locator('[data-decor="note"]')).toHaveAttribute("aria-hidden", "true");
  await expect(research).toContainText(patent.number);
  // Languages line is Inter (Dev-04).
  const langs = await page.locator(".proof-langs").evaluate((el) => getComputedStyle(el).fontFamily);
  expect(langs.toLowerCase()).not.toContain("caveat");
});

test("page order: hero → journey → capabilities → impact → experience → proof → CTA → band", async ({ page }) => {
  test.skip(width(page) !== 1440, "DOM order is viewport-independent; checked once at w1440");
  await page.goto("/about", { waitUntil: "load" });
  const order = await page.evaluate(() => {
    const main = document.querySelector("main") ?? document.body;
    const pick = (sel: string) => main.querySelector(sel) ?? document.querySelector(sel);
    const els = [
      pick("#impact"),
      pick("section#experience"),
      pick("section.proof-s"),
      pick("section#about-cta"),
      document.querySelector("footer.band"),
    ];
    if (els.some((e) => !e)) return false;
    return els.every((e, i) => i === 0 || !!(els[i - 1]!.compareDocumentPosition(e!) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  expect(order).toBe(true);
});

test("@EVAL-006 /about axe clean", { tag: "@EVAL-006" }, async ({ page, axe }) => {
  test.skip(!MEASURED.includes(width(page)), "axe runs at 390 and 1440 (EVAL-006)");
  await page.goto("/about", { waitUntil: "load" });
  await axe(page);
});
