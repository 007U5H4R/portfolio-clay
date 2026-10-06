/**
 * t4-chrome.spec.ts (`@EVAL-008` overflow · `@EVAL-010` motion · `@EVAL-026` theme stability; M-010 T4, TASK-145) —
 * the paper-cut chrome: nav, footer ocean, three-layer dividers.
 *
 *   TC-T4-01  nav: routes, labels and the Ask button unchanged; the current tab carries aria-current and a visible
 *             terracotta strip; every tab is reachable by keyboard and shows a focus ring
 *   TC-T4-02  no horizontal scroll at 375 and 768 (and 1440) with the nav, footer ocean and dividers in place
 *   TC-T4-03  footer ocean: aria-hidden, three tracks + ship, does not intercept the pointer; the footer text keeps
 *             its place above the waves
 *   TC-T4-04  footer ocean motion is transform-only; reduced motion = no animation anywhere in it
 *   TC-T4-05  every torn edge renders three ridge layers; reduced motion = no ridge animation
 *   TC-T4-06  theme switch swaps the ocean art to the dark twins without moving the page (scrollHeight ±1)
 *   TC-T4-07  the whole ship (mast tip, flag, sails) fits inside the ocean strip at 375 / 768 / 1440 / 1920 (TASK-150)
 *   TC-T4-08  the ocean's rendering is skipped while it is off-screen and resumes in view (TASK-155)
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { navItems } from "@/lib/nav";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe("T4 chrome", () => {
  test("TC-T4-01 nav is unchanged in content, current tab is marked, tabs are keyboard reachable", async ({ page }) => {
    await page.goto("/about", { waitUntil: "load" });
    const nav = page.locator('header nav[aria-label="Primary"]');
    for (const item of navItems) await expect(nav.locator(`a[href="${item.href}"]`)).toHaveText(item.label);
    await expect(page.locator("header").getByRole("button", { name: "Ask AI" })).toBeVisible();
    const current = nav.locator('a[aria-current="page"]');
    await expect(current).toHaveCount(1);
    expect(await current.locator(".hn-strip").evaluate((el) => getComputedStyle(el).transform)).not.toBe("matrix(1, 0, 0, 1, 0, 0)");
    await nav.locator("a").first().focus();
    for (let i = 0; i < navItems.length - 1; i++) await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("href"));
    expect(focused).toBe(navItems[navItems.length - 1]!.href);
    expect(await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)).not.toBe("none");
  });

  test("TC-T4-02 no horizontal scroll with the paper chrome", async ({ page }) => {
    for (const route of ["/", "/about"]) {
      await page.goto(route, { waitUntil: "load" });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      expect(await overflow(page), `${route} @${width(page)}`).toBeLessThanOrEqual(0);
    }
  });

  test("TC-T4-03 footer ocean is decorative and sits below the footer text", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const ocean = page.locator("footer.band [data-band-ocean]");
    await expect(ocean).toHaveAttribute("aria-hidden", "true");
    await expect(ocean.locator(".ocean-track")).toHaveCount(3);
    await expect(ocean.locator(".ocean-ship")).toHaveCount(1);
    const geo = await page.evaluate(() => {
      const o = document.querySelector("footer.band [data-band-ocean]")!.getBoundingClientRect();
      const b = document.querySelector("footer.band .band-bar")!.getBoundingClientRect();
      return { oceanTop: o.top, barBottom: b.bottom, widthOk: o.width <= document.documentElement.clientWidth + 1 };
    });
    expect(geo.oceanTop).toBeGreaterThanOrEqual(geo.barBottom - 1);
    expect(geo.widthOk).toBe(true);
  });

  test("TC-T4-04 ocean motion is transform-only; reduced motion stops it", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const names = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => (a.effect as KeyframeEffect).target?.closest("[data-band-ocean]"))
        .map((a) => (a as CSSAnimation).animationName),
    );
    expect(names.sort()).toEqual(["ocean-drift", "ocean-drift", "ocean-drift", "ocean-rock", "ocean-sail"]);
    for (const kf of ["ocean-drift", "ocean-sail", "ocean-rock"]) {
      const props = await page.evaluate((name) => {
        const rule = [...document.styleSheets].flatMap((s) => [...s.cssRules]).find((r) => r instanceof CSSKeyframesRule && r.name === name) as CSSKeyframesRule;
        return [...new Set([...rule.cssRules].flatMap((r) => [...(r as CSSKeyframeRule).style].map((p) => p)))];
      }, kf);
      expect(props, kf).toEqual(["transform"]);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await page.evaluate(() => [...document.querySelectorAll("[data-band-ocean] *")].reduce((n, el) => n + el.getAnimations().length, 0))).toBe(0);
  });

  test("TC-T4-05 every torn edge has three ridge layers; reduced motion freezes them", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const edges = await page.evaluate(() => [...document.querySelectorAll('[data-decor="torn"]')].map((e) => e.querySelectorAll("path").length));
    expect(edges.length).toBeGreaterThan(0);
    for (const n of edges) expect(n).toBe(3);
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await page.evaluate(() => [...document.querySelectorAll('[data-decor="torn"] path')].reduce((n, el) => n + el.getAnimations().length, 0))).toBe(0);
  });

  test("TC-T4-07 the ship is never clipped by the ocean strip", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const w of [375, 768, 1440, 1920]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/", { waitUntil: "load" });
      const geo = await page.evaluate(() => {
        const o = document.querySelector("footer.band [data-band-ocean]")!.getBoundingClientRect();
        const s = document.querySelector("footer.band .ocean-ship")!.getBoundingClientRect();
        return { headroom: s.top - o.top, bottomGap: o.bottom - s.bottom };
      });
      // the 4px rock lift happens with motion on; reduced motion is the still frame, so demand more than that
      expect(geo.headroom, `ship headroom @${w}`).toBeGreaterThanOrEqual(8);
      expect(geo.bottomGap, `ship bottom @${w}`).toBeGreaterThanOrEqual(0);
    }
  });

  test("TC-T4-08 the ocean stops rendering off-screen and resumes in view", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const skipped = () =>
      page.evaluate(
        () =>
          new Promise<boolean>((resolve) => {
            const el = document.querySelector<HTMLElement>("footer.band [data-band-ocean]")!;
            el.addEventListener("contentvisibilityautostatechange", (e) => resolve((e as Event & { skipped: boolean }).skipped), { once: true });
          }),
      );
    // at the top of the page the strip is far below the fold: its first state event reports skipped
    expect(await page.evaluate(() => getComputedStyle(document.querySelector("footer.band [data-band-ocean]")!).contentVisibility)).toBe("auto");
    const inView = skipped();
    await page.evaluate(() => document.querySelector("footer.band [data-band-ocean]")!.scrollIntoView());
    expect(await inView).toBe(false);
    const outOfView = skipped();
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(await outOfView).toBe(true);
  });

  test("TC-T4-06 dark twins swap in without moving the page", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const h0 = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    const bg = await page.locator(".ocean-front").evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain("wave-front-dark.webp");
    expect(await page.locator(".ocean-ship").evaluate((el) => getComputedStyle(el).backgroundImage)).toContain("ship-dark.webp");
    const h1 = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(Math.abs(h1 - h0)).toBeLessThanOrEqual(1);
  });
});
