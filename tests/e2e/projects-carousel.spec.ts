/**
 * projects-carousel.spec.ts (TASK-274, Tushar 2026-10-19) — the desktop product tray (centred stage + pager), the product card's
 * own previous / next + pager + ←/→ + drag, and scroll-to-video after a deliberate carousel pick.
 * Desktop (>= 1024 px) only gets the new controls; the phone (390) must not render or expose any of them.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { projects } from "@/data/projects";
import { isListed } from "@/lib/portfolio";
import { VERTICAL_CAROUSEL_ENABLED } from "@/components/portfolio/vertical-carousel-flag";

const PERSONAL = projects.filter(isListed);
const N = PERSONAL.length;
const w = (page: Page) => page.viewportSize()?.width ?? 0;
const panel = (page: Page) => page.getByRole("tabpanel");
const pad = (n: number) => String(n).padStart(2, "0");
const hydrated = async (page: Page) => {
  await page.waitForFunction(() => {
    const tab = document.querySelector('[role="tab"]');
    return !!tab && Object.keys(tab).some((k) => k.startsWith("__react"));
  });
  await page.waitForTimeout(300); // useSyncExternalStore re-render with the desktop pieces
};
const open = async (page: Page, slug?: string) => {
  await page.goto(slug ? `/projects?product=${slug}` : "/projects", { waitUntil: "load" });
  await hydrated(page);
};
const active = (page: Page) => panel(page).getAttribute("data-active-product");
const info = (page: Page) => panel(page).locator(".pf-info");

test.describe("desktop (>= 1024)", () => {
  test.beforeEach(({ page }) => {
    test.skip(w(page) < 1024, "desktop-only controls");
    test.skip(VERTICAL_CAROUSEL_ENABLED, "TASK-301 experiment: the vertical carousel replaces this tray from 1024 up (vertical-carousel.spec.ts); with the flag off this runs");
  });

  test("the index is data-driven (NN / total) and the selected card carries state beyond colour", async ({ page }) => {
    await open(page);
    await expect(page.locator(".pf-count")).toHaveText(`01 / ${pad(N)}`);
    const sel = page.getByRole("tab", { selected: true });
    await expect(sel).toHaveAttribute("aria-selected", "true");
    await expect(sel).toHaveAttribute("data-rel", "0");
    const scales = await page.getByRole("tab").evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).scale) || 1));
    expect(scales[0]).toBeGreaterThan(scales[1]!); // larger, not just a different colour
    await page.getByRole("tab").nth(3).click();
    await expect(page.locator(".pf-count")).toHaveText(`04 / ${pad(N)}`);
    await expect(page.getByRole("tab", { selected: true })).toHaveAttribute("data-product", PERSONAL[3]!.slug);
  });

  test("the selected card is centred in the tray; arrows move one product; the pager jumps", async ({ page }) => {
    await open(page);
    await page.getByRole("tab").nth(4).click();
    await page.waitForTimeout(900);
    const off = await page.evaluate(() => {
      const t = document.querySelector<HTMLElement>(".pf-track")!.getBoundingClientRect();
      const c = document.querySelector<HTMLElement>('.pf-thumb[aria-selected="true"]')!.getBoundingClientRect();
      return Math.abs(t.left + t.width / 2 - (c.left + c.width / 2));
    });
    expect(off).toBeLessThan(6);
    const slug = (await active(page))!;
    const at = PERSONAL.findIndex((p) => p.slug === slug);
    await page.locator(".pf-carousel").getByRole("button", { name: "Next product" }).click();
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[(at + 1) % N]!.slug);
    await page.locator(".pf-carousel").getByRole("button", { name: "Previous product" }).click();
    await expect(panel(page)).toHaveAttribute("data-active-product", slug);
    const dots = page.locator(".pf-pager .pf-pager-dot");
    await expect(dots).toHaveCount(N);
    await dots.nth(N - 1).click();
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[N - 1]!.slug);
    await expect(dots.nth(N - 1)).toHaveAttribute("aria-current", "true");
    await expect(dots.nth(0)).not.toHaveAttribute("aria-current", "true");
  });

  test("the card has previous / next (looping) and a pager; URL follows and back/forward still work", async ({ page }) => {
    await open(page);
    const nav = info(page).locator(".pf-info-nav");
    await expect(nav.getByRole("button")).toHaveCount(2);
    await expect(info(page).locator(".pf-info-kicker .pf-info-count")).toHaveText(`01 / ${pad(N)}`);
    await nav.getByRole("button", { name: /^Next: / }).click();
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[1]!.slug);
    await expect(page).toHaveURL(new RegExp(`product=${PERSONAL[1]!.slug}`));
    await expect(info(page).locator(".pf-info-kicker .pf-info-count")).toHaveText(`02 / ${pad(N)}`);
    await expect(page.locator(".pf-count")).toHaveText(`02 / ${pad(N)}`);
    // focus stays on the control that was used (the card remounts per product)
    await expect(info(page).locator('[data-nav-key="next"]')).toBeFocused();
    await info(page).getByRole("button", { name: /^Previous: / }).click();
    await info(page).getByRole("button", { name: /^Previous: / }).click();
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[N - 1]!.slug); // wraps like the carousel
    const dots = info(page).locator(".pf-info-dot");
    await expect(dots).toHaveCount(N);
    await dots.nth(2).click();
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[2]!.slug);
    await expect(dots.nth(2)).toHaveAttribute("aria-current", "true");
    // card controls replace the URL (the existing convention): no history spam
    const before = await page.evaluate(() => history.length);
    await dots.nth(5).click();
    expect(await page.evaluate(() => history.length)).toBe(before);
    // the stage and the card agree (single coherent state)
    await expect(info(page).getByRole("heading", { level: 2 })).toContainText(PERSONAL[5]!.name);
    // ?product= deep link still selects; a popstate re-reads the URL
    await page.goto(`/projects?product=${PERSONAL[3]!.slug}`, { waitUntil: "load" });
    await hydrated(page);
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[3]!.slug);
  });

  test("←/→ step products from the card; not hijacked in inputs, with a selection, or on the video", async ({ page }) => {
    await open(page);
    await info(page).locator(".pf-info-name").click();
    await page.keyboard.press("ArrowRight");
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[1]!.slug);
    await info(page).locator('[data-nav-key="next"]').focus();
    await page.keyboard.press("ArrowLeft");
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
    // an editable field inside the card keeps its arrows
    await page.evaluate(() => {
      const input = document.createElement("input");
      input.id = "probe";
      document.querySelector(".pf-info")!.appendChild(input);
    });
    await page.locator("#probe").focus();
    await page.keyboard.press("ArrowRight");
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
    // the media stage is outside the card: arrows there do nothing to the selection
    await page.locator("#pf-stage-screen").dispatchEvent("keydown", { key: "ArrowRight", bubbles: true });
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
    // the carousel's own tablist still owns its arrows (one step, not two)
    await page.getByRole("tab", { selected: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[1]!.slug);
  });

  test("a sideways drag past the threshold steps; a short or mostly-vertical drag and a drag from a control do not", async ({ page }) => {
    await open(page);
    await page.evaluate(() => window.scrollTo(0, document.getElementById("pf-panel")!.getBoundingClientRect().top + window.scrollY - 140));
    await page.waitForTimeout(500);
    const box = (await info(page).locator(".pf-info-tagline").boundingBox())!;
    const y = box.y + box.height / 2;
    const x = box.x + 30;
    const drag = async (dx: number, dy: number, fromX = x, fromY = y) => {
      await page.mouse.move(fromX, fromY);
      await page.mouse.down();
      await page.mouse.move(fromX + dx / 2, fromY + dy / 2, { steps: 4 });
      await page.mouse.move(fromX + dx, fromY + dy, { steps: 4 });
      await page.mouse.up();
    };
    await drag(-30, 0);
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
    await drag(-120, 100);
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
    const btn = (await info(page).locator('[data-nav-key="next"]').boundingBox())!;
    await drag(-150, 0, btn.x + 22, btn.y + 22);
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
    await drag(-150, 5);
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[1]!.slug);
    await drag(150, -5, x, y);
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
  });

  test("a deliberate carousel click scrolls the video into view below the header, once; no scroll on load; no autoplay change", async ({ page }) => {
    await open(page);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.evaluate(() => window.scrollTo(0, document.querySelector(".pf-carousel")!.getBoundingClientRect().top + window.scrollY - 200));
    await page.waitForTimeout(500);
    const startY = await page.evaluate(() => window.scrollY);
    expect(startY).toBeGreaterThan(100);
    await page.getByRole("tab").nth(2).click();
    await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[2]!.slug);
    await page.waitForTimeout(1800);
    const seen = await page.evaluate(() => {
      const header = document.querySelector<HTMLElement>("header[data-site-header]")!.getBoundingClientRect().height;
      const r = document.getElementById("pf-stage-screen")!.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, header, vh: window.innerHeight, y: window.scrollY };
    });
    expect(seen.top).toBeGreaterThanOrEqual(seen.header - 1);
    expect(seen.bottom).toBeLessThanOrEqual(seen.vh + 1);
    expect(seen.y).toBeLessThan(startY);
    // one scroll per selection: it has settled
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(seen.y, -1);
    // arrows / keyboard browsing never yank the page
    const y0 = seen.y;
    await page.evaluate(() => window.scrollTo(0, window.scrollY + 120));
    await page.waitForTimeout(400);
    const y1 = await page.evaluate(() => window.scrollY);
    await page.locator(".pf-carousel").getByRole("button", { name: "Next product" }).evaluate((b) => (b as HTMLElement).click());
    await page.waitForTimeout(900);
    expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(y1, -1);
    expect(y1).not.toBe(y0);
  });

  test("reduced motion: the reveal is an instant jump", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page);
    await page.evaluate(() => window.scrollTo(0, document.querySelector(".pf-carousel")!.getBoundingClientRect().top + window.scrollY - 200));
    await page.waitForTimeout(300);
    const behaviour = await page.evaluate(() => {
      const calls: string[] = [];
      const orig = window.scrollTo.bind(window);
      window.scrollTo = ((...a: unknown[]) => {
        calls.push(String((a[0] as ScrollToOptions | undefined)?.behavior));
        return (orig as (...x: unknown[]) => void)(...a);
      }) as typeof window.scrollTo;
      (window as unknown as { __calls: string[] }).__calls = calls;
      return true;
    });
    expect(behaviour).toBe(true);
    await page.getByRole("tab").nth(1).click();
    await page.waitForTimeout(150);
    const calls = await page.evaluate(() => (window as unknown as { __calls: string[] }).__calls);
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every((c) => c === "auto")).toBe(true);
    const top = await page.evaluate(() => document.getElementById("pf-stage-screen")!.getBoundingClientRect().top);
    expect(top).toBeGreaterThan(0);
  });

  test("no horizontal overflow, the card nav clears the kicker and title", async ({ page }) => {
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const clear = await page.evaluate(() => {
      const nav = document.querySelector(".pf-info-nav")!.getBoundingClientRect();
      const k = document.querySelector(".pf-info-kicker")!;
      const kids = Array.from(k.children).map((c) => c.getBoundingClientRect());
      const name = document.querySelector(".pf-info-name")!.getBoundingClientRect();
      return { kicker: kids.every((r) => r.right <= nav.left + 1 || r.bottom <= nav.top || r.top >= nav.bottom), title: name.top >= nav.bottom - 2 };
    });
    expect(clear.kicker).toBe(true);
    expect(clear.title).toBe(true);
  });
});

for (const viewport of [{ width: 1024, height: 768 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
  test(`@${viewport.width} no horizontal overflow on every product`, async ({ page }) => {
    test.skip(w(page) !== 1440, "viewport is set explicitly below; run once");
    test.skip(VERTICAL_CAROUSEL_ENABLED, "TASK-301 experiment: covered by vertical-carousel.spec.ts while the flag is on");
    await page.setViewportSize(viewport);
    await open(page);
    for (let i = 0; i < N; i++) {
      await page.locator(".pf-pager .pf-pager-dot").nth(i).evaluate((b) => (b as HTMLElement).click());
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    }
  });
}

test.describe("below the desktop breakpoint", () => {
  test.beforeEach(({ page }) => {
    test.skip(w(page) >= 1024, "phone / tablet only");
  });

  test("none of the new controls exist in the DOM, so none can be focused or announced", async ({ page }) => {
    await page.goto("/projects", { waitUntil: "load" });
    await page.waitForTimeout(800);
    for (const sel of [".pf-pager", ".pf-pager-dot", ".pf-info-nav", ".pf-info-arrow", ".pf-info-pager", ".pf-info-dot"]) {
      await expect(page.locator(sel)).toHaveCount(0);
    }
    await expect(page.locator("[data-rel]")).toHaveCount(0);
    // the count keeps its existing unpadded form
    if (w(page) >= 640) await expect(page.locator(".pf-count")).toHaveText(`1 / ${N}`);
  });
});

test("phone: opening a product from the list still opens its detail (no swipe, no new controls)", async ({ page }) => {
  test.skip(w(page) !== 390, "phone only");
  await page.goto("/projects", { waitUntil: "load" });
  await page.waitForTimeout(600);
  await page.locator(".pf-m-card").nth(1).click();
  await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[1]!.slug);
  await page.waitForTimeout(500);
  // the existing detail already opens at the top with the video on screen under the header (scroll-to-video is met without new code)
  const stage = await page.evaluate(() => {
    const h = document.querySelector<HTMLElement>("header[data-site-header]")?.getBoundingClientRect().bottom ?? 0;
    const r = document.getElementById("pf-stage-screen")!.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, h, vh: window.innerHeight };
  });
  expect(stage.top).toBeGreaterThanOrEqual(0);
  expect(stage.bottom).toBeLessThanOrEqual(stage.vh);
  await expect(page.locator(".pf-info-nav, .pf-info-pager")).toHaveCount(0);
  const y = await page.evaluate(() => window.scrollY);
  await page.touchscreen.tap(200, 400).catch(() => {});
  const x0 = 320;
  await page.mouse.move(x0, 500);
  await page.mouse.down();
  await page.mouse.move(x0 - 200, 505, { steps: 6 });
  await page.mouse.up();
  await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[1]!.slug);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(typeof y).toBe("number");
});
