/**
 * paper-selector.spec.ts — TASK-305: with PAPER_SELECTOR_ENABLED the desktop vertical product tray is an origami paper selector
 * (a parchment / charcoal panel, a "SELECT A PRODUCT 07 / 10" header, horizontal paper tiles, folded-paper arrows). Desktop only:
 * at phone width the marker is absent. Set PSEL_CROPS=<dir> to also write element crops (light + dark, two selected products).
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { PAPER_SELECTOR_ENABLED } from "@/components/portfolio/paper-selector-flag";
import { VERTICAL_CAROUSEL_ENABLED } from "@/components/portfolio/vertical-carousel-flag";
import { projects } from "@/data/projects";
import { isListed } from "@/lib/portfolio";

const PERSONAL = projects.filter(isListed);
const pad2 = (n: number) => String(n).padStart(2, "0");
const TOTAL = PERSONAL.length;
const SIZES = [[1280, 800], [1440, 900], [1920, 1080]] as const;
const CROPS = process.env.PSEL_CROPS;

test.beforeEach(({ page }) => {
  test.skip(!(PAPER_SELECTOR_ENABLED && VERTICAL_CAROUSEL_ENABLED), "TASK-305 flag is off");
  test.skip((page.viewportSize()?.width ?? 0) !== 1440, "sizes are set inside the tests; run once");
});

async function open(page: Page, vw: number, vh: number, theme: "light" | "dark", slug?: string) {
  await page.setViewportSize({ width: vw, height: vh });
  await page.goto(slug ? `/projects?product=${slug}` : "/projects", { waitUntil: "load" });
  await page.waitForFunction(() => {
    const tab = document.querySelector('[role="tab"]');
    return !!tab && Object.keys(tab).some((k) => k.startsWith("__react"));
  });
  await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
  await page.evaluate(() => document.fonts.ready);
  await scrollToSelector(page);
}

async function scrollToSelector(page: Page) {
  await page.evaluate(() => {
    const header = document.querySelector("header[data-site-header]")!.getBoundingClientRect().height;
    const pad = parseFloat(getComputedStyle(document.querySelector(".pf-showcase")!).getPropertyValue("--pf-pad")) || 0;
    const feature = document.querySelector(".pf-feature")!;
    const lift = parseFloat(getComputedStyle(feature).marginTop) || 0;
    window.scrollTo(0, feature.getBoundingClientRect().top + window.scrollY - lift - header - 8 - pad);
  });
  await page.waitForTimeout(700);
}

const count = (page: Page) => page.locator(".pf-showcase .pf-count");
const expectIndex = async (page: Page, n: number, why: string) => {
  await expect(count(page), why).toHaveText(`${pad2(n)} / ${pad2(TOTAL)}`);
  await expect(page.locator(".pf-showcase .pf-info-count"), `${why}: card agrees`).toHaveText(`${pad2(n)} / ${pad2(TOTAL)}`);
};

for (const [vw, vh] of SIZES) {
  for (const theme of ["light", "dark"] as const) {
    test(`TASK-305: header index, selected tile and arrows at ${vw}x${vh}, ${theme}`, async ({ page }) => {
      test.setTimeout(120_000);
      await open(page, vw, vh, theme);
      const sel = page.locator('.pf-showcase .pf-carousel[data-paper-selector]');
      await expect(sel, "paper-selector marker present at desktop").toHaveCount(1);
      await expect(sel.locator(".pf-select")).toHaveText("Select a product");
      await expectIndex(page, 1, "initial");

      // the index follows the state: arrows, then keys
      await page.getByRole("button", { name: "Next product" }).click();
      await expectIndex(page, 2, "next button");
      await page.getByRole("button", { name: "Previous product" }).click();
      await expectIndex(page, 1, "previous button");
      await page.locator('.pf-showcase .pf-thumb[aria-selected="true"]').focus();
      await page.keyboard.press("ArrowDown");
      await expectIndex(page, 2, "ArrowDown");
      await page.keyboard.press("ArrowDown");
      await expectIndex(page, 3, "ArrowDown again");
      await page.keyboard.press("ArrowUp");
      await expectIndex(page, 2, "ArrowUp");
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("ArrowUp");
      await expectIndex(page, TOTAL, "ArrowUp wraps to the last product");
      await page.waitForTimeout(900); // the strip settles and re-centres

      // one selected real tile; clones carry no selection
      const state = await page.evaluate(() => {
        const tiles = [...document.querySelectorAll(".pf-showcase .pf-track .pf-thumb")];
        return {
          selected: tiles.filter((t) => !t.hasAttribute("data-clone") && t.getAttribute("aria-selected") === "true").length,
          cloneSelected: tiles.filter((t) => t.hasAttribute("data-clone") && t.hasAttribute("aria-selected")).length,
        };
      });
      expect(state.selected, "exactly one selected tile").toBe(1);
      expect(state.cloneSelected, "clones are never selected").toBe(0);

      // the arrows: real buttons, >= 44 px, labelled, no disc (transparent background)
      for (const [dir, label] of [["prev", "Previous product"], ["next", "Next product"]] as const) {
        const btn = sel.locator(`button.pf-arrow[data-dir="${dir}"]`);
        await expect(btn).toHaveAttribute("aria-label", label);
        const m = await btn.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return { w: r.width, h: r.height, bg: cs.backgroundColor, img: cs.backgroundImage, shadow: cs.boxShadow, radius: cs.borderRadius, tag: el.tagName };
        });
        expect(m.tag).toBe("BUTTON");
        expect(m.w, `${dir} arrow width`).toBeGreaterThanOrEqual(44);
        expect(m.h, `${dir} arrow height`).toBeGreaterThanOrEqual(44);
        expect(m.bg, `${dir} arrow has no filled disc`).toBe("rgba(0, 0, 0, 0)");
        expect(m.img, `${dir} arrow has no background art`).toBe("none");
        expect(m.shadow, `${dir} arrow has no ring`).toBe("none");
      }

      // the right arrow sits beside the selected tile, vertically centred on it, short of the video
      const g = await page.evaluate(() => {
        const r = (el: Element | null) => el!.getBoundingClientRect();
        const tile = r(document.querySelector('.pf-showcase .pf-track .pf-thumb[aria-selected="true"]'));
        const ptr = r(document.querySelector(".pf-showcase .pf-vcar-pointer"));
        const feat = r(document.querySelector(".pf-showcase .pf-feature"));
        const dir = document.querySelector(".pf-showcase .pf-vcar-pointer .oa[data-dir='right']");
        return { tileMid: tile.top + tile.height / 2, tileRight: tile.right, ptrMid: ptr.top + ptr.height / 2, ptrLeft: ptr.left, ptrRight: ptr.right, ptrW: ptr.width, featLeft: feat.left, hasArt: !!dir };
      });
      expect(g.hasArt, "pointer holds the arrow art").toBe(true);
      expect(Math.abs(g.ptrMid - g.tileMid), "right arrow centred on the selected tile").toBeLessThan(4);
      expect(g.ptrLeft, "right arrow is to the right of the tile").toBeGreaterThanOrEqual(g.tileRight - 1);
      expect(g.ptrRight, "right arrow ends before the video").toBeLessThanOrEqual(g.featLeft + 1);
      expect(g.ptrW, "right arrow is drawn").toBeGreaterThan(8);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), "no horizontal overflow").toBeLessThanOrEqual(vw);
    });
  }
}

test("TASK-305: every tile shows its product's existing thumbnail, loaded and decoded", async ({ page }) => {
  test.setTimeout(150_000);
  await open(page, 1440, 900, "light");
  const mapping: string[] = [];
  for (let i = 0; i < TOTAL; i += 1) {
    const r = await page.evaluate(async () => {
      const urlOf = (img: HTMLImageElement) => new URL(img.currentSrc || img.src, location.href).searchParams.get("url") ?? img.src;
      const tile = document.querySelector<HTMLElement>('.pf-showcase .pf-track .pf-thumb[aria-selected="true"]')!;
      const img = tile.querySelector<HTMLImageElement>("img")!;
      const poster = document.querySelector<HTMLImageElement>(".pf-showcase .pf-info .pf-info-poster-img");
      const deadline = Date.now() + 8000;
      while (!(img.complete && img.naturalWidth > 0) && Date.now() < deadline) await new Promise((res) => setTimeout(res, 50));
      const loaded = img.complete && img.naturalWidth > 0;
      if (loaded) await img.decode();
      const art = img.parentElement!.getBoundingClientRect();
      return {
        name: tile.querySelector(".pf-thumb-name")!.textContent,
        src: urlOf(img),
        poster: poster ? urlOf(poster) : null,
        loaded,
        ratio: art.width / art.height,
        fit: getComputedStyle(img).objectFit,
        w: img.getAttribute("width"), // next/image `fill` sets none; the box has an aspect-ratio instead
        boxH: art.height,
      };
    });
    expect(r.loaded, `${r.name}: thumbnail loaded`).toBe(true);
    expect(r.src, `${r.name}: the existing cover art`).toContain("cover-");
    if (r.poster) expect(r.src, `${r.name}: tile art = the card's art for this product`).toBe(r.poster);
    expect(Math.abs(r.ratio - 16 / 9), `${r.name}: thumbnail box keeps 16:9 (no layout shift)`).toBeLessThan(0.05);
    expect(r.fit).toBe("cover");
    mapping.push(`${PERSONAL[i]!.slug} -> ${r.src.split("/").pop()}`);
    if (i < TOTAL - 1) {
      await page.getByRole("button", { name: "Next product" }).click();
      await expectIndex(page, i + 2, `step ${i + 2}`);
      await page.waitForTimeout(150);
    }
  }
  test.info().annotations.push({ type: "thumbnail-mapping", description: mapping.join("; ") });
});

test("TASK-305: at phone width the paper selector is absent", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects", { waitUntil: "load" });
  await page.waitForTimeout(800);
  expect(await page.locator("[data-paper-selector]").count(), "no marker below 1024px").toBe(0);
  expect(await page.locator(".oa, .ps-cur").count(), "no paper-selector parts below 1024px").toBe(0);
});

if (CROPS) {
  for (const theme of ["light", "dark"] as const) {
    for (const slug of ["campfire-board", "pratyasa"]) {
      test(`crop ${theme} ${slug}`, async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
        const page = await ctx.newPage();
        await open(page, 1440, 900, theme, slug);
        await page.waitForTimeout(800);
        const sel = page.locator(".pf-showcase .pf-carousel[data-paper-selector]");
        await sel.scrollIntoViewIfNeeded();
        const box = (await sel.boundingBox())!;
        const pad = 26; // room for the right arrow and the tile's lift
        await page.screenshot({ path: `${CROPS}/selector-${theme}-${slug}.png`, clip: { x: Math.max(0, box.x - 6), y: box.y - 6, width: box.width + pad, height: box.height + 12 } });
        await sel.locator(".pf-carousel-tag").screenshot({ path: `${CROPS}/header-${theme}-${slug}.png` });
        const tile = page.locator('.pf-showcase .pf-track .pf-thumb[aria-selected="true"]');
        const tb = (await tile.boundingBox())!;
        await page.screenshot({ path: `${CROPS}/tile-${theme}-${slug}.png`, clip: { x: tb.x - 10, y: tb.y - 10, width: tb.width + 44, height: tb.height + 24 } });
        const pb = (await sel.locator('button.pf-arrow[data-dir="prev"]').boundingBox())!;
        const nb = (await sel.locator('button.pf-arrow[data-dir="next"]').boundingBox())!;
        await page.screenshot({ path: `${CROPS}/arrow-up-${theme}-${slug}.png`, clip: pb });
        await page.screenshot({ path: `${CROPS}/arrow-down-${theme}-${slug}.png`, clip: nb });
        await ctx.close();
      });
    }
  }
}
