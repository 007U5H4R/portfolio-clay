/**
 * origami-icons.spec.ts — TASK-301: the product card's five action buttons (Watch demo, Watch pitch, Live product, GitHub, Case study)
 * carry sculpted origami icons. At 1440 (the vertical-carousel card) and 390 (the phone's own buttons), light and dark: every button
 * shows its own origami img (right file, decorative, loaded, >= 2x sharp), keeps its label, stays >= 44 px tall and exactly as tall as
 * it is without the icon (+-1 px, i.e. the icon never grows a row), the page does not overflow, and axe is clean. Hover motion is
 * pointer-fine only and absent under prefers-reduced-motion.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { projects } from "@/data/projects";
import { isListed } from "@/lib/portfolio";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const SLUGS = projects.filter(isListed).map((p) => p.slug);

// action -> [button selector (desktop), button selector (phone), expected origami name, label pattern]
const ACTIONS = [
  { key: "demo", desktop: '.pf-action-set .pf-action[data-action="demo"]', phone: '.pf-m-btn[data-action="watch"][data-mode="demo"]', name: "play", label: /^Watch demo/ },
  { key: "pitch", desktop: '.pf-action-set .pf-action[data-action="pitch"]', phone: '.pf-m-btn[data-action="watch"][data-mode="pitch"]', name: "camera", label: /^Watch pitch/ },
  { key: "product", desktop: '.pf-action-set .pf-action[data-action="product"]', phone: '.pf-m-btn[data-action="live"]', name: "rocket", label: /^Live product/ },
  { key: "github", desktop: '.pf-action-set .pf-action[data-action="github"]', phone: '.pf-m-btn[data-action="github"]', name: "cat", label: /^GitHub/ },
  { key: "case", desktop: '.pf-action-set .pf-action[data-action="case"]', phone: '.pf-m-btn[data-action="case"]', name: "document", label: /case study/i },
] as const;

async function openWithAllFive(page: Page, theme: "light" | "dark") {
  const desktop = width(page) >= 1024;
  for (const slug of SLUGS) {
    await page.goto(`/projects?product=${slug}`, { waitUntil: "load" });
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    await page.evaluate(() => document.fonts.ready);
    const found = await page.evaluate(
      (sels) => sels.every((s) => [...document.querySelectorAll(s)].some((el) => (el as HTMLElement).offsetParent !== null)),
      ACTIONS.map((a) => (desktop ? a.desktop : a.phone)),
    );
    if (found) return slug;
  }
  throw new Error("no listed product shows all five action buttons");
}

for (const theme of ["light", "dark"] as const) {
  test(`TASK-301: the five action buttons show their origami icons, ${theme}`, async ({ page, axe, noOverflow }) => {
    test.skip(width(page) !== 390 && width(page) !== 1440, "checked at the two boundary widths");
    const desktop = width(page) >= 1024;
    await openWithAllFive(page, theme);

    for (const a of ACTIONS) {
      const button = page.locator(desktop ? a.desktop : a.phone).filter({ visible: true }).first();
      await expect(button).toBeVisible();
      const img = button.locator("img.pf-origami");
      await expect(img).toHaveCount(1);
      await expect(img).toHaveAttribute("alt", "");
      await expect(img).toHaveAttribute("aria-hidden", "true");
      await expect(img).toHaveAttribute("src", new RegExp(`/media/illustrations/origami-icons/origami-${a.name}(-128)?\\.webp$`));
      // loaded and decoded before anything is measured
      await img.evaluate(async (el: HTMLImageElement) => {
        await new Promise<void>((resolve) => (el.complete ? resolve() : el.addEventListener("load", () => resolve(), { once: true })));
        await el.decode();
      });
      const m = await button.evaluate((el, n) => {
        const image = el.querySelector("img.pf-origami") as HTMLImageElement;
        const h = el.getBoundingClientRect().height;
        const rendered = image.getBoundingClientRect().width;
        const before = { w: image.naturalWidth, rendered, h };
        image.style.display = "none";
        const without = el.getBoundingClientRect().height;
        image.style.display = "";
        const label = ((el.querySelector(".pf-action-label") ?? el.querySelector(":scope > span:not(.sr-only)")) as HTMLElement).innerText.trim();
        return { ...before, without, label, ok: image.complete, n };
      }, a.name);
      expect(m.ok && m.w > 0, `${a.key} image loaded`).toBe(true);
      expect(m.w, `${a.key} is >= 2x its rendered ${m.rendered}px`).toBeGreaterThanOrEqual(m.rendered * 2);
      expect(m.rendered, `${a.key} has a visible size`).toBeGreaterThanOrEqual(19);
      expect(m.h, `${a.key} button is >= 44 px tall`).toBeGreaterThanOrEqual(44);
      expect(Math.abs(m.h - m.without), `${a.key} height is unchanged by the icon`).toBeLessThanOrEqual(1);
      expect(m.label, `${a.key} label`).toMatch(a.label);
    }
    await noOverflow(page);
    await axe(page);
  });
}

test("TASK-301: hover lifts and tilts the icon only for a fine pointer, and not at all with reduced motion", async ({ page }) => {
  test.skip(width(page) !== 1440, "pointer-fine hover is a desktop behaviour");
  await openWithAllFive(page, "light");
  const button = page.locator(ACTIONS[0].desktop).filter({ visible: true }).first();
  await button.scrollIntoViewIfNeeded(); // the first hover would scroll the card into view and move the box under the pointer
  await page.waitForTimeout(900);
  const img = button.locator("img.pf-origami");
  const before = await button.boundingBox();
  const resting = await img.evaluate((el) => getComputedStyle(el).transform);
  await button.hover();
  await page.waitForTimeout(350);
  const hovered = await img.evaluate((el) => getComputedStyle(el).transform);
  expect(resting).toBe("none");
  expect(hovered).not.toBe("none");
  const after = await button.boundingBox();
  expect([after!.width, after!.height]).toEqual([before!.width, before!.height]);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.mouse.move(5, 5);
  await page.waitForTimeout(300);
  await button.hover();
  await page.waitForTimeout(350);
  expect(await img.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
});
