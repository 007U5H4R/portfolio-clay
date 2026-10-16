/**
 * portfolio-mobile.spec.ts (TASK-233) — the phone Portfolio: Enterprise & Client Work as a one-card swipe carousel with
 * the shared liquid pagination, and the My Projects list as frosted-glass cards.
 *
 * Phone (< 640, asserted from the w390 project, widths 320 / 360 / 375 / 390 / 412 / 430 set by hand, both themes):
 *   ENTERPRISE  one case file visible; a real touch swipe advances it; one marker per case; the capsule follows the swipe and
 *               a tap on a marker moves the carousel; heading + dock stay put; the pagination clears the dock; an open
 *               dossier is not clipped, only one is open, and leaving the slide closes it.
 *   LIST        the card is a real glass layer (computed backdrop blur, fill alpha <= 0.7), title + tagline pass axe, the
 *               thumbnails are crisp (no filter anywhere on their path); reduced motion and reduced transparency both work.
 *   ALL         every control is >= 44 x 44 and nothing overflows horizontally.
 * >= 640: the carousel wrapper is `display: contents`, the pagination is hidden, the grid is a grid, the glass is off.
 */
import type { Locator, Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { enterpriseCases } from "@/data/enterprise";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const WIDTHS = [320, 360, 375, 390, 412, 430];
const THEMES = ["light", "dark"] as const;
const DOCK = ".mobile-dock";
const GRID = ".ee-journal .ee-grid";
const DOTS = ".ee-journal .hs-dots";

const setTheme = (page: Page, theme: "light" | "dark") => page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);

async function openAt(page: Page, w: number, theme: "light" | "dark") {
  await page.setViewportSize({ width: w, height: 800 });
  await page.goto("/projects", { waitUntil: "load" });
  await page.waitForFunction(() => {
    const el = document.querySelector(".ee-journal .hs-dots");
    return !!el && Object.keys(el).some((k) => k.startsWith("__react"));
  });
  await setTheme(page, theme);
}

/** A real touch swipe (CDP), so native scroll-snap does the work exactly as on a phone. */
async function swipe(page: Page, target: Locator, dx: number) {
  const box = (await target.boundingBox())!;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.synthesizeScrollGesture", {
    x: Math.round(box.x + box.width / 2),
    y: Math.round(Math.min(box.y + 120, 700)),
    xDistance: dx,
    yDistance: 0,
    gestureSourceType: "touch",
    speed: 900,
  });
  await cdp.detach();
}

const slideIndex = (page: Page) =>
  page.locator(GRID).evaluate((el) => {
    const stride = (el.children[1] as HTMLElement).offsetLeft - (el.children[0] as HTMLElement).offsetLeft;
    return Math.round(el.scrollLeft / stride);
  });
const settled = async (page: Page, index: number) => {
  await expect.poll(() => slideIndex(page), { timeout: 5000 }).toBe(index);
  await page.waitForTimeout(250);
};
const pill = (page: Page) =>
  page.locator(`${DOTS} .hs-dots-pill`).evaluate((el) => {
    const s = (el as HTMLElement).style;
    return { x: Number.parseFloat(s.transform.replace(/translateX\(|px\)/g, "")), w: Number.parseFloat(s.width) };
  });
const rect = (loc: Locator) => loc.evaluate((el) => {
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom, r: r.right };
});

test.describe("Enterprise & Client Work carousel on phones (TASK-233)", () => {
  test.beforeEach(({ page }) => {
    test.skip(width(page) !== 390, "phone tier: widths are swept inside the test (w390 project)");
  });

  for (const w of WIDTHS) {
    for (const theme of THEMES) {
      test(`${w}px ${theme}: one card, swipe + tap sync the capsule, shell stays put, pagination clears the dock`, async ({ page, noOverflow }) => {
        await openAt(page, w, theme);
        const n = enterpriseCases.length;
        await expect(page.locator(`${DOTS} .hs-dot`)).toHaveCount(n); // marker count equals the case count
        await expect(page.locator(`${GRID} > .ee-item`)).toHaveCount(n);
        await page.locator(GRID).scrollIntoViewIfNeeded();
        await page.evaluate(() => document.querySelector(".ee-journal .ee-grid")!.scrollIntoView({ block: "center" }));

        // one card visible
        const visible = () =>
          page.locator(`${GRID} > .ee-item`).evaluateAll((els) => {
            const vw = window.innerWidth;
            return els.filter((el) => {
              const r = el.getBoundingClientRect();
              return Math.min(r.right, vw) - Math.max(r.left, 0) > r.width * 0.5;
            }).length;
          });
        expect(await visible()).toBe(1);

        const heading = page.locator("#pf-enterprise-h");
        const dock = page.locator(DOCK);
        const h0 = await rect(heading);
        const d0 = await rect(dock);
        const first = await pill(page);
        expect(first.x).toBeCloseTo(14 - 12, 0);

        // swipe left: next case, capsule follows
        await swipe(page, page.locator(GRID), -260);
        await settled(page, 1);
        expect(await visible()).toBe(1);
        await expect(page.locator(`${DOTS} .hs-dot`).nth(1)).toHaveAttribute("aria-current", "true");
        const moved = await pill(page);
        expect(moved.x).toBeCloseTo(14 + 28 - 12, 0);
        // the heading, intro and dock did not move
        const h1 = await rect(heading);
        const d1 = await rect(dock);
        expect(h1.x).toBeCloseTo(h0.x, 0);
        expect(h1.y).toBeCloseTo(h0.y, 0);
        expect(d1.y).toBeCloseTo(d0.y, 0);

        // swipe right: back to the first
        await swipe(page, page.locator(GRID), 260);
        await settled(page, 0);
        await expect(page.locator(`${DOTS} .hs-dot`).nth(0)).toHaveAttribute("aria-current", "true");

        // tap the last marker: the carousel moves there and the capsule follows
        await page.locator(`${DOTS} .hs-dot`).nth(n - 1).click();
        await settled(page, n - 1);
        await expect(page.locator(`${DOTS} .hs-dot`).nth(n - 1)).toHaveAttribute("aria-current", "true");
        expect((await pill(page)).x).toBeCloseTo(14 + 28 * (n - 1) - 12, 0);

        // pagination sits directly under the card and clears the fixed dock
        await page.evaluate(() => document.querySelector(".ee-journal .hs-dots")!.scrollIntoView({ block: "end" }));
        const dots = await rect(page.locator(DOTS));
        const card = await rect(page.locator(`${GRID} > .ee-item`).nth(n - 1).locator(".ee-card"));
        const dockNow = await rect(dock);
        expect(dots.y).toBeGreaterThanOrEqual(card.b - 1);
        expect(dots.y - card.b).toBeLessThan(48);
        expect(dots.b).toBeLessThanOrEqual(dockNow.y + 0.5);
        await noOverflow(page);
      });

      test(`${w}px ${theme}: an open dossier is not clipped, one at a time, and closes when its slide is left`, async ({ page, noOverflow }) => {
        await openAt(page, w, theme);
        await page.evaluate(() => document.querySelector(".ee-journal .ee-grid")!.scrollIntoView({ block: "start" }));
        const open = (i: number) => page.locator(`${GRID} > .ee-item`).nth(i).locator(".ee-open");
        await open(0).click();
        await expect(open(0)).toHaveAttribute("aria-expanded", "true");
        const item = page.locator(`${GRID} > .ee-item`).nth(0);
        const dossier = item.locator(".ee-dossier");
        await expect(dossier).toBeVisible();
        const g = await rect(page.locator(GRID));
        const dz = await rect(dossier);
        const c = await rect(item.locator(".ee-card"));
        // inside the carousel's box (it grows with the open slide) and inside the viewport width
        expect(dz.b).toBeLessThanOrEqual(g.b + 0.5);
        expect(c.b).toBeLessThanOrEqual(g.b + 0.5);
        expect(dz.x).toBeGreaterThanOrEqual(0);
        expect(dz.r).toBeLessThanOrEqual(w + 0.5);
        // the whole record is readable by scrolling the page (last line reachable above the dock)
        await page.evaluate(() => document.querySelector(".ee-journal .hs-dots")!.scrollIntoView({ block: "end" }));
        const lastLine = await rect(dossier.locator(".ee-concept"));
        const dockTop = (await rect(page.locator(DOCK))).y;
        expect(lastLine.b).toBeLessThanOrEqual(dockTop + 0.5);
        const clippedBy = await dossier.evaluate((el) => {
          // no ancestor up to the section clips it vertically
          for (let p = el.parentElement; p && p.id !== "enterprise"; p = p.parentElement) {
            const o = getComputedStyle(p);
            if (p.scrollHeight > p.clientHeight + 1 && o.overflowY !== "visible" && o.overflowY !== "auto") return p.className;
            if (p.scrollHeight > p.clientHeight + 1 && o.overflowY === "auto") return `${p.className} scrolls`;
          }
          return null;
        });
        expect(clippedBy).toBeNull();
        await noOverflow(page);

        // leaving the slide closes the dossier; opening another leaves exactly one
        await page.locator(`${DOTS} .hs-dot`).nth(1).click();
        await settled(page, 1);
        await expect(page.locator(".ee-item[data-open]")).toHaveCount(0);
        await expect(open(0)).toHaveAttribute("aria-expanded", "false");
        await open(1).click();
        await expect(page.locator(".ee-item[data-open]")).toHaveCount(1);
        await expect(open(1)).toHaveAttribute("aria-expanded", "true");
      });
    }
  }

  test("controls are at least 44 x 44 and axe finds nothing in the carousel (both themes)", async ({ page, axe, minTargets }) => {
    for (const theme of THEMES) {
      await openAt(page, 390, theme);
      await minTargets(page);
      await axe(page, { include: "#enterprise" });
    }
  });

  test("reduced motion: the carousel still swipes, the capsule snaps without stretching", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openAt(page, 390, "light");
    await page.evaluate(() => document.querySelector(".ee-journal .ee-grid")!.scrollIntoView({ block: "center" }));
    await swipe(page, page.locator(GRID), -260);
    await settled(page, 1);
    const p = await pill(page);
    expect(p.x).toBeCloseTo(30, 0);
    expect(p.w).toBeCloseTo(24, 0); // a resting capsule (no stretch)
    await page.locator(`${DOTS} .hs-dot`).nth(3).click();
    await settled(page, 3);
  });
});

test.describe("My Projects glass list on phones (TASK-233)", () => {
  test.beforeEach(({ page }) => {
    test.skip(width(page) !== 390, "phone tier: widths are swept inside the test (w390 project)");
  });

  for (const w of WIDTHS) {
    for (const theme of THEMES) {
      test(`${w}px ${theme}: cards are see-through blurred glass, text passes axe, thumbnails are crisp`, async ({ page, axe, noOverflow }) => {
        await openAt(page, w, theme);
        const card = page.locator(".pf-m-card").first();
        await card.scrollIntoViewIfNeeded();
        const glass = await card.evaluate((el) => {
          const cs = getComputedStyle(el);
          const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/);
          const parts = m?.[1] ? m[1].split(",").map((x) => Number.parseFloat(x)) : [];
          return { blur: cs.backdropFilter, alpha: parts.length === 4 ? (parts[3] ?? 1) : 1, radius: cs.borderTopLeftRadius };
        });
        expect(glass.blur).toContain("blur");
        expect(glass.alpha).toBeGreaterThan(0.3);
        expect(glass.alpha).toBeLessThanOrEqual(0.7);
        // thumbnails: no filter / backdrop-filter / opacity on the art or anything between it and the card
        const art = await page.locator(".pf-m-card .pf-m-art").first().evaluate((el) => {
          const bad: string[] = [];
          for (let n: Element | null = el; n && !n.classList.contains("pf-m-card"); n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (cs.filter !== "none" || cs.backdropFilter !== "none" || cs.opacity !== "1") bad.push(n.className);
          }
          const img = el.querySelector("img")!;
          const ics = getComputedStyle(img);
          if (ics.filter !== "none" || ics.opacity !== "1") bad.push("img");
          return { bad, loaded: img.complete && img.naturalWidth > 0 };
        });
        expect(art.bad).toEqual([]);
        expect(art.loaded).toBe(true);
        // title + tagline + tags contrast (axe color-contrast) over the real composite
        await axe(page, { include: ".pf-m-cards" });
        // the circular arrow control is a visible circle, and the card (the link) is a 44 px+ target
        const box = await rect(card);
        expect(box.h).toBeGreaterThanOrEqual(44);
        expect(box.w).toBeGreaterThanOrEqual(44);
        const chev = await rect(card.locator(".pf-m-chev"));
        expect(Math.abs(chev.w - chev.h)).toBeLessThan(1);
        await noOverflow(page);
      });
    }
  }

  test("the fill is opaque (no blur) when the browser has no backdrop-filter or prefers reduced transparency", async ({ page }) => {
    await openAt(page, 390, "light");
    // the fallbacks are plain CSS; read them from the shipped stylesheet so the check holds whichever engine runs it
    const rules = await page.evaluate(() => {
      const out = { reduced: "", unsupported: "" };
      const walk = (list: CSSRuleList, ctx: string) => {
        for (const r of Array.from(list)) {
          const g = r as CSSGroupingRule & { conditionText?: string; selectorText?: string; cssText: string };
          if (g.selectorText === undefined && g.cssRules) walk(g.cssRules, `${ctx}|${g.conditionText ?? ""}`);
          else if (g.selectorText?.includes(".pf-m-card.m-float")) {
            if (ctx.includes("prefers-reduced-transparency")) out.reduced += g.cssText;
            if (ctx.includes("not (")) out.unsupported += g.cssText;
          }
        }
      };
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          walk(sheet.cssRules, "");
        } catch {
          /* cross-origin sheet */
        }
      }
      return out;
    });
    expect(rules.reduced).toMatch(/0\.97|f7\b/); // 0.97 alpha (the engine may serialise it as #rrggbbf7)
    expect(rules.reduced).toMatch(/backdrop-filter:\s*none/);
    expect(rules.unsupported).toMatch(/0\.97|f7\b/);
  });

  test("reduced transparency (emulated) drops the blur and makes the fill opaque; reduced motion still renders", async ({ page }) => {
    await openAt(page, 390, "light");
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }] });
    const card = page.locator(".pf-m-card").first();
    const state = await card.evaluate((el) => ({
      matches: matchMedia("(prefers-reduced-transparency: reduce)").matches,
      blur: getComputedStyle(el).backdropFilter,
      bg: getComputedStyle(el).backgroundColor,
    }));
    // Chromium without the media feature cannot be emulated; the stylesheet test above covers the rule then.
    if (state.matches) {
      expect(state.blur).toBe("none");
      expect(state.bg).toMatch(/0\.97\)$/);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(card).toBeVisible();
  });

  test("order, data and routes are unchanged: names, hrefs and the live count", async ({ page }) => {
    await openAt(page, 390, "light");
    const rows = await page.locator(".pf-m-card").evaluateAll((els) =>
      els.map((el) => ({
        name: el.querySelector(".pf-m-name")!.textContent,
        line: el.querySelector(".pf-m-line")!.textContent,
        href: el.getAttribute("href"),
        order: [...el.children].map((c) => (c.getAttribute("class") ?? "").split(" ").find((k) => k.startsWith("pf-m-"))),
      })),
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      expect(r.href).toMatch(/^\/projects\?product=/);
      expect(r.order).toEqual(["pf-m-art", "pf-m-body", "pf-m-chev"]); // art, title/tagline/tags, arrow
    }
    await expect(page.getByTestId("pf-m-count")).toHaveText(`${rows.length} projects`);
  });
});

test.describe("tablet and desktop are unchanged (TASK-233)", () => {
  test.beforeEach(({ page }) => {
    test.skip(width(page) < 640, "wide tiers only");
  });

  test("the carousel wrapper is display: contents, no pagination, the grid stays a grid, no glass", async ({ page, noOverflow }) => {
    await page.goto("/projects", { waitUntil: "load" });
    const s = await page.evaluate(() => {
      const wrap = document.querySelector(".ee-journal .hs-carousel")!;
      const dots = document.querySelector(".ee-journal .hs-dots")!;
      const grid = document.querySelector(".ee-journal .ee-grid")!;
      const list = document.querySelector(".pf-m-list")!;
      return {
        wrap: getComputedStyle(wrap).display,
        dots: getComputedStyle(dots).display,
        grid: getComputedStyle(grid).display,
        overflowX: getComputedStyle(grid).overflowX,
        cols: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        tabindex: grid.getAttribute("tabindex"),
        list: getComputedStyle(list).display,
      };
    });
    expect(s.wrap).toBe("contents");
    expect(s.dots).toBe("none");
    expect(s.grid).toBe("grid");
    expect(s.overflowX).toBe("visible");
    expect(s.cols).toBe(width(page) >= 1024 ? 3 : 2);
    expect(s.tabindex).toBeNull();
    expect(s.list).toBe("none"); // the phone list (and so its glass) is not shown
    await noOverflow(page);
  });
});
