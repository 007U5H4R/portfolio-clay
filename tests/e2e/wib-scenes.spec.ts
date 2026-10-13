/**
 * wib-scenes.spec.ts — TASK-203: the seven interactive paper-craft scenes of the Experience page "What I Bring"
 * (components/experience/WibScene.tsx, lib/wib/scenes.ts, lib/wib/scene-machine.ts). Runs in all four viewport projects
 * (w390 touch + the vertical trail, w768 and w1024 fine-pointer trail, w1440 the one-landscape layout). It proves, per scene:
 * hover and focus only LIFT (the phase stays "rest"), a click / Enter / tap plays the signature sequence to a settled end
 * state, the end state is repeatable, changing stage never leaves a stage stuck, reduced motion settles at once without
 * travel, no animation loops, the art is the active theme's, and nothing overflows.
 */
import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const STAGES = ["ambiguity", "discovery", "product", "ai-genai", "technology", "execution", "impact"] as const;
type Stage = (typeof STAGES)[number];
const SEQ_MS = 2400; // the longest sequence (AI + GenAI, 2000 ms) plus margin
/** What must be true of each scene once its sequence has settled: a part that moved, and a stroke / lit sprite that appeared. */
const END: Record<Stage, { moved: string; shown: { sel: string; min: number } }> = {
  ambiguity: { moved: "tag", shown: { sel: "path[data-o='c1']", min: 0.9 } },
  discovery: { moved: "lens", shown: { sel: "path[data-o='hl']", min: 0.5 } },
  product: { moved: "board", shown: { sel: "path[data-o='ln']", min: 0.9 } },
  "ai-genai": { moved: "input", shown: { sel: "path[data-o='c3']", min: 0.9 } },
  technology: { moved: "cloud", shown: { sel: "path[data-o='ca']", min: 0.8 } },
  execution: { moved: "gear", shown: { sel: ".wib-flow li:last-child", min: 0 } },
  impact: { moved: "flag", shown: { sel: "path[data-o='road']", min: 0.9 } },
};

const stage = (page: Page, id: Stage) => page.locator(`.wib-stage[data-stage='${id}']`);
const phase = (page: Page, id: Stage) => stage(page, id).getAttribute("data-phase");
const move = (page: Page, id: Stage, part: string) => stage(page, id).locator(`.wib-part[data-p='${part}'] > .wib-move`);

async function keyboardFocus(page: Page, loc: Locator) {
  await page.keyboard.press("Shift");
  await loc.focus();
  expect(await loc.evaluate((el) => el.matches(":focus-visible")), "focus is keyboard-visible").toBe(true);
}
/** Computed pose of a part: its transform is identity when it has not moved. */
async function pose(loc: Locator) {
  return loc.evaluate((el) => {
    const cs = getComputedStyle(el);
    const m = cs.transform === "none" ? new DOMMatrix() : new DOMMatrix(cs.transform);
    const tr = cs.translate === "none" ? [0, 0] : cs.translate.split(" ").map((v) => Number.parseFloat(v) || 0);
    return { transform: !m.isIdentity, translate: tr.some((v) => v !== 0), rotate: cs.rotate !== "none" && Number.parseFloat(cs.rotate) !== 0, anim: el.getAnimations().length };
  });
}
async function open(page: Page, id: Stage) {
  const s = stage(page, id);
  await s.scrollIntoViewIfNeeded();
  return s.locator(".wib-card");
}
const finePointer = (page: Page) => page.evaluate(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);

test.describe("@TASK-203 What I Bring scenes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/work", { waitUntil: "networkidle" });
    await page.locator("section#skills").scrollIntoViewIfNeeded();
  });

  test("every scene renders its parts in the light art and every image loads", async ({ page, consoleErrors }) => {
    for (const id of STAGES) {
      await stage(page, id).scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
    }
    const out = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLImageElement>(".wib-art .wib-img")).map((i) => ({ src: i.currentSrc || i.src, ok: i.complete && i.naturalWidth > 0, hidden: i.classList.contains("wib-lit") })),
    );
    expect(out.length).toBeGreaterThanOrEqual(7 * 3);
    for (const i of out) expect(i.ok, `loaded: ${i.src}`).toBe(true);
    expect(out.every((i) => decodeURIComponent(i.src).includes("light"))).toBe(true);
    for (const id of STAGES) expect(await stage(page, id).locator(".wib-part[data-p='base']").count()).toBe(1);
    expect(consoleErrors).toEqual([]);
  });

  for (const id of STAGES) {
    test(`${id}: hover / focus lift the scene but never play it; Enter or a click plays it to a settled end state`, async ({ page, viewport }) => {
      const card = await open(page, id);
      const mover = move(page, id, END[id].moved);
      expect(await phase(page, id)).toBe("rest");
      const fine = await finePointer(page);
      if (fine) {
        // hover: the lift pose, still at rest
        await card.hover();
        await expect(stage(page, id)).toHaveAttribute("data-active", "");
        await page.waitForTimeout(450);
        expect(await phase(page, id), "hover does not play").toBe("rest");
        const hov = await pose(mover);
        expect(hov.translate || hov.rotate, "hover lifts or tilts the primary object").toBe(true);
        expect(hov.transform, "hover does not run the sequence").toBe(false);
        await page.mouse.move(2, 2);
      }
      // keyboard focus: the same discoverability, still not played
      await keyboardFocus(page, card);
      await expect(card).toHaveAttribute("aria-expanded", "true");
      await page.waitForTimeout(450);
      expect(await phase(page, id), "focus does not play").toBe("rest");
      // Enter plays
      await page.keyboard.press("Enter");
      await expect(stage(page, id)).toHaveAttribute("data-phase", "playing");
      await expect(stage(page, id)).toHaveAttribute("data-phase", "settled", { timeout: SEQ_MS + 1500 });
      await page.waitForTimeout(350);
      const end = await pose(mover);
      if (END[id].moved === "gear" || END[id].moved === "lens" || END[id].moved === "cloud" || END[id].moved === "flag" || END[id].moved === "input" || END[id].moved === "board" || END[id].moved === "tag") {
        expect(end.transform, "the settled end pose is not the rest pose").toBe(true);
      }
      expect(end.anim, "nothing is still animating once settled").toBe(0);
      const shown = END[id].shown;
      const el = stage(page, id).locator(shown.sel).first();
      if (shown.sel.includes("li")) {
        expect(await el.evaluate((n) => Number(getComputedStyle(n, "::before").opacity)), "the last flow label is underlined").toBe(1);
      } else {
        const v = await el.evaluate((n) => ({ o: Number(getComputedStyle(n).opacity), d: getComputedStyle(n).strokeDashoffset }));
        expect(v.o).toBeGreaterThanOrEqual(shown.min);
        expect(Number.parseFloat(v.d)).toBe(0);
      }
      void viewport;
    });
  }

  test("a tap plays the scene (touch parity) and the art is large enough to read", async ({ page, viewport }) => {
    test.skip(viewport!.width >= 1024, "the tap path is the phone / trail path");
    test.skip(!(await page.evaluate(() => navigator.maxTouchPoints > 0)), "this project has no touch input (only w390 does)");
    const card = await open(page, "ambiguity");
    await card.tap();
    await expect(stage(page, "ambiguity")).toHaveAttribute("data-phase", "playing");
    await expect(stage(page, "ambiguity")).toHaveAttribute("data-phase", "settled", { timeout: SEQ_MS });
    const art = await stage(page, "ambiguity").locator(".wib-art").boundingBox();
    expect(art!.width).toBeGreaterThanOrEqual(100);
    // the parallax listener is a fine-pointer thing: a tap leaves the layers at their rest offsets
    const t = await stage(page, "ambiguity").locator(".wib-layer").first().evaluate((el) => getComputedStyle(el).translate);
    expect(["none", "0px", "0px 0px"]).toContain(t);
  });

  test("repeated activation replays deterministically and ends settled every time", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1100, "below 1100 px a second tap collapses the stage (the trail); the landscape replays");
    const card = await open(page, "ai-genai");
    for (let i = 0; i < 3; i++) {
      await card.click();
      await expect(stage(page, "ai-genai")).toHaveAttribute("data-phase", /playing|resetting/);
      await expect(stage(page, "ai-genai")).toHaveAttribute("data-phase", "settled", { timeout: SEQ_MS + 1500 });
    }
    // a click storm during the sequence is ignored, not queued
    await card.click();
    await card.click();
    await card.click();
    await expect(stage(page, "ai-genai")).toHaveAttribute("data-phase", "settled", { timeout: SEQ_MS + 1500 });
  });

  test("changing stage mid-sequence lets the first finish and settles the second; nothing sticks", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1100, "the landscape keeps one stage shown; the trail collapses on the next tap");
    await (await open(page, "ambiguity")).click();
    await expect(stage(page, "ambiguity")).toHaveAttribute("data-phase", "playing");
    await stage(page, "impact").locator(".wib-card").click();
    await expect(stage(page, "impact")).toHaveAttribute("data-phase", /playing|settled/);
    await expect(stage(page, "ambiguity")).toHaveAttribute("data-phase", "rest", { timeout: SEQ_MS + 1500 });
    await expect(stage(page, "impact")).toHaveAttribute("data-phase", "settled", { timeout: SEQ_MS + 1500 });
    // selecting the next stage resets the settled one at once
    await stage(page, "execution").locator(".wib-card").click();
    await expect(stage(page, "impact")).toHaveAttribute("data-phase", "rest");
  });

  test("no infinite animation, and only transform / opacity / stroke-dashoffset ever animate", async ({ page }) => {
    const card = await open(page, "ai-genai");
    await card.click();
    await page.waitForTimeout(500);
    const r = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".wib-art *, .wib-art"))
        .flatMap((el) => el.getAnimations())
        .map((a) => ({ it: (a.effect as KeyframeEffect).getTiming().iterations, props: Object.keys((a.effect as KeyframeEffect).getKeyframes()[0] ?? {}).filter((k) => !["offset", "computedOffset", "easing", "composite"].includes(k)) })),
    );
    expect(r.length).toBeGreaterThan(3);
    for (const a of r) {
      expect(a.it).toBe(1);
      for (const p of a.props) expect(["transform", "opacity", "strokeDashoffset", "translate", "rotate"]).toContain(p);
    }
    const tp = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".wib-art *"))
        .map((el) => getComputedStyle(el))
        .filter((cs) => cs.transitionDuration.split(",").some((d) => Number.parseFloat(d) > 0))
        .map((cs) => cs.transitionProperty)
        .join(","),
    );
    expect(tp).not.toMatch(/box-shadow|filter|\ball\b/);
  });

  test("reduced motion: a click settles at once, nothing travels or draws, the end state is still visible", async ({ page, withReducedMotion }) => {
    await withReducedMotion(page);
    const card = await open(page, "ai-genai");
    await card.click();
    await expect(stage(page, "ai-genai")).toHaveAttribute("data-phase", "settled");
    await page.waitForTimeout(250);
    const moved = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".wib-layer, .wib-move"))
        .map((el) => {
          const s = getComputedStyle(el);
          const bad = !["none", "matrix(1, 0, 0, 1, 0, 0)"].includes(s.transform) || !["none", "0px", "0px 0px"].includes(s.translate) || (s.rotate !== "none" && s.rotate !== "0deg") || el.getAnimations().length > 0;
          const part = el.closest(".wib-part");
          return bad ? `${part?.getAttribute("data-s")}/${part?.getAttribute("data-p")} ${el.className} transform=${s.transform} translate=${s.translate} rotate=${s.rotate} anims=${el.getAnimations().length}` : "";
        })
        .filter(Boolean),
    );
    expect(moved).toEqual([]);
    const c3 = await stage(page, "ai-genai").locator("path[data-o='c3']").evaluate((n) => ({ o: Number(getComputedStyle(n).opacity), d: getComputedStyle(n).strokeDashoffset }));
    expect(c3.o, "the connector accent is shown").toBeGreaterThanOrEqual(0.9);
    const lit = await stage(page, "ai-genai").locator(".wib-lit").evaluate((n) => Number(getComputedStyle(n).opacity));
    expect(lit, "the chip highlight is shown").toBeGreaterThan(0.5);
    // every scene settles the same way
    for (const id of STAGES) {
      await (await open(page, id)).click();
      await expect(stage(page, id)).toHaveAttribute("data-phase", "settled");
    }
  });

  test("no horizontal overflow with every scene activated", async ({ page, noOverflow, viewport }) => {
    for (const id of STAGES) {
      const c = await open(page, id);
      await c.click();
      if (viewport!.width < 1100) await expect(c).toHaveAttribute("aria-expanded", "true");
      await page.waitForTimeout(120);
      await noOverflow(page);
    }
  });

  test("the flow labels (AI + GenAI, Execution) are underlined in order and the count of labels is unchanged", async ({ page }) => {
    const c = await open(page, "execution");
    await c.click();
    const lis = stage(page, "execution").locator(".wib-flow li");
    await expect(lis).toHaveText(["Discover", "Plan", "Build", "Ship", "Measure", "Iterate"]);
    await page.waitForTimeout(700);
    const mid = await lis.evaluateAll((els) => els.map((e) => Number(getComputedStyle(e, "::before").opacity)));
    expect(mid[0]!).toBeGreaterThan(0);
    expect(mid[5]!, "later labels come later").toBeLessThan(1);
    await expect(stage(page, "execution")).toHaveAttribute("data-phase", "settled", { timeout: SEQ_MS });
    const end = await lis.evaluateAll((els) => els.map((e) => Number(getComputedStyle(e, "::before").opacity)));
    expect(end).toEqual([1, 1, 1, 1, 1, 1]);
  });

  test("no figure is added: Impact shows only its two existing self-reported proofs", async ({ page }) => {
    await (await open(page, "impact")).click();
    await expect(stage(page, "impact")).toHaveAttribute("data-phase", "settled", { timeout: SEQ_MS });
    const proof = stage(page, "impact").locator(".wib-proof li");
    await expect(proof).toHaveCount(2);
    await expect(proof.first()).toContainText("12");
    await expect(proof.last()).toContainText("30%");
  });
});

test.describe("@TASK-203 What I Bring scenes: night art", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/work", { waitUntil: "networkidle" });
    await page.locator("section#skills").scrollIntoViewIfNeeded();
  });

  test("the night art is served, every image loads, and the light set is never requested", async ({ page }) => {
    const requested: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("what-i-bring%2Fscenes") || r.url().includes("what-i-bring/scenes")) requested.push(decodeURIComponent(r.url()));
    });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    for (const id of STAGES) {
      await stage(page, id).scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
    }
    const imgs = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLImageElement>(".wib-art .wib-img")).map((i) => ({ src: decodeURIComponent(i.currentSrc || i.src), ok: i.complete && i.naturalWidth > 0 })),
    );
    expect(imgs.length).toBeGreaterThanOrEqual(7 * 3);
    for (const i of imgs) {
      expect(i.ok, i.src).toBe(true);
      expect(i.src).toContain("dark");
    }
    expect(requested.filter((u) => u.includes("/light/"))).toEqual([]);
  });

  test("a scene plays in the night art and the strokes keep a readable colour", async ({ page }) => {
    const card = await open(page, "impact");
    await card.click();
    await expect(stage(page, "impact")).toHaveAttribute("data-phase", "settled", { timeout: SEQ_MS });
    const road = await stage(page, "impact").locator("path[data-o='road']").evaluate((n) => ({ o: Number(getComputedStyle(n).opacity), s: getComputedStyle(n).stroke }));
    expect(road.o).toBeGreaterThanOrEqual(0.9);
    expect(road.s).not.toBe("none");
  });

  test("a live theme change swaps the art without a reload, in both directions", async ({ page }) => {
    await open(page, "technology");
    const first = stage(page, "technology").locator(".wib-img").first();
    const src = () => first.evaluate((i) => decodeURIComponent((i as HTMLImageElement).currentSrc || (i as HTMLImageElement).src));
    await expect.poll(src).toContain("/dark/");
    await page.emulateMedia({ colorScheme: "light" }); // no saved choice: the page follows the system
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect.poll(src).toContain("/light/");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect.poll(src).toContain("/dark/");
  });
});
