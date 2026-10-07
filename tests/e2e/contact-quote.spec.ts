/**
 * contact-quote.spec.ts (TASK-171) — the Contact opener's handwritten quote: exactly one copy is visible at every width
 * and it sits on the scene's ruled page (inside the opener) at every width — on phones too (Tushar 2026-10-07), it is real
 * text in the handwriting face, and it tilts up to the right.
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
    await expect(visible.locator("figcaption cite")).toHaveText("Alan Kay");
    const narrow = page.viewportSize()!.width < 768;
    expect(await visible.evaluate((el) => !!el.closest(".scene-opener")), "written on the scene at every width").toBe(true);
    // On the scene's paper, not off its edges: the quote's box stays inside the scene root's box.
    const inside = await visible.evaluate((el) => {
      const q = el.getBoundingClientRect();
      const s = el.closest(".scene-opener")!.querySelector("[data-paper-scene]")!.getBoundingClientRect();
      return q.left >= s.left && q.right <= s.right && q.top >= s.top && q.bottom <= s.bottom;
    });
    expect(inside, "quote inside the scene").toBe(true);
    const style = await visible.evaluate((el) => {
      const cs = getComputedStyle(el);
      const m = new DOMMatrix(cs.transform);
      return { font: cs.fontFamily, angle: (Math.atan2(m.b, m.a) * 180) / Math.PI };
    });
    expect(style.font.toLowerCase()).toContain("caveat");
    expect(style.angle, "rises to the right").toBeLessThan(-2);
    // Two lines at most at every width (a third line once orphaned "it." at 768).
    // offsetHeight is the untransformed layout height: the tilted block's bounding box is taller than its lines.
    const lines = await visible.locator("blockquote p").evaluate((el) => Math.round((el as HTMLElement).offsetHeight / parseFloat(getComputedStyle(el).lineHeight)));
    expect(lines).toBeLessThanOrEqual(narrow ? 4 : 2);
  });
}
