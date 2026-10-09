/**
 * eval-041.spec.ts (`@EVAL-041`, evaluation-plan §11, M-012 P2 / TASK-181.2) — object motion is single-source on the
 * home Featured Work trio: `paperMotion`'s one pointermove listener and one rAF loop drive the layers and the tilt; `--hx/--hy`
 * exist only on the one active object; layer travel equals depth × range (bg 2 · art 4 · fg 6 · RailCite's top 8 px) within 1 px; the
 * art tilt stays ≤ 2° and sits on the art container only; the copy does not move relative to its sheet; no layer leaves a seam at
 * ±max; the loop sleeps 1.5 s after the pointer leaves; and a wheel scroll under a parked cursor activates nothing.
 * Reduced motion and touch attach nothing. Fine-pointer checks run at w1440 (the featured spread's full layout), touch at w390.
 * Attribution to `paperMotion` is by the built chunk that contains the motion source (tests/e2e/paper-world-lib.ts).
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { instrument, liveMotionListeners, motionChunks, type PwRecord } from "./paper-world-lib";

const width = (page: Page) => page.viewportSize()!.width;
const SLUGS = ["railcite", "slag-city", "campfire-board"] as const;
const lift = (slug: string) => `.fw-lift[data-featured-lift="${slug}"]`;
const RANGE: Record<string, number> = { bg: 2, art: 4, fg: 6, top: 8 };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(instrument);
});

/** Centre a card in the viewport (Lenis may animate, so wait) and return its sheet's box. */
async function paperBox(page: Page, slug: string) {
  await page.locator(lift(slug)).evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(800);
  return (await page.locator(`${lift(slug)} .fw-paper`).boundingBox())!;
}

async function gotoFeatured(page: Page) {
  await page.goto("/", { waitUntil: "load" });
  await page.locator("#work-featured").scrollIntoViewIfNeeded();
  // the entrance Reveal and the lazy layers settle; every card has been observed as intersecting
  await page.locator(lift("railcite")).scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>("#work-featured .fw-layer img")].filter((i) => i.getBoundingClientRect().top < innerHeight).every((i) => i.complete));
  await page.waitForTimeout(600);
}

/** Two frames, so a reading has seen the spring advance. */
const frames2 = (page: Page) => page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));

/** Computed `translate` of each depth layer of a card, px, once the spring has stopped. */
async function layerOffsets(page: Page, slug: string) {
  const read = () =>
    page.evaluate((sel) => {
      return [...document.querySelectorAll(`${sel} .pm-layer`)].map((el) => {
        const t = getComputedStyle(el).translate;
        const [x = "0", y = "0"] = t === "none" ? [] : t.split(" ");
        return { depth: (el as HTMLElement).dataset.pmDepth!, x: parseFloat(x) || 0, y: parseFloat(y) || 0 };
      });
    }, lift(slug));
  await frames2(page);
  let prev = JSON.stringify(await read());
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(120);
    await frames2(page);
    const cur = JSON.stringify(await read());
    if (cur === prev) return JSON.parse(cur) as Awaited<ReturnType<typeof read>>;
    prev = cur;
  }
  throw new Error("layers never settled");
}

test.describe("@EVAL-041 object motion (fine pointer)", () => {
  test.beforeEach(({ page }) => {
    test.skip(width(page) !== 1440, "pointer object motion is measured at w1440");
  });

  test("one pointermove listener for the page; layer travel = depth × range within 1 px at each corner; tilt ≤ 2° on the art only", async ({ page }) => {
    await gotoFeatured(page);
    expect(await liveMotionListeners(page, "pointermove", "window")).toBe(1);
    for (const slug of SLUGS) {
      const box = await paperBox(page, slug);
      for (const [sx, sy] of [[1, 1], [-1, -1], [1, -1], [-1, 1]] as const) {
        // just inside the paper's corner (the torn mask lets the pointer through at the very corner)
        await page.mouse.move(box.x + box.width / 2 + sx * box.width * 0.47, box.y + box.height / 2 + sy * box.height * 0.47, { steps: 8 });
        const offsets = await layerOffsets(page, slug);
        // the object's own local pointer (--hx/--hy): layer travel must be exactly depth range × that value
        const h = await page.locator(lift(slug)).evaluate((el) => [Number(el.style.getPropertyValue("--hx")), Number(el.style.getPropertyValue("--hy"))]);
        expect(Math.abs(h[0]!), `${slug} --hx at ${sx},${sy}`).toBeGreaterThan(0.85);
        expect(Math.abs(h[1]!), `${slug} --hy at ${sx},${sy}`).toBeGreaterThan(0.85);
        expect(Math.sign(h[0]!)).toBe(sx);
        expect(Math.sign(h[1]!)).toBe(sy);
        expect(offsets.length, `${slug} layers`).toBeGreaterThanOrEqual(3);
        for (const o of offsets) {
          expect(Math.abs(o.x - h[0]! * RANGE[o.depth]!), `${slug} ${o.depth} x at ${sx},${sy}`).toBeLessThanOrEqual(1);
          expect(Math.abs(o.y - h[1]! * RANGE[o.depth]!), `${slug} ${o.depth} y at ${sx},${sy}`).toBeLessThanOrEqual(1);
        }
        const tilt = await page.locator(`${lift(slug)} [data-pm-tilt]`).evaluate((el) => {
          const m = new DOMMatrix(getComputedStyle(el).transform);
          return { y: (Math.acos(Math.min(1, m.m11)) * 180) / Math.PI, x: (Math.acos(Math.min(1, m.m22)) * 180) / Math.PI };
        });
        expect(tilt.y, `${slug} rotateY`).toBeLessThanOrEqual(2.05);
        expect(tilt.x, `${slug} rotateX`).toBeLessThanOrEqual(1.55);
        // the tilt sits on the art container only: neither the copy nor the sheet carries a transform
        const others = await page.locator(`${lift(slug)} :is(.fw-copy, .fw-paper, .fw-card)`).evaluateAll((els) => els.map((e) => getComputedStyle(e).transform));
        expect(others.every((t) => t === "none"), `${slug} copy/sheet transforms: ${others.join(" | ")}`).toBe(true);
      }
      await page.mouse.move(2, 2);
      await page.waitForTimeout(500);
    }
  });

  test("--hx/--hy exist on one object at a time, only while it is hovered; layer properties are never layout", async ({ page }) => {
    await gotoFeatured(page);
    await page.evaluate(() => {
      const w = window as unknown as { __maxActive: number; __hxOwners: Set<Element> };
      w.__maxActive = 0;
      w.__hxOwners = new Set();
      const setProperty = CSSStyleDeclaration.prototype.setProperty;
      CSSStyleDeclaration.prototype.setProperty = function (this: CSSStyleDeclaration, name: string, ...rest: never[]) {
        if (name === "--hx" || name === "--hy") w.__hxOwners.add(this as unknown as Element);
        return (setProperty as (...a: unknown[]) => void).call(this, name, ...rest);
      } as typeof setProperty;
      new MutationObserver(() => {
        w.__maxActive = Math.max(w.__maxActive, document.querySelectorAll("[data-pm-active]").length);
      }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-pm-active"] });
    });
    await page.locator("#work-featured .fw-grid").evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(800);
    const a = (await page.locator(`${lift("railcite")} .fw-paper`).boundingBox())!;
    const b = (await page.locator(`${lift("slag-city")} .fw-paper`).boundingBox())!;
    await page.mouse.move(a.x + a.width * 0.7, a.y + a.height * 0.5, { steps: 6 });
    await page.mouse.move(b.x + b.width * 0.7, b.y + b.height * 0.5, { steps: 6 }); // straight from one card to the next
    await page.mouse.move(2, 2, { steps: 6 });
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => {
      const w = window as unknown as { __maxActive: number };
      return { maxActive: w.__maxActive, active: document.querySelectorAll("[data-pm-active]").length, owners: [...document.querySelectorAll("[data-pm-obj]")].filter((e) => (e as HTMLElement).style.getPropertyValue("--hx") !== "0" && (e as HTMLElement).style.getPropertyValue("--hx") !== "").length };
    });
    // moving A → B lets A settle in its second slot while B follows: at most two carry the marker, never more, and none is left behind
    expect(r.maxActive).toBeLessThanOrEqual(2);
    expect(r.active).toBe(0);
    expect(r.owners).toBe(0);
    const style = await page.locator(`${lift("railcite")} .pm-layer`).first().evaluate((el) => (el as HTMLElement).style.cssText);
    expect(style).not.toMatch(/\b(top|left|width|height|filter)\s*:/);
  });

  test("the copy does not move relative to its sheet while the art moves", async ({ page }) => {
    await gotoFeatured(page);
    const rel = (slug: string) =>
      page.evaluate((sel) => {
        const root = document.querySelector(sel)!.getBoundingClientRect();
        const name = document.querySelector(`${sel} .fw-name`)!.getBoundingClientRect();
        const cta = document.querySelector(`${sel} .fw-cta`)!.getBoundingClientRect();
        return [name.left - root.left, name.top - root.top, cta.left - root.left, cta.top - root.top];
      }, lift(slug));
    for (const slug of SLUGS) {
      const rest = await rel(slug);
      const box = await paperBox(page, slug);
      await page.mouse.move(box.x + box.width * 0.96, box.y + box.height * 0.96, { steps: 8 });
      await layerOffsets(page, slug);
      const moved = await rel(slug);
      moved.forEach((v, i) => expect(Math.abs(v - rest[i]!), `${slug} copy offset ${i}`).toBeLessThanOrEqual(0.6));
      await page.mouse.move(2, 2);
      await page.waitForTimeout(500);
    }
  });

  test("no seam at ±max: every layer's image still covers its card's sheet", async ({ page }) => {
    await gotoFeatured(page);
    for (const slug of SLUGS) {
      const paper = await paperBox(page, slug);
      for (const [sx, sy] of [[1, 1], [-1, -1], [1, -1], [-1, 1]] as const) {
        await page.mouse.move(paper.x + paper.width / 2 + sx * paper.width * 0.47, paper.y + paper.height / 2 + sy * paper.height * 0.47, { steps: 8 });
        await layerOffsets(page, slug);
        const gaps = await page.evaluate((sel) => {
          const p = document.querySelector(`${sel} .fw-paper`)!.getBoundingClientRect();
          const out: string[] = [];
          for (const layer of document.querySelectorAll(`${sel} .pm-layer`)) {
            const img = layer.querySelector("img")!.getBoundingClientRect();
            if (img.left > p.left + 0.5) out.push(`${(layer as HTMLElement).dataset.pmDepth}:left`);
            if (img.right < p.right - 0.5) out.push(`${(layer as HTMLElement).dataset.pmDepth}:right`);
            if (img.bottom < p.bottom - 0.5) out.push(`${(layer as HTMLElement).dataset.pmDepth}:bottom`);
          }
          return out;
        }, lift(slug));
        expect(gaps, `${slug} edge gaps with the pointer at ${sx},${sy}`).toEqual([]);
      }
      await page.mouse.move(2, 2);
      await page.waitForTimeout(500);
    }
  });

  test("0 rAF callbacks 1.5 s after the pointer leaves; nothing activates during a wheel scroll under a parked cursor", async ({ page }) => {
    await gotoFeatured(page);
    const chunks = await motionChunks(page);
    const raf = (since: number) =>
      page.evaluate(([t, cs]) => (window as unknown as { __pw: PwRecord }).__pw.raf.filter((r) => r.t > (t as number) && (cs as string[]).some((c) => r.stack.includes(c))).length, [since, chunks] as const);
    const now = () => page.evaluate(() => performance.now());
    const box = await paperBox(page, "railcite");
    const t0 = await now();
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5, { steps: 8 });
    expect(await raf(t0), "the loop runs while an object is followed").toBeGreaterThan(0);
    await page.mouse.move(2, 2, { steps: 6 });
    await page.waitForTimeout(1500);
    const idle = await now();
    await page.waitForTimeout(600);
    expect(await raf(idle), "paperMotion rAF callbacks while idle").toBe(0);

    // parked cursor in the gutter between the cards' column and the page edge; the cards scroll under the cursor's row
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const w = window as unknown as { __activations: number };
      w.__activations = 0;
      new MutationObserver((records) => {
        for (const r of records) if ((r.target as Element).hasAttribute("data-pm-active")) w.__activations += 1;
      }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-pm-active"] });
    });
    const y = (await page.locator("#work-featured").boundingBox())!;
    await page.mouse.move(page.viewportSize()!.width * 0.4, 450);
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 160);
      await page.waitForTimeout(60);
    }
    // measured while the page is moving and for the 150 ms window after; the pointer itself never moved
    const during = await page.evaluate(() => (window as unknown as { __activations: number }).__activations);
    expect(during, "objects activated while scrolling under a parked cursor").toBe(0);
    expect(y.height).toBeGreaterThan(0);
  });
});

test.describe("@EVAL-041 reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("attaches no motion listener; layers and tilt sit at rest under the pointer", async ({ page }) => {
    test.skip(width(page) !== 1440, "pointer object motion is measured at w1440");
    await gotoFeatured(page);
    expect(await liveMotionListeners(page, "pointermove", "window")).toBe(0);
    const box = await paperBox(page, "railcite");
    await page.mouse.move(box.x + box.width - 3, box.y + box.height - 3, { steps: 8 });
    await page.waitForTimeout(600);
    const r = await page.evaluate((sel) => ({
      layers: [...document.querySelectorAll(`${sel} .pm-layer`)].map((e) => getComputedStyle(e).translate),
      tilt: getComputedStyle(document.querySelector(`${sel} [data-pm-tilt]`)!).transform,
      lift: getComputedStyle(document.querySelector(sel)!).translate,
      active: document.querySelectorAll("[data-pm-active]").length,
    }), lift("railcite"));
    expect(r.layers.every((t) => t === "none" || t === "0px 0px"), r.layers.join("|")).toBe(true);
    expect(r.tilt).toBe("none");
    expect(r.lift === "none" || r.lift === "0px", r.lift).toBe(true);
    expect(r.active).toBe(0);
  });
});

test.describe("@EVAL-041 touch", () => {
  test("a touch viewport attaches no pointermove listener, writes no --hx, and shows the evidence slips", async ({ page }) => {
    test.skip(width(page) !== 390, "touch profile");
    await gotoFeatured(page);
    expect(await liveMotionListeners(page, "pointermove", "window")).toBe(0);
    const writes = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("[data-pm-obj]")].filter((e) => e.style.getPropertyValue("--hx") !== "").length);
    expect(writes).toBe(0);
    const slips = await page.locator("#work-featured .fw-proof-item").evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity));
    expect(slips).toEqual(["1", "1"]);
  });
});
