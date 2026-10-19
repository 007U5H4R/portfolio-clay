/**
 * nuptis-next-art.spec.ts (TASK-275) — the Nuptis next-project band shows the Bhakti Vilas artwork,
 * one WebP per theme, crisp at 2x, with the link unchanged; other studies' bands carry no art.
 * TASK-279 adds: the supporting line, the cream light band / navy dark band, AA text contrast, other studies' bands unchanged
 * (no line, no tone, navy), and no horizontal overflow at 375 / 414 / 768 / 1440.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const setTheme = (page: Page, theme: "light" | "dark") =>
  page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
const band = (page: Page) => page.locator('section[aria-label="Next project"]');

for (const theme of ["light", "dark"] as const) {
  test(`nuptis next band · ${theme}: correct art, link unchanged, ≥2x natural width`, async ({ page }) => {
    await page.goto("/work/nuptis", { waitUntil: "load" });
    await setTheme(page, theme);
    await band(page).scrollIntoViewIfNeeded();
    const img = band(page).locator(`img.cs-next-art-${theme}`);
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("src", new RegExp(`bhakti-next-${theme}\\.webp$`));
    await expect(band(page).locator(`img.cs-next-art-${theme === "light" ? "dark" : "light"}`)).toBeHidden();
    await expect(band(page).locator("a")).toHaveAttribute("href", "/work/bhakti-vilas");
    await expect(band(page).locator("h2")).toContainText("Bhakti Vilas");
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
    const m = await img.evaluate((el: HTMLImageElement) => ({ natural: el.naturalWidth, shown: el.getBoundingClientRect().width }));
    expect(m.natural).toBeGreaterThanOrEqual(m.shown * 2);
  });
}

test("other case studies' next bands have no artwork", async ({ page }) => {
  await page.goto("/work/teachspark", { waitUntil: "load" });
  await expect(band(page).locator(".cs-next-art")).toHaveCount(0);
});

/* ---- TASK-279: supporting line + cream light tone ---- */
const LINE = "Devotion-led wellbeing, with health monitored and cared for.";
type Rgb = [number, number, number];
const lum = ([r, g, b]: Rgb) => {
  const f = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: Rgb, b: Rgb) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x! + 0.05) / (y! + 0.05); };

/** Resolved sRGB of the band's painted pieces (a canvas normalises oklch/oklab/color-mix to rgb). */
async function bandStyles(page: Page) {
  return band(page).evaluate((el) => {
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
    const rgb = (css: string): [number, number, number] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000";
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0]!, d[1]!, d[2]!];
    };
    const tok = (name: string) => { const p = document.createElement("i"); p.style.color = `var(${name})`; document.body.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return rgb(c); };
    const col = (s: string) => { const n = el.querySelector(s); if (!n) throw new Error(`band is missing ${s}`); return rgb(getComputedStyle(n).color); };
    const opt = (s: string) => (el.querySelector(s) ? col(s) : null);
    // the painted surface is the section's background-image gradient (one flat colour)
    const probe = document.createElement("i");
    probe.style.color = getComputedStyle(el).backgroundImage.replace(/^linear-gradient\(/, "").split(/,(?![^(]*\))/)[0]!.trim();
    document.body.appendChild(probe);
    const surface = rgb(getComputedStyle(probe).color);
    probe.remove();
    const front = el.querySelector(".torn-front");
    const ring = rgb(getComputedStyle(el.querySelector("a")!).outlineColor);
    return {
      surface, ring,
      front: front ? rgb(getComputedStyle(front).fill) : null,
      h: col(".cs-next-h"), eyebrow: col(".cs-next-eyebrow"), note: col(".cs-next-note"), line: opt(".cs-next-line"),
      paper: tok("--color-paper"), navy: tok("--color-navy"), rust: tok("--color-rust"), ivory: tok("--color-ivory"),
    };
  });
}

test.describe("TASK-279 · nuptis band line + tone", () => {
  test("light: cream band, ink text AA, torn edge cream; dark: navy band", async ({ page }) => {
    await page.goto("/work/nuptis", { waitUntil: "load" });
    await band(page).scrollIntoViewIfNeeded();
    await expect(band(page).locator(".cs-next-line")).toHaveText(LINE);
    await expect(band(page)).toHaveAttribute("data-tone", "cream");

    await setTheme(page, "light");
    const l = await bandStyles(page);
    expect(l.surface).toEqual(l.paper); // cream = the paper token (#f7f1e7)
    expect(l.front).toEqual(l.paper);
    expect(l.surface[0]).toBeGreaterThan(230); // cream, not navy
    for (const k of ["h", "eyebrow", "line", "note"] as const) expect(ratio(l[k]!, l.surface), `light ${k}`).toBeGreaterThanOrEqual(4.5);

    await setTheme(page, "dark");
    const d = await bandStyles(page);
    expect(d.surface).toEqual(d.ivory); // dark band = the lifted-navy card tone, as today
    expect(d.surface[0]).toBeLessThan(60);
    for (const k of ["h", "eyebrow", "line", "note"] as const) expect(ratio(d[k]!, d.surface), `dark ${k}`).toBeGreaterThanOrEqual(4.5);
  });

  test("light focus ring is rust (AA on cream)", async ({ page }) => {
    await page.goto("/work/nuptis", { waitUntil: "load" });
    await setTheme(page, "light");
    await band(page).locator("a").focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    const l = await bandStyles(page);
    expect(l.ring).toEqual(l.rust);
    expect(ratio(l.ring, l.surface)).toBeGreaterThanOrEqual(3);
  });

  for (const slug of ["cubicle", "slag-city"]) {
    test(`${slug}: band unchanged (no line, no tone, navy in light, lifted navy in dark)`, async ({ page }) => {
      await page.goto(`/work/${slug}`, { waitUntil: "load" });
      await band(page).scrollIntoViewIfNeeded();
      await expect(band(page).locator(".cs-next-line")).toHaveCount(0);
      expect(await band(page).getAttribute("data-tone")).toBeNull();
      await setTheme(page, "light");
      const l = await bandStyles(page);
      expect(l.surface).toEqual(l.navy);
      expect(l.front).toEqual(l.navy);
      expect(l.h).toEqual(l.ivory);
      await setTheme(page, "dark");
      const d = await bandStyles(page);
      expect(d.surface).toEqual(d.ivory);
    });
  }

  for (const width of [375, 414, 768, 1440]) {
    test(`no horizontal overflow at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work/nuptis", { waitUntil: "load" });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        await band(page).scrollIntoViewIfNeeded();
        const o = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
        expect(o.s).toBeLessThanOrEqual(o.c);
      }
    });
  }
});
