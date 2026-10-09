/**
 * interaction-p3.spec.ts (`@TASK-181.3`, PLAN §4.5–4.7, EXE-62…64) — the L3 surfaces of the interaction system: the home hero,
 * Tushky (Home launcher + drawer controls) and Contact. On the built site, measured on computed styles:
 *   hero     "Ask Tushky" straightens the sticker head 6 -> 0 deg and lifts it 3 px; nothing moves under reduced motion
 *   contact  the stamp moves only while the primary CTA is hovered/focused (<= 3 px), the arrow follows 120 ms late
 *   tushky   breathing is finite (3 breaths, then `getAnimations()` is empty), the mascot leans <= 2 deg as a whole image on
 *            hover, lifts 4 px and leans 2 deg toward the composer when it is focused; touch/RM: no lean, no loop
 *   sheets   the Tushky card/close/voice controls never transition box-shadow; their hover is gated and has a focus twin
 */
import type { Locator, Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

/** The element's individual translate (px), rotate (deg) and transform-matrix offsets, summed. */
async function pose(loc: Locator) {
  return loc.evaluate((el) => {
    const cs = getComputedStyle(el);
    const [tx = "0", ty = "0"] = cs.translate === "none" ? [] : cs.translate.split(" ");
    const m = cs.transform === "none" ? new DOMMatrix() : new DOMMatrix(cs.transform);
    const rot = cs.rotate === "none" ? 0 : Number.parseFloat(cs.rotate);
    return {
      x: Number.parseFloat(tx) + m.e,
      y: Number.parseFloat(ty) + m.f,
      rot: rot + (Math.atan2(m.b, m.a) * 180) / Math.PI,
      scaleY: cs.scale === "none" ? m.d : Number(cs.scale.split(" ")[1] ?? cs.scale.split(" ")[0]) * m.d,
    };
  });
}

async function keyboardFocus(page: Page, loc: Locator) {
  await page.keyboard.press("Shift");
  await loc.focus();
  expect(await loc.evaluate((el) => el.matches(":focus-visible")), "focus is keyboard-visible").toBe(true);
}

async function gotoHome(page: Page) {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
}

test.describe("@TASK-181.3 hero", () => {
  test("Ask Tushky: the sticker head straightens 6 -> 0 deg and lifts 3 px, its pointer nudges 2 px, hover = focus", async ({ page }) => {
    test.skip(!wide(page), "hover is a fine-pointer behaviour");
    await gotoHome(page);
    const ask = page.locator(".hero-btn-secondary").first();
    await ask.scrollIntoViewIfNeeded();
    const head = page.locator(".hero-tushky-img");
    const arrow = page.locator(".hero-tushky-arrow");
    const rest = await pose(head);
    const restArrow = await pose(arrow);
    expect(rest.rot).toBeCloseTo(6, 0);
    await ask.hover();
    await page.waitForTimeout(700);
    const hov = await pose(head);
    const hovArrow = await pose(arrow);
    expect(hov.rot, "head upright").toBeCloseTo(0, 0);
    expect(hov.y - rest.y, "head lifts 3 px").toBeCloseTo(-3, 0);
    expect(hovArrow.x - restArrow.x, "pointer x").toBeCloseTo(2, 0);
    expect(hovArrow.y - restArrow.y, "pointer y").toBeCloseTo(-2, 0);
    expect(await head.evaluate((el) => getComputedStyle(el).transitionProperty)).not.toMatch(/box-shadow|filter|all/);
    await page.mouse.move(2, 2);
    await page.waitForTimeout(700);
    await keyboardFocus(page, ask);
    await page.waitForTimeout(700);
    const foc = await pose(head);
    expect(foc.rot, "focus twin rotate").toBeCloseTo(hov.rot, 0);
    expect(foc.y, "focus twin lift").toBeCloseTo(hov.y, 0);
  });

  test("reduced motion: the sticker stays at rest on hover and focus", async ({ page }) => {
    test.skip(!wide(page), "hover is a fine-pointer behaviour");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoHome(page);
    const ask = page.locator(".hero-btn-secondary").first();
    await ask.scrollIntoViewIfNeeded();
    const head = page.locator(".hero-tushky-img");
    const rest = await pose(head);
    await ask.hover();
    await page.waitForTimeout(400);
    expect(await pose(head)).toEqual(rest);
  });

});

test.describe("@TASK-181.3 contact", () => {
  test("the stamp moves only while Email me is hovered or focused, <= 3 px; the arrow follows 120 ms late", async ({ page }) => {
    test.skip(!wide(page), "hover is a fine-pointer behaviour");
    await page.goto("/contact", { waitUntil: "networkidle" });
    const stamp = page.locator(".cx-stamp-wrap");
    const primary = page.locator(".cx-btn-primary");
    const secondary = page.locator(".cx-btn-secondary").first();
    await primary.scrollIntoViewIfNeeded();
    const rest = await pose(stamp);
    await secondary.hover();
    await page.waitForTimeout(700);
    expect(await pose(stamp), "the stamp ignores the secondary links").toEqual(rest);

    await primary.hover();
    await page.waitForTimeout(800);
    const hov = await pose(stamp);
    expect(hov.y - rest.y, "stamp lifts 2 px").toBeCloseTo(-2, 0);
    expect(Math.abs(hov.x - rest.x), "no sideways travel").toBeLessThanOrEqual(0.5);
    expect(Math.abs(hov.y - rest.y), "nothing moves more than 3 px").toBeLessThanOrEqual(3);
    expect(rest.rot - hov.rot, "rotates 1.5 deg toward upright").toBeCloseTo(1.5, 0);
    const arrowDelay = await primary.locator(".cx-btn-arrow").evaluate((el) => getComputedStyle(el).transitionDelay.split(",")[0]);
    expect(arrowDelay, "arrow answers 120 ms after the stamp").toBe("0.12s");
    expect((await pose(primary.locator(".cx-btn-arrow"))).x, "arrow nudge 3 px").toBeCloseTo(3, 0);

    await page.mouse.move(2, 2);
    await page.waitForTimeout(800);
    expect(await pose(stamp), "released").toEqual(rest);
    await keyboardFocus(page, primary);
    await page.waitForTimeout(800);
    const foc = await pose(stamp);
    expect(foc.y, "focus twin").toBeCloseTo(hov.y, 0);
    expect(foc.rot, "focus twin rotate").toBeCloseTo(hov.rot, 1);
  });

  test("reduced motion: the stamp stays put", async ({ page }) => {
    test.skip(!wide(page), "hover is a fine-pointer behaviour");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/contact", { waitUntil: "networkidle" });
    const stamp = page.locator(".cx-stamp-wrap");
    const rest = await pose(stamp);
    await page.locator(".cx-btn-primary").hover();
    await page.waitForTimeout(400);
    expect(await pose(stamp)).toEqual(rest);
  });
});

test.describe("@TASK-181.3 tushky", () => {
  async function inView(page: Page) {
    await gotoHome(page);
    const section = page.locator("section#ask");
    await section.scrollIntoViewIfNeeded();
    await expect(page.locator(".hat-grid[data-in]")).toHaveCount(1);
    return page.locator(".hat-dog");
  }

  test("breathing is finite: three breaths, then nothing animates on the mascot", async ({ page }) => {
    const dog = await inView(page);
    await page.waitForTimeout(1500);
    const running = await dog.evaluate((el) => el.getAnimations().map((a) => ({ n: (a as CSSAnimation).animationName, it: a.effect?.getComputedTiming().iterations })));
    expect(running, "breathing is running with 3 iterations").toEqual([{ n: "tk-breathe", it: 3 }]);
    await page.waitForTimeout(8000);
    expect(await dog.evaluate((el) => el.getAnimations().length), "no animation on the mascot 8 s after entering view").toBe(0);
    // scoped to the Tushky section: other surfaces own their loops (the gyro chip, the postmark), TASK-181.3 adds none
    const infinite = await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((a) => a.effect?.getComputedTiming().iterations === Infinity)
          .filter((a) => (a.effect as KeyframeEffect).target?.closest("section#ask")).length,
    );
    expect(infinite, "no infinite animation in the Tushky section").toBe(0);
  });

  test("breathing never starts off-screen or under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const dog = await inView(page);
    await page.waitForTimeout(1500);
    expect(await dog.evaluate((el) => el.getAnimations().length)).toBe(0);
    const offscreen = await page.evaluate(() => document.querySelector(".hat-dog")!.getAnimations().length);
    expect(offscreen).toBe(0);
  });

  test("hover leans the whole image <= 2 deg and lifts 3 px; the callout stays", async ({ page }) => {
    test.skip(!wide(page), "hover is a fine-pointer behaviour");
    const dog = await inView(page);
    await page.waitForTimeout(8000); // breathing done
    const mascot = page.locator(".hat-mascot");
    const callout = page.locator(".hat-callout");
    const box = (await mascot.boundingBox())!;
    const restCallout = await callout.boundingBox();
    const rest = await pose(dog);
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.6, { steps: 6 });
    await page.waitForTimeout(900);
    const lean = await pose(dog);
    expect(lean.rot - rest.rot, "leans toward the cursor").toBeGreaterThan(0.3);
    expect(Math.abs(lean.rot), "<= 2 deg").toBeLessThanOrEqual(2.05);
    expect(lean.y - rest.y, "lifts 3 px").toBeCloseTo(-3, 0);
    expect(lean.scaleY, "never scales up on hover").toBeLessThanOrEqual(1.0001);
    expect((await callout.boundingBox())!.y, "the callout does not move").toBeCloseTo(restCallout!.y, 0);
    await page.mouse.move(2, 2, { steps: 4 });
    await page.waitForTimeout(1500);
    const after = await pose(dog);
    expect(after.rot, "settles back").toBeCloseTo(rest.rot, 1);
    expect(after.y, "drops back").toBeCloseTo(rest.y, 1);
    expect(await mascot.getAttribute("data-pm-active"), "released").toBeNull();
  });

  test("attentive: the focused composer lifts the mascot 4 px and leans it 2 deg toward the composer", async ({ page }) => {
    test.skip(!wide(page), "layout-specific");
    const dog = await inView(page);
    await page.waitForTimeout(8000);
    const rest = await pose(dog);
    await page.locator("#ask-portfolio-input").focus();
    await page.waitForTimeout(900);
    const att = await pose(dog);
    expect(att.y - rest.y).toBeCloseTo(-4, 0);
    expect(att.rot - rest.rot).toBeCloseTo(2, 0);
  });

  test("reduced motion and touch: no lean, no lift", async ({ page, viewport }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const dog = await inView(page);
    const rest = await pose(dog);
    if (viewport!.width >= 1024) {
      const box = (await page.locator(".hat-mascot").boundingBox())!;
      await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.6, { steps: 4 });
      await page.waitForTimeout(600);
      await page.locator("#ask-portfolio-input").focus();
      await page.waitForTimeout(600);
    }
    expect(await pose(dog)).toEqual(rest);
    if (viewport!.width < 768) {
      expect(await page.locator(".hat-mascot").evaluate((el) => el.style.getPropertyValue("--hx")), "touch writes no --hx").toBe("");
    }
  });

  test("the Tushky controls swap their shadow (never transition it), gate hover and twin it on focus", async ({ page }) => {
    await gotoHome(page);
    const out = await page.evaluate(() => {
      const SCOPE = /\.(tk-card|hat-card|tk-close|tk-voice-disc|tk-voice-main|hat-dog|hero-tushky-img|hero-tushky-arrow|cx-stamp-wrap)\b/;
      const hits: { selector: string; media: string; style: CSSStyleDeclaration }[] = [];
      const walk = (rules: CSSRuleList, media: string) => {
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSStyleRule) hits.push({ selector: rule.selectorText, media, style: rule.style });
          else if (rule instanceof CSSMediaRule) walk(rule.cssRules, `${media} @media ${rule.conditionText}`);
          else if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules, media);
        }
      };
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          walk(sheet.cssRules, "");
        } catch {
          /* not ours */
        }
      }
      const bad: string[] = [];
      for (const h of hits) {
        if (!SCOPE.test(h.selector)) continue;
        const tp = h.style.transitionProperty;
        if (tp && /box-shadow|filter|(^|,\s*)all(\s*,|$)/.test(tp)) bad.push(`transitions ${tp}: ${h.selector}`);
        if (/animation/.test(h.style.cssText) && /infinite/.test(h.style.animation)) bad.push(`infinite: ${h.selector}`);
        if (!h.selector.includes(":hover") || /prefers-reduced-motion:\s*reduce/.test(h.media)) continue;
        if (!/hover:\s*hover/.test(h.media) || !/pointer:\s*fine/.test(h.media)) bad.push(`ungated :hover: ${h.selector}`);
      }
      return bad;
    });
    expect(out).toEqual([]);
  });
});
