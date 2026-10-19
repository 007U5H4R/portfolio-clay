/**
 * case-study-phone-header.spec.ts (TASK-272) — on phones (< 640) the site header renders 69 px tall, but `--header-h`
 * resolves to 119 on :root (the phablet value). The case-study scopes (.rcp, .tsp, .csx) must use the real 69 px, so
 * the sticky chapter nav sits flush under the header (no band of body text scrolling between them) and chapter jumps
 * land the heading just under header + nav instead of ~50 px lower.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const HEADER = "header[data-site-header]";
const rect = (page: Page, sel: string) =>
  page.locator(sel).first().evaluate((el) => {
    const b = el.getBoundingClientRect();
    return { top: b.top, bottom: b.bottom };
  });

for (const width of [360, 390]) {
  test.describe(`phone case-study header offset @${width}`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });

    for (const [slug, root, nav] of [
      ["railcite", ".rcp", ".rcp-nav"],
      ["teachspark", ".tsp", ".tsp-nav"],
    ] as const) {
      test(`${slug}: sticky chapter nav sits flush under the 69 px header; jumps land under it`, async ({ page }, info) => {
        test.skip(info.project.name !== "w390", "viewport is set per describe; run once");
        await page.goto(`/work/${slug}`, { waitUntil: "load" });
        await page.evaluate(() => window.scrollTo(0, 1500));
        await expect.poll(async () => (await rect(page, nav)).top).toBeGreaterThan(0);
        const h = await rect(page, HEADER);
        expect(h.bottom, "header is the compact 69 px").toBeLessThanOrEqual(71);
        await expect.poll(async () => Math.abs((await rect(page, nav)).top - (h.bottom + 6))).toBeLessThanOrEqual(2);
        const n = await rect(page, nav);
        expect(n.top - h.bottom, "no gap for body text between header and nav").toBeLessThanOrEqual(8);
        expect(await page.locator(root).first().evaluate((el) => getComputedStyle(el).getPropertyValue("--header-h").trim())).toBe("69px");

        const links = page.locator(`${nav} a`);
        const hrefs = await links.evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
        for (const href of [hrefs[1]!, hrefs[hrefs.length - 1]!]) {
          await page.locator(`${nav} a[href="${href}"]`).click();
          await page.waitForTimeout(1200);
          const top = await page.evaluate((id) => {
            const t = document.getElementById(id)!;
            return (t.querySelector("h2,h3") ?? t).getBoundingClientRect().top;
          }, href.slice(1));
          const navB = (await rect(page, nav)).bottom;
          expect(top, `${href} heading is not hidden under the nav`).toBeGreaterThanOrEqual(navB - 2);
          expect(top, `${href} heading lands under header + nav (measured ~201-205 after; was ~245 before)`).toBeLessThan(210);
        }
      });
    }

    test("generic case study (.csx): chapter sections clear the 69 px header, not 119", async ({ page }, info) => {
      test.skip(info.project.name !== "w390", "viewport is set per describe; run once");
      // TASK-282: Slag City now has its own paper layout; token-toli still renders the shared .csx template
      await page.goto("/work/token-toli", { waitUntil: "load" });
      const h = await rect(page, HEADER);
      expect(h.bottom).toBeLessThanOrEqual(71);
      expect(await page.locator("article.csx").evaluate((el) => getComputedStyle(el).getPropertyValue("--header-h").trim())).toBe("69px");
      const margin = await page.locator(".csx-sec").first().evaluate((el) => parseFloat(getComputedStyle(el).scrollMarginTop));
      expect(margin).toBeCloseTo(69 + 56, 0);
    });
  });
}
