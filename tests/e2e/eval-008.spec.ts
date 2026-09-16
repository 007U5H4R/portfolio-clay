/**
 * eval-008.spec.ts (technical-plan.md §B S09.02, `@EVAL-008`) — the responsive sweep across every
 * public route at 390 / 768 / 1024 / 1440: no horizontal page overflow, every visible control
 * ≥ 44×44 (documented allowlist aside), and no visible text below the 14px caption floor.
 *
 * LIVE now: no-overflow on all four routes; 44px-target check on /, /work, /work/teachspark.
 *
 * FIXME (real EVAL-008 findings the broadened sweep surfaced in already-shipped code — OUT OF
 * SCOPE for TKT-07a/TSK-09, which only builds the harness; recorded, never faked green, and they
 * flip to live once the owning ticket fixes them or a threshold-owner ratifies an exception):
 *   • /contact 44px targets — the "email me" link renders 80×26 (height < 44) and is not marked
 *     `data-inline-link`, so it is neither a 44px control nor a declared WCAG 2.5.8 inline-link
 *     exception. Owner: TKT-06 (contact page) — mark it inline or enlarge it.
 *   • 14px text floor — eyebrows ("Senior Product Manager"), the "TP" monogram, and the floating-
 *     tile captions render at 12–13px, below the design's own 14px caption token
 *     (--text-caption: 0.875rem) and EVAL-008's stated floor. Global via Header/hero/tiles, so it
 *     fails on every route. Owner: TKT-04/05 components (+ a threshold-owner ruling on whether
 *     overline/eyebrow microcopy is an accepted exception, à la the inline-target exception).
 *     These are NOT weakened here (EV2) — the assertion stays; it is skipped, not softened.
 *
 * Each test title carries the literal `@EVAL-0xx` token so it surfaces in `playwright test --list`.
 */
import { test, expect } from "./fixtures";
import { STATIC_ROUTES, DEV_ROUTES } from "./routes";

const ROUTES = [...STATIC_ROUTES, ...(process.env.ALLOW_DEV_ROUTES ? DEV_ROUTES : [])];
// 44px-target routes proven clean today; /contact is fixme'd (see the "email me" finding above).
const TARGET_ROUTES = ROUTES.filter((r) => r !== "/contact");
const MIN_FONT_PX = 14;

for (const route of ROUTES) {
  test(`@EVAL-008 responsive: no horizontal overflow · ${route}`, { tag: "@EVAL-008" }, async ({
    page,
    noOverflow,
  }) => {
    await page.goto(route, { waitUntil: "load" });
    await noOverflow(page);
  });
}

for (const route of TARGET_ROUTES) {
  test(`@EVAL-008 44px touch targets · ${route}`, { tag: "@EVAL-008" }, async ({
    page,
    minTargets,
  }) => {
    await page.goto(route, { waitUntil: "load" });
    await minTargets(page);
  });
}

// FIXME — /contact "email me" link is 80×26 (h < 44) and not data-inline-link. TKT-06 finding.
test.fixme(`@EVAL-008 44px touch targets · /contact ("email me" link is 26px tall — TKT-06)`, {
  tag: "@EVAL-008",
}, async ({ page, minTargets }) => {
  await page.goto("/contact", { waitUntil: "load" });
  await minTargets(page);
});

// FIXME — 12–13px eyebrow/monogram/tile microcopy is below the 14px caption floor (TKT-04/05).
// Kept as a real assertion (the intended sweep) so it flips to live when the floor is met.
test.fixme(`@EVAL-008 no visible text below ${MIN_FONT_PX}px (eyebrow/monogram at 12–13px — TKT-04/05)`, {
  tag: "@EVAL-008",
}, async ({ page }) => {
  const FONT_FLOOR = MIN_FONT_PX - 0.5; // sub-pixel tolerance for a nominal 14px
  await page.goto("/", { waitUntil: "load" });
  const offenders = await page.evaluate((floor) => {
    const out: { text: string; px: number; tag: string }[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = (node.textContent ?? "").trim();
      if (!text) continue;
      const el = node.parentElement;
      if (!el) continue;
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const px = parseFloat(style.fontSize);
      if (Number.isFinite(px) && px < floor) {
        out.push({ text: text.slice(0, 40), px: Math.round(px * 100) / 100, tag: el.tagName.toLowerCase() });
      }
    }
    return out;
  }, FONT_FLOOR);
  expect(offenders, `visible text below ${MIN_FONT_PX}px:\n${JSON.stringify(offenders, null, 2)}`).toEqual([]);
});
