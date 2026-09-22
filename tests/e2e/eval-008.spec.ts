/**
 * eval-008.spec.ts (technical-plan.md §B S09.02, `@EVAL-008`) — the responsive sweep across every
 * public route at 390 / 768 / 1024 / 1440: no horizontal page overflow, every visible control
 * ≥ 44×44 (documented allowlist aside), and no visible text below the 14px caption floor.
 *
 * LIVE now: no-overflow, 44px-target, AND the 14px content-text floor all run on every public
 * route — home, /work, every personal `/work/<slug>` case study, /about, /thinking, every
 * `/thinking/<slug>` essay, /playground, /contact (TKT-47) — with a documented `data-micro-label`
 * exception (EXE-7, `decisions.md`) for small non-content brand labels. The route list is DERIVED
 * from the same sources `app/sitemap.ts` composes (`STATIC_ROUTES` + personal `projects` +
 * `writing`), never hard-coded, so a new case study or essay is swept automatically instead of
 * silently going unchecked (TKT-47 QA-tester finding: the old `tests/e2e/routes.json` static list
 * only had `/work/teachspark`, missing 10 case studies + 5 essays).
 *
 * RESOLVED (EXE-7 · EVAL-008 findings from the original broadened sweep):
 *   • /contact 44px target — the "email me" action is now a `ClayButton` (min-h-11/min-w-11) on
 *     its own line, not a sub-44px inline link. Fixed by TKT-06/EXE-7, not exempted.
 *   • 14px text floor — the FloatingTiles one-liner `copy` was CONTENT rendered at 12px; it now
 *     uses `--text-caption` (14px). The header wordmark subtitle ("Senior Product Manager") and
 *     the "TP" monogram are decorative brand micro-labels, not content — EXE-7 grants them a
 *     documented exception (`data-micro-label`): exempt from the 14px floor, but still required to
 *     be ≥12px and pass WCAG AA contrast (≥4.5:1) against their resolved background. The rule is
 *     NOT weakened for anything else (EV2) — every other offender still fails at <14px.
 *
 * Each test title carries the literal `@EVAL-0xx` token so it surfaces in `playwright test --list`.
 */
import { test, expect } from "./fixtures";
import { DEV_ROUTES } from "./routes";
import { STATIC_ROUTES } from "@/app/sitemap";
import { projects } from "@/data/projects";
import { writing } from "@/data/writing";

// Full public-route sweep set (TKT-47), derived the same way `app/sitemap.ts` builds its entries —
// not the stale `tests/e2e/routes.json` static list (which only covered `/work/teachspark`).
const CASE_STUDY_ROUTES = projects
  .filter((project) => project.category === "personal")
  .map((project) => `/work/${project.slug}`);
const ESSAY_ROUTES = writing.map((essay) => `/thinking/${essay.slug}`);
const PUBLIC_ROUTES = [...STATIC_ROUTES, ...CASE_STUDY_ROUTES, ...ESSAY_ROUTES];
const ROUTES = [...PUBLIC_ROUTES, ...(process.env.ALLOW_DEV_ROUTES ? DEV_ROUTES : [])];
const MIN_FONT_PX = 14;
const MICRO_LABEL_MIN_PX = 12;
const MICRO_LABEL_MIN_CONTRAST = 4.5; // WCAG AA, normal text

for (const route of ROUTES) {
  test(`@EVAL-008 responsive: no horizontal overflow · ${route}`, { tag: "@EVAL-008" }, async ({
    page,
    noOverflow,
  }) => {
    await page.goto(route, { waitUntil: "load" });
    await noOverflow(page);
  });
}

// EXE-7: /contact's "email me" is now a real ≥44×44 ClayButton — every route runs this check.
for (const route of ROUTES) {
  test(`@EVAL-008 44px touch targets · ${route}`, { tag: "@EVAL-008" }, async ({
    page,
    minTargets,
  }) => {
    await page.goto(route, { waitUntil: "load" });
    await minTargets(page);
  });
}

// LIVE (EXE-7): content text ≥14px is enforced on every public route; `data-micro-label` elements
// (documented brand micro-labels — header wordmark subtitle, "TP" monogram) are exempt from the
// 14px floor but must still clear ≥12px AND WCAG AA contrast (≥4.5:1) against their resolved
// background — never a blanket escape hatch for content copy.
for (const route of ROUTES) {
  test(`@EVAL-008 no visible content text below ${MIN_FONT_PX}px · ${route} (data-micro-label exempt, ≥${MICRO_LABEL_MIN_PX}px + AA contrast)`, {
    tag: "@EVAL-008",
  }, async ({ page }) => {
    const FONT_FLOOR = MIN_FONT_PX - 0.5; // sub-pixel tolerance for a nominal 14px
    const MICRO_FLOOR = MICRO_LABEL_MIN_PX - 0.5; // sub-pixel tolerance for a nominal 12px
    await page.goto(route, { waitUntil: "load" });
    const offenders = await page.evaluate(
    ({ floor, microFloor, minContrast }) => {
      // Canvas fillStyle parses any CSS color (rgb/oklch/hsl/…) and rendering resolves it to sRGB
      // bytes, sidestepping getComputedStyle's color-function serialization differences.
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      function toRGBA(colorStr: string): [number, number, number, number] {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = colorStr;
        ctx.fillRect(0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        return [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0, (data[3] ?? 255) / 255];
      }
      function relLuminance([r, g, b]: [number, number, number]): number {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          const p = c / 255;
          return p <= 0.03928 ? p / 12.92 : Math.pow((p + 0.055) / 1.055, 2.4);
        }) as [number, number, number];
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
        const l1 = relLuminance(a);
        const l2 = relLuminance(b);
        const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
        return (lighter + 0.05) / (darker + 0.05);
      }
      function resolveBgRGB(start: Element): [number, number, number] {
        let node: Element | null = start;
        while (node) {
          const bg = getComputedStyle(node).backgroundColor;
          const [r, g, b, a] = toRGBA(bg);
          if (a > 0) return [r, g, b];
          node = node.parentElement;
        }
        return [255, 255, 255]; // fall back to the page's off-white ground
      }

      const out: { text: string; px: number; tag: string; reason: string }[] = [];
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
        if (!Number.isFinite(px)) continue;

        const isMicroLabel = el.closest("[data-micro-label]") !== null;
        if (isMicroLabel) {
          if (px < microFloor) {
            out.push({
              text: text.slice(0, 40),
              px: Math.round(px * 100) / 100,
              tag: el.tagName.toLowerCase(),
              reason: `data-micro-label below ${microFloor + 0.5}px floor`,
            });
            continue;
          }
          const [fr, fg, fb, fa] = toRGBA(style.color);
          if (fa > 0) {
            const fgRgb: [number, number, number] = [fr, fg, fb];
            const bgRgb = resolveBgRGB(el);
            const ratio = contrastRatio(fgRgb, bgRgb);
            if (ratio < minContrast) {
              out.push({
                text: text.slice(0, 40),
                px: Math.round(px * 100) / 100,
                tag: el.tagName.toLowerCase(),
                reason: `data-micro-label contrast ${ratio.toFixed(2)}:1 below AA ${minContrast}:1`,
              });
            }
          }
          continue;
        }

        if (px < floor) {
          out.push({
            text: text.slice(0, 40),
            px: Math.round(px * 100) / 100,
            tag: el.tagName.toLowerCase(),
            reason: `content text below ${floor + 0.5}px floor`,
          });
        }
      }
        return out;
      },
      { floor: FONT_FLOOR, microFloor: MICRO_FLOOR, minContrast: MICRO_LABEL_MIN_CONTRAST },
    );
    expect(offenders, `visible text below the font floor:\n${JSON.stringify(offenders, null, 2)}`).toEqual(
      [],
    );
  });
}
