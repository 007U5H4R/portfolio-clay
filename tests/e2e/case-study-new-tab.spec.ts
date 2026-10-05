/**
 * case-study-new-tab.spec.ts (TASK-130; Tushar 2026-09-29: "whenever a user clicks on case study link
 * a new tab should open"). Crawls every public route (the live sitemap, falling back to the static
 * list) and asserts that every link to a case study — `a[href^="/work/"]` other than `/work` itself,
 * the Experience page — opens in a new tab: `target="_blank"`, `rel` containing `noopener`, and a
 * visually hidden "opens in a new tab" in its accessible name. Also checks the links that only exist
 * after an interaction: the Portfolio info sheet per product and Ask Tushky's answer sources.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { loadRoutes } from "./routes";
import { TUSHKY_SUGGESTIONS } from "@/components/ai/tushky-questions";

const BASE_URL = process.env.PW_BASE_URL ?? "http://127.0.0.1:3000";

interface Offender { href: string; target: string | null; rel: string | null; name: string }

async function caseStudyLinkOffenders(page: Page): Promise<{ checked: number; offenders: Offender[] }> {
  return page.evaluate(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="/work/"]'));
    const offenders: Offender[] = [];
    for (const a of links) {
      const href = a.getAttribute("href") ?? "";
      const target = a.getAttribute("target");
      const rel = a.getAttribute("rel");
      const name = (a.getAttribute("aria-label") ?? a.textContent ?? "").replace(/\s+/g, " ").trim();
      const ok = target === "_blank" && /\bnoopener\b/.test(rel ?? "") && /opens in a new tab/i.test(name);
      if (!ok) offenders.push({ href, target, rel, name });
    }
    return { checked: links.length, offenders };
  });
}

test("@EVAL-011 every case-study link on every public route opens in a new tab", async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 1440, "the crawl runs once at w1440");
  test.setTimeout(180_000);
  const routes = (await loadRoutes({ baseUrl: BASE_URL })).filter((route) => !route.startsWith("/dev/"));
  expect(routes.length).toBeGreaterThan(10);
  let total = 0;
  const failures: string[] = [];
  for (const route of routes) {
    await page.goto(route, { waitUntil: "load" });
    const { checked, offenders } = await caseStudyLinkOffenders(page);
    total += checked;
    for (const o of offenders) failures.push(`${route}: ${o.href} target=${o.target} rel=${o.rel} name="${o.name}"`);
  }
  expect(failures, failures.join("\n")).toEqual([]);
  expect(total, "the crawl must actually see case-study links").toBeGreaterThan(20);
});

test("@EVAL-011 the Portfolio info sheet's case-study link opens in a new tab for every product", async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 1440, "runs once at w1440");
  await page.goto("/projects", { waitUntil: "load" });
  const tabs = page.getByRole("tab");
  const count = await tabs.count();
  expect(count).toBeGreaterThanOrEqual(12);
  for (let i = 0; i < count; i++) {
    await tabs.nth(i).click();
    const link = page.locator('a[data-action="case"]');
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toContainText(/opens in a new tab/);
  }
  // A click opens the study in a new page and leaves the portfolio where it was.
  const [popup] = await Promise.all([page.waitForEvent("popup"), page.locator('a[data-action="case"]').click()]);
  await popup.waitForLoadState("load");
  expect(new URL(popup.url()).pathname).toMatch(/^\/work\/[a-z0-9-]+$/);
  expect(new URL(page.url()).pathname).toBe("/projects");
  await popup.close();
});

test("@EVAL-011 Ask Tushky answer sources that point at a case study open in a new tab", async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 1440, "runs once at w1440");
  await page.goto("/", { waitUntil: "load" });
  const section = page.locator("section#ask");
  await section.scrollIntoViewIfNeeded();
  const cards = section.getByRole("list", { name: "Suggested questions" }).getByRole("button");
  const drawer = page.locator("dialog.ask-panel");
  let seen = 0;
  for (let i = 0; i < TUSHKY_SUGGESTIONS.length; i++) {
    await cards.nth(i).click();
    await expect(drawer.locator('[data-role="tushky"][data-msg="answer"]')).toHaveCount(1, { timeout: 5_000 });
    const { checked, offenders } = await caseStudyLinkOffenders(page);
    seen += checked;
    expect(offenders, JSON.stringify(offenders)).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(drawer).not.toHaveAttribute("open", "");
  }
  expect(seen, "at least one answer cites a case study").toBeGreaterThan(0);
});
