/**
 * vertical-carousel.spec.ts — TASK-301 experiment: with VERTICAL_CAROUSEL_ENABLED the /projects desktop page is three columns of ONE
 * height — a vertical product tray, the exact-16:9 video frame, and a 5:7 "baseball card". Runs only while the flag is on (the
 * TASK-291 layout specs skip themselves then; with the flag off they run and this file is skipped).
 * Set VCAR_CROPS=<dir> to also write 2x viewport crops (light + dark, product 01 and the tallest-content product).
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { VERTICAL_CAROUSEL_ENABLED } from "@/components/portfolio/vertical-carousel-flag";
import { PAPER_CARD_ENABLED } from "@/components/portfolio/paper-card-flag";
import { projects } from "@/data/projects";
import { isListed } from "@/lib/portfolio";

const PERSONAL = projects.filter(isListed);
const pad2 = (n: number) => String(n).padStart(2, "0");
const SIZES = [[1280, 800], [1440, 900], [1920, 1080]] as const;
const CROPS = process.env.VCAR_CROPS;

test.beforeEach(({ page }) => {
  test.skip(!VERTICAL_CAROUSEL_ENABLED, "TASK-301 experiment flag is off");
  test.skip((page.viewportSize()?.width ?? 0) !== 1440, "desktop sizes are set inside the tests; run once");
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
  await page.evaluate(() => {
    const header = document.querySelector("header[data-site-header]")!.getBoundingClientRect().height;
    const pad = parseFloat(getComputedStyle(document.querySelector(".pf-showcase")!).getPropertyValue("--pf-pad")) || 0;
    const feature = document.querySelector(".pf-feature")!;
    const lift = parseFloat(getComputedStyle(feature).marginTop) || 0;
    window.scrollTo(0, feature.getBoundingClientRect().top + window.scrollY - lift - header - 8 - pad);
  });
  await page.waitForTimeout(700);
}

const measure = (page: Page) =>
  page.evaluate(() => {
    const r = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
    const car = r(".pf-showcase .pf-carousel");
    const stage = r(".pf-showcase .pf-stage");
    const info = r(".pf-showcase .pf-info");
    const screen = r(".pf-showcase .pf-stage-screen");
    const media = document.querySelector(".pf-stage-screen img, .pf-stage-screen iframe")!.getBoundingClientRect();
    const inside = (sel: string) => {
      const q = document.querySelector(sel)!.getBoundingClientRect();
      return q.top >= car.top - 0.5 && q.bottom <= car.bottom + 0.5 && q.left >= car.left - 0.5 && q.right <= car.right + 0.5;
    };
    // the card's content against the card box; the pager rides in the bottom padding, the arrows in the first row
    let top = Infinity;
    let bottom = -Infinity;
    let right = -Infinity;
    for (const el of document.querySelectorAll(".pf-showcase .pf-info .pf-info-head > :not(ul), .pf-showcase .pf-info .pf-action-set, .pf-showcase .pf-info .pf-action-set .pf-star-note")) {
      const q = el.getBoundingClientRect();
      if (q.height < 2) continue;
      top = Math.min(top, q.top);
      bottom = Math.max(bottom, q.bottom);
      right = Math.max(right, q.right);
    }
    const pager = document.querySelector(".pf-showcase .pf-info-dot")!.getBoundingClientRect();
    const track = r(".pf-showcase .pf-track");
    const visible = [...document.querySelectorAll(".pf-showcase .pf-track .pf-thumb")].filter((t) => {
      const q = t.getBoundingClientRect();
      const overlap = Math.min(q.bottom, track.bottom) - Math.max(q.top, track.top);
      return overlap >= q.height * 0.6;
    }).length;
    return {
      car: { x: car.x, right: car.right, top: car.top, bottom: car.bottom, h: car.height },
      stage: { x: stage.x, right: stage.right, top: stage.top, bottom: stage.bottom, h: stage.height },
      info: { x: info.x, right: info.right, top: info.top, bottom: info.bottom, h: info.height, w: info.width },
      screen: { w: screen.width, h: screen.height },
      media: { x: media.x - screen.x, y: media.y - screen.y, r: screen.right - media.right, b: screen.bottom - media.bottom, w: media.width, h: media.height },
      counterInside: inside(".pf-showcase .pf-carousel-tag"),
      arrowsInside: inside('.pf-showcase .pf-arrow[data-dir="prev"]') && inside('.pf-showcase .pf-arrow[data-dir="next"]'),
      topGap: top - info.top,
      botGap: info.bottom - bottom,
      rightGap: info.right - right,
      // TASK-303: the paper card tucks the pager's 44 px hit boxes into its border, so its clearance is measured to the visible pill
      pagerClear: (document.querySelector(".pf-info.pf-paper") ? pager.top + pager.height / 2 - 3 : pager.top) - bottom,
      pagerInside: pager.bottom - 8 <= info.bottom,
      smallTargets: [...document.querySelectorAll(".pf-showcase .pf-carousel button, .pf-showcase .pf-info button, .pf-showcase .pf-info a")].filter((e) => !e.hasAttribute("data-clone") && (e.getBoundingClientRect().height < 43.5 || e.getBoundingClientRect().width < 43.5) && e.getBoundingClientRect().width > 0).length,
      visible,
      header: document.querySelector("header[data-site-header]")!.getBoundingClientRect().bottom,
      vw: innerWidth,
      sw: document.documentElement.scrollWidth,
    };
  });

for (const [vw, vh] of SIZES) {
  for (const theme of ["light", "dark"] as const) {
    test(`TASK-301: carousel, video and card are three equal-height columns at ${vw}x${vh}, ${theme}`, async ({ page }) => {
      test.setTimeout(150_000);
      await open(page, vw, vh, theme);
      let worst = { slug: "", clip: -Infinity };
      for (let i = 0; i < PERSONAL.length; i += 1) {
        const m = await measure(page);
        const tag = `${PERSONAL[i]!.slug} @${vw}x${vh} ${theme}`;
        // order and shared edges (the carousel's counter and arrows live inside its box)
        expect(m.car.right, `${tag}: carousel left of the video`).toBeLessThanOrEqual(m.stage.x + 1);
        expect(m.stage.right, `${tag}: video left of the card`).toBeLessThanOrEqual(m.info.x + 1);
        for (const [name, box] of [["video", m.stage], ["card", m.info]] as const) {
          expect(Math.abs(box.top - m.car.top), `${tag}: ${name} top = carousel top`).toBeLessThanOrEqual(1);
          expect(Math.abs(box.bottom - m.car.bottom), `${tag}: ${name} bottom = carousel bottom`).toBeLessThanOrEqual(1);
        }
        expect(m.counterInside && m.arrowsInside, `${tag}: counter and arrows sit inside the carousel's height`).toBe(true);
        // the video: exact 16:9, media fills the frame
        expect(Math.abs(m.screen.w / m.screen.h - 16 / 9), `${tag}: video frame 16:9`).toBeLessThan(0.01);
        expect(Math.abs(m.media.w / m.media.h - 16 / 9), `${tag}: media 16:9`).toBeLessThan(0.01);
        for (const gap of [m.media.x, m.media.y, m.media.r, m.media.b]) expect(Math.abs(gap), `${tag}: media fills the frame`).toBeLessThanOrEqual(1);
        // the card: 5:7 and as tall as the video
        expect(Math.abs(m.info.w / m.info.h - 5 / 7), `${tag}: card is 5:7`).toBeLessThan(0.02);
        expect(Math.abs(m.info.h - m.stage.h), `${tag}: card = video height`).toBeLessThanOrEqual(2);
        // the stage fits the viewport under the header, nothing overflows sideways
        expect(m.stage.top, `${tag}: stage under the header`).toBeGreaterThanOrEqual(m.header);
        expect(m.car.bottom, `${tag}: stage inside the viewport`).toBeLessThanOrEqual(vh);
        expect(m.sw, `${tag}: no horizontal overflow`).toBeLessThanOrEqual(vw);
        expect(m.visible, `${tag}: 3-5 thumbnails show`).toBeGreaterThanOrEqual(3);
        expect(m.visible, `${tag}: 3-5 thumbnails show`).toBeLessThanOrEqual(5);
        // card content not clipped: inside the card, clear of the pager row
        expect(m.topGap, `${tag}: content not cut at the top`).toBeGreaterThanOrEqual(0);
        expect(m.rightGap, `${tag}: content not cut at the right`).toBeGreaterThanOrEqual(0);
        const clip = -m.pagerClear;
        if (clip > worst.clip) worst = { slug: PERSONAL[i]!.slug, clip };
        expect(m.pagerClear, `${tag}: card content clears the card's pager (clip ${clip}px)`).toBeGreaterThanOrEqual(0);
        expect(m.smallTargets, `${tag}: every control in the carousel and the card is at least 44 x 44`).toBe(0);
        expect(m.pagerInside, `${tag}: pager inside the card`).toBe(true);
        if (i < PERSONAL.length - 1) {
          await page.getByRole("button", { name: "Next product" }).click();
          await expect(page.locator(".pf-showcase .pf-info-count")).toHaveText(`${pad2(i + 2)} / ${pad2(PERSONAL.length)}`);
          await page.waitForTimeout(400); // TASK-304: the card enters over 300 ms (pf-enter); measuring at ~120 ms raced it (1.17 px off, also with the paper player off)
        }
      }
      test.info().annotations.push({ type: "worst-card-overflow", description: `${worst.slug}: ${worst.clip}px` });
    });
  }
}

test("TASK-301: the loop wraps both ways by arrows buttons and ArrowUp / ArrowDown, and stays centred", async ({ page }) => {
  await open(page, 1440, 900, "light");
  const count = page.locator(".pf-showcase .pf-count");
  const centred = async () => {
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const t = document.querySelector(".pf-showcase .pf-track")!.getBoundingClientRect();
            const s = document.querySelector('.pf-showcase .pf-thumb[aria-selected="true"]')!.getBoundingClientRect();
            return Math.round(Math.abs(s.top + s.height / 2 - (t.top + t.height / 2)));
          }),
        { message: "the selected thumbnail is vertically centred", timeout: 6000 },
      )
      .toBeLessThanOrEqual(4);
  };
  await centred();
  await expect(count).toHaveText("01 / 10");
  await page.getByRole("button", { name: "Previous product" }).click();
  await expect(count).toHaveText("10 / 10");
  await centred();
  await page.getByRole("button", { name: "Next product" }).click();
  await expect(count).toHaveText("01 / 10");
  await centred();
  await page.locator('.pf-showcase .pf-thumb[aria-selected="true"]').focus();
  await page.keyboard.press("ArrowUp");
  await expect(count).toHaveText("10 / 10");
  await centred();
  await page.keyboard.press("ArrowDown");
  await expect(count).toHaveText("01 / 10");
  await centred();
  await page.keyboard.press("ArrowDown");
  await expect(count).toHaveText("02 / 10");
  await page.keyboard.press("ArrowLeft");
  await expect(count).toHaveText("01 / 10");
  await page.keyboard.press("ArrowRight");
  await expect(count).toHaveText("02 / 10");
  await expect(page.getByRole("tablist", { name: "Select a product" })).toHaveAttribute("aria-orientation", "vertical");
});

test("TASK-301: a pointer sits beside the selected card, in the gap toward the video", async ({ page }) => {
  for (const [vw, vh] of [[1280, 800], [1440, 900], [1920, 1080]] as const) {
    await open(page, vw, vh, "light");
    await page.locator('.pf-showcase .pf-carousel .pf-arrow[data-dir="next"]').click();
    await page.waitForTimeout(900); // the strip settles and re-centres
    const m = await page.evaluate(() => {
      const r = (el: Element | null) => el!.getBoundingClientRect();
      const sel = [...document.querySelectorAll(".pf-showcase .pf-track .pf-thumb")].find((t) => t.getAttribute("aria-selected") === "true" || t.getAttribute("data-current") === "true");
      const p = r(document.querySelector(".pf-showcase .pf-vcar-pointer"));
      const s = r(sel!);
      return { pc: p.top + p.height / 2, sc: s.top + s.height / 2, pl: p.left, pr: p.right, car: r(document.querySelector(".pf-showcase .pf-carousel")).right, feat: r(document.querySelector(".pf-showcase .pf-feature")).left, w: p.width };
    });
    expect(m.w, "pointer drawn").toBeGreaterThan(6);
    expect(Math.abs(m.pc - m.sc), `${vw}: pointer centred on the selected card`).toBeLessThan(4);
    expect(m.pr, `${vw}: pointer ends before the video`).toBeLessThanOrEqual(m.feat + 1);
    expect(m.pl, `${vw}: pointer is at the carousel's right edge (TASK-305: on the selected tile's right side, inside the panel)`).toBeGreaterThanOrEqual(m.car - 32);
  }
});

test("TASK-301: the clones stay aria-hidden, unfocusable and id-free", async ({ page }) => {
  await open(page, 1440, 900, "light");
  const info = await page.evaluate(() => {
    const all = [...document.querySelectorAll(".pf-showcase .pf-track .pf-thumb")];
    const clones = all.filter((t) => t.hasAttribute("data-clone"));
    const real = all.filter((t) => !t.hasAttribute("data-clone"));
    return {
      total: all.length,
      real: real.length,
      realIds: real.every((t) => !!t.id),
      clonesOk: clones.every((t) => t.getAttribute("aria-hidden") === "true" && t.getAttribute("tabindex") === "-1" && !t.id && !t.hasAttribute("aria-controls") && !t.hasAttribute("data-product")),
      pager: document.querySelectorAll(".pf-showcase .pf-pager").length,
    };
  });
  expect(info.total).toBe(PERSONAL.length * 3);
  expect(info.real).toBe(PERSONAL.length);
  expect(info.realIds).toBe(true);
  expect(info.clonesOk).toBe(true);
  expect(info.pager, "the tray's dash pager is omitted (the counter + the card pager carry the position)").toBe(0);
});

test("TASK-301: choosing a thumbnail keeps carousel, card and video in sync", async ({ page }) => {
  await open(page, 1440, 900, "light");
  await page.getByRole("tab", { name: new RegExp(`^${PERSONAL[2]!.name}`) }).first().click();
  await expect(page.getByRole("tabpanel")).toHaveAttribute("data-active-product", PERSONAL[2]!.slug);
  await expect(page.locator(".pf-showcase .pf-info-count")).toHaveText(`03 / ${pad2(PERSONAL.length)}`);
  await expect(page.locator(".pf-showcase .pf-count")).toHaveText(`03 / ${pad2(PERSONAL.length)}`);
});

const posterMeasure = (page: Page) =>
  page.evaluate(async () => {
    const img = document.querySelector<HTMLImageElement>(".pf-showcase .pf-info .pf-info-poster-img");
    if (!img) return null;
    const hiddenFrame = getComputedStyle(img.parentElement!).display === "none";
    if (hiddenFrame) {
      const cta0 = document.querySelector(".pf-showcase .pf-info .pf-action-set")!.getBoundingClientRect();
      const pager0 = document.querySelector(".pf-showcase .pf-info-dot")!.getBoundingClientRect();
      return { hidden: true as const, slot: img.closest(".pf-info-poster")!.getBoundingClientRect().height, pagerToCta: pager0.top - cta0.bottom };
    }
    const deadline = Date.now() + 8000;
    while (!(img.complete && img.naturalWidth > 0) && Date.now() < deadline) await new Promise((r) => setTimeout(r, 50));
    await img.decode();
    const box = img.getBoundingClientRect();
    const frame = img.parentElement!.getBoundingClientRect();
    const head = [...document.querySelectorAll(".pf-showcase .pf-info .pf-info-head > *")].map((e) => e.getBoundingClientRect()).filter((q) => q.height > 2);
    const metaBottom = Math.max(...head.map((q) => q.bottom));
    const cta = document.querySelector(".pf-showcase .pf-info .pf-action-set")!.getBoundingClientRect();
    const pager = document.querySelector(".pf-showcase .pf-info-dot")!.getBoundingClientRect();
    const urlOf = (el: Element | null) => {
      const src = (el as HTMLImageElement | null)?.currentSrc || (el as HTMLImageElement | null)?.src || "";
      return new URL(src, location.href).searchParams.get("url") ?? src;
    };
    const selected = document.querySelector('.pf-showcase .pf-track .pf-thumb[aria-selected="true"] img');
    return {
      hidden: false as const,
      top: box.top, bottom: box.bottom, w: box.width, h: box.height,
      frameW: frame.width, frameH: frame.height,
      fit: getComputedStyle(img).objectFit,
      ariaHidden: img.closest(".pf-info-poster")!.getAttribute("aria-hidden") === "true" && img.getAttribute("alt") === "",
      metaGap: box.top - metaBottom,
      ctaGap: cta.top - box.bottom,
      ctaToPager: cta.bottom - pager.top,
      pagerToCta: pager.top - cta.bottom,
      src: urlOf(img), thumbSrc: urlOf(selected),
      natural: img.naturalWidth / img.naturalHeight,
    };
  });

for (const [vw, vh] of SIZES) {
  test(`TASK-301: each product's poster art fills the card between the text and the actions at ${vw}x${vh}`, async ({ page }) => {
    test.skip(PAPER_CARD_ENABLED, "TASK-303: the paper card shows the poster at its own aspect ratio, not stretched to fill the card (paper-card.spec.ts)");
    test.setTimeout(150_000);
    await open(page, vw, vh, "light");
    const sizes: string[] = [];
    const hiddenSlugs: string[] = [];
    for (let i = 0; i < PERSONAL.length; i += 1) {
      const m = await posterMeasure(page);
      const tag = `${PERSONAL[i]!.slug} @${vw}x${vh}`;
      expect(m, `${tag}: the card has a poster`).not.toBeNull();
      if (!m) continue;
      if (m.hidden) {
        expect(await page.locator(".pf-showcase .pf-info .pf-action-set .pf-star-note").count(), `${tag}: the star note is dropped from the card`).toBe(0);
        // graceful hide: only allowed where the card truly has no room (the slot is tiny), never when it could have shown
        hiddenSlugs.push(PERSONAL[i]!.slug + ":" + Math.round(m.slot));
        expect(m.slot, `${tag}: poster hidden only when the free space is under 56px`).toBeLessThanOrEqual(56);
        expect(Math.abs(m.pagerToCta), `${tag}: actions sit just above the pager`).toBeLessThanOrEqual(16);
        if (i < PERSONAL.length - 1) {
          await page.getByRole("button", { name: "Next product" }).click();
          await expect(page.locator(".pf-showcase .pf-info-count")).toHaveText(`${pad2(i + 2)} / ${pad2(PERSONAL.length)}`);
          await page.waitForTimeout(400); // TASK-304: the card enters over 300 ms (pf-enter); measuring at ~120 ms raced it (1.17 px off, also with the paper player off)
        }
        continue;
      }
      sizes.push(`${Math.round(m.w)}x${Math.round(m.h)}`);
      expect(await page.locator(".pf-showcase .pf-info .pf-action-set .pf-star-note").count(), `${tag}: the star note is dropped from the card`).toBe(0);
      expect(m.metaGap, `${tag}: poster clear of the meta line`).toBeGreaterThanOrEqual(6);
      expect(m.ctaGap, `${tag}: poster clear of the actions`).toBeGreaterThanOrEqual(6);
      expect(m.h, `${tag}: poster is tall enough to read`).toBeGreaterThanOrEqual(44);
      expect(m.src, `${tag}: poster is this product's art`).toContain("cover-");
      expect(m.src, `${tag}: poster = the carousel cover`).toBe(m.thumbSrc);
      expect(m.fit, `${tag}: cover-fit, never stretched`).toBe("cover");
      expect(Math.abs(m.w - m.frameW) + Math.abs(m.h - m.frameH), `${tag}: image fills its frame exactly`).toBeLessThanOrEqual(1);
      expect(m.ariaHidden, `${tag}: decorative (alt empty, aria-hidden)`).toBe(true);
      expect(Math.abs(m.natural - 16 / 9), `${tag}: source art is 16:9`).toBeLessThan(0.02);
      expect(Math.abs(m.pagerToCta), `${tag}: actions sit just above the pager`).toBeLessThanOrEqual(16);
      expect(m.pagerToCta, `${tag}: actions do not overlap the pager`).toBeGreaterThanOrEqual(-2);
      if (i < PERSONAL.length - 1) {
        await page.getByRole("button", { name: "Next product" }).click();
        await expect(page.locator(".pf-showcase .pf-info-count")).toHaveText(`${pad2(i + 2)} / ${pad2(PERSONAL.length)}`);
        await page.waitForTimeout(400); // TASK-304: the card enters over 300 ms (pf-enter); measuring at ~120 ms raced it (1.17 px off, also with the paper player off)
      }
    }
    test.info().annotations.push({ type: "poster-sizes", description: `${vw}x${vh}: ${sizes.join(", ")}; hidden: ${hiddenSlugs.join(",") || "none"}` });
    if (vw >= 1440) expect(Math.min(...sizes.map((z) => Number(z.split("x")[1]))), `${vw}x${vh}: poster at least 110px tall`).toBeGreaterThanOrEqual(110);
    if (vw >= 1440) expect(hiddenSlugs, `${vw}x${vh}: every product shows its poster`).toEqual([]);
  });
}

if (CROPS) {
  const tallest = PERSONAL.reduce((a, p) => (p.tagline.length > a.tagline.length ? p : a), PERSONAL[0]!);
  for (const [vw, vh] of SIZES.filter(([w]) => w !== 1920)) {
    for (const theme of ["light", "dark"] as const) {
      for (const [label, slug] of [["01", PERSONAL[0]!.slug], ["06-pratyasa", "pratyasa"], ["02-railcite", "railcite"], ["tallest-" + tallest.slug, tallest.slug]] as const) {
        test(`crop ${vw}x${vh} ${theme} ${label}`, async ({ browser }) => {
          const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2, reducedMotion: "reduce" });
          const page = await ctx.newPage();
          await open(page, vw, vh, theme, slug);
          await page.screenshot({ path: `${CROPS}/${vw}x${vh}-${theme}-${label}.png` });
          await ctx.close();
        });
      }
    }
  }
}
