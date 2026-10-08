/**
 * eval-040.spec.ts (`@EVAL-040`, evaluation-plan §11, M-012 P1 / TASK-181.1) — the interaction hierarchy contract for the L1
 * surfaces (Design.md §14.10): header nav + strip, the Connect pill, hero / Contact / About / How-I-Think / Portfolio / featured
 * buttons and their arrows, the theme toggle, the band social icons and the carousel arrows. On the built site:
 *   - hover and keyboard focus-visible produce the SAME movement (the focus twin), measured on computed styles;
 *   - nothing transitions box-shadow, filter, backdrop-filter or `all` (the element, its ::before/::after and its arrow), and
 *     every transition duration sits inside the L1 band (150–250 ms);
 *   - nothing scales above 1 on hover or focus;
 *   - a stylesheet walk: every :hover rule on these surfaces sits inside (hover: hover) and (pointer: fine) and has a
 *     :focus-visible twin; no rule on them transitions box-shadow / filter / all; none scales up;
 *   - touch: a tap leaves no hover state behind; reduced motion: no translate, the non-motion feedback stays.
 * EVAL-037 (button hover −1 px / press +1 px) and EVAL-032 stay as they are; this spec adds, it never replaces.
 */
import type { Locator, Page } from "@playwright/test";
import { test, expect } from "./fixtures";

test.skip(({ viewport }) => ![390, 1440].includes(viewport!.width), "EVAL-040 runs at 390 and 1440");

interface Surface {
  name: string;
  route: string;
  selector: string;
  /** Expected hover/focus movement of the element itself (px). */
  dx?: number;
  dy?: number;
  /** Optional pseudo-element carrying the movement (nav tab paper). */
  pseudo?: "::before";
  /** Optional arrow inside the element and its expected dx. */
  arrow?: { selector: string; dx: number };
}

const SURFACES: Surface[] = [
  { name: "nav tab", route: "/", selector: '.header-nav-link:not([aria-current="page"])', pseudo: "::before", dy: -1 },
  { name: "connect pill", route: "/", selector: ".header-pill", dy: -1, arrow: { selector: ".header-pill-arrow", dx: 3 } },
  { name: "hero primary", route: "/", selector: ".hero-btn-primary", dy: -1, arrow: { selector: ".btn-arrow", dx: 3 } },
  { name: "hero secondary", route: "/", selector: ".hero-btn-secondary", dy: -1 },
  { name: "theme toggle", route: "/", selector: ".theme-toggle", dy: -1 },
  { name: "featured CTA", route: "/", selector: ".fw-cta", dy: -1, arrow: { selector: ".fw-cta-arrow", dx: 3 } },
  { name: "band social", route: "/", selector: ".band-social a", dy: -2 },
  { name: "how-i-think pill", route: "/", selector: ".hit-pill", dy: -1, arrow: { selector: ".hit-pill-arrow", dx: 3 } },
  { name: "about CTA", route: "/about", selector: ".acx-btn-primary", dy: -1, arrow: { selector: ".acx-arrow", dx: 3 } },
  { name: "contact primary", route: "/contact", selector: ".cx-btn-primary", dy: -1, arrow: { selector: ".cx-btn-arrow", dx: 3 } },
  { name: "portfolio action", route: "/projects", selector: ".pf-action", dy: -1, arrow: { selector: ".pf-action-arrow", dx: 3 } },
  { name: "carousel next", route: "/projects", selector: '.pf-arrow[data-dir="next"]', dx: 2 },
];

const FORBIDDEN = /box-shadow|filter|backdrop-filter|^all$/;

/** Effective offset of an element (individual `translate` property + the transform matrix), plus its scale and transition. */
async function read(loc: Locator, pseudo?: string) {
  return loc.evaluate((el, ps) => {
    const cs = getComputedStyle(el, ps ?? null);
    const [tx = "0", ty = "0"] = cs.translate === "none" ? [] : cs.translate.split(" ");
    const m = cs.transform === "none" ? new DOMMatrix() : new DOMMatrix(cs.transform);
    const sc = cs.scale === "none" ? [1, 1] : cs.scale.split(" ").map(Number);
    return {
      x: Number.parseFloat(tx) + m.e,
      y: Number.parseFloat(ty) + m.f,
      scaleX: Math.max(m.a, sc[0] ?? 1),
      scaleY: Math.max(m.d, sc[1] ?? sc[0] ?? 1),
      props: cs.transitionProperty.split(",").map((p) => p.trim()),
      durations: cs.transitionDuration.split(",").map((d) => Number.parseFloat(d) * (d.trim().endsWith("ms") ? 1 : 1000)),
      shadow: cs.boxShadow,
      filter: cs.filter,
    };
  }, pseudo);
}

/** Wait until the element has stopped moving (the hero sheet drifts on scroll) before reading its box. */
async function still(loc: Locator) {
  await loc.evaluate(
    (el) =>
      new Promise<void>((done) => {
        let last = el.getBoundingClientRect().top;
        let n = 0;
        const tick = () => {
          const t = el.getBoundingClientRect().top;
          n = t === last ? n + 1 : 0;
          last = t;
          if (n >= 6) done();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
}

/** Wait until the element's own transform/translate has stopped changing (a one-shot Reveal can still be settling). */
async function poseSettled(loc: Locator) {
  let prev = "";
  let same = 0;
  for (let i = 0; i < 80 && same < 4; i++) {
    const now = await loc.evaluate((el) => {
      const cs = getComputedStyle(el);
      let alpha = 1;
      for (let n: Element | null = el; n; n = n.parentElement) alpha *= Number(getComputedStyle(n).opacity);
      return `${cs.translate}|${cs.transform}|${alpha}`;
    });
    // a Reveal that has not started yet is still at opacity 0: it only counts as settled once fully shown
    same = now === prev && now.endsWith("|1") ? same + 1 : 0;
    prev = now;
    await loc.page().waitForTimeout(150);
  }
}

async function keyboardFocus(page: Page, loc: Locator) {
  await page.keyboard.press("Shift"); // a key event first, so programmatic focus counts as keyboard modality (:focus-visible)
  await loc.focus();
  expect(await loc.evaluate((el) => el.matches(":focus-visible")), "focus is keyboard-visible").toBe(true);
}

function checkTransitions(label: string, r: Awaited<ReturnType<typeof read>>) {
  // a transition-property with a 0 s duration never runs (pseudo-elements report the initial `all 0s`)
  const bad = r.props.filter((p, i) => FORBIDDEN.test(p) && (r.durations[i % r.durations.length] ?? 0) > 0);
  expect(bad, `${label}: forbidden transition properties`).toEqual([]);
  r.props.forEach((p, i) => {
    const ms = r.durations[i % r.durations.length]!;
    if (p === "none" || ms === 0) return;
    expect(ms, `${label}: ${p} duration ${ms} ms inside L1 (150–250 ms)`).toBeGreaterThanOrEqual(149);
    expect(ms, `${label}: ${p} duration ${ms} ms inside L1 (150–250 ms)`).toBeLessThanOrEqual(251);
  });
}

test.describe("@EVAL-040 L1 hover and focus parity", () => {
  for (const s of SURFACES) {
    test(`${s.name} (${s.route}): hover and focus move alike, no shadow/filter transition, no scale-up`, async ({ page, viewport }) => {
      test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
      await page.goto(s.route, { waitUntil: "networkidle" });
      const loc = page.locator(s.selector).first();
      if ((await loc.count()) === 0) test.skip(true, `${s.selector} not on ${s.route}`);
      await loc.scrollIntoViewIfNeeded();
      await still(loc);
      await poseSettled(loc); // let a one-shot Reveal on the surface finish before the rest pose is read
      const arrow = s.arrow ? loc.locator(s.arrow.selector).first() : undefined;

      const rest = await read(loc, s.pseudo);
      const restArrow = arrow ? await read(arrow) : undefined;
      const restPseudoAfter = s.pseudo ? await read(loc, "::after") : undefined;
      void restPseudoAfter;

      // 1. hover
      await loc.hover();
      await page.waitForTimeout(450);
      const hov = await read(loc, s.pseudo);
      const hovArrow = arrow ? await read(arrow) : undefined;
      expect(hov.x - rest.x, `${s.name} hover dx`).toBeCloseTo(s.dx ?? 0, 0);
      expect(hov.y - rest.y, `${s.name} hover dy`).toBeCloseTo(s.dy ?? 0, 0);
      if (s.arrow) expect(hovArrow!.x - restArrow!.x, `${s.name} arrow hover dx`).toBeCloseTo(s.arrow.dx, 0);
      for (const r of [hov, ...(hovArrow ? [hovArrow] : [])]) {
        expect(r.scaleX, `${s.name} hover scale-up`).toBeLessThanOrEqual(1.0001);
        expect(r.scaleY, `${s.name} hover scale-up`).toBeLessThanOrEqual(1.0001);
      }
      checkTransitions(`${s.name} hover`, hov);
      if (hovArrow) checkTransitions(`${s.name} arrow`, hovArrow);
      for (const ps of ["::before", "::after"]) checkTransitions(`${s.name} ${ps}`, await read(loc, ps));

      // 2. keyboard focus gives the same movement
      await page.mouse.move(2, 2);
      await page.waitForTimeout(450);
      await keyboardFocus(page, loc);
      await page.waitForTimeout(450);
      const foc = await read(loc, s.pseudo);
      const focArrow = arrow ? await read(arrow) : undefined;
      expect(foc.x - rest.x, `${s.name} focus dx`).toBeCloseTo(hov.x - rest.x, 0);
      expect(foc.y - rest.y, `${s.name} focus dy`).toBeCloseTo(hov.y - rest.y, 0);
      if (focArrow) expect(focArrow.x - restArrow!.x, `${s.name} arrow focus dx`).toBeCloseTo(hovArrow!.x - restArrow!.x, 0);
      expect(foc.scaleX).toBeLessThanOrEqual(1.0001);
      checkTransitions(`${s.name} focus`, foc);
    });
  }

  test("nav: the strip wipes to half, the label does not move, press goes 1 px down", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
    await page.goto("/", { waitUntil: "networkidle" });
    const link = page.locator('.header-nav-link:not([aria-current="page"])').first();
    const label = await link.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    const strip = (await link.locator(".hn-strip").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)) as number;
    expect(strip, "strip at rest").toBeCloseTo(0, 1);
    await link.hover();
    await page.waitForTimeout(450);
    const half = await link.locator(".hn-strip").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    expect(half, "strip wiped to half").toBeCloseTo(0.5, 1);
    const hovered = await link.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    expect(hovered, "label box unchanged on hover").toEqual(label);
    const before = await read(link, "::before");
    await page.mouse.down();
    await page.waitForTimeout(400);
    const pressed = await read(link, "::before");
    expect(pressed.y - before.y, "press moves the paper 2 px below its hover pose (hover −1 → press +1)").toBeCloseTo(2, 0);
    await page.mouse.move(2, 2);
    await page.mouse.up();
  });

  test("the connect pill does not rotate on hover (S35 / EXE-63)", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
    await page.goto("/", { waitUntil: "networkidle" });
    const pill = page.locator(".header-pill");
    await pill.hover();
    await page.waitForTimeout(450);
    const m = await pill.evaluate((el) => {
      const cs = getComputedStyle(el);
      const t = cs.transform === "none" ? new DOMMatrix() : new DOMMatrix(cs.transform);
      return { rotate: cs.rotate, b: t.b, c: t.c };
    });
    expect(m.rotate === "none" || Number.parseFloat(m.rotate) === 0).toBe(true);
    expect(Math.abs(m.b) + Math.abs(m.c)).toBeLessThan(1e-6);
  });
});

test.describe("@EVAL-040 stylesheet contract", () => {
  test("hover rules on the L1 surfaces are gated, have a focus-visible twin, and never transition a shadow or filter", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const result = await page.evaluate(() => {
      const SCOPE =
        /\.(header-nav-link|hn-strip|header-pill|header-ask|theme-toggle|tt-window|hero-btn|cx-btn|fw-cta|hit-pill|acx-btn|pf-action|pf-play|pf-arrow|band-social|band-email|btn-arrow)\b/;
      // Static current-page states keep a :hover variant only to out-rank the base hover rule (specificity), and the legacy
      // InkUnderline is dead code (PrimaryNav no longer renders it): both are exempt from the gate/twin walk.
      const EXEMPT = /\[aria-current|ink-underline/;
      interface Hit {
        selector: string;
        media: string;
        style: CSSStyleDeclaration;
      }
      const hits: Hit[] = [];
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
          /* cross-origin sheet: not ours */
        }
      }
      const all = new Set(hits.map((h) => h.selector));
      const out: string[] = [];
      for (const h of hits) {
        if (!SCOPE.test(h.selector)) continue;
        const tp = h.style.transitionProperty;
        if (tp && /box-shadow|filter|(^|,\s*)all(\s*,|$)/.test(tp)) out.push(`transitions ${tp}: ${h.selector}`);
        const sc = `${h.style.transform} ${h.style.scale}`;
        const hoverish = /:hover|:focus-visible/.test(h.selector);
        for (const m of sc.matchAll(/scale(?:X|Y|3d)?\(([\d.]+)/g)) if (hoverish && Number(m[1]) > 1) out.push(`scales up (${m[0]}): ${h.selector}`);
        if (!h.selector.includes(":hover") || EXEMPT.test(h.selector)) continue;
        // reduced-motion blocks only REMOVE motion from hover/focus/press (they are not hover feedback themselves)
        if (/prefers-reduced-motion:\s*reduce/.test(h.media)) continue;
        if (!/hover:\s*hover/.test(h.media) || !/pointer:\s*fine/.test(h.media)) out.push(`ungated :hover: ${h.selector}`);
        // the twin: the same selector with :hover → :focus-visible (or both pseudo-classes in one selector)
        for (const part of h.selector.split(/,\s*(?![^()]*\))/)) {
          if (!part.includes(":hover")) continue;
          const twin = part.replaceAll(":hover", ":focus-visible");
          const ok = [...all].some((s) => s === twin || s.split(/,\s*(?![^()]*\))/).includes(twin)) || /:is\(:hover,\s*:focus-visible\)|:is\(:focus-visible,\s*:hover\)/.test(part);
          if (!ok) out.push(`no :focus-visible twin: ${part}`);
        }
      }
      return { count: hits.length, out };
    });
    expect(result.count, "rules walked").toBeGreaterThan(1000);
    expect(result.out).toEqual([]);
  });
});

test.describe("@EVAL-040 touch and reduced motion", () => {
  test("touch: a tap leaves no hover state behind (hover rules never apply)", async ({ page, viewport }) => {
    test.skip(viewport!.width !== 390, "touch project");
    await page.goto("/", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)).toBe(false);
    const toggle = page.locator(".theme-toggle");
    const before = await read(toggle);
    const shadowBefore = await toggle.locator(".tt-window").evaluate((el) => getComputedStyle(el).boxShadow);
    await toggle.tap(); // switches the theme...
    await page.waitForTimeout(500);
    const after = await read(toggle);
    expect(after.y - before.y, "no sticky hover lift after a tap").toBeCloseTo(0, 1);
    await toggle.tap(); // ...and back, so the shadow is comparable with the rest pose
    await page.waitForTimeout(500);
    const shadowAfter = await toggle.locator(".tt-window").evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadowAfter, "the paper-hover shadow never sticks after a tap").toBe(shadowBefore);
  });

  test("reduced motion: no translate on hover or focus, the shadow still swaps", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1024, "hover is a fine-pointer behaviour");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });
    const btn = page.locator(".hero-btn-primary").first();
    await btn.scrollIntoViewIfNeeded();
    await still(btn);
    const rest = await read(btn);
    await btn.hover();
    await page.waitForTimeout(300);
    const hov = await read(btn);
    expect(hov.y - rest.y, "no lift under reduced motion").toBeCloseTo(0, 1);
    expect(hov.shadow, "the shadow swap is the feedback that stays").not.toBe(rest.shadow);
    const tab = page.locator('.header-nav-link:not([aria-current="page"])').first();
    const tabRest = await read(tab, "::before");
    await tab.hover();
    await page.waitForTimeout(300);
    const tabHov = await read(tab, "::before");
    expect(tabHov.y - tabRest.y, "no tab lift under reduced motion").toBeCloseTo(0, 1);
    expect(tabHov.shadow, "the tab's shadow still swaps").not.toBe(tabRest.shadow);
  });
});
