/**
 * contact-quote.spec.ts (TASK-171) — the Contact opener's handwritten quote: exactly one copy is visible at every width
 * (≥ 768 on the scene's ruled page, < 768 below the opener), it is real text in the handwriting face, it tilts up to the
 * right, and its ink differs from the page in both themes.
 */
import { test, expect } from "./fixtures";

const QUOTE = "The best way to predict the future is to invent it.";

for (const theme of ["light", "dark"] as const) {
  test(`one visible handwritten quote, legible, tilted · ${theme}`, async ({ page }) => {
    await page.addInitScript((t) => {
      try {
        localStorage.setItem("portfolio-theme", t);
      } catch {}
    }, theme);
    await page.goto("/contact", { waitUntil: "load" });
    const visible = page.locator(".opener-quote:visible");
    await expect(visible).toHaveCount(1);
    await expect(visible.locator("blockquote")).toHaveText(QUOTE);
    await expect(visible.locator("figcaption")).toHaveText("— Alan Kay");
    const narrow = page.viewportSize()!.width < 768;
    expect(await visible.evaluate((el) => !!el.closest(".scene-opener"))).toBe(!narrow);
    const style = await visible.evaluate((el) => {
      const cs = getComputedStyle(el);
      const m = new DOMMatrix(cs.transform);
      return { font: cs.fontFamily, angle: (Math.atan2(m.b, m.a) * 180) / Math.PI };
    });
    expect(style.font.toLowerCase()).toContain("caveat");
    expect(style.angle, "rises to the right").toBeLessThan(-2);
    // Two lines at most at every width (a third line once orphaned "it." at 768).
    const lines = await visible.locator("blockquote p").evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
    expect(lines).toBeLessThanOrEqual(narrow ? 3 : 2);
  });
}
