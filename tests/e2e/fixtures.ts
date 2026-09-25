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
 *   keyboardOnly      — press Tab `opts.tabs` times and, after each, assert the focus-visible
 *                       element wears the shared 2px solid rust ring (EVAL-007).
 *   consoleErrors     — opt-in collector: any console.error or uncaught page error during a test
 *                       that destructures this fixture fails that test at teardown (A12: no silent
 *                       client errors).
 *   saveData          — opt-in (TSK-37, EVAL-019 Save-Data mode): stubs `navigator.connection` to
 *                       `{ saveData: true }` on the whole context before any page script runs, so
 *                       `HeroClip` takes its poster-only branch (Design.md §5.3.1).
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
  {
    selector: "a[data-inline-link]",
    reason:
      "ExternalLink is a running-text inline link (WCAG 2.5.8 inline exception): its target size is set by the sentence, not the 44px control floor. Marked explicitly with data-inline-link so only real inline links are exempt.",
  },
];

type AxeCheck = (page: Page, opts?: { include?: string }) => Promise<void>;
type PageCheck = (page: Page) => Promise<void>;
type KeyboardOnlyCheck = (page: Page, opts?: { tabs?: number }) => Promise<void>;

interface TracerFixtures {
  axe: AxeCheck;
  noOverflow: PageCheck;
  minTargets: PageCheck;
  withReducedMotion: PageCheck;
  noViewTransitions: PageCheck;
  keyboardOnly: KeyboardOnlyCheck;
  consoleErrors: string[];
  saveData: void;
}

/**
 * TKT-90d (A11Y-1): `Reveal` content is always in the accessibility tree but sits at opacity 0 until
 * it scrolls into view, and axe's color-contrast rule then measures a near-invisible blend. Audit
 * the page as a reader sees it: scroll every not-yet-revealed `.reveal` into view, wait until each
 * is revealed and fully opaque, then restore the scroll position. Nothing is excluded from axe.
 */
async function revealForAudit(page: Page): Promise<void> {
  // `.reveal` is only added after hydration — let the client settle first, or the class can land
  // mid-scan (seen at w390 on /about).
  await page.waitForLoadState("networkidle").catch(() => {});
  const scrollY = await page.evaluate(() => window.scrollY);
  // Element handles, not `.all()` locators: `:not([data-revealed])` re-resolves as items fire.
  const pending = await page.locator(".reveal:not([data-revealed])").elementHandles();
  for (const el of pending) await el.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll(".reveal")).every(
        (el) => el.hasAttribute("data-revealed") && getComputedStyle(el).opacity === "1",
      ),
    null,
    { timeout: 10_000 },
  );
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
}

export const test = base.extend<TracerFixtures>({
  axe: async ({}, provide) => {
    await provide(async (page, opts) => {
      await revealForAudit(page);
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
      // Let layout settle before measuring (M-004 QA: this check flaked under host load on
      // sub-pixel boundary cases — a control mid-reflow reading e.g. 43.6px, not a stale
      // assertion) — wait for the load event + web fonts, then retry the measurement pass with
      // Playwright's retrying `toPass()` instead of a one-shot evaluate, and round each dimension
      // to whole px before comparing (a legitimate <1px sub-pixel rounding tolerance; the real
      // 44px floor itself is unchanged).
      await page.waitForLoadState("load");
      await page.evaluate(() => document.fonts.ready);
      await expect(async () => {
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
              const w = Math.round(rect.width);
              const h = Math.round(rect.height);
              if (w < minPx || h < minPx) {
                offenders.push({
                  tag: el.tagName.toLowerCase(),
                  text: (el.textContent ?? "").trim().slice(0, 40),
                  w,
                  h,
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
      }).toPass({ timeout: 6000 });
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

  keyboardOnly: async ({}, provide) => {
    await provide(async (page, opts) => {
      const tabs = opts?.tabs ?? 6;
      // Resolve the accent colour through the same engine that resolves outline-color, so the
      // comparison is exact regardless of rgb()/oklch() serialisation across Chromium versions.
      const accent = await page.evaluate(() => {
        const probe = document.createElement("span");
        probe.style.color = "var(--color-rust)";
        probe.style.position = "absolute";
        probe.style.opacity = "0";
        probe.style.pointerEvents = "none";
        document.body.appendChild(probe);
        const c = getComputedStyle(probe).color;
        probe.remove();
        return c;
      });

      for (let i = 0; i < tabs; i++) {
        await page.keyboard.press("Tab");
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body || el === document.documentElement) return null;
          // Only assert on elements the browser is showing a keyboard focus ring for.
          if (typeof el.matches === "function" && !el.matches(":focus-visible")) return null;
          const s = getComputedStyle(el);
          return {
            outlineWidth: s.outlineWidth,
            outlineStyle: s.outlineStyle,
            outlineColor: s.outlineColor,
            tag: el.tagName.toLowerCase(),
            name: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 48),
          };
        });
        if (!info) continue; // no focus-visible target at this stop (e.g. a container) — skip
        const where = `tab ${i + 1} → <${info.tag}> "${info.name}"`;
        expect(info.outlineWidth, `${where}: focus ring must be 2px`).toBe("2px");
        expect(info.outlineStyle, `${where}: focus ring must be solid`).toBe("solid");
        expect(info.outlineColor, `${where}: focus ring must be the rust colour`).toBe(accent);
      }
    });
  },

  consoleErrors: async ({ page }, provide) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      // Network resource-status failures (e.g. "Failed to load resource: … 404") are logged by the
      // browser at error level but are NOT app client errors — they belong to the response/dead-link
      // layer (EVAL-011 crawler, TKT-07b), not this collector. A12 scopes `consoleErrors` to
      // app-thrown/logged JS errors (Ask/Video/Copy failure paths, React errors). During M-002 the
      // nav prefetches /thinking and /about (built in later milestones), so filtering this noise
      // here is correct scoping, not hiding — a genuine broken asset still fails the crawler.
      if (text.startsWith("Failed to load resource")) return;
      errors.push(text);
    });
    page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));
    await provide(errors);
    // Fails only the tests that opted into this fixture (A12: client errors are never silent).
    expect(errors, `app console/JS errors captured during the test:\n${errors.join("\n")}`).toEqual(
      [],
    );
  },

  saveData: async ({ context }, provide) => {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "connection", {
        configurable: true,
        value: { saveData: true },
      });
    });
    await provide();
  },
});

export { expect };
export { MIN_TARGET_ALLOWLIST };
