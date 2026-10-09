/**
 * eval-037.spec.ts (`@EVAL-037`, evaluation-plan §10, M-011 P3 / TASK-159) — material + light consistency, probed on the
 * built site: every `[data-elev]` paper element casts only bottom-right (every non-inset shadow has x ≥ 0 and y ≥ 0) with
 * a blur inside its PAPER level's band; no backdrop-filter and no pure-black fill on paper; `--mat-*` is never a text
 * colour; the paper-button contract (hover lifts 1 px, press goes 1 px down, no transform-less layout change). The AA
 * half is `pnpm tokens:check`. EXE-52: buttons are matched by their six family classes, cards by `data-elev` (Sheet).
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

test.skip(({ viewport }) => ![390, 1440].includes(viewport!.width), "EVAL-037 runs at 390 and 1440");

/** Blur band per PAPER level (Design.md §14.3: the ambient shadow's blur is the widest). */
const BLUR_MAX: Record<string, number> = { "0": 0, "1": 6, "2": 20, "3": 30, "4": 40, "5": 56 };

async function probe(page: Page, route: string, theme: "light" | "dark") {
  await page.addInitScript((t) => localStorage.setItem("portfolio-theme", t), theme);
  await page.goto(route, { waitUntil: "networkidle" });
  return page.evaluate((blurMax) => {
    const split = (v: string) => {
      const parts: string[] = [];
      let depth = 0;
      let cur = "";
      for (const ch of v) {
        if (ch === "(") depth++;
        if (ch === ")") depth--;
        if (ch === "," && depth === 0) {
          parts.push(cur.trim());
          cur = "";
        } else cur += ch;
      }
      if (cur.trim()) parts.push(cur.trim());
      return parts;
    };
    const out: string[] = [];
    let count = 0;
    for (const el of document.querySelectorAll<HTMLElement>("[data-elev]")) {
      if (el.getClientRects().length === 0) continue;
      count++;
      const cs = getComputedStyle(el);
      const level = el.dataset.elev ?? "2";
      const name = `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}[elev ${level}]`;
      if (cs.backdropFilter !== "none" && cs.backdropFilter !== "") out.push(`${name} backdrop-filter ${cs.backdropFilter}`);
      if (cs.backgroundColor === "rgb(0, 0, 0)") out.push(`${name} pure black fill`);
      if (cs.boxShadow !== "none") {
        for (const sh of split(cs.boxShadow)) {
          if (/inset/.test(sh)) continue;
          const nums = (sh.replace(/rgba?\([^)]*\)|oklab\([^)]*\)|color\([^)]*\)/g, "").match(/-?\d*\.?\d+px/g) ?? []).map((n) => Number.parseFloat(n));
          const [x = 0, y = 0, blur = 0] = nums;
          if (x < 0 || y < 0) out.push(`${name} casts up/left: ${sh}`);
          if (blur > (blurMax[level] ?? 56)) out.push(`${name} blur ${blur}px over PAPER-${level} band`);
        }
      }
    }
    return { count, out };
  }, BLUR_MAX);
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`@EVAL-037 paper elevation (${theme})`, () => {
    for (const route of ["/", "/projects", "/contact", "/work"]) {
      test(`${route}: [data-elev] shadows cast bottom-right, in band, no glass or black`, async ({ page }) => {
        const r = await probe(page, route, theme);
        expect(r.count, "paper elements on the page").toBeGreaterThan(0);
        expect(r.out).toEqual([]);
      });
    }
  });
}

test.describe("@EVAL-037 material tokens", () => {
  test("--mat-* never colours text, and exists in both themes", async ({ page }) => {
    for (const theme of ["light", "dark"] as const) {
      await page.addInitScript((t) => localStorage.setItem("portfolio-theme", t), theme);
      await page.goto("/", { waitUntil: "networkidle" });
      const r = await page.evaluate(() => {
        const names = ["bg", "cream", "kraft", "terra-1", "terra-2", "terra-3", "side"];
        const probeEl = document.createElement("i");
        document.body.append(probeEl);
        const mat = names.map((n) => {
          probeEl.style.color = `var(--mat-${n})`;
          return getComputedStyle(probeEl).color;
        });
        probeEl.remove();
        const text: string[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const el = n.parentElement;
          if (el && n.textContent?.trim() && el.getClientRects().length) {
            const c = getComputedStyle(el).color;
            if (mat.includes(c)) text.push(`${el.tagName}.${String(el.className).split(" ")[0]} ${c}`);
          }
        }
        return { mat, text };
      });
      expect(r.mat.every((c) => /^(rgb|oklab|oklch|lab|lch|color)/.test(c) && c !== "rgb(0, 0, 0)"), `${theme}: mat tokens resolve`).toBe(true);
      expect(r.text, `${theme}: text coloured by a material`).toEqual([]);
    }
  });
});

test.describe("@EVAL-037 paper button contract", () => {
  test("hover lifts 1 px, press goes 1 px down, with no layout change (translate only)", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
    await page.goto("/", { waitUntil: "networkidle" });
    const btn = page.locator(".hero-btn-primary").first();
    await btn.scrollIntoViewIfNeeded();
    // The hero sheet's scroll-driven drift (TKT-96) keeps moving the button for a few frames after the scroll
    // (measured 418 → 515 px), so a box read at once sends the pointer where the button was. Wait until it is still.
    await page.waitForFunction(
      (sel) =>
        new Promise<boolean>((done) => {
          const el = document.querySelector(sel)!;
          const y0 = el.getBoundingClientRect().top;
          requestAnimationFrame(() => requestAnimationFrame(() => done(el.getBoundingClientRect().top === y0)));
        }),
      ".hero-btn-primary",
    );
    const box0 = await btn.boundingBox();
    const ty = () => btn.evaluate((e) => Number.parseFloat(getComputedStyle(e).translate.split(" ")[1] ?? "0") || 0);
    await page.mouse.move(box0!.x + box0!.width / 2, box0!.y + box0!.height / 2);
    await page.waitForTimeout(400);
    expect(await ty()).toBeCloseTo(-1, 0);
    await page.mouse.down();
    await page.waitForTimeout(400);
    expect(await ty()).toBeCloseTo(1, 0);
    await page.mouse.move(2, 2); // release off the link so the press does not navigate
    await page.mouse.up();
    const sizeNow = await btn.evaluate((e) => ({ w: (e as HTMLElement).offsetWidth, h: (e as HTMLElement).offsetHeight }));
    expect(sizeNow).toEqual({ w: Math.round(box0!.width), h: Math.round(box0!.height) });
  });
});

// M-012 (TASK-181): the contract's other members — hover lifts 1 px, press goes 1 px down — on a fine pointer.
test.describe("@EVAL-037 paper button contract: M-012 family members", () => {
  for (const [route, selector] of [["/", ".header-pill"], ["/", ".hit-pill"], ["/about", ".acx-btn-primary"], ["/projects", ".pf-action"]] as const) {
    test(`${selector} (${route}): hover −1 px, press +1 px`, async ({ page, viewport }) => {
      test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
      await page.goto(route, { waitUntil: "networkidle" });
      const el = page.locator(selector).first();
      await el.scrollIntoViewIfNeeded();
      // wait for a one-shot Reveal / scroll drift to finish (fully shown and still) before reading the box
      await el.evaluate((n) => new Promise<void>((done) => { let last = "", same = 0; const t = () => { let a = 1; for (let e: Element | null = n; e; e = e.parentElement) a *= Number(getComputedStyle(e).opacity); const k = `${a}|${n.getBoundingClientRect().top}|${getComputedStyle(n).transform}`; same = k === last && a === 1 ? same + 1 : 0; last = k; same > 20 ? done() : requestAnimationFrame(t); }; t(); }));
      const ty = () => el.evaluate((e) => Number.parseFloat(getComputedStyle(e).translate.split(" ")[1] ?? "0") || 0);
      const rest = await ty();
      await el.hover();
      await page.waitForTimeout(400);
      expect((await ty()) - rest).toBeCloseTo(-1, 0);
      await page.mouse.down();
      await page.waitForTimeout(400);
      expect((await ty()) - rest).toBeCloseTo(1, 0);
      await page.mouse.move(2, 2); // release off the link so the press does not navigate
      await page.mouse.up();
    });
  }
});
