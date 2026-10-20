/**
 * nuptis-next-art.spec.ts (TASK-275) — the Nuptis next-project band shows the Bhakti Vilas artwork,
 * one WebP per theme, crisp at 2x, with the link unchanged; other studies' bands carry no art.
 * TASK-279 adds: the supporting line, the cream light band / navy dark band, AA text contrast, other studies' bands unchanged
 * (no line, no tone, navy), and no horizontal overflow at 375 / 414 / 768 / 1440.
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import sharp from "sharp";

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
const LINE = "Devotion-led wellbeing"; // TASK-292: the product's one-liner (nextLine in data/portfolio.ts)
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
      h: col(".cs-next-h"), eyebrow: col(".cs-next-eyebrow"), note: opt(".cs-next-note"), line: opt(".cs-next-line"),
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
    expect(l.surface).toEqual([0xf7, 0xf0, 0xe7]); // the art's decoded field; one green level under the paper token (#f7f1e7)
    for (let c = 0; c < 3; c++) expect(Math.abs(l.surface[c]! - l.paper[c]!)).toBeLessThanOrEqual(1);
    expect(l.front).toEqual(l.surface);
    expect(l.note).toBeNull(); // the supporting line replaces "next up"
    for (const k of ["h", "eyebrow", "line"] as const) expect(ratio(l[k]!, l.surface), `light ${k}`).toBeGreaterThanOrEqual(4.5);

    await setTheme(page, "dark");
    const d = await bandStyles(page);
    expect(d.surface).toEqual(d.ivory); // dark band = the lifted-navy card tone, as today
    expect(d.surface[0]).toBeLessThan(60);
    for (const k of ["h", "eyebrow", "line"] as const) expect(ratio(d[k]!, d.surface), `dark ${k}`).toBeGreaterThanOrEqual(4.5);
  });

  test("unfocused band link has no outline or box-shadow (the rust line in crops is the fixed reading-progress bar)", async ({ page }) => {
    await page.goto("/work/nuptis", { waitUntil: "load" });
    for (const theme of ["light", "dark"] as const) {
      await setTheme(page, theme);
      await band(page).scrollIntoViewIfNeeded();
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.mouse.move(2, 2);
      const st = await band(page).locator("a").evaluate((el) => { const c = getComputedStyle(el); return { outline: c.outlineStyle, width: c.outlineWidth, shadow: c.boxShadow }; });
      expect(st.outline === "none" || st.width === "0px", `${theme} outline`).toBe(true);
      expect(st.shadow, `${theme} box-shadow`).toBe("none");
    }
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

  // TASK-282: slag-city now carries The Shravan's Round line (still a navy band); tested in slag-city-paper.spec.ts
  for (const slug of ["cubicle", "token-toli"]) {
    test(`${slug}: band is the next product's own band (TASK-290: its art and cream tone from NEXT_BAND_ART; TASK-292: its one-liner)`, async ({ page }) => {
      await page.goto(`/work/${slug}`, { waitUntil: "load" });
      await band(page).scrollIntoViewIfNeeded();
      await expect(band(page).locator(".cs-next-line")).toHaveCount(1);
      await expect(band(page).locator(".cs-next-note")).toHaveCount(0); // the one-liner replaced "next up" on every band (TASK-292)
      expect(await band(page).getAttribute("data-tone")).toBe("cream"); // Campfire Board / Pratyasa bands are painted on the cream surface
      await expect(band(page).locator(".cs-next-art")).toHaveCount(1);
      await setTheme(page, "light");
      const l = await bandStyles(page);
      expect(l.surface).toEqual([0xf7, 0xf0, 0xe7]);
      expect(l.front).toEqual(l.surface);
      await setTheme(page, "dark");
      const d = await bandStyles(page);
      expect(d.surface).toEqual(d.ivory);
    });
  }

  for (const slug of ["cubicle", "nuptis", "tegaki"]) {
    test(`${slug}: dark band has no light strip above it`, async ({ page }) => {
      await page.goto(`/work/${slug}`, { waitUntil: "load" });
      await setTheme(page, "dark");
      await band(page).scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      const d = await bandStyles(page);
      expect(d.front).toEqual(d.surface); // the torn front is the band's own colour, not the cream --color-navy
      // pixel probe: the bottom row of the torn edge (all front, no ridge) matches the band, across the width
      const box = (await band(page).boundingBox())!;
      const y = Math.round(box.y + 42);
      const shot = await page.screenshot({ clip: { x: 0, y, width: 1280, height: 1 } });
      const { data: bytes, info } = await sharp(shot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      let worst = 0;
      for (let i = 0; i < info.width; i++) for (let c = 0; c < 3; c++) worst = Math.max(worst, Math.abs(bytes[i * 3 + c]! - d.surface[c]!));
      expect(worst, "max per-channel deviation from the band colour on the torn edge's bottom row").toBeLessThanOrEqual(6);
    });
  }

  // TASK-290: the band is the uniform band, so the art no longer stacks above the footer's top edge (the footer's torn top is meant to
  // overlap the band's last 72px). Its invariant now: the art sits inside the band's body, not hidden by it, and on phones (where the
  // art is 70% of the body tall, TASK-290 mobile follow-up) it ends within the footer's 44px torn top, never under its solid body. The text/footer clearance is asserted for every band in next-band-uniform.spec.ts.
  for (const width of [375, 414, 768, 1024, 1440]) {
    test(`art stays inside the band at the end of the page at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work/nuptis", { waitUntil: "load" });
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.waitForTimeout(900);
        const m = await page.evaluate((t) => {
          const img = document.querySelector(`section[aria-label="Next project"] img.cs-next-art-${t}`)!.getBoundingClientRect();
          const b = document.querySelector('section[aria-label="Next project"]')!.getBoundingClientRect();
          return { top: img.top, bottom: img.bottom, bt: b.top, bb: b.bottom, ft: document.querySelector("footer")!.getBoundingClientRect().top, ftorn: document.querySelector("footer > svg[data-decor='torn']")?.getBoundingClientRect().height ?? 0 };
        }, theme);
        expect(m.top, `${theme}: art top inside the band`).toBeGreaterThanOrEqual(m.bt);
        expect(m.bottom, `${theme}: art bottom inside the band`).toBeLessThanOrEqual(m.bb + 0.5);
        if (width < 768) expect(m.bottom - m.ft, `${theme}: the big phone art ends within the footer's torn top (never under its solid body)`).toBeLessThanOrEqual(m.ftorn);
      }
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
