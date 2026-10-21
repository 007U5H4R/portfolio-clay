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

/** WCAG 2.x contrast of two computed `rgb(…)` / `rgba(…)` colours (alpha ignored — every colour under test is opaque). */
const CONTRAST = `(a, b) => {
  const ch = (s) => (s.match(/[\\d.]+/g) || []).slice(0, 3).map(Number);
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
            if (bg && !bg.startsWith("rgba(0, 0, 0, 0)")) return bg;
            e = e.parentElement;
          }
          return "rgb(255, 255, 255)";
        };
        const pair = (textSel: string, bgSel?: string) => {
          const el = document.querySelector(textSel)!;
          return contrast(getComputedStyle(el).color, bgSel ? cs(bgSel).backgroundColor : bgOf(el));
        };
        return {
          cta: pair('.pf-paper .pf-action[data-tier="primary"] .pf-action-label', '.pf-paper .pf-action[data-tier="primary"]'),
          tagline: pair(".pf-paper .pf-info-tagline"),
          count: pair(".pf-paper .pf-info-count"),
          tileNum: pair('[data-paper-selector] .pf-thumb[aria-selected="true"] .pf-thumb-num', '[data-paper-selector] .pf-thumb[aria-selected="true"]'),
          counterCur: pair("[data-paper-selector] .pf-count .ps-cur"),
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
          const outside = [...card.querySelectorAll(".pf-action, .pf-pc-pills li, .pf-info-pager")].map(out).filter(Boolean);
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

  test("TASK-313: while the player loads, the poster stays and a loading cue shows (YouTube blocked)", async ({ page }) => {
    test.skip(!PAPER_PLAYER_ENABLED, "paper player flag is off");
    await page.route(/youtube(-nocookie)?\.com/, (route) => route.abort());
    await open(page, 1440, 900, "light", "urja");
    await page.locator(".pf-stage-screen > .pf-play").click();
    const screen = page.locator(".pf-stage-screen");
    await expect(screen).toHaveAttribute("data-player-state", "loading");
    await expect(screen.locator("iframe")).toHaveCount(1);
    await expect(screen.locator(".pf-stage-poster[data-loading-poster]"), "the poster is kept over the iframe").toBeVisible();
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
        const over = await page.locator(".pf-paper .pf-info-category").evaluate((el) => (el.textContent ? el.scrollWidth - el.clientWidth : 0));
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
