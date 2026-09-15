/**
 * Shared Playwright fixtures (technical-plan.md §A9 / §B S07.01) — implemented now on the tracer,
 * reused verbatim by the TKT-07 full harness. Each fixture is a callable helper injected into a
 * test so the assertions live in one place and every spec applies them identically.
 *
 *   axe               — @axe-core/playwright, tags wcag2a/wcag2aa/wcag21aa; fails on any
 *                       critical|serious violation (EVAL-006).
 *   noOverflow        — documentElement.scrollWidth <= clientWidth at the current viewport (EVAL-008).
 *   minTargets        — every VISIBLE a/button/[role=button]/[role=tab]/input has a box >= 44x44,
 *                       except selectors on the documented allowlist (EVAL-008 / Fitts).
 *   withReducedMotion — emulate prefers-reduced-motion: reduce for the current page (EVAL-010).
 *                       (Named `withReducedMotion`, not `reducedMotion`, to avoid overriding
 *                       Playwright's built-in `reducedMotion` context option.)
 *   noViewTransitions — delete document.startViewTransition before any script runs, forcing the
 *                       EXE-5 plain-navigation fallback (EVAL-015).
 */
import { test as base, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const TARGET_SELECTOR = "a[href], button, [role=button], [role=tab], input";
const MIN_TARGET_PX = 44;

/**
 * Documented min-target allowlist (EVAL-008). Controls that are legitimately below 44x44 in their
 * resting state, with the reason. Kept tiny and explicit — never a blanket escape hatch.
 */
const MIN_TARGET_ALLOWLIST: { selector: string; reason: string }[] = [
  {
    selector: 'a[href="#main"]',
    reason:
      "SkipLink is sr-only (1x1 clipped) until focused, at which point it renders full-size; it is not a resting touch target.",
  },
];

type AxeCheck = (page: Page, opts?: { include?: string }) => Promise<void>;
type PageCheck = (page: Page) => Promise<void>;

interface TracerFixtures {
  axe: AxeCheck;
  noOverflow: PageCheck;
  minTargets: PageCheck;
  withReducedMotion: PageCheck;
  noViewTransitions: PageCheck;
}

export const test = base.extend<TracerFixtures>({
  axe: async ({}, provide) => {
    await provide(async (page, opts) => {
      let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]);
      if (opts?.include) builder = builder.include(opts.include);
      const results = await builder.analyze();
      const blocking = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      const summary = blocking.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.length,
        help: v.help,
      }));
      expect(blocking, `axe critical/serious violations:\n${JSON.stringify(summary, null, 2)}`).toEqual(
        [],
      );
    });
  },

  noOverflow: async ({}, provide) => {
    await provide(async (page) => {
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(
        scrollWidth,
        `horizontal overflow: scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`,
      ).toBeLessThanOrEqual(clientWidth);
    });
  },

  minTargets: async ({}, provide) => {
    await provide(async (page) => {
      const allowSelectors = MIN_TARGET_ALLOWLIST.map((entry) => entry.selector);
      const undersized = await page.evaluate(
        ({ selector, minPx, allow }) => {
          const allowed = new Set<Element>();
          for (const sel of allow) {
            document.querySelectorAll(sel).forEach((el) => allowed.add(el));
          }
          const offenders: { tag: string; text: string; w: number; h: number }[] = [];
          const nodes = Array.from(document.querySelectorAll(selector));
          for (const el of nodes) {
            if (allowed.has(el)) continue;
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            // Only visible, laid-out controls count.
            if (style.display === "none" || style.visibility === "hidden") continue;
            if (rect.width === 0 || rect.height === 0) continue;
            if (rect.width < minPx || rect.height < minPx) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                text: (el.textContent ?? "").trim().slice(0, 40),
                w: Math.round(rect.width),
                h: Math.round(rect.height),
              });
            }
          }
          return offenders;
        },
        { selector: TARGET_SELECTOR, minPx: MIN_TARGET_PX, allow: allowSelectors },
      );
      expect(
        undersized,
        `controls below ${MIN_TARGET_PX}x${MIN_TARGET_PX} (not allowlisted):\n${JSON.stringify(undersized, null, 2)}`,
      ).toEqual([]);
    });
  },

  withReducedMotion: async ({}, provide) => {
    await provide(async (page) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
    });
  },

  noViewTransitions: async ({}, provide) => {
    await provide(async (page) => {
      await page.addInitScript(() => {
        try {
          // Remove the API so the app takes the EXE-5 plain-navigation fallback path.
          Reflect.deleteProperty(Document.prototype, "startViewTransition");
          Object.defineProperty(document, "startViewTransition", {
            configurable: true,
            value: undefined,
          });
        } catch {
          /* if it cannot be removed the test simply runs with VT available */
        }
      });
    });
  },
});

export { expect };
export { MIN_TARGET_ALLOWLIST };
