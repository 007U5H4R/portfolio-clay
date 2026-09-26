/**
 * eval-010.spec.ts (technical-plan.md §B S09.02, `@EVAL-010`) — prefers-reduced-motion honoured:
 * transform/position animations collapse to opacity-only or instant, and the page stays usable.
 * The header-collapse check and a generic no-transform-animation DOM sweep run on every public
 * route; the card hover-lift check stays scoped to `/` (the only route the hover card exists on).
 * Ask expand/panel, StoryCard and parallax component-specific checks are fixme'd until their
 * tickets (TKT-10/13/16). ShowTheThinking's reduced-motion behaviour is real now, in
 * thinking.spec.ts (TKT-21).
 *
 * TKT-48 (QA precedent: TKT-47's EVAL-008 fix): the header-collapse check previously ran on `/`
 * only, so a route whose header transition failed to collapse (e.g. a page-specific override)
 * would have gone undetected. The route list is DERIVED from the same sources `app/sitemap.ts` /
 * the TKT-47-fixed eval-008.spec.ts build theirs — never hard-coded. Same thresholds (transition
 * collapses to `none`; no element still transform/position-animates), only the iteration is
 * broader (no EV2 weakening).
 */
import { test, expect } from "./fixtures";
import { STATIC_ROUTES } from "@/app/sitemap";
import { projects } from "@/data/projects";
import { writing } from "@/data/writing";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

// Full public-route sweep set (TKT-48) — see eval-006/008 for the identical derivation.
const CASE_STUDY_ROUTES = projects
  .filter((project) => project.category === "personal")
  .map((project) => `/work/${project.slug}`);
const ESSAY_ROUTES = writing.map((essay) => `/thinking/${essay.slug}`);
const PUBLIC_ROUTES = [...STATIC_ROUTES, ...CASE_STUDY_ROUTES, ...ESSAY_ROUTES];

for (const route of PUBLIC_ROUTES) {
  test(`@EVAL-010 reduced motion: header transition collapses · ${route}`, {
    tag: "@EVAL-010",
  }, async ({ page, withReducedMotion }) => {
    test.skip(width(page) !== 1440, "compaction reduced-motion check runs at w1440 (fine pointer)");
    await withReducedMotion(page);
    await page.goto(route, { waitUntil: "load" });

    // Header transition-property collapses to none under reduced motion.
    const transitionProperty = await page
      .locator("header")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionProperty);
    expect(transitionProperty, "header transition must collapse to none under reduced motion").toBe(
      "none",
    );
  });
}

// Generic DOM sweep (mirrors eval-008's per-route offender scan): no element may still carry a
// non-instant transition/animation whose property list includes `transform` (or `all`, which
// implicitly includes it) once reduced motion is on — the global `app/globals.css` rule forces
// every transition/animation duration to 1ms, so anything still measuring above that has either
// bypassed the rule (inline `!important`, JS/WAAPI-driven motion) or is a new CSS rule that forgot
// to inherit it.
const DURATION_FLOOR_MS = 1.5; // 1ms forced floor + sub-ms rounding tolerance

for (const route of PUBLIC_ROUTES) {
  test(`@EVAL-010 reduced motion: no transform/position animation survives · ${route}`, {
    tag: "@EVAL-010",
  }, async ({ page, withReducedMotion }) => {
    test.skip(width(page) !== 1440, "generic reduced-motion sweep runs once per route at w1440");
    await withReducedMotion(page);
    await page.goto(route, { waitUntil: "load" });

    const offenders = await page.evaluate((floorMs) => {
      const toMs = (raw: string) => {
        const v = parseFloat(raw);
        if (!Number.isFinite(v)) return 0;
        return raw.trim().endsWith("ms") ? v : v * 1000;
      };
      const out: { tag: string; cls: string; kind: string; durationMs: number }[] = [];
      document.querySelectorAll("*").forEach((el) => {
        const style = getComputedStyle(el);

        const props = style.transitionProperty.split(",").map((s) => s.trim());
        const durations = style.transitionDuration.split(",").map((s) => s.trim());
        props.forEach((prop, i) => {
          if (prop !== "transform" && prop !== "all" && prop !== "top" && prop !== "left") return;
          const ms = toMs(durations[i % durations.length] ?? durations[0] ?? "0s");
          if (ms > floorMs) {
            out.push({ tag: el.tagName.toLowerCase(), cls: (el as HTMLElement).className?.toString().slice(0, 60) ?? "", kind: `transition:${prop}`, durationMs: ms });
          }
        });

        if (style.animationName !== "none") {
          const animDurations = style.animationDuration.split(",").map((s) => s.trim());
          const ms = toMs(animDurations[0] ?? "0s");
          if (ms > floorMs) {
            out.push({ tag: el.tagName.toLowerCase(), cls: (el as HTMLElement).className?.toString().slice(0, 60) ?? "", kind: `animation:${style.animationName}`, durationMs: ms });
          }
        }
      });
      return out;
    }, DURATION_FLOOR_MS);

    expect(
      offenders,
      `transform/position animation still active under reduced motion:\n${JSON.stringify(offenders, null, 2)}`,
    ).toEqual([]);
  });
}

test("@EVAL-010 reduced motion: card hover does not lift (/)", {
  tag: "@EVAL-010",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "hover reduced-motion check runs at w1440 (fine pointer)");
  await withReducedMotion(page);
  await page.goto("/", { waitUntil: "load" });

  // Card hover must not translate (transform-animate) under reduced motion.
  const card = page.locator('a[href="/work/teachspark"]').first();
  await card.scrollIntoViewIfNeeded();
  const before = await card.boundingBox();
  await card.hover();
  await page.waitForTimeout(300);
  const after = await card.boundingBox();
  expect(before && after, "card must be laid out").toBeTruthy();
  expect(
    Math.abs(after!.y - before!.y),
    "card must not lift under reduced motion",
  ).toBeLessThan(1);
});

// Ask expand/panel + StoryCard + parallax reduced-motion checks arrive with their components
// (TKT-10/13/16). ShowTheThinking's is real now — see thinking.spec.ts (TKT-21).
test.fixme("@EVAL-010 reduced motion: Ask / story / parallax collapse (TKT-10/13/16)", {
  tag: "@EVAL-010",
}, async () => {});

// ---------------------------------------------------------------------------------------------------
// TKT-83 · Show the thinking on a real case-study route (TC-162 step 4): under reduced motion the 8
// nodes appear all at once (delay 0, opacity only) and nothing in the deep dive animates transform.
// ---------------------------------------------------------------------------------------------------
test.describe("TKT-83 · deep dive reduced motion", () => {
  test("@EVAL-010 reduced motion: Show the thinking reveals all 8 nodes at once, opacity only (/work/teachspark)", {
    tag: "@EVAL-010",
  }, async ({ page, withReducedMotion }) => {
    test.skip(width(page) !== 1440, "reduced-motion check runs at w1440");
    await withReducedMotion(page);
    await page.goto("/work/teachspark", { waitUntil: "load" });
    await page.getByRole("radio", { name: "Deep dive" }).click();
    await page.getByRole("button", { name: /Show the thinking/ }).click();

    const nodes = page.locator("#show-the-thinking-panel li.thinking-node");
    await expect(nodes).toHaveCount(8);
    const styles = await nodes.evaluateAll((els) =>
      els.map((el) => {
        const s = getComputedStyle(el);
        return { opacity: s.opacity, property: s.transitionProperty, delay: s.transitionDelay };
      }),
    );
    for (const s of styles) {
      expect(s.property, "node transition must collapse to opacity only").toBe("opacity");
      expect(s.delay, "node transition-delay must be zeroed under reduced motion").toMatch(/^0s?$/);
    }
    await expect.poll(async () => nodes.evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity)), { timeout: 500 }).toEqual(
      Array.from({ length: 8 }, () => "1"),
    );
  });
});

// ---------------------------------------------------------------------------------------------------
// TKT-90c · S90.02 / TC-174 step 2 — every Design.md §8 row collapses under reduced motion, on every
// public route (+ the 404). The rows are checked by behaviour, not by class name, so a new rule or
// component is caught without editing this list:
//
// | §8 row                                   | Reduced-motion contract       | Where it is asserted                           |
// |------------------------------------------|-------------------------------|------------------------------------------------|
// | Hero clip                                | poster only                   | route sweep (0 autoplay video; `/` banner img) + eval-019.spec.ts |
// | Headline underline draw-in               | drawn, no animation           | route sweep (`[data-drawin]`)                  |
// | Section reveal                           | opacity-only, ≈ instant       | route sweep (`.reveal` after a full scroll)    |
// | Card / button / pill / band-social hover, next-project arrow, row arrow | no transform change | route hover sweep (rules read from the CSSOM) |
// | Nav / tab underline, CopyButton, progress bar | instant / unaffected     | — (no motion to collapse)                      |
// | Experience strip chevron                 | instant                       | `/projects` strip test below                   |
// | Filter change                            | opacity crossfade             | `/projects` filter test below (+ projects.spec)|
// | Ask inline expand                        | instant height, 150 ms opacity| ask-inline.spec.ts (TC-149)                    |
// | Ask panel / mobile sheet                 | instant; scrim opacity        | Ask panel test below                           |
// | Show-the-thinking nodes                  | all at once, opacity          | TKT-83 block above                             |
// | Overview folder tabs                     | instant                       | folder-tab test below                          |
// | (Dev-22) Lenis smoothing                 | native scroll                 | route sweep (no `html.lenis`) + lenis.spec.ts  |
// | (any) running WAAPI/CSS animation        | none longer than the 1 ms floor | route sweep (`document.getAnimations()`)     |
// ---------------------------------------------------------------------------------------------------
const SWEEP_ROUTES = [...PUBLIC_ROUTES, "/definitely-missing"];
const MOVE_PROPS = ["transform", "translate", "rotate", "scale"] as const;

/** Split a selector list on top-level commas (commas inside `:has(…)`/`:is(…)` stay). */
function splitSelectorList(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of list) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

test.describe("TKT-90c · §8 reduced-motion row sweep", () => {
  for (const route of SWEEP_ROUTES) {
    test(`@EVAL-010 reduced motion: §8 rows collapse (draw-ins, reveals, hero, Lenis, running animations) · ${route}`, {
      tag: "@EVAL-010",
    }, async ({ page, withReducedMotion }) => {
      test.skip(width(page) !== 1440, "row sweep runs once per route at w1440 (fine pointer)");
      await withReducedMotion(page);
      await page.goto(route, { waitUntil: "load" });

      // Scroll the whole page so every IntersectionObserver reveal fires (Lenis is off under reduced
      // motion, so a plain window scroll is the real scroll).
      await page.evaluate(async () => {
        const step = Math.max(200, Math.floor(window.innerHeight * 0.6));
        for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(150);

      const state = await page.evaluate((floorMs) => {
        const drawins = Array.from(document.querySelectorAll("[data-drawin]")).map((el) => {
          const s = getComputedStyle(el);
          return { animation: s.animationName, dashoffset: parseFloat(s.strokeDashoffset || "0") };
        });
        const reveals = Array.from(document.querySelectorAll(".reveal")).map((el) => {
          const s = getComputedStyle(el);
          return {
            property: s.transitionProperty,
            opacity: s.opacity,
            transform: s.transform,
            revealed: el.hasAttribute("data-revealed"),
          };
        });
        const running = document
          .getAnimations()
          .filter((a) => a.playState === "running")
          .map((a) => {
            const timing = a.effect?.getComputedTiming();
            const duration = typeof timing?.duration === "number" ? timing.duration : 0;
            const target = (a.effect as KeyframeEffect | null)?.target as Element | null;
            return {
              name: (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? a.constructor.name,
              duration,
              iterations: timing?.iterations ?? 1,
              target: target ? `${target.tagName.toLowerCase()}.${String((target as HTMLElement).className).slice(0, 40)}` : "",
            };
          })
          .filter((a) => a.duration > floorMs || a.iterations === Infinity);
        return {
          drawins,
          reveals,
          running,
          autoplayVideos: document.querySelectorAll("video[autoplay], video[data-hero-clip]").length,
          lenis: document.documentElement.classList.contains("lenis"),
        };
      }, DURATION_FLOOR_MS);

      test.info().annotations.push({
        type: "eval-010",
        description: JSON.stringify({ route, drawins: state.drawins.length, reveals: state.reveals.length, running: state.running.length }),
      });

      // Hero clip → poster only; no other autoplaying video anywhere.
      expect(state.autoplayVideos, "no autoplaying <video> under reduced motion").toBe(0);
      if (route === "/") {
        await expect(page.locator(".scene-banner img").first(), "the hero renders its still image").toBeVisible();
      }
      // Draw-ins render complete, never animate.
      for (const d of state.drawins) {
        expect(d.animation, "draw-in animation must be none").toBe("none");
        expect(d.dashoffset, "draw-in must render fully drawn (stroke-dashoffset 0)").toBe(0);
      }
      // Reveals: opacity-only transition, settled at opacity 1 with no transform offset.
      for (const r of state.reveals) {
        expect(r.property, "reveal transitions opacity only").toBe("opacity");
        expect(r.revealed, "every reveal fired after a full scroll").toBe(true);
        expect(r.opacity).toBe("1");
        expect(r.transform).toBe("none");
      }
      // Nothing (CSS animation, CSS transition or WAAPI/motion) still runs past the 1 ms floor.
      expect(state.running, `animations still running under reduced motion:\n${JSON.stringify(state.running, null, 2)}`).toEqual([]);
      // Dev-22: Lenis is not mounted (native scroll).
      expect(state.lenis, "Lenis must not mount under reduced motion").toBe(false);
    });
  }

  for (const route of SWEEP_ROUTES) {
    test(`@EVAL-010 reduced motion: no hover rule moves anything · ${route}`, {
      tag: "@EVAL-010",
    }, async ({ page, withReducedMotion }) => {
      test.skip(width(page) !== 1440, "hover sweep runs at w1440 (fine pointer, hover: hover)");
      await withReducedMotion(page);
      await page.goto(route, { waitUntil: "load" });
      const result = await hoverSweep(page);
      test.info().annotations.push({ type: "eval-010-hover", description: JSON.stringify({ route, ...result, moved: result.moved.length }) });
      expect(result.unresolved, "every :hover transform selector resolves to a hover target").toEqual([]);
      expect(result.moved, `hover still moves elements under reduced motion:\n${JSON.stringify(result.moved, null, 2)}`).toEqual([]);
    });
  }

  test("positive control: the same hover sweep detects the lift with motion allowed (/)", async ({ page }) => {
    test.skip(width(page) !== 1440, "control runs at w1440");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/", { waitUntil: "load" });
    const result = await hoverSweep(page);
    expect(result.moved.length, "the sweep must see at least one hover lift when motion is allowed").toBeGreaterThan(0);
  });

  test("@EVAL-010 reduced motion: experience-strip chevron flips instantly (/projects)", {
    tag: "@EVAL-010",
  }, async ({ page, withReducedMotion }) => {
    test.skip(width(page) !== 1440, "reduced-motion check runs at w1440");
    await withReducedMotion(page);
    await page.goto("/projects", { waitUntil: "load" });
    const summary = page.locator("details summary").filter({ has: page.locator(".job-chev") }).first();
    await summary.scrollIntoViewIfNeeded();
    const chev = summary.locator(".job-chev");
    const before = await chev.evaluate((el) => {
      const s = getComputedStyle(el);
      return { transform: s.transform, rotate: s.rotate, duration: s.transitionDuration, property: s.transitionProperty };
    });
    expect(before.duration.split(",").every((d) => parseFloat(d) * (d.trim().endsWith("ms") ? 1 : 1000) <= DURATION_FLOOR_MS),
      `chevron transition must be instant (got ${before.duration} on ${before.property})`).toBe(true);
    await summary.click();
    const after = await chev.evaluate(async (el) => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const s = getComputedStyle(el);
      return { transform: s.transform, rotate: s.rotate };
    });
    expect(after.transform !== before.transform || after.rotate !== before.rotate, "the chevron still flips (state stays visible)").toBe(true);
  });

  test("@EVAL-010 reduced motion: a filter change never writes a transform (/projects)", {
    tag: "@EVAL-010",
  }, async ({ page, withReducedMotion }) => {
    test.skip(width(page) !== 1440, "reduced-motion check runs at w1440");
    await withReducedMotion(page);
    await page.goto("/projects", { waitUntil: "load" });
    const tabs = page.getByRole("tab");
    expect(await tabs.count(), "/projects has filter tabs").toBeGreaterThan(1);
    await tabs.nth(1).scrollIntoViewIfNeeded();
    // Sample every element under the tab panel (inline transforms that `motion` writes) and every
    // running animation's keyframes for ~20 frames after the click.
    const sampled = page.evaluate(
      () =>
        new Promise<string[]>((resolve) => {
          const seen = new Set<string>();
          let frames = 0;
          const tick = () => {
            document.querySelectorAll("[role=tabpanel] *").forEach((el) => {
              const inline = (el as HTMLElement).style?.transform;
              if (inline && inline !== "none") seen.add(`${el.tagName.toLowerCase()}:${inline}`);
            });
            document.getAnimations().forEach((a) => {
              const kf = (a.effect as KeyframeEffect | null)?.getKeyframes?.() ?? [];
              if (kf.some((k) => "transform" in k || "translate" in k || "height" in k)) seen.add(`animation:${JSON.stringify(kf).slice(0, 80)}`);
            });
            frames += 1;
            if (frames < 20) requestAnimationFrame(tick);
            else resolve([...seen]);
          };
          requestAnimationFrame(tick);
        }),
    );
    await tabs.nth(1).click();
    expect(await sampled, "filter re-sequence is an opacity crossfade only").toEqual([]);
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  });

  test("@EVAL-010 reduced motion: overview folder tabs swap instantly (/work/teachspark)", {
    tag: "@EVAL-010",
  }, async ({ page, withReducedMotion }) => {
    test.skip(width(page) !== 1440, "reduced-motion check runs at w1440");
    await withReducedMotion(page);
    await page.goto("/work/teachspark", { waitUntil: "load" });
    const deep = page.getByRole("radio", { name: "Deep dive" });
    await deep.scrollIntoViewIfNeeded();
    await deep.click();
    const running = await page.evaluate(
      (floorMs) =>
        new Promise<string[]>((resolve) =>
          requestAnimationFrame(() =>
            resolve(
              document
                .getAnimations()
                .filter((a) => a.playState === "running")
                .filter((a) => {
                  const d = a.effect?.getComputedTiming().duration;
                  return typeof d === "number" && d > floorMs;
                })
                .map((a) => (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? "waapi"),
            ),
          ),
        ),
      DURATION_FLOOR_MS,
    );
    expect(running, "the folder-tab swap runs no animation").toEqual([]);
    await expect(deep).toHaveAttribute("aria-checked", "true");
  });

  test("@EVAL-010 reduced motion: the Ask panel opens in place, no slide (/)", {
    tag: "@EVAL-010",
  }, async ({ page, withReducedMotion }) => {
    test.skip(width(page) !== 1440, "reduced-motion check runs at w1440");
    await withReducedMotion(page);
    await page.goto("/", { waitUntil: "load" });
    await page.locator(".header-ask").first().click();
    const panel = page.locator("dialog.ask-panel");
    await expect(panel).toHaveAttribute("data-open", /.*/);
    const s = await panel.evaluate(async (el) => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const cs = getComputedStyle(el);
      return { transform: cs.transform, duration: cs.transitionDuration };
    });
    expect(s.transform, "the panel is in place one frame after opening").toBe("none");
    expect(parseFloat(s.duration) * (s.duration.trim().endsWith("ms") ? 1 : 1000)).toBeLessThanOrEqual(DURATION_FLOOR_MS);
  });
});

/**
 * Read every `:hover` style rule that sets a transform-family property (transform / translate / rotate /
 * scale, nested `@media (hover)` blocks included) from the live CSSOM, hover the first visible target of
 * each on the page, and report affected elements whose computed transform family changed.
 */
async function hoverSweep(page: import("@playwright/test").Page) {
  const selectors = await page.evaluate((props) => {
    const found = new Set<string>();
    const moves = (rule: CSSRule): boolean => {
      const style = (rule as CSSStyleRule).style;
      if (style && props.some((p) => { const v = style.getPropertyValue(p).trim(); return v !== "" && v !== "none"; })) return true;
      const kids = (rule as CSSGroupingRule).cssRules;
      if (!kids) return false;
      return Array.from(kids).some((k) => {
        if (k instanceof CSSMediaRule && !window.matchMedia(k.conditionText).matches) return false;
        return moves(k);
      });
    };
    const visit = (list: CSSRuleList) => {
      for (const r of Array.from(list)) {
        if (r instanceof CSSMediaRule) {
          if (window.matchMedia(r.conditionText).matches) visit(r.cssRules);
        } else if (r instanceof CSSStyleRule) {
          if (r.selectorText.includes(":hover") && moves(r)) found.add(r.selectorText);
          if (r.cssRules?.length) visit(r.cssRules);
        } else if ((r as CSSGroupingRule).cssRules) {
          visit((r as CSSGroupingRule).cssRules);
        }
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        visit(sheet.cssRules);
      } catch {
        /* cross-origin sheet — none expected */
      }
    }
    return [...found];
  }, [...MOVE_PROPS]);

  // The hover point is the centre of each element the rule restyles: `:hover` lands on the topmost element
  // there and every ancestor, which covers `X:hover`, `X:hover Y` (Y inside X) and `X:has(> Y:hover)`
  // (a stretched link inside the card) without parsing the (Lightning-CSS-rewritten) selector.
  // `:hover` as a pseudo-class only — not the escaped `\\:hover\\:` inside a Tailwind class name
  // (`.motion-reduce\\:hover\\:translate-y-0:hover`).
  const HOVER = /(?<!\\):hover(?![\w-])/g;
  const pairs = selectors.flatMap(splitSelectorList).filter((s) => new RegExp(HOVER.source).test(s));
  const unresolved: string[] = [];
  const moved: { selector: string; before: string; after: string }[] = [];
  let hovered = 0;
  for (const selector of pairs) {
    const affected = selector.replace(HOVER, "");
    const count = await page.evaluate((sel) => {
      try {
        return Array.from(document.querySelectorAll(sel)).filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
        }).length;
      } catch {
        return -1;
      }
    }, affected);
    if (count < 0) {
      unresolved.push(selector);
      continue;
    }
    if (count === 0) continue;
    const probe = (mode: "place" | "read") =>
      page.evaluate(({ sel, props, mode }) => {
        const el = Array.from(document.querySelectorAll(sel)).find((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden";
        })!;
        if (mode === "place") el.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        const hit = document.elementFromPoint(x, y);
        return {
          x,
          y,
          reachable: !!hit && (el === hit || el.contains(hit) || hit.contains(el)),
          // Canonicalise identity values so `translate: 0px` (a reduced-motion `translate-y-0` override)
          // equals `none`: only a real offset, turn or scale counts as movement.
          value: props
            .map((k) => {
              const v = getComputedStyle(el).getPropertyValue(k).trim();
              if (v === "none" || v === "") return "none";
              if (k === "transform") return /^matrix\(1, 0, 0, 1, 0, 0\)$/.test(v) ? "none" : v;
              const nums = v.match(/-?[\d.]+/g)?.map(Number) ?? [];
              if (k === "scale") return nums.every((n) => n === 1) ? "none" : v;
              return nums.every((n) => n === 0) ? "none" : v;
            })
            .join("|"),
        };
      }, { sel: affected, props: [...MOVE_PROPS], mode });
    await page.mouse.move(0, 0);
    const before = await probe("place");
    if (!before.reachable) continue; // covered (e.g. by the sticky header) — not hoverable here
    await page.waitForTimeout(30);
    const rest = await probe("read");
    await page.mouse.move(rest.x, rest.y);
    await page.waitForTimeout(60);
    const after = await probe("read");
    hovered += 1;
    if (rest.value !== after.value) moved.push({ selector, before: rest.value, after: after.value });
  }
  await page.mouse.move(0, 0);
  return { rules: pairs.length, hovered, unresolved, moved };
}
