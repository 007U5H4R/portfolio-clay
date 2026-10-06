/**
 * Shared EVAL-030 helpers: the secret-trigger click sequence and lab-mount wait, used by
 * eval-030.spec.ts (SwiftShader launch, canvas path) and eval-030-entry.spec.ts (default launch).
 */
import type { Page } from "@playwright/test";

export const BRAND = "[data-site-header] .header-brand";
export const MONOGRAM = "[data-site-header] .header-monogram";

export async function rapidClicks(page: Page, selector: string, n = 5, gap = 70) {
  // Wait until the trigger has hydrated: a click before that is (correctly) not counted.
  await page.waitForSelector("html[data-gummy-trigger='ready']", { timeout: 20_000 });
  for (let i = 0; i < n; i += 1) {
    // A raw mouse click at the element's centre, not `locator.click()`: Playwright's actionability checks
    // wait for animation frames, so on a host whose compositor crawls (software WebGL) each click took
    // 0.6–2.5 s and the harness, not the page, decided whether 5 clicks fit in 3.5 s.
    const box = (await page.locator(selector).first().boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { delay: 10 });
    if (i < n - 1) await page.waitForTimeout(gap);
  }
}

export async function enterLab(page: Page, selector = BRAND) {
  await page.goto("/");
  await page.waitForLoadState("load");
  await rapidClicks(page, selector);
  await page.waitForURL("**/lab", { timeout: 15_000 });
  await waitLab(page);
}

/** The lab has mounted (canvas or fallback), not just the static loading shell. */
export const waitLab = (page: Page) => page.waitForSelector("[data-lab]:not([data-lab='loading'])", { timeout: 30_000 });
