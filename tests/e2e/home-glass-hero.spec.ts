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
  eyebrow: "PRODUCT MANAGER · AI BUILDER",
  headline: "I turn complex ideas into products that matter.",
  support: "Building AI-powered products for real people, from enterprise systems to indie experiments.",
  primary: "Explore my work →",
  secondary: "Let's connect",
};
const width = (page: Page) => page.viewportSize()?.width ?? 0;
/** The glass hero shows from the site's desktop tier up (1024); below it the previous hero shows, unchanged. */
const GLASS_MIN = 1024;
const glassOnly = (page: Page) => test.skip(width(page) < GLASS_MIN, "TASK-289 is desktop-only: the glass hero shows from 1024 up");
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

test("below 1024 the previous hero shows, unchanged: one h1 (the old one), no glass panel", async ({ page }) => {
  test.skip(width(page) >= GLASS_MIN, "phone and tablet only");
  await settle(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("AI-native products");
  await expect(panel(page)).toBeHidden();
  await expect(page.locator(".hero-intro")).toBeVisible();
  await expect(page.locator(".hero-cta-row").getByRole("link", { name: /View my work/ })).toBeVisible();
  await expect(page.locator(".hero-cta-row").getByRole("link", { name: "Ask Tushky" })).toBeVisible();
  expect(await page.evaluate(() => [...document.querySelectorAll("[id]")].map((e) => e.id).filter((id, i, a) => a.indexOf(id) !== i))).toEqual([]);
  await noOverflowCheck(page);
});

async function noOverflowCheck(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

test("copy: exactly the specified strings, one h1 in the accessibility tree, nothing else in the panel", async ({ page }) => {
  glassOnly(page);
  await settle(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(COPY.headline);
  // the previous hero's h1 is in the HTML but display:none, so out of the accessibility tree; ids stay unique
  await expect(page.locator("#hero-h")).toBeHidden();
  expect(await page.evaluate(() => [...document.querySelectorAll("[id]")].map((e) => e.id).filter((id, i, a) => a.indexOf(id) !== i))).toEqual([]);
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
  await expect(page.locator(".hero-intro, .hero-hand-sub, .hero-tushky, .hero-cta-row").locator("visible=true")).toHaveCount(0);
});

test("art untouched: the four layers keep their order and depths; the panel is outside the scene root", async ({ page }) => {
  await settle(page);
  const layers = await page.locator(".hero-banner [data-paper-scene] > [data-layer]").evaluateAll((els) => els.map((e) => [e.getAttribute("data-layer"), e.getAttribute("data-depth")]));
  expect(layers).toEqual([["bg", "0.05"], ["subject", "0.22"], ["fg", "0.4"], ["details", "0.6"]]);
  expect(await page.locator("[data-paper-scene] [data-hero-glass]").count()).toBe(0);
  await expect(page.locator(".hero-polaroid")).toHaveCount(3);
});

test("placement: clear of the face, the laptop and the dog", async ({ page }) => {
  glassOnly(page);
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
  for (const [name, f] of Object.entries(regions)) expect(overlap(f), `panel overlaps the ${name}`).toBe(false);
  expect(box.x).toBeGreaterThanOrEqual(scene.x);
  expect(box.x + box.w).toBeLessThanOrEqual(scene.x + scene.w * 0.45);
  expect(box.w, "compact: never full-bleed").toBeLessThanOrEqual(Math.min(width(page) - 16, 660));
});

test("the panel takes pointer events only inside its own box", async ({ page }) => {
  glassOnly(page);
  await settle(page);
  const b = (await panel(page).boundingBox())!;
  const hit = (x: number, y: number) => page.evaluate(([px = 0, py = 0]) => !!document.elementFromPoint(px, py)?.closest("[data-hero-glass]"), [x, y]);
  expect(await hit(b.x + b.width / 2, b.y + 8)).toBe(true);
  expect(await hit(b.x + b.width + 6, b.y + b.height / 2)).toBe(false);
  expect(await hit(b.x + b.width / 2, b.y + b.height + 6)).toBe(false);
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: glass surface, readable, axe-clean, no overflow, targets ≥ 44px`, async ({ page, axe, noOverflow }) => {
    glassOnly(page);
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

test("Explore my work: same tab, URL unchanged, lands on the Credentials heading below the header", async ({ page }) => {
  glassOnly(page);
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
    top: document.getElementById("credentials-heading")!.getBoundingClientRect().top,
    header: document.querySelector("header[data-site-header]")!.getBoundingClientRect().bottom,
  }));
  expect(top, "Credentials heading sits below the sticky header").toBeGreaterThanOrEqual(header);
  await expect(page.locator("#credentials-heading")).toBeInViewport();
  // parallax still runs: the hero banner is still driven by the scroll timeline
  expect(await page.evaluate(() => getComputedStyle(document.querySelector(".hero-banner")!).animationName)).toContain("scene-parallax");
});

test("Explore my work: keyboard activation, visible focus ring", async ({ page }) => {
  glassOnly(page);
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
    top: document.getElementById("credentials-heading")!.getBoundingClientRect().top,
    header: document.querySelector("header[data-site-header]")!.getBoundingClientRect().bottom,
  }));
  expect(y).toBeGreaterThan(200);
  expect(top).toBeGreaterThanOrEqual(header);
  expect(page.url()).toBe(url);
  await ctx.close();
});

test("Let's connect: the site's existing /contact destination, same behaviour as the header pill", async ({ page }) => {
  glassOnly(page);
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

// ---- TASK-289 V2: footprint, contrast, art unchanged ----
/** Panel height at 1440 before V2 (TASK-289 #127, measured on the live page): 300.3 px (1024: 237.6 px). */
const OLD_PANEL_H_1440 = 300.3;

test("V2 footprint: the panel is at most 88% of its old height at 1440", async ({ page }) => {
  glassOnly(page);
  test.skip(width(page) !== 1440, "measured at 1440");
  await settle(page);
  const h = (await panel(page).boundingBox())!.height;
  expect(h, `panel height ${h} vs old ${OLD_PANEL_H_1440}`).toBeLessThanOrEqual(OLD_PANEL_H_1440 * 0.88);
});

/** Contrast of the text against the panel's composited background, sampled from real pixels with the text hidden. */
for (const theme of ["light", "dark"] as const) {
  test(`V2 contrast (${theme}): headline ≥ 3:1, body text ≥ 4.5:1 over the art`, async ({ page }) => {
    glassOnly(page);
    await setTheme(page, theme);
    await settle(page);
    await page.waitForTimeout(800);
    const targets = [
      { sel: ".hero-glass-h1", min: 3 },
      { sel: ".hero-glass-eyebrow", min: 4.5 },
      { sel: ".hero-glass-support", min: 4.5 },
    ];
    await page.addStyleTag({ content: ".hero-glass-on .hero-glass :is(.hero-glass-h1,.hero-glass-eyebrow,.hero-glass-support){color:transparent!important}" });
    const out: string[] = [];
    for (const t of targets) {
      const r = await page.evaluate(async (sel) => {
        const el = document.querySelector(sel)!;
        const range = document.createRange();
        range.selectNodeContents(el);
        const rects = [...range.getClientRects()].map((b) => ({ x: b.x, y: b.y, w: b.width, h: b.height }));
        return rects;
      }, t.sel);
      let worst = Infinity;
      for (const rc of r) {
        const buf = await page.screenshot({ clip: { x: rc.x, y: rc.y, width: Math.max(1, rc.w), height: Math.max(1, rc.h) } });
        const lum = await page.evaluate(async ([b64, sel]) => {
          const bytes = Uint8Array.from(atob(b64 as string), (c) => c.charCodeAt(0));
          const bmp = await createImageBitmap(new Blob([bytes]));
          const cv = new OffscreenCanvas(bmp.width, bmp.height);
          const ctx = cv.getContext("2d")!;
          ctx.drawImage(bmp, 0, 0);
          const d = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
          const lin = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
          const L = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
          // text colour comes from the stylesheet (the transparent override is !important, so read the token the rule uses)
          const px = new OffscreenCanvas(1, 1).getContext("2d")!;
          const probe = document.createElement("span");
          probe.style.color = (sel as string).includes("support") ? "var(--color-navy-2)" : "var(--color-navy)";
          document.body.appendChild(probe);
          px.fillStyle = getComputedStyle(probe).color; // any CSS colour syntax (srgb / oklab) -> canvas resolves it
          probe.remove();
          px.fillRect(0, 0, 1, 1);
          const m = [...px.getImageData(0, 0, 1, 1).data];
          const lt = L(m[0]!, m[1]!, m[2]!);
          const ratios: number[] = [];
          for (let i = 0; i < d.length; i += 4) {
            const lb = L(d[i]!, d[i + 1]!, d[i + 2]!);
            const [hi, lo] = lb > lt ? [lb, lt] : [lt, lb];
            ratios.push((hi + 0.05) / (lo + 0.05));
          }
          ratios.sort((a, b) => a - b);
          return ratios[Math.floor(ratios.length * 0.01)]!; // 1st percentile: the worst 1% of pixels
        }, [buf.toString("base64"), t.sel] as [string, string]);
        worst = Math.min(worst, lum);
      }
      out.push(`${t.sel}=${worst.toFixed(2)}`);
      expect(worst, `${theme} ${t.sel} contrast ${worst.toFixed(2)}`).toBeGreaterThanOrEqual(t.min);
    }
    console.log(`CONTRAST ${theme} ${width(page)} ${out.join(" ")}`);
  });
}

test("V2 art unchanged: the banner's pixels with the glass rules on equal the flag-off look (panel hidden both times)", async ({ page }) => {
  glassOnly(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await settle(page);
  await page.waitForTimeout(800);
  const banner = page.locator(".hero-banner");
  await page.addStyleTag({ content: "[data-hero-glass]{display:none!important}" });
  const on = await banner.screenshot();
  await page.evaluate(() => document.querySelector("section.hero")!.classList.remove("hero-glass-on"));
  await page.waitForTimeout(300);
  const off = await banner.screenshot();
  const stat = await page.evaluate(async ([a, b]) => {
    const load = async (s: string) => {
      const bmp = await createImageBitmap(new Blob([Uint8Array.from(atob(s), (c) => c.charCodeAt(0))]));
      const cv = new OffscreenCanvas(bmp.width, bmp.height);
      const ctx = cv.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0);
      return ctx.getImageData(0, 0, bmp.width, bmp.height);
    };
    const [x, y] = [await load(a as string), await load(b as string)];
    if (x.width !== y.width || x.height !== y.height) return { size: false, bad: 1, max: 255, a: [x.width, x.height], b: [y.width, y.height] };
    let bad = 0, max = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    const rows = x.height - 44; // the sheet's 44px torn edge overlaps the banner bottom; that strip is the sheet, not the art
    for (let i = 0; i < rows * x.width * 4; i += 4) {
      const dm = Math.max(Math.abs(x.data[i]! - y.data[i]!), Math.abs(x.data[i + 1]! - y.data[i + 1]!), Math.abs(x.data[i + 2]! - y.data[i + 2]!));
      max = Math.max(max, dm);
      if (dm > 6) { bad++; const q = i / 4; const cx = q % x.width, cy = Math.floor(q / x.width); x0 = Math.min(x0, cx); x1 = Math.max(x1, cx); y0 = Math.min(y0, cy); y1 = Math.max(y1, cy); }
    }
    return { size: true, bad: bad / (x.width * rows), max, box: [x0, y0, x1, y1] };
  }, [on.toString("base64"), off.toString("base64")] as [string, string]);
  console.log(`ART-DIFF ${width(page)} ${JSON.stringify(stat)}`);
  expect(stat.size).toBe(true);
  expect(stat.bad, "fraction of pixels differing by > 6/255").toBeLessThan(0.001);
});

// ---- review crops (HG_CROPS=<tag>) ----
const OUT = "/Volumes/E Drive/Dev/.scratch/home-glass/crops-v2";
for (const theme of ["light", "dark"] as const) {
  test(`crop ${theme}`, async ({ browser }) => {
    test.skip(!process.env.HG_CROPS, "review crops only with HG_CROPS=<tag>");
    test.setTimeout(120_000);
    for (const [w, h] of [[1024, 768], [1440, 900]] as const) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, });
      const page = await ctx.newPage();
      await setTheme(page, theme);
      await settle(page);
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${OUT}/${process.env.HG_CROPS}-${w}-${theme}.png` });
      const pb = await panel(page).boundingBox();
      console.log(`PANEL ${process.env.HG_CROPS} ${w} ${theme} h=${pb?.height.toFixed(1)} w=${pb?.width.toFixed(1)}`);
      if (process.env.HG_CROPS === "after" && w === 1440) {
        await panel(page).getByRole("link", { name: COPY.primary }).click();
        await page.waitForTimeout(2500);
        await page.screenshot({ path: `${OUT}/after-explore-${w}-${theme}.png` });
      }
      await ctx.close();
    }
  });
}
