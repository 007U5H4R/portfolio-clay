/**
 * tab-order.spec.ts - TASK-341 (DES-021, WCAG 2.4.3 Focus Order): on the desktop /projects showcase (paper selector present) the forward
 * Tab order is selector (Previous, the one selected tile, Next) -> card (its CTA first, then the secondaries) -> stage (player controls)
 * -> out of the showcase, and Shift+Tab walks the same stops backwards. Below 1024 px the DOM order is unchanged.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { PAPER_SELECTOR_ENABLED } from "@/components/portfolio/paper-selector-flag";
import { VERTICAL_CAROUSEL_ENABLED } from "@/components/portfolio/vertical-carousel-flag";

test.beforeEach(({ page }) => {
  test.skip(!(PAPER_SELECTOR_ENABLED && VERTICAL_CAROUSEL_ENABLED), "paper selector is off");
  test.skip((page.viewportSize()?.width ?? 0) !== 1440, "sizes are set inside the tests; run once");
});

/** Which part of the showcase holds focus, with a readable name for failures. */
const where = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return { zone: "out", name: "body" };
    const name = el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 40) ?? el.tagName;
    let zone = "out";
    if (el.closest(".pf-carousel")) zone = el.matches('[role="tab"]') ? "tile" : el.matches('[data-dir="prev"]') ? "sel-prev" : el.matches('[data-dir="next"]') ? "sel-next" : "sel-other";
    else if (el.closest("#pf-stage-screen, .pf-stage")) zone = "stage";
    else if (el.closest("#pf-panel")) zone = el.matches('.pf-action[data-tier="primary"]') ? "cta" : "card";
    return { zone, name };
  });

async function open(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projects", { waitUntil: "load" });
  await page.waitForFunction(() => {
    const tab = document.querySelector('[role="tab"]');
    return !!tab && document.querySelector(".pf-carousel[data-paper-selector]") && Object.keys(tab).some((k) => k.startsWith("__react"));
  });
  await page.evaluate(() => document.fonts.ready);
}

const compress = (zones: string[]) => zones.filter((z, i) => z !== zones[i - 1]);

test("TASK-341: Tab runs selector -> card (CTA first) -> stage -> out, Shift+Tab reverses", async ({ page }) => {
  test.setTimeout(90_000);
  await open(page);
  // from the very start of the page to the first selector stop
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  let seen = "out";
  for (let i = 0; i < 120 && seen === "out"; i++) {
    await page.keyboard.press("Tab");
    seen = (await where(page)).zone;
  }
  expect(seen, "Tab from the page start reaches the selector").toBe("sel-prev");

  const forward: { zone: string; name: string }[] = [await where(page)];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    const at = await where(page);
    if (at.zone === "out") break;
    forward.push(at);
  }
  const zones = forward.map((f) => f.zone);
  expect(compress(zones), `forward order ${JSON.stringify(forward)}`).toEqual(["sel-prev", "tile", "sel-next", "cta", "card", "stage"]);
  expect(zones.filter((z) => z === "tile"), "the tablist is one tab stop (roving tabindex)").toHaveLength(1);
  expect(forward.find((f) => f.zone === "tile")?.name).toContain(":"); // "<Product>: <tagline>" accessible name
  expect(zones.filter((z) => z === "cta"), "the card's CTA is the first card stop").toHaveLength(1);
  expect(zones.indexOf("cta")).toBe(zones.indexOf("sel-next") + 1);
  expect(zones.filter((z) => z === "card").length, "secondaries follow the CTA").toBeGreaterThanOrEqual(1);

  // Shift+Tab from the stop after the showcase comes back through the same stops, last to first
  await page.keyboard.press("Shift+Tab");
  const back: { zone: string; name: string }[] = [await where(page)];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Shift+Tab");
    const at = await where(page);
    if (at.zone === "out") break;
    back.push(at);
  }
  expect(back.map((b) => b.name), "reverse order is the forward order reversed").toEqual(forward.map((f) => f.name).reverse());
});

test("TASK-341: the DOM order is unchanged below 1024 px (carousel after the panel)", async ({ page }) => {
  for (const [w, h] of [[768, 1024], [390, 844]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/projects", { waitUntil: "load" });
    await page.waitForFunction(() => Object.keys(document.querySelector("#pf-panel")!).some((k) => k.startsWith("__react")));
    const order = await page.evaluate(() => {
      const panel = document.getElementById("pf-panel")!;
      const car = document.querySelector(".pf-carousel")!;
      const stage = document.getElementById("pf-stage-screen")!;
      const info = panel.querySelector(".pf-info")!;
      const after = (a: Node, b: Node) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
      return { carAfterPanel: after(panel, car), stageBeforeInfo: after(stage, info) };
    });
    expect(order, `${w}px`).toEqual({ carAfterPanel: true, stageBeforeInfo: true });
  }
});
