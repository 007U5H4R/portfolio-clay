/**
 * stage8-des.spec.ts — Stage 8 design-critique regressions on the /projects product showcase (DES-012 … DES-019, 2026-10-21).
 *
 *   TASK-309  the selection arrow never reaches the selected tile's name and no tile name truncates (DES-012)
 *   TASK-310  card and selector text keeps >= 4.5:1 contrast in light and dark (DES-013)
 *   TASK-311  the paper card keeps its pills and actions inside itself from 1024 to 1279 px (DES-014)
 *   TASK-312  on a phone, "Watch demo" lands the stage below the fixed header (DES-015)
 *   TASK-313  while the player loads, the poster stays and a loading cue shows (DES-016)
 *   TASK-314  the paper card's category label never truncates (DES-017)
 *   TASK-315  the stage's "Watch on YouTube" link has a >= 44 px hit area (DES-018)
 *   TASK-316  tablet carousel tile names and categories never truncate (DES-019)
 * Design wave 2 (DES-020 ... DES-028, 2026-10-21):
 *   TASK-331  micro-label size floors and no overflow / truncation 1024-1920, light + dark (DES-020)
 *   TASK-332  the description is >= 13 px, uncut, with <= 24 px above the CTA at 1180-1920 (DES-022)
 *   TASK-347  the tagline clears the poster by >= 4 px; the free-height gaps above the poster and the description are each <= 24 px, 1180-1512
 *   TASK-333  arrow-key browsing starts one video once the selection settles; reduced motion never auto-starts (DES-023)
 *   TASK-336  >= 1800 px scale-up: tile names 15.5 px, card type a step up, no dead space above the CTA; 1440 / 1512 unchanged (DES-026)
 *   TASK-337  the stage poster's title chip is hidden at 1024-1180 px, the name stays accessible (DES-028)
 *   TASK-334  the paper card has no navigation of its own - the selector is the one control (DES-024)
 *
 * Desktop checks run once (w1440 project, sizes set inside); the phone check runs on w390; the tablet check on w768.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { PAPER_SELECTOR_ENABLED } from "@/components/portfolio/paper-selector-flag";
import { PAPER_CARD_ENABLED } from "@/components/portfolio/paper-card-flag";
import { PAPER_PLAYER_ENABLED } from "@/components/portfolio/paper-player-flag";
import { VERTICAL_CAROUSEL_ENABLED } from "@/components/portfolio/vertical-carousel-flag";
import { projects } from "@/data/projects";
import { portfolioEntries } from "@/data/portfolio";
import { isListed } from "@/lib/portfolio";

const PERSONAL = projects.filter(isListed);
const PAPER = PAPER_SELECTOR_ENABLED && PAPER_CARD_ENABLED && VERTICAL_CAROUSEL_ENABLED;
type Theme = "light" | "dark";

async function open(page: Page, vw: number, vh: number, theme: Theme, slug?: string) {
  await page.setViewportSize({ width: vw, height: vh });
  await page.goto(slug ? `/projects?product=${slug}` : "/projects", { waitUntil: "load" });
  await page.waitForFunction(() => {
    const tab = document.querySelector('[role="tab"]');
    return !!tab && Object.keys(tab).some((k) => k.startsWith("__react"));
  });
  await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".pf-feature").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
}

/** WCAG 2.x contrast of two computed `rgb(…)` / `rgba(…)` colours (alpha ignored — every colour under test is opaque). Any other
 *  colour syntax (lab(), color(), oklch()) throws, so a wrong surface can never pass by accident. */
const CONTRAST = `(a, b) => {
  const ch = (s) => { if (!/^rgba?\\(/.test(s)) throw new Error("not an rgb colour: " + s); return (s.match(/[\\d.]+/g) || []).slice(0, 3).map(Number); };
  const lum = (s) => { const [r, g, b] = ch(s).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const la = lum(a), lb = lum(b); const hi = Math.max(la, lb), lo = Math.min(la, lb); return (hi + 0.05) / (lo + 0.05);
}`;

test.describe("Stage 8 desktop (paper selector + card)", () => {
  test.skip(!PAPER, "paper selector / card flags are off");
  test.beforeEach(() => {
    test.skip(test.info().project.name !== "w1440", "sizes are set inside the tests; run once");
  });

  for (const [vw, vh] of [[1280, 800], [1440, 900], [1512, 982], [1920, 1080]] as const) {
    test(`TASK-309: at ${vw}x${vh} the arrow stays off the selected tile's name and no name truncates`, async ({ page }) => {
      test.setTimeout(90_000);
      await open(page, vw, vh, "light", "teachspark");
      const tile = page.locator('.pf-carousel[data-paper-selector] .pf-thumb[aria-selected="true"]');
      await expect(tile).toHaveCount(1);
      const m = await page.evaluate(() => {
        const tile = document.querySelector('.pf-carousel[data-paper-selector] .pf-thumb[aria-selected="true"]')!;
        const name = tile.querySelector(".pf-thumb-name")!;
        const arrow = document.querySelector(".pf-vcar-pointer")!.getBoundingClientRect();
        const t = tile.getBoundingClientRect();
        const n = name.getBoundingClientRect();
        const names = [...document.querySelectorAll(".pf-carousel[data-paper-selector] .pf-thumb-name")].map((el) => ({
          text: el.textContent,
          over: (el as HTMLElement).scrollWidth - (el as HTMLElement).clientWidth,
        }));
        return { arrowLeft: arrow.left, arrowRight: arrow.right, tileRight: t.right, nameRight: n.right, names };
      });
      // the arrow's base may straddle the border, but its box starts to the right of the name's box
      expect(m.arrowLeft, `arrow ${m.arrowLeft} vs name right ${m.nameRight}`).toBeGreaterThanOrEqual(m.nameRight);
      expect(m.arrowLeft, "no more than ~6 px of the arrow is inside the tile").toBeGreaterThanOrEqual(m.tileRight - 6);
      for (const n of m.names) expect(n.over, `${n.text} is not cut with an ellipsis`).toBeLessThanOrEqual(0);
    });
  }

  for (const theme of ["light", "dark"] as const) {
    test(`TASK-310: text contrast >= 4.5:1 on the card and the selector, ${theme}`, async ({ page }) => {
      await open(page, 1440, 900, theme, "teachspark");
      const ratios = await page.evaluate((fn) => {
        const contrast = new Function(`return ${fn}`)() as (a: string, b: string) => number;
        const cs = (sel: string) => getComputedStyle(document.querySelector(sel)!);
        const bgOf = (el: Element) => {
          let e: Element | null = el;
          while (e) {
            const bg = getComputedStyle(e).backgroundColor;
            const alpha = bg.startsWith("rgba") ? Number(bg.match(/[\d.]+/g)?.[3] ?? 1) : 1;
            if (bg && alpha >= 0.99) return bg; // translucent tints (e.g. the counter's row) are not the surface
            e = e.parentElement;
          }
          return "rgb(255, 255, 255)";
        };
        const pair = (textSel: string, bgSel?: string, bg?: string) => {
          const el = document.querySelector(textSel)!;
          return contrast(getComputedStyle(el).color, bg ?? (bgSel ? cs(bgSel).backgroundColor : bgOf(el)));
        };
        // the selector panel's parchment is painted by its ::before, so no ancestor carries a background colour
        const panelBg = getComputedStyle(document.querySelector(".pf-carousel[data-paper-selector]")!, "::before").backgroundColor;
        return {
          cta: pair('.pf-paper .pf-action[data-tier="primary"] .pf-action-label', '.pf-paper .pf-action[data-tier="primary"]'),
          tagline: pair(".pf-paper .pf-info-tagline"),
          tileNum: pair('[data-paper-selector] .pf-thumb[aria-selected="true"] .pf-thumb-num', '[data-paper-selector] .pf-thumb[aria-selected="true"]'),
          counterCur: pair("[data-paper-selector] .pf-count .ps-cur", undefined, panelBg),
        };
      }, CONTRAST);
      for (const [name, ratio] of Object.entries(ratios)) expect(ratio, `${name} ${theme}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    });
  }

  for (const [vw, vh] of [[1024, 768], [1100, 800], [1180, 820], [1280, 800]] as const) {
    for (const theme of ["light", "dark"] as const) {
      test(`TASK-311: at ${vw}x${vh} ${theme} the card keeps its pills and actions inside itself`, async ({ page }) => {
        test.setTimeout(90_000);
        await open(page, vw, vh, theme, "teachspark");
        const card = page.locator(".pf-info.pf-paper");
        await expect(card).toHaveCount(1);
        const m = await page.evaluate(() => {
          const card = document.querySelector(".pf-info.pf-paper")!;
          const c = card.getBoundingClientRect();
          const out = (el: Element) => {
            const r = el.getBoundingClientRect();
            return r.bottom > c.bottom + 1 || r.right > c.right + 1 || r.left < c.left - 1
              ? `${el.className} ${Math.round(r.left)},${Math.round(r.right)},${Math.round(r.bottom)} vs card ${Math.round(c.left)},${Math.round(c.right)},${Math.round(c.bottom)}`
              : null;
          };
          // (the pager row straddles the card's bottom edge by design, so it is not part of this check)
          const outside = [...card.querySelectorAll(".pf-action, .pf-pc-pills li")].map(out).filter(Boolean);
          const cut = [...card.querySelectorAll(".pf-action-label, .pf-pc-pills li, .pf-info-kicker")]
            .filter((el) => (el as HTMLElement).offsetWidth > 2) // the sr-only labels of the icon row are 1 px by design
            .map((el) => ({ text: el.textContent?.trim(), over: (el as HTMLElement).scrollWidth - (el as HTMLElement).clientWidth }))
            .filter((x) => x.over > 1);
          const secondaries = [...card.querySelectorAll('.pf-action[data-tier="secondary"]')].map((el) => ({
            name: (el as HTMLElement).getAttribute("aria-label") || el.textContent?.trim(),
            w: el.getBoundingClientRect().width,
            h: el.getBoundingClientRect().height,
          }));
          return { outside, cut, secondaries };
        });
        expect(m.outside, "nothing sticks out of the card").toEqual([]);
        expect(m.cut, "no label or pill is truncated").toEqual([]);
        for (const s of m.secondaries) {
          expect(s.name, "every icon-row action keeps an accessible name").toBeTruthy();
          expect(Math.min(s.w, s.h), `${s.name} is a >= 40 px target`).toBeGreaterThanOrEqual(40);
        }
      });
    }
  }

  // Stage 12 RCA1 (QA-013): the narrow-card container query once fired at 1440 (it measures the card's CONTENT box, ~299 px there),
  // stripping the approved 1440 card of its action labels and category. Above the narrow band the card must stay complete.
  for (const [vw, vh] of [[1440, 900], [1512, 982], [1920, 1080]] as const) {
    for (const theme of ["light", "dark"] as const) {
      test(`RCA1: at ${vw}x${vh} ${theme} the paper card keeps its secondary labels and category (QA-013)`, async ({ page }) => {
        await open(page, vw, vh, theme, "teachspark");
        const m = await page.evaluate(() => {
          const card = document.querySelector(".pf-info.pf-paper")!;
          const labels = [...card.querySelectorAll('.pf-action[data-tier="secondary"] .pf-action-label')].map((el) => ({ text: el.textContent?.trim(), w: (el as HTMLElement).offsetWidth, pos: getComputedStyle(el).position }));
          const cat = card.querySelector(".pf-info-category") as HTMLElement | null;
          const tail = card.querySelector('.pf-action[data-tier="primary"] .pf-action-tail') as HTMLElement | null;
          return { labels, catW: cat?.offsetWidth ?? 0, catPos: cat ? getComputedStyle(cat).position : "", tailShown: tail ? getComputedStyle(tail).display !== "none" : null };
        });
        expect(m.labels.length, "the card has secondary actions").toBeGreaterThan(0);
        for (const l of m.labels) {
          expect(l.pos, `${l.text} label is laid out, not clipped`).not.toBe("absolute");
          expect(l.w, `${l.text} label is visible`).toBeGreaterThan(20);
        }
        expect(m.catPos, "the category is laid out, not clipped").not.toBe("absolute");
        expect(m.catW, "the category is visible").toBeGreaterThan(10);
        expect(m.tailShown, "the CTA reads 'Watch demo video'").toBe(true);
      });
    }
  }

  for (const [vw, vh] of [[1024, 768], [1440, 900]] as const) {
    test(`TASK-334: at ${vw}x${vh} the card has no arrows, index or pager and the selector alone drives selection`, async ({ page }) => {
      await open(page, vw, vh, "light", PERSONAL[2]!.slug);
      // not rendered at all, so nothing is hidden-but-focusable and nothing is in the accessibility tree
      await expect(page.locator(".pf-info .pf-info-nav, .pf-info .pf-info-pager, .pf-info .pf-info-arrow, .pf-info .pf-info-dot, .pf-info .pf-info-count")).toHaveCount(0);
      await expect(page.getByRole("group", { name: "Browse products" })).toHaveCount(0);
      await expect(page.getByRole("group", { name: "Product position" })).toHaveCount(0);
      await expect(page.locator(".pf-info .pf-info-category")).toHaveCount(1);
      const panel = page.getByRole("tabpanel");
      await page.getByRole("tab", { selected: true }).focus();
      await page.keyboard.press("ArrowDown");
      await expect(panel).toHaveAttribute("data-active-product", PERSONAL[3]!.slug);
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("ArrowUp");
      await expect(panel).toHaveAttribute("data-active-product", PERSONAL[1]!.slug);
      await page.keyboard.press("End");
      await expect(panel).toHaveAttribute("data-active-product", PERSONAL.at(-1)!.slug);
      await page.keyboard.press("Home");
      await expect(panel).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
      await expect(page.locator(".pf-showcase .pf-count")).toHaveText(`01 / ${String(PERSONAL.length).padStart(2, "0")}`);
      // the selector's own up / down buttons still wrap
      await page.locator('.pf-carousel[data-paper-selector] .pf-arrow[data-dir="prev"]').click();
      await expect(panel).toHaveAttribute("data-active-product", PERSONAL.at(-1)!.slug);
    });
  }

  for (const [vw, vh] of [[1180, 820], [1280, 720], [1280, 800], [1366, 768], [1440, 900], [1800, 900], [1920, 1080]] as const) {
    test(`TASK-332: at ${vw}x${vh} every description is >= 13 px, uncut, with <= 24 px above the CTA`, async ({ page }) => {
      test.setTimeout(120_000);
      await open(page, vw, vh, "light", PERSONAL[0]!.slug);
      for (const project of PERSONAL) {
        await page.locator(`[role="tab"][data-product="${project.slug}"]`).evaluate((el) => (el as HTMLElement).click());
        await expect(page.locator(`[role="tab"][data-product="${project.slug}"]`)).toHaveAttribute("aria-selected", "true");
        await page.waitForTimeout(120);
        const m = await page.evaluate(() => {
          const card = document.querySelector(".pf-info.pf-paper")!.getBoundingClientRect();
          const desc = [...document.querySelectorAll(".pf-info.pf-paper .pf-info-desc")].find((e) => getComputedStyle(e).display !== "none") as HTMLElement;
          const r = desc.getBoundingClientRect();
          const acts = document.querySelector(".pf-info.pf-paper .pf-action-set")!.getBoundingClientRect();
          const pills = document.querySelector(".pf-info.pf-paper .pf-pc-pills")!.getBoundingClientRect();
          return { shown: getComputedStyle(desc).display !== "none", fs: parseFloat(getComputedStyle(desc).fontSize), h: r.height, top: r.top, bottom: r.bottom, cut: desc.scrollHeight - desc.clientHeight, cardBottom: card.bottom, cardH: card.height, actsTop: acts.top, actsBottom: acts.bottom, pillsBottom: pills.bottom };
        });
        const at = `${project.slug} @${vw}`;
        expect(m.shown, `${at}: the description is shown`).toBe(true);
        expect(m.fs, `${at}: description size`).toBeGreaterThanOrEqual(13);
        expect(m.cut, `${at}: the description is not cut off`).toBeLessThanOrEqual(1);
        expect(m.top, `${at}: below the pills`).toBeGreaterThanOrEqual(m.pillsBottom - 1);
        // TASK-347: in the 330-500 px card tier the two capped gaps (<= 24 px each, asserted by the TASK-347 test) take height first and the
        // rest sits above the actions, which stay at the card's bottom padding - so allow that remainder (<= 64 px) there; taller cards keep 24 px
        const ctaCap = m.cardH <= 500 ? 64 : 24;
        expect(m.actsTop - m.bottom, `${at}: gap above the CTA`).toBeLessThanOrEqual(ctaCap);
        expect(m.actsTop - m.bottom, `${at}: description clears the CTA`).toBeGreaterThanOrEqual(0);
        expect(m.actsBottom, `${at}: actions inside the card`).toBeLessThanOrEqual(m.cardBottom + 1);
      }
    });
  }

  // TASK-347: the free height above the poster and above the description is shared, but each gap stays within 4-24 px (the tagline never touches the poster)
  for (const [vw, vh] of [[1180, 820], [1280, 720], [1366, 768], [1440, 900], [1512, 982]] as const) {
    test(`TASK-347: at ${vw}x${vh} the tagline clears the poster by >= 4 px and neither free-height gap exceeds 24 px`, async ({ page }) => {
      test.setTimeout(120_000);
      await open(page, vw, vh, "light", PERSONAL[0]!.slug);
      for (const project of PERSONAL) {
        await page.locator(`[role="tab"][data-product="${project.slug}"]`).evaluate((el) => (el as HTMLElement).click());
        await expect(page.locator(`[role="tab"][data-product="${project.slug}"]`)).toHaveAttribute("aria-selected", "true");
        await page.waitForTimeout(120);
        const m = await page.evaluate(() => {
          const q = (sel: string) => [...document.querySelectorAll(`.pf-info.pf-paper ${sel}`)].find((e) => getComputedStyle(e).display !== "none")!.getBoundingClientRect();
          const card = document.querySelector(".pf-info.pf-paper")!.getBoundingClientRect();
          return { aboveGap: q(".pf-info-poster-frame").top - q(".pf-info-tagline").bottom, descGap: q(".pf-info-desc").top - q(".pf-pc-pills").bottom, actsBottom: q(".pf-action-set").bottom, cardBottom: card.bottom };
        });
        const at = `${project.slug} @${vw}`;
        expect(m.aboveGap, `${at}: tagline -> poster`).toBeGreaterThanOrEqual(4);
        expect(m.aboveGap, `${at}: gap above the poster`).toBeLessThanOrEqual(24);
        expect(m.descGap, `${at}: gap above the description`).toBeLessThanOrEqual(24);
        expect(m.descGap, `${at}: pills clear the description`).toBeGreaterThanOrEqual(-1);
        expect(m.actsBottom, `${at}: actions inside the card`).toBeLessThanOrEqual(m.cardBottom + 1);
        expect(m.cardBottom - m.actsBottom, `${at}: blank below the actions`).toBeLessThanOrEqual(16);
      }
    });
  }

  // TASK-333 (DES-023): which videos the stage actually started - every iframe added to the page, recorded by its src
  const recordStarts = (page: Page) =>
    page.addInitScript(() => {
      const w = window as unknown as { __starts: string[] };
      w.__starts = [];
      new MutationObserver((records) => {
        for (const r of records) for (const n of r.addedNodes) for (const f of n instanceof Element ? [n, ...n.querySelectorAll("*")] : []) if (f instanceof HTMLIFrameElement) w.__starts.push(f.src);
      }).observe(document, { childList: true, subtree: true });
    });
  const starts = (page: Page) => page.evaluate(() => (window as unknown as { __starts: string[] }).__starts);
  const videoOf = (slug: string) => {
    const e = portfolioEntries.find((x) => x.slug === slug)!;
    return (e.pitchVideo ?? e.demoVideo)!.videoId;
  };

  test("TASK-333: rapid ArrowDown x4 starts at most one player - the last product's, after the selection settles", async ({ page }) => {
    await recordStarts(page);
    await open(page, 1440, 900, "light", PERSONAL[0]!.slug);
    expect(await starts(page), "a page load starts nothing").toEqual([]);
    await page.getByRole("tab", { selected: true }).focus();
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(120);
    }
    await expect(page.getByRole("tabpanel")).toHaveAttribute("data-active-product", PERSONAL[4]!.slug);
    expect(await starts(page), "no video per step while the keys are still arriving").toEqual([]);
    await expect(page.locator(".pf-stage iframe")).toHaveCount(1, { timeout: 4000 });
    const all = await starts(page);
    expect(all, "exactly one start").toHaveLength(1);
    expect(all[0]).toContain(`/embed/${videoOf(PERSONAL[4]!.slug)}`);
  });

  test("TASK-333: clicking the selector's up / down buttons is browsing - 4 clicks 350 ms apart start one video, after the last", async ({ page }) => {
    await recordStarts(page);
    await open(page, 1440, 900, "light", PERSONAL[0]!.slug);
    const down = page.locator('.pf-carousel[data-paper-selector] .pf-arrow[data-dir="next"]');
    for (let i = 0; i < 4; i++) {
      await down.evaluate((el) => (el as HTMLElement).click()); // a direct click event: Playwright's own actionability waits would stretch the spacing under load
      await page.waitForTimeout(350);
    }
    await expect(page.getByRole("tabpanel")).toHaveAttribute("data-active-product", PERSONAL[4]!.slug);
    expect(await starts(page), "no video starts while the clicks are still arriving").toEqual([]);
    await expect(page.locator(".pf-stage iframe")).toHaveCount(1, { timeout: 4000 });
    const all = await starts(page);
    expect(all).toHaveLength(1);
    expect(all[0]).toContain(`/embed/${videoOf(PERSONAL[4]!.slug)}`);
  });

  test("TASK-333: Home / End browse the same way (debounced)", async ({ page }) => {
    await recordStarts(page);
    await open(page, 1440, 900, "light", PERSONAL[2]!.slug);
    await page.getByRole("tab", { selected: true }).focus();
    await page.keyboard.press("End");
    await page.keyboard.press("Home");
    await expect(page.getByRole("tabpanel")).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
    expect(await starts(page)).toEqual([]);
    await expect(page.locator(".pf-stage iframe")).toHaveCount(1, { timeout: 4000 });
    expect(await starts(page)).toHaveLength(1);
  });

  test("TASK-333: a pointer click on a tile starts its video immediately", async ({ page }) => {
    await recordStarts(page);
    await open(page, 1440, 900, "light", PERSONAL[0]!.slug);
    await page.locator(`[role="tab"][data-product="${PERSONAL[3]!.slug}"]`).click();
    await expect(page.locator(".pf-stage iframe"), "well inside the 700 ms browse delay").toHaveCount(1, { timeout: 500 });
    expect((await starts(page))[0]).toContain(`/embed/${videoOf(PERSONAL[3]!.slug)}`);
  });

  test("TASK-333: Enter on a focused tile starts its video immediately", async ({ page }) => {
    await open(page, 1440, 900, "light", PERSONAL[0]!.slug);
    await page.getByRole("tab", { selected: true }).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.locator(".pf-stage iframe")).toHaveCount(1, { timeout: 500 });
  });

  test("TASK-333: under reduced motion nothing auto-starts - the poster and its Watch control stay until it is pressed", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, 1440, 900, "light", PERSONAL[0]!.slug);
    await page.locator(`[role="tab"][data-product="${PERSONAL[3]!.slug}"]`).click();
    await expect(page.getByRole("tabpanel")).toHaveAttribute("data-active-product", PERSONAL[3]!.slug);
    await page.getByRole("tab", { selected: true }).focus();
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(1500);
    await expect(page.locator(".pf-stage iframe")).toHaveCount(0);
    const watch = page.locator(".pf-stage-screen > .pf-play");
    await expect(watch).toBeVisible();
    await watch.click();
    await expect(page.locator(".pf-stage iframe")).toHaveCount(1);
  });

  // TASK-331 (DES-020): label floors - tagline 14, action labels 13, kicker 11.5, selector label + counter 11.5, pills 10.5
  // (10 inside the narrow <= 280 px card block, where they wrap) - and nothing overflows, leaves the card or truncates.
  for (const [vw, vh] of [[1024, 768], [1100, 800], [1180, 820], [1280, 800], [1366, 768], [1440, 900], [1512, 982], [1920, 1080]] as const) {
    for (const theme of ["light", "dark"] as const) {
      test(`TASK-331: at ${vw}x${vh} ${theme} labels meet their size floors and nothing overflows (all products)`, async ({ page }) => {
        test.setTimeout(150_000);
        await open(page, vw, vh, theme, PERSONAL[0]!.slug);
        for (const project of PERSONAL) {
          await page.locator(`[role="tab"][data-product="${project.slug}"]`).evaluate((el) => (el as HTMLElement).click());
          await expect(page.locator(`[role="tab"][data-product="${project.slug}"]`)).toHaveAttribute("aria-selected", "true");
          await page.waitForTimeout(120);
          const m = await page.evaluate(() => {
            const card = document.querySelector(".pf-info.pf-paper")!;
            const c = card.getBoundingClientRect();
            const sel = document.querySelector(".pf-carousel[data-paper-selector]")!;
            const size = (root: Element, q: string) => [...root.querySelectorAll(q)].filter((e) => (e as HTMLElement).offsetWidth > 2).map((e) => parseFloat(getComputedStyle(e).fontSize));
            const cs = getComputedStyle(card);
            const content = card.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
            const text = [".pf-info-kicker", ".pf-info-category", ".pf-info-tagline", ".pf-info-desc", ".pf-action-label", ".pf-pc-pills li", ".pf-action", ".pf-info-name"];
            const bad = [...card.querySelectorAll(text.join(","))]
              .filter((e) => (e as HTMLElement).offsetWidth > 2)
              .filter((e) => { const r = e.getBoundingClientRect(); return e.scrollWidth - e.clientWidth > 1 || r.right > c.right + 1 || r.left < c.left - 1 || r.bottom > c.bottom + 1; })
              .map((e) => `${e.className || e.tagName}: ${e.textContent?.trim().slice(0, 24)}`);
            const names = [...sel.querySelectorAll(".pf-thumb-name")].filter((e) => (e as HTMLElement).offsetWidth > 0 && e.scrollWidth - e.clientWidth > 0).length;
            const tag = [...sel.querySelectorAll(".pf-carousel-tag *")].filter((e) => e.scrollWidth > e.clientWidth + 1).length;
            // review F1: the whole header (title + counter) stays inside the selector panel's box
            const panel = sel.getBoundingClientRect();
            const header = [...sel.querySelectorAll(".pf-carousel-tag > *")].map((e) => e.getBoundingClientRect());
            const headerOut = Math.max(...header.map((r) => r.right - panel.right), ...header.map((r) => panel.left - r.left));
            // review F3: the nav-less card's kicker is not a blank band - its category shows
            const cat = card.querySelector(".pf-info-category") as HTMLElement | null;
            return {
              narrow: content <= 280,
              tagline: size(card, ".pf-info-tagline"), kicker: size(card, ".pf-info-kicker"), cta: size(card, '.pf-action[data-tier="primary"] .pf-action-label'),
              secondary: size(card, '.pf-action[data-tier="secondary"] .pf-action-label'), pills: size(card, ".pf-pc-pills li"),
              label: size(sel, ".pf-select"), counter: size(sel, ".pf-count"), bad, names, tag, headerOut, catShown: !!cat && cat.offsetWidth > 5, page: document.documentElement.scrollWidth - window.innerWidth,
            };
          });
          const at = `${project.slug}`;
          for (const v of m.tagline) expect(v, `${at} tagline`).toBeGreaterThanOrEqual(14);
          for (const v of m.cta) expect(v, `${at} CTA`).toBeGreaterThanOrEqual(13);
          for (const v of m.secondary) expect(v, `${at} secondary label`).toBeGreaterThanOrEqual(13);
          for (const v of m.kicker) expect(v, `${at} kicker`).toBeGreaterThanOrEqual(11.5);
          for (const v of [...m.label, ...m.counter]) expect(v, `${at} selector label / counter`).toBeGreaterThanOrEqual(11.5);
          for (const v of m.pills) expect(v, `${at} pill (narrow ${m.narrow})`).toBeGreaterThanOrEqual(m.narrow ? 10 : 10.5);
          expect(m.bad, `${at} nothing overflows, truncates or leaves the card`).toEqual([]);
          expect(m.names, `${at} selector names never truncate`).toBe(0);
          expect(m.tag, `${at} selector header fits`).toBe(0);
          expect(m.headerOut, `${at} selector header (title + counter) stays inside the panel (${m.headerOut}px past it)`).toBeLessThanOrEqual(-1);
          expect(m.catShown, `${at} the kicker shows the category (no blank band)`).toBe(true);
          expect(m.page, "no horizontal page scroll").toBeLessThanOrEqual(0);
        }
      });
    }
  }

  test("TASK-336: at 1920x1080 the showcase scales up and the description-to-CTA gap closes (every product)", async ({ page }) => {
    test.setTimeout(120_000);
    await open(page, 1920, 1080, "light", PERSONAL[0]!.slug);
    for (const project of PERSONAL) {
      await page.locator(`[role="tab"][data-product="${project.slug}"]`).evaluate((el) => (el as HTMLElement).click());
      await expect(page.locator(`[role="tab"][data-product="${project.slug}"]`)).toHaveAttribute("aria-selected", "true");
      await page.waitForTimeout(120);
      const m = await page.evaluate(() => {
        const card = document.querySelector(".pf-info.pf-paper")!;
        const px = (q: string, root: ParentNode = card) => parseFloat(getComputedStyle(root.querySelector(q)!).fontSize);
        const desc = card.querySelector(".pf-info-desc")!.getBoundingClientRect();
        const cta = card.querySelector(".pf-action-set")!.getBoundingClientRect();
        const c = card.getBoundingClientRect();
        return { tile: px(".pf-thumb[aria-selected='true'] .pf-thumb-name", document), tagline: px(".pf-info-tagline"), desc: px(".pf-info-desc"), gap: cta.top - desc.bottom, out: cta.bottom - c.bottom };
      });
      expect(m.tile, `${project.slug} tile name`).toBeGreaterThanOrEqual(15);
      expect(m.tagline, `${project.slug} tagline`).toBeGreaterThanOrEqual(20);
      expect(m.desc, `${project.slug} description`).toBeGreaterThanOrEqual(16);
      expect(m.gap, `${project.slug}: no ~80 px dead space above the CTA`).toBeLessThanOrEqual(60);
      expect(m.out, `${project.slug}: actions inside the card`).toBeLessThanOrEqual(1);
    }
  });

  for (const [vw, vh] of [[1440, 900], [1512, 982]] as const) {
    test(`TASK-336: ${vw}x${vh} keeps the pre-scale-up sizes`, async ({ page }) => {
      await open(page, vw, vh, "light", "teachspark");
      const m = await page.evaluate(() => {
        const px = (q: string) => parseFloat(getComputedStyle(document.querySelector(q)!).fontSize);
        return { tile: px(".pf-thumb[aria-selected='true'] .pf-thumb-name"), tagline: px(".pf-info-tagline"), desc: px(".pf-info-desc"), clamp: getComputedStyle(document.querySelector(".pf-info-desc")!).webkitLineClamp, cta: px('.pf-action[data-tier="primary"] .pf-action-label') };
      });
      expect(m.tile).toBeLessThan(14);
      expect(m.tagline).toBeLessThan(16);
      expect(m.desc).toBeLessThan(14);
      expect(m.cta).toBeLessThanOrEqual(15);
    });
  }

  for (const [vw, vh, shown] of [[1024, 768, false], [1100, 800, false], [1180, 820, false], [1280, 800, true], [1440, 900, true]] as const) {
    test(`TASK-337: at ${vw}x${vh} the poster title chip is ${shown ? "shown" : "hidden"} and the product name stays accessible`, async ({ page }) => {
      await open(page, vw, vh, "light", "urja");
      // a deep link lands on the poster (nothing auto-starts), which is where the chip lives
      const chip = page.locator(".pf-stage .pp-title");
      await expect(chip).toHaveCount(1);
      if (shown) await expect(chip).toBeVisible();
      else await expect(chip).toBeHidden();
      const play = page.locator(".pf-stage-screen > .pf-play");
      await expect(play).toHaveAccessibleName(/^Play .+/);
      await expect(page.locator(".pf-stage figcaption")).not.toHaveText("");
    });
  }

  test("TASK-313: while the player loads, the poster stays and a loading cue shows (YouTube blocked)", async ({ page }) => {
    test.skip(!PAPER_PLAYER_ENABLED, "paper player flag is off");
    await page.route(/youtube(-nocookie)?\.com/, (route) => route.abort());
    await open(page, 1440, 900, "light", "urja");
    await page.locator(".pf-stage-screen > .pf-play").click();
    const screen = page.locator(".pf-stage-screen");
    await expect(screen).toHaveAttribute("data-player-state", "loading");
    await expect(screen.locator("iframe")).toHaveCount(1);
    await expect(screen.locator("img").first(), "the poster is kept over the iframe").toBeVisible();
    await expect(screen.locator("[data-loading-status]"), "assistive tech hears the loading state").toHaveText(/Loading video/);
    const cue = await screen.evaluate((el) => getComputedStyle(el, "::before").content);
    expect(cue).toContain("Loading video");
    // the existing error path still follows once the player never answers
    await expect(screen).toHaveAttribute("data-player-state", "error", { timeout: 15_000 });
  });

  for (const vw of [1280, 1440] as const) {
    test(`TASK-314: no product's card category truncates at ${vw}`, async ({ page }) => {
      test.setTimeout(150_000);
      await open(page, vw, vw === 1280 ? 800 : 900, "light", PERSONAL[0]!.slug);
      for (const project of PERSONAL) {
        await page.locator(`[role="tab"][data-product="${project.slug}"]`).click();
        await expect(page.locator(`[role="tab"][data-product="${project.slug}"]`)).toHaveAttribute("aria-selected", "true");
        await page.waitForTimeout(150);
        // in the narrow-card band (≤ 280 px content) the category is clipped for assistive tech only (sr-only pattern) — not a truncation
        const over = await page.locator(".pf-paper .pf-info-category").evaluate((el) => (el.textContent && (el as HTMLElement).offsetWidth > 2 ? el.scrollWidth - el.clientWidth : 0));
        expect(over, `${project.name} category fits`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("TASK-315: the stage's Watch on YouTube link has a >= 44 px hit area", async ({ page }) => {
    test.skip(!PAPER_PLAYER_ENABLED, "paper player flag is off");
    await open(page, 1440, 900, "light", "urja");
    const m = await page.locator(".pf-paper .pp-watch").evaluate((el) => {
      const r = el.getBoundingClientRect();
      const b = getComputedStyle(el, "::before");
      return { h: r.height, top: parseFloat(b.top), bottom: parseFloat(b.bottom), content: b.content, position: b.position };
    });
    expect(m.content).toBe('""');
    expect(m.position).toBe("absolute");
    expect(m.h - m.top - m.bottom, "pill height plus the invisible ring").toBeGreaterThanOrEqual(44);
  });
});

test.describe("Stage 8 phone", () => {
  test("TASK-312: Watch demo lands the stage below the fixed header", async ({ page }) => {
    test.skip(test.info().project.name !== "w390", "phone only");
    await page.goto("/projects?product=railcite", { waitUntil: "load" });
    await page.waitForFunction(() => {
      const el = document.querySelector(".pf-showcase");
      return !!el && Object.keys(el).some((k) => k.startsWith("__react"));
    });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.getByRole("button", { name: "Watch demo" }).click();
    await expect(page.locator("#pf-stage-screen iframe")).toHaveCount(1);
    await page.waitForTimeout(1200); // the smooth scroll settles
    const m = await page.evaluate(() => {
      const header = document.querySelector("header[data-site-header]")!.getBoundingClientRect();
      const stage = document.getElementById("pf-stage-screen")!.getBoundingClientRect();
      const under = document.elementFromPoint(stage.left + stage.width / 2, stage.top + 2);
      return { headerBottom: header.bottom, stageTop: stage.top, coveredBy: under?.closest("header") ? "header" : "stage" };
    });
    expect(m.stageTop, `stage top ${m.stageTop} vs header bottom ${m.headerBottom}`).toBeGreaterThanOrEqual(m.headerBottom - 1);
    expect(m.coveredBy).toBe("stage");
  });
});

test.describe("Stage 8 tablet", () => {
  test("TASK-316: carousel tile names and categories wrap instead of truncating", async ({ page }) => {
    test.skip(test.info().project.name !== "w768", "tablet only");
    await page.goto("/projects", { waitUntil: "load" });
    await page.waitForFunction(() => {
      const tab = document.querySelector('[role="tab"]');
      return !!tab && Object.keys(tab).some((k) => k.startsWith("__react"));
    });
    await page.evaluate(() => document.fonts.ready);
    const cut = await page.evaluate(() =>
      [...document.querySelectorAll(".pf-showcase .pf-thumb-name, .pf-showcase .pf-thumb-cat")]
        .map((el) => ({
          text: el.textContent?.trim(),
          overX: (el as HTMLElement).scrollWidth - (el as HTMLElement).clientWidth,
          overY: (el as HTMLElement).scrollHeight - (el as HTMLElement).clientHeight,
          ellipsis: getComputedStyle(el).textOverflow,
        }))
        .filter((x) => x.overX > 1 || x.overY > 1 || x.ellipsis === "ellipsis"),
    );
    expect(cut, "every tile name and category fits in its two lines").toEqual([]);
  });
});
