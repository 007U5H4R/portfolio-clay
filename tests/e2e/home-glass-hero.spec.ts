/**
 * home-glass-hero.spec.ts (TASK-289 test) — the integrated frosted-glass home hero, behind
 * `HOME_GLASS_HERO_ENABLED` (components/hero/home-glass-flag.ts). Flag ON: these assertions run. Flag OFF: they
 * skip, the older home specs (home / hero-fold / tracer ...) assert the previous hero, and
 * tests/unit/home-glass-hero.test.tsx renders both branches.
 *
 * With HG_CROPS=<tag> set it also writes review screenshots to /Volumes/E Drive/Dev/.scratch/home-glass/crops.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { HOME_GLASS_HERO_ENABLED } from "@/components/hero/home-glass-flag";

test.skip(!HOME_GLASS_HERO_ENABLED, "TASK-289: the glass hero is switched off (HOME_GLASS_HERO_ENABLED = false)");

const COPY = {
  eyebrow: "AI PRODUCT MANAGER · BUILDER",
  headline: "I turn complex ideas into products that matter.",
  support: "Building AI-powered products for real people, from enterprise systems to indie experiments.",
  primary: "Explore my work →",
  secondary: "Let's connect",
};
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const panel = (page: Page) => page.locator("[data-hero-glass]");

async function setTheme(page: Page, theme: "light" | "dark") {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("portfolio-theme", t);
    } catch {
      /* private mode */
    }
  }, theme);
}

async function settle(page: Page) {
  await page.goto("/", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  // The art: wait for the lead layers to be decoded before measuring anything against them.
  await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll<HTMLImageElement>(".hero-banner [data-paper-scene] img")].filter((i) => i.loading === "eager");
    await Promise.all(imgs.map(async (i) => { if (!i.complete) await new Promise((r) => { i.onload = i.onerror = r; }); await i.decode().catch(() => {}); }));
  });
}

test("copy: exactly the specified strings, one h1, nothing else in the panel", async ({ page }) => {
  await settle(page);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText(COPY.headline);
  const p = panel(page);
  await expect(p).toHaveCount(1);
  await expect(p.locator(".hero-glass-eyebrow")).toHaveText(COPY.eyebrow);
  await expect(p.locator(".hero-glass-support")).toHaveText(COPY.support);
  await expect(p.getByRole("link")).toHaveText([COPY.primary, COPY.secondary]);
  // eyebrow, h1, support, CTA row — and no images, svg, extra paragraphs or labels.
  expect(await p.evaluate((el) => [...el.children].map((c) => c.tagName + "." + c.className))).toEqual([
    "P.hero-glass-eyebrow",
    "H1.hero-glass-h1",
    "P.hero-glass-support",
    "DIV.hero-glass-cta",
  ]);
  await expect(p.locator("img, svg, picture")).toHaveCount(0);
  await expect(page.locator(".hero-intro, .hero-hand-sub, .hero-tushky")).toHaveCount(0);
});

test("art untouched: the four layers keep their order and depths; the panel is outside the scene root", async ({ page }) => {
  await settle(page);
  const layers = await page.locator(".hero-banner [data-paper-scene] > [data-layer]").evaluateAll((els) => els.map((e) => [e.getAttribute("data-layer"), e.getAttribute("data-depth")]));
  expect(layers).toEqual([["bg", "0.05"], ["subject", "0.22"], ["fg", "0.4"], ["details", "0.6"]]);
  expect(await page.locator("[data-paper-scene] [data-hero-glass]").count()).toBe(0);
  await expect(page.locator(".hero-polaroid")).toHaveCount(3);
});

test("placement: clear of the face, the laptop and the dog; never covers the art when stacked", async ({ page }) => {
  await settle(page);
  const { scene, box } = await page.evaluate(() => {
    const r = (s: string) => { const b = document.querySelector(s)!.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
    return { scene: r(".hero-banner [data-paper-scene]"), box: r("[data-hero-glass]") };
  });
  // Art regions as fractions of the whole 2400×1029 scene (measured on the layered art).
  const regions = { face: [0.44, 0.07, 0.57, 0.35], laptopScreen: [0.46, 0.5, 0.67, 0.8], dog: [0.73, 0.5, 1, 0.97] } as const;
  const overlap = (f: readonly [number, number, number, number]) => {
    const [fx0, fy0, fx1, fy1] = [scene.x + f[0] * scene.w, scene.y + f[1] * scene.h, scene.x + f[2] * scene.w, scene.y + f[3] * scene.h];
    return box.x < fx1 && box.x + box.w > fx0 && box.y < fy1 && box.y + box.h > fy0;
  };
  if (width(page) >= 1000) {
    for (const [name, f] of Object.entries(regions)) expect(overlap(f), `panel overlaps the ${name}`).toBe(false);
    expect(box.x).toBeGreaterThanOrEqual(scene.x);
    expect(box.x + box.w).toBeLessThanOrEqual(scene.x + scene.w * 0.45);
  } else {
    // Stacked under the art: at most the art's torn bottom strip (12 px) is overlapped.
    expect(box.y).toBeGreaterThanOrEqual(scene.y + scene.h - 12);
  }
  expect(box.w, "compact: never full-bleed").toBeLessThanOrEqual(Math.min(width(page) - 16, 660));
});

test("the panel takes pointer events only inside its own box", async ({ page }) => {
  test.skip(width(page) < 1000, "overlay layout only");
  await settle(page);
  const b = (await panel(page).boundingBox())!;
  const hit = (x: number, y: number) => page.evaluate(([px = 0, py = 0]) => !!document.elementFromPoint(px, py)?.closest("[data-hero-glass]"), [x, y]);
  expect(await hit(b.x + b.width / 2, b.y + 8)).toBe(true);
  expect(await hit(b.x + b.width + 6, b.y + b.height / 2)).toBe(false);
  expect(await hit(b.x + b.width / 2, b.y + b.height + 6)).toBe(false);
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: glass surface, readable, axe-clean, no overflow, targets ≥ 44px`, async ({ page, axe, noOverflow }) => {
    await setTheme(page, theme);
    await settle(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const s = await panel(page).evaluate((el) => {
      const c = getComputedStyle(el);
      return { blur: c.backdropFilter || c.getPropertyValue("-webkit-backdrop-filter"), bg: c.backgroundColor, radius: c.borderTopLeftRadius, border: c.borderTopWidth };
    });
    expect(s.blur).toContain("blur(");
    expect(s.bg).toMatch(/\//); // a translucent colour (alpha channel), not a solid fill
    expect(Number.parseFloat(s.radius)).toBeGreaterThanOrEqual(16);
    expect(s.border).toBe("1px");
    await axe(page, { include: "section.hero" });
    await noOverflow(page);
    for (const link of await panel(page).getByRole("link").all()) {
      const box = (await link.boundingBox())!;
      expect(box.height, "CTA height").toBeGreaterThanOrEqual(44);
      expect(box.width, "CTA width").toBeGreaterThanOrEqual(44);
    }
  });
}

test("Explore my work: same tab, URL unchanged, lands on the Selected work heading below the header", async ({ page }) => {
  await settle(page);
  const url = page.url();
  const pagesBefore = page.context().pages().length;
  await panel(page).getByRole("link", { name: COPY.primary }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 8000 }).toBeGreaterThan(200);
  // let the (possibly eased) scroll come to rest
  let last = -1;
  await expect.poll(async () => { const y = await page.evaluate(() => window.scrollY); const done = Math.abs(y - last) < 1; last = y; return done; }, { timeout: 8000, intervals: [250] }).toBe(true);
  expect(page.url()).toBe(url);
  expect(page.context().pages().length).toBe(pagesBefore);
  const { top, header } = await page.evaluate(() => ({
    top: document.getElementById("selected-work-heading")!.getBoundingClientRect().top,
    header: document.querySelector("header[data-site-header]")!.getBoundingClientRect().bottom,
  }));
  expect(top, "Selected work heading sits below the sticky header").toBeGreaterThanOrEqual(header);
  await expect(page.locator("#selected-work-heading")).toBeInViewport();
  // parallax still runs: the hero banner is still driven by the scroll timeline
  expect(await page.evaluate(() => getComputedStyle(document.querySelector(".hero-banner")!).animationName)).toContain("scene-parallax");
});

test("Explore my work: keyboard activation, visible focus ring", async ({ page }) => {
  test.skip(width(page) < 640, "keyboard path is covered on the desktop projects");
  await settle(page);
  const link = panel(page).getByRole("link", { name: COPY.primary });
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    if (await link.evaluate((el) => el === document.activeElement)) break;
  }
  await expect(link).toBeFocused();
  const ring = await link.evaluate((el) => { const c = getComputedStyle(el); return { style: c.outlineStyle, w: Number.parseFloat(c.outlineWidth) }; });
  expect(ring.style).not.toBe("none");
  expect(ring.w).toBeGreaterThanOrEqual(2);
  const url = page.url();
  await page.keyboard.press("Enter");
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 8000 }).toBeGreaterThan(200);
  expect(page.url()).toBe(url);
});

test("Explore my work under prefers-reduced-motion: an instant jump", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1024, height: 768 } });
  const page = await ctx.newPage();
  await settle(page);
  const url = page.url();
  await panel(page).getByRole("link", { name: COPY.primary }).click();
  // instant: within two frames the page is already at the destination, with no easing in between
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const { y, top, header } = await page.evaluate(() => ({
    y: window.scrollY,
    top: document.getElementById("selected-work-heading")!.getBoundingClientRect().top,
    header: document.querySelector("header[data-site-header]")!.getBoundingClientRect().bottom,
  }));
  expect(y).toBeGreaterThan(200);
  expect(top).toBeGreaterThanOrEqual(header);
  expect(page.url()).toBe(url);
  await ctx.close();
});

test("Let's connect: the site's existing /contact destination, same behaviour as the header pill", async ({ page }) => {
  await settle(page);
  const link = panel(page).getByRole("link", { name: COPY.secondary });
  await expect(link).toHaveAttribute("href", "/contact");
  await expect(link).not.toHaveAttribute("target", /.+/);
  await link.click();
  await expect(page).toHaveURL(/\/contact$/);
});

test("no layout shift from the hero on load", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __cls: { value: number; hero: number } }).__cls = { value: 0, hero: 0 };
    new PerformanceObserver((list) => {
      const cls = (window as unknown as { __cls: { value: number; hero: number } }).__cls;
      for (const e of list.getEntries() as unknown as { hadRecentInput: boolean; value: number; sources?: { node?: Node }[] }[]) {
        if (e.hadRecentInput) continue;
        cls.value += e.value;
        if (e.sources?.some((s) => s.node && (s.node as Element).closest?.(".hero"))) cls.hero += e.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await settle(page);
  await page.waitForTimeout(1500);
  const cls = await page.evaluate(() => (window as unknown as { __cls: { value: number; hero: number } }).__cls);
  expect(cls.hero, `hero layout shift ${cls.hero}`).toBeLessThan(0.01);
});

// ---- review crops (HG_CROPS=<tag>) ----
const OUT = "/Volumes/E Drive/Dev/.scratch/home-glass/crops";
for (const theme of ["light", "dark"] as const) {
  test(`crop ${theme}`, async ({ browser }) => {
    test.skip(!process.env.HG_CROPS, "review crops only with HG_CROPS=<tag>");
    test.setTimeout(120_000);
    for (const [w, h] of [[375, 812], [768, 1024], [1024, 768], [1440, 900]] as const) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: w < 768, hasTouch: w < 768 });
      const page = await ctx.newPage();
      await setTheme(page, theme);
      await settle(page);
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${OUT}/${process.env.HG_CROPS}-${w}-${theme}.png` });
      if (process.env.HG_CROPS === "after" && (w === 375 || w === 1440) && theme === "light") {
        await panel(page).getByRole("link", { name: COPY.primary }).click();
        await page.waitForTimeout(2500);
        await page.screenshot({ path: `${OUT}/after-explore-${w}-${theme}.png` });
      }
      await ctx.close();
    }
  });
}
