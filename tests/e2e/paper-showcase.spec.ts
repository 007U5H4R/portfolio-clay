/**
 * paper-showcase.spec.ts — the /projects paper-craft showcase (TASK-217): window above its tray, selection kept in sync across
 * poster, info panel and actions however the project is chosen, the play control only when a video exists, and the active
 * card raised. Tablet and desktop only: a phone (< 640 px) renders TASK-210's list / detail instead of this component.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { VERTICAL_CAROUSEL_ENABLED } from "@/components/portfolio/vertical-carousel-flag";
import { projects } from "@/data/projects";
import { isListed } from "@/lib/portfolio";
import { portfolioEntries } from "@/data/portfolio";

// TASK-249 (Tushar 2026-10-18): the carousel / cards list the listed builds only.
const PERSONAL = projects.filter(isListed);
const entryOf = (slug: string) => portfolioEntries.find((e) => e.slug === slug)!;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const pad2 = (n: number) => String(n).padStart(2, "0");
const panel = (page: Page) => page.getByRole("tabpanel");
const tabs = (page: Page) => page.getByRole("tablist", { name: "Select a product" }).getByRole("tab");

async function open(page: Page, slug?: string) {
  await page.goto(slug ? `/projects?product=${slug}` : "/projects", { waitUntil: "load" });
  await page.waitForFunction(() => {
    const tab = document.querySelector('[role="tab"]');
    return !!tab && Object.keys(tab).some((k) => k.startsWith("__react"));
  });
}

/** What the info panel and poster must show for a project, straight from the data. */
// TASK-253: a product chosen by the visitor starts its pitch (else demo) at once, so the stage shows that player, not the poster.
async function expectSynced(page: Page, index: number, chosen = false) {
  const project = PERSONAL[index]!;
  const entry = entryOf(project.slug);
  await expect(panel(page)).toHaveAttribute("data-active-product", project.slug);
  await expect(panel(page).getByRole("heading", { level: 2 })).toHaveText(project.name);
  await expect(panel(page).locator(".pf-info-count")).toHaveText(`${pad2(index + 1)} / ${pad2(PERSONAL.length)}`);
  // Stage 8 DES-017 (TASK-314): the paper card's kicker shows one tag; the TASK-301 card showed two
  const paper = (await panel(page).locator(".pf-info.pf-paper").count()) > 0;
  await expect(panel(page).locator(".pf-info-category")).toHaveText(project.tags.slice(0, paper ? 1 : 2).join(" · "));
  const video = entry.pitchVideo ?? entry.demoVideo;
  if (chosen && video) await expect(page.locator(".pf-stage iframe")).toHaveAttribute("src", new RegExp(`/embed/${video.videoId}`));
  else await expect(page.locator(".pf-stage .pf-cover-name")).toHaveText(project.name);
  await expect(tabs(page).nth(index)).toHaveAttribute("aria-selected", "true");
  await expect(panel(page).locator('[data-action="pitch"]')).toHaveCount(entry.pitchVideo ? 1 : 0);
  await expect(panel(page).locator('[data-action="demo"]')).toHaveCount(entry.demoVideo ? 1 : 0);
  await expect(panel(page).locator('.pf-action-set [data-action="case"]')).toHaveAttribute("href", `/work/${project.slug}`);
}

test.beforeEach(({ page }) => {
  test.skip(width(page) < 640, "a phone renders the TASK-210 list / detail, not the showcase");
});

test("TASK-301: with the vertical carousel off, the GitHub star note stays on the card", async ({ page }) => {
  test.skip(VERTICAL_CAROUSEL_ENABLED && width(page) >= 1024, "the flag-on card drops the star note (vertical-carousel.spec.ts)");
  await open(page, "teachspark");
  await expect(panel(page).locator(".pf-action-set .pf-star-note")).toHaveCount(1);
});

test("the window sits above a tray of the same width, the poster left of the info panel", async ({ page }) => {
  test.skip(VERTICAL_CAROUSEL_ENABLED && width(page) >= 1024, "TASK-301 experiment: from 1024 up the vertical-carousel layout replaces this one (vertical-carousel.spec.ts); with the flag off this runs");
  await open(page);
  const box = async (sel: string) => (await page.locator(sel).first().boundingBox())!;
  const feature = await box(".pf-feature");
  const tray = await box(".pf-carousel");
  const stage = await box(".pf-stage");
  const info = await box(".pf-info");
  expect(tray.y, "tray beneath the window").toBeGreaterThanOrEqual(feature.y + feature.height);
  expect(tray.y - (feature.y + feature.height), "small, consistent gap").toBeLessThan(48);
  expect(Math.abs(tray.x - feature.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(tray.width - feature.width)).toBeLessThanOrEqual(1);
  if (width(page) >= 900) {
    expect(info.x, "info beside the poster").toBeGreaterThanOrEqual(stage.x + stage.width);
    expect(stage.width / (stage.width + info.width), "poster is the larger part").toBeGreaterThan(0.5);
  } else {
    expect(info.y, "stacked: info under the poster").toBeGreaterThanOrEqual(stage.y + stage.height);
  }
});

test("a card click, the arrows and the keyboard all keep poster, title, count, category and actions in sync", async ({ page }) => {
  await open(page);
  await expectSynced(page, 0);

  await tabs(page).nth(2).click();
  await expectSynced(page, 2, true);

  await page.getByRole("button", { name: "Next product" }).click();
  await expectSynced(page, 3, true);
  await page.getByRole("button", { name: "Previous product" }).click();
  await expectSynced(page, 2, true);

  await tabs(page).nth(2).focus();
  await page.keyboard.press("ArrowRight");
  await expectSynced(page, 3, true);
  await page.keyboard.press("End");
  await expectSynced(page, PERSONAL.length - 1, true);
  await page.keyboard.press("Home");
  await expectSynced(page, 0, true);
});

test("the play control exists only for a project with a pitch video", async ({ page }) => {
  for (const [index, project] of PERSONAL.entries()) {
    await open(page, project.slug);
    await expectSynced(page, index);
    const plays = page.locator(".pf-stage-screen .pf-play");
    await expect(plays, `${project.slug} play control`).toHaveCount(entryOf(project.slug).pitchVideo ? 1 : 0);
    if (!entryOf(project.slug).pitchVideo) await expect(page.locator(".pf-stage-tag")).toBeVisible();
  }
});

test("exactly one action is primary, the primary is a real video when there is one, and no destination repeats", async ({ page }) => {
  for (const project of PERSONAL) {
    await open(page, project.slug);
    const entry = entryOf(project.slug);
    const primary = panel(page).locator('[data-tier="primary"]');
    await expect(primary, `${project.slug} primary`).toHaveCount(1);
    const expected = entry.pitchVideo ? "pitch" : entry.demoVideo ? "demo" : "case";
    await expect(panel(page).locator(`.pf-action[data-action="${expected}"]`)).toBeVisible();
    const hrefs = await panel(page).locator("a.pf-action").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(new Set(hrefs).size, `${project.slug} destinations`).toBe(hrefs.length);
  }
});

test("the active card is raised above its neighbours and ringed", async ({ page }) => {
  test.skip(VERTICAL_CAROUSEL_ENABLED && width(page) >= 1024, "TASK-301 experiment: from 1024 up the vertical-carousel layout replaces this one (vertical-carousel.spec.ts); with the flag off this runs");
  await open(page);
  const cards = tabs(page);
  const active = (await cards.nth(0).boundingBox())!;
  const other = (await cards.nth(1).boundingBox())!;
  expect(other.y - active.y, "selected card sits higher").toBeGreaterThanOrEqual(4);
  await cards.nth(1).click();
  await expect(cards.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.waitForTimeout(450); // let the 320 ms lift settle
  const now = (await cards.nth(1).boundingBox())!;
  const rest = (await cards.nth(0).boundingBox())!;
  expect(rest.y - now.y).toBeGreaterThanOrEqual(4);
  // the ring is the card's own border colour, not colour alone (the lift above is the shape cue)
  const ring = await cards.nth(1).evaluate((el) => getComputedStyle(el).borderTopColor);
  const idle = await cards.nth(0).evaluate((el) => getComputedStyle(el).borderTopColor);
  expect(ring).not.toBe(idle);
});

test("no horizontal overflow and the tray scrolls instead of squeezing the cards", async ({ page, noOverflow }) => {
  test.skip(VERTICAL_CAROUSEL_ENABLED && width(page) >= 1024, "TASK-301 experiment: from 1024 up the vertical-carousel layout replaces this one (vertical-carousel.spec.ts); with the flag off this runs");
  await open(page, PERSONAL[6]!.slug);
  await noOverflow(page);
  const track = page.locator(".pf-track");
  expect(await track.evaluate((el) => el.scrollWidth > el.clientWidth), "more cards than fit scroll sideways").toBe(true);
  const first = (await tabs(page).nth(0).boundingBox())!;
  expect(first.width, "cards keep a readable width").toBeGreaterThanOrEqual(120);
});

// TASK-291 (Tushar 2026-10-20): the video, the card and the tray share one screen on a desktop. The video frame and the card are the
// same height, the tray spans video-left .. card-right, and with the stage top just under the header the tray's bottom is still in
// the viewport; every product's card content fits, and the video frame is exactly the video's 16:9 with no bars.
for (const [vw, vh] of [[1440, 900], [1280, 800]] as const) {
  for (const theme of ["light", "dark"] as const) {
    test(`TASK-291: video, card and tray fit one ${vw}x${vh} screen, ${theme} (equal heights, tray edges, no clipping, 16:9 media)`, async ({ page }) => {
  test.skip(VERTICAL_CAROUSEL_ENABLED && width(page) >= 1024, "TASK-301 experiment: from 1024 up the vertical-carousel layout replaces this one (vertical-carousel.spec.ts); with the flag off this runs");
      test.skip(width(page) !== 1440, "desktop sizes are set inside the test; run once");
      test.setTimeout(120_000);
      await page.setViewportSize({ width: vw, height: vh });
      await open(page);
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      await page.evaluate(() => document.fonts.ready);
      // the landing position: the paper frame (10 px above the stage) sits 8 px under the sticky header
      await page.evaluate(() => {
        const header = document.querySelector("header[data-site-header]")!.getBoundingClientRect().height;
        const pad = parseFloat(getComputedStyle(document.querySelector(".pf-showcase")!).getPropertyValue("--pf-pad")) || 0;
        window.scrollTo(0, document.querySelector(".pf-feature")!.getBoundingClientRect().top + window.scrollY - header - 8 - pad);
      });
      await page.waitForTimeout(500);
      const header = await page.evaluate(() => document.querySelector("header[data-site-header]")!.getBoundingClientRect().bottom);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), "no horizontal overflow").toBeLessThanOrEqual(vw);

      for (let i = 0; i < PERSONAL.length; i += 1) {
        const m = await page.evaluate(() => {
          const r = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
          const stage = r(".pf-showcase .pf-stage");
          const info = r(".pf-showcase .pf-info");
          const tray = r(".pf-showcase .pf-carousel");
          const screen = r(".pf-showcase .pf-stage-screen");
          const media = document.querySelector(".pf-stage-screen img, .pf-stage-screen iframe")!.getBoundingClientRect();
          // the card's content (head, actions, star note) against the card's own box; its pager rides in the bottom padding
          let top = Infinity;
          let bottom = -Infinity;
          for (const el of document.querySelectorAll(".pf-showcase .pf-info .pf-info-head > :not(ul), .pf-showcase .pf-info .pf-action-set, .pf-showcase .pf-info .pf-star-note")) {
            const q = el.getBoundingClientRect();
            if (q.height < 2) continue;
            top = Math.min(top, q.top);
            bottom = Math.max(bottom, q.bottom);
          }
          return {
            stage: { x: stage.x, y: stage.y, h: stage.height },
            info: { y: info.y, h: info.height, right: info.right, bottom: info.bottom },
            tray: { x: tray.x, right: tray.right, bottom: tray.bottom },
            screen: { w: screen.width, h: screen.height },
            media: { x: media.x - screen.x, y: media.y - screen.y, r: screen.right - media.right, b: screen.bottom - media.bottom, w: media.width, h: media.height },
            topGap: top - info.top,
            botGap: info.bottom - bottom,
          };
        });
        const tag = `${PERSONAL[i]!.slug} @${vw}x${vh} ${theme}`;
        expect(Math.abs(m.stage.h - m.info.h), `${tag}: video frame and card are the same height`).toBeLessThanOrEqual(2);
        expect(Math.abs(m.tray.x - m.stage.x), `${tag}: tray left edge = video left edge`).toBeLessThanOrEqual(1);
        expect(Math.abs(m.tray.right - m.info.right), `${tag}: tray right edge = card right edge`).toBeLessThanOrEqual(1);
        expect(m.tray.bottom, `${tag}: the tray (and its pager) ends inside the viewport`).toBeLessThanOrEqual(vh);
        expect(m.stage.y, `${tag}: the stage starts under the header`).toBeGreaterThanOrEqual(header);
        expect(m.topGap, `${tag}: card content is not cut off at the top`).toBeGreaterThanOrEqual(0);
        expect(m.botGap, `${tag}: card content clears the card's pager`).toBeGreaterThanOrEqual(20);
        expect(Math.abs(m.screen.w / m.screen.h - 16 / 9), `${tag}: the video frame is 16:9`).toBeLessThan(0.01);
        expect(Math.abs(m.media.w / m.media.h - 16 / 9), `${tag}: the media box is 16:9`).toBeLessThan(0.01);
        for (const gap of [m.media.x, m.media.y, m.media.r, m.media.b]) expect(Math.abs(gap), `${tag}: media fills the frame`).toBeLessThanOrEqual(1);
        if (i < PERSONAL.length - 1) {
          await page.getByRole("button", { name: "Next product" }).first().click();
          await expect(panel(page).locator(".pf-info-count")).toHaveText(`${pad2(i + 2)} / ${pad2(PERSONAL.length)}`);
          await page.waitForTimeout(150);
        }
      }
    });
  }
}

// TASK-291 follow-up: the tray's dash pager sits fully below the cards, the selected card's lift and its marker, with room to spare.
for (const [vw, vh] of [[1440, 900], [1280, 800], [1920, 1080], [1024, 768]] as const) {
  test(`TASK-291: the tray's pager clears the cards, the selected card and its marker by 8 px at ${vw}x${vh}`, async ({ page }) => {
  test.skip(VERTICAL_CAROUSEL_ENABLED && width(page) >= 1024, "TASK-301 experiment: from 1024 up the vertical-carousel layout replaces this one (vertical-carousel.spec.ts); with the flag off this runs");
    test.skip(width(page) !== 1440, "desktop sizes are set inside the test; run once");
    await page.setViewportSize({ width: vw, height: vh });
    await open(page);
    await page.evaluate(() => document.fonts.ready);
    for (let step = 0; step < 2; step += 1) {
      await page.waitForTimeout(900); // the selected card is centred and settled
      const m = await page.evaluate(() => {
        const rect = (el: Element) => el.getBoundingClientRect();
        const cards = [...document.querySelectorAll(".pf-showcase .pf-track .pf-thumb")].map(rect).filter((r) => r.right > 0 && r.left < innerWidth);
        const selected = rect(document.querySelector('.pf-showcase .pf-thumb[aria-selected="true"]')!);
        const dot = rect(document.querySelector(".pf-showcase .pf-pager-dot")!);
        // the dash is a 6 px bar centred in the dot's 44 px box; the selected marker hangs 11 px (3 px bar) under its card
        return { cardsBottom: Math.max(...cards.map((r) => r.bottom)), markerBottom: selected.bottom + 12, dashTop: dot.top + (dot.height - 6) / 2 };
      });
      expect(m.cardsBottom + 8, "the pager is clear of the cards").toBeLessThanOrEqual(m.dashTop);
      expect(m.markerBottom + 8, "the pager is clear of the selected card's marker").toBeLessThanOrEqual(m.dashTop);
      await page.getByRole("button", { name: "Next product" }).first().click();
    }
  });
}
