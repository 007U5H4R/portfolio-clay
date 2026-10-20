/**
 * case-logos.spec.ts (TASK-285) — a product's own logo replaces its name in the case-study hero h1 and in the next-project band.
 * Per logo product: the hero h1 holds the logo (correct theme file in light and dark, one visible, decoration only) while the h1
 * and the band link keep the product name as their accessible name; the band shows the NEXT product's logo and keeps the arrow
 * and link; a product without a logo keeps its text; no horizontal overflow at 375 / 768 / 1440; the logo file is never upscaled.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const PRODUCTS: Record<string, string> = {
  teachspark: "TeachSpark",
  railcite: "RailCite",
  velora: "Velora",
  nuptis: "Nuptis",
  "bhakti-vilas": "Bhakti Vilas",
  pratyasa: "Pratyasa",
  "campfire-board": "Campfire Board",
  "slag-city": "Slag City",
  "shravans-round": "The Shravan's Round",
  urja: "Urja",
};
const NO_LOGO = ["tegaki", "token-toli", "dino-arcade-pwa", "cinematic-portfolio", "cubicle"];
const WIDTHS = [375, 768, 1440];
const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
const band = (page: Page) => page.locator('section[aria-label="Next project"]');

/** The visible logo image inside a container: its src, and how many logo images are showing. */
async function shown(page: Page, scope: ReturnType<Page["locator"]>) {
  const imgs = scope.locator(".cs-logo img.pf-logo-img");
  await expect.poll(() => imgs.evaluateAll((els) => els.every((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0))).toBe(true);
  return imgs.evaluateAll((els) => {
    const on = (els as HTMLImageElement[]).filter((el) => getComputedStyle(el).display !== "none");
    return { count: on.length, src: on[0]?.getAttribute("src") ?? "", alt: on[0]?.getAttribute("alt"), w: on[0]?.getBoundingClientRect().width ?? 0, nat: on[0]?.naturalWidth ?? 0 };
  });
}

for (const [slug, name] of Object.entries(PRODUCTS)) {
  test(`${slug}: hero + next band show logos, names stay accessible, no overflow`, async ({ page, noOverflow }) => {
    await page.goto(`/work/${slug}`, { waitUntil: "load" });
    for (const theme of ["light", "dark"] as const) {
      await setTheme(page, theme);
      const h1 = page.locator("h1#cs-h");
      await expect(h1.locator(".cs-logo")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(name);
      const hero = await shown(page, h1);
      expect(hero.count, `${slug} hero ${theme}: exactly one logo shows`).toBe(1);
      expect(hero.src).toBe(`/media/logos/products/logo-${slug}-${theme}.webp`);
      expect(hero.alt).toBe("");
      expect(hero.nat).toBeGreaterThanOrEqual(hero.w); // never upscaled
      // next band
      await band(page).scrollIntoViewIfNeeded();
      const href = await band(page).locator("a").getAttribute("href");
      const nextSlug = href!.replace("/work/", "");
      const nextName = PRODUCTS[nextSlug];
      await expect(band(page).locator("a")).toHaveAttribute("aria-label", new RegExp(`^Next project: ${nextName!.replace(/'/g, ".")}`));
      if (nextSlug === "slag-city") {
        // TASK-290: Slag City's logo file is an opaque dark plate (a small dark box on the band), so its band shows the plain name
        await expect(band(page).locator("h2 .cs-logo")).toHaveCount(0);
        await expect(band(page).locator("h2")).toContainText(nextName!);
        continue;
      }
      const pinned = (await band(page).locator(".cs-logo[data-on-dark]").count()) > 0;
      const next = await shown(page, band(page).locator("h2"));
      expect(next.count, `${slug} band ${theme}: exactly one logo shows`).toBe(1);
      expect(next.src).toBe(`/media/logos/products/logo-${nextSlug}-${pinned || theme === "dark" ? "dark" : "light"}.webp`);
      await expect(band(page).locator("h2")).toContainText(nextName!);
      await expect(band(page).locator("h2")).toContainText("→");
      const gap = await band(page).locator("h2").evaluate((h) => { const l = h.querySelector(".cs-logo")!.getBoundingClientRect(); const a = h.querySelector("[aria-hidden=true]:not(.cs-logo):not(img)")!.getBoundingClientRect(); return a.left - l.right; });
      expect(gap, `${slug} band: the arrow sits right after the logo`).toBeGreaterThanOrEqual(0);
      expect(gap).toBeLessThanOrEqual(40);
      if (nextSlug !== "shravans-round") expect(next.nat).toBeGreaterThanOrEqual(next.w);
    }
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        await noOverflow(page);
        const box = await page.locator("h1#cs-h .cs-logo img.pf-logo-img").evaluateAll((els) => {
          const on = (els as HTMLImageElement[]).find((el) => getComputedStyle(el).display !== "none")!;
          const r = on.getBoundingClientRect();
          return { right: r.right, left: r.left, h: r.height };
        });
        expect(box.right).toBeLessThanOrEqual(w);
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.h).toBeGreaterThan(20);
      }
    }
  });
}

for (const slug of NO_LOGO) {
  test(`${slug}: a product without a logo keeps its text name`, async ({ page }) => {
    await page.goto(`/work/${slug}`, { waitUntil: "load" });
    await expect(page.locator("h1#cs-h .cs-logo")).toHaveCount(0);
    await expect(page.locator("h1#cs-h")).not.toHaveText("");
  });
}
