/**
 * layout.spec.ts (technical-plan.md §B S05.05; TKT-71 S71.02/S71.04 header + reading-progress
 * gates) — the paper header contract (TC-130, TC-131, TC-133) at all 4 widths, then the S05.01/S05.02
 * assertions for `Container` / `Section` / `SectionHeading` / `Reveal`, plus the TKT-72 band footer
 * (TC-134, TC-135, TC-136) that replaced the S05.04 two-tier footer.
 *
 * Deliberately tagged `@primitives`, NOT `@EVAL-*` — same reasoning as `paper-board.spec.ts`
 * (TKT-04): the `/dev/primitives` board it targets is a QA-only route that only renders on an
 * `ALLOW_DEV_ROUTES` build, so it must not be pulled into the eval harness's plain-build grep.
 * Run with: `ALLOW_DEV_ROUTES=1 pnpm build && ALLOW_DEV_ROUTES=1 pnpm test:e2e --grep primitives`
 * (folded into EVAL-008/EVAL-010 formally at TKT-07, per docs/reports/TKT-04.md).
 *
 * The band tests below hit real routes (the band is mounted globally in app/layout.tsx) and need no
 * dev-route flag — they run under the plain `pnpm test:e2e` default too.
 */
import { test, expect } from "./fixtures";
import { STATIC_ROUTES as SITEMAP_STATIC_ROUTES } from "@/app/sitemap";
import { navItems } from "@/lib/nav";
import { hero } from "@/data/hero";
import { projects } from "@/data/projects";
import { writing } from "@/data/writing";

const PRIMITIVES_PATH = "/dev/primitives";
const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

/**
 * Navigate to the dev route and SKIP (never FAIL) when it 404s — `/dev/*` only exists under
 * `ALLOW_DEV_ROUTES=1`, so a plain `pnpm test:e2e` skips these instead of failing (TKT-07b).
 */
async function gotoDev(
  page: import("@playwright/test").Page,
  waitUntil: "load" | "domcontentloaded" = "load",
): Promise<void> {
  const resp = await page.goto(PRIMITIVES_PATH, { waitUntil });
  test.skip(
    (resp?.status() ?? 404) === 404,
    "/dev/primitives 404s without ALLOW_DEV_ROUTES=1 — run the QA job to exercise it",
  );
}

// ---------------------------------------------------------------------------
// TC-130 (TKT-71 AC 1, D12) — one header height at every width; `data-scrolled` toggles the hairline
// only, and is removed again at the top.
// ---------------------------------------------------------------------------
test("header keeps one height across scroll; data-scrolled only toggles the hairline", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  const header = page.locator("header[data-site-header]");
  await expect(header).toBeVisible();
  const lineColor = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "var(--line)";
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  });

  const restBox = await header.boundingBox();
  await expect(header).not.toHaveAttribute("data-scrolled");
  const restBorder = await header.evaluate((el) => getComputedStyle(el).borderBottomColor);
  expect(restBorder, "no hairline at rest").not.toBe(lineColor);

  await page.evaluate(() => window.scrollTo(0, 400));
  // Waits for hydration — the attribute is only written by the client HeaderScroll listener.
  await expect(header).toHaveAttribute("data-scrolled", "");
  const scrolledBox = await header.boundingBox();
  expect(
    Math.abs(scrolledBox!.height - restBox!.height),
    `height at scrollY 400 (${scrolledBox!.height}) must equal rest (${restBox!.height}) ±1 at ${width(page)}`,
  ).toBeLessThanOrEqual(1);
  const scrolledBorder = await header.evaluate((el) => getComputedStyle(el).borderBottomColor);
  expect(scrolledBorder, "the --line hairline appears after scroll").toBe(lineColor);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).not.toHaveAttribute("data-scrolled");
  const backBox = await header.boundingBox();
  expect(Math.abs(backBox!.height - restBox!.height)).toBeLessThanOrEqual(1);
});

// ---------------------------------------------------------------------------
// TC-131 (TKT-71 AC 3, AC 4, D8) — the subline annotation is gated by width (TP14 MediaGate), the
// nav is hidden < 1440 with seven items (TKT-101/102; TKT-112 menu below 1440) and an aria-current
// underline ≥ 1440, every control ≥ 44 px.
// ---------------------------------------------------------------------------
test("header subline annotation is absent from the DOM < 640 and present + aria-hidden ≥ 640", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  const header = page.locator("header[data-site-header]");
  // Hydration gate (the annotation only mounts client-side): wait for the scroll listener to exist.
  await page.evaluate(() => window.scrollTo(0, 40));
  await expect(header).toHaveAttribute("data-scrolled", "");
  await page.evaluate(() => window.scrollTo(0, 0));

  const annotations = header.locator('[data-decor="annotation"]');
  const decor = header.locator("[data-decor]");
  if (width(page) < 640) {
    await expect(annotations).toHaveCount(0);
    await expect(decor, "header unit count 0 below 640").toHaveCount(0);
  } else {
    await expect(annotations).toHaveCount(1);
    await expect(annotations).toHaveAttribute("aria-hidden", "true");
    await expect(annotations).toHaveText("Build · Learn · Solve · Grow");
    await expect(decor, "header unit count 1 (Design.md §3.3)").toHaveCount(1);
  }
});

test("primary nav: every navItems entry (TKT-101/102), hidden < 1440 behind the menu (TKT-112), aria-current draws the underline on /work", async ({ page }) => {
  await page.goto("/work", { waitUntil: "load" });
  const nav = page.locator('header nav[aria-label="Primary"]').first();
  const links = nav.locator("a");
  // Derived from lib/nav.ts (TKT-102 added Certifications; TKT-101 adds Projects) — never a literal.
  await expect(links).toHaveCount(navItems.length);
  await expect(nav.locator('a[href="/playground"]')).toHaveCount(1);
  await expect(nav.locator('a[href="/certifications"]')).toHaveCount(1);
  // TKT-112 (Tushar 2026-09-26, "Menu below 1440"): seven items need ≥ 1440; below that the menu button.
  if (width(page) < 1440) {
    await expect(nav).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    if (width(page) < 1024) await expect(page.locator('header a[href="/contact"]:visible')).toHaveCount(0);
    else await expect(page.locator('header a[href="/contact"]:visible')).toHaveCount(1);
    return;
  }
  await expect(nav).toBeVisible();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
  const active = nav.locator('a[aria-current="page"]');
  await expect(active).toHaveText("Experience");
  await expect(active.locator("svg.ink-underline")).toHaveCSS("opacity", "1");
  await expect(nav.locator('a[href="/"] svg.ink-underline')).toHaveCSS("opacity", "0");
  const font = await active.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(font).toContain("Fraunces");
  await expect(page.locator("header").getByRole("link", { name: /Let's connect/ })).toHaveAttribute("href", "/contact");
  await expect(page.locator("header").getByRole("button", { name: "Ask AI" })).toBeVisible();
});

test("every visible header control is at least 44×44", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  const undersized = await page.evaluate(() => {
    const out: { tag: string; name: string; w: number; h: number }[] = [];
    document.querySelectorAll("header a[href], header button").forEach((el) => {
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden") return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (Math.round(r.width) < 44 || Math.round(r.height) < 44) {
        out.push({ tag: el.tagName, name: (el.getAttribute("aria-label") ?? el.textContent ?? "").trim(), w: r.width, h: r.height });
      }
    });
    return out;
  });
  expect(undersized).toEqual([]);
});

// ---------------------------------------------------------------------------
// QA-010 regression (TKT-71 fix round 1) — at the lg collapse point six (TKT-101) Fraunces-18 nav items + the
// pill + the Ask ghost must fit: at 1024 (w1024 project), 1280 (w1440 project resized) and 1440
// (w1440 project) no two header controls' boxes intersect, none leaves the header row, no control
// overflows its own box (the grid was squeezing the brand's nowrap subline), and adjacent controls
// keep ≥ 16 px between them — headless Chromium has no scrollbar, so the 16 px margin stands in for
// the ~15 px a real Chrome window loses at 1024 (that is where the ~12 px pill ∩ Playground overlap
// was seen). Before the fix this failed at 1024 on every route.
// ---------------------------------------------------------------------------
const HEADER_MIN_GAP_PX = 16;
for (const target of [1024, 1280, 1440]) {
  test(`header controls never overlap or overflow at ${target} (QA-010)`, async ({ page }) => {
    const w = width(page);
    if (target === 1024) test.skip(w !== 1024, "1024 runs in the w1024 project");
    else test.skip(w !== 1440, `${target} runs in the w1440 project`);
    if (target === 1280) await page.setViewportSize({ width: 1280, height: 900 });

    for (const route of ["/", "/work", "/projects", "/about"]) {
      await page.goto(route, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const report = await page.evaluate(() => {
        const header = document.querySelector("header[data-site-header]")!;
        const hb = header.getBoundingClientRect();
        const controls = Array.from(header.querySelectorAll<HTMLElement>("a[href], button")).filter((el) => {
          const s = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return s.display !== "none" && s.visibility !== "hidden" && r.width > 0 && r.height > 0 && !el.closest("dialog");
        });
        // Text-only inner overflow: the union of the control's text-node rects vs its own box. Uses
        // text ranges, not scrollWidth, so the decorative ink-underline SVG (which bleeds 2 px past
        // each nav link by design) does not register — only squeezed copy does.
        const textOverflow = (el: HTMLElement) => {
          const r = el.getBoundingClientRect();
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          let left = Infinity;
          let right = -Infinity;
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            if (!n.textContent?.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(n);
            for (const rect of Array.from(range.getClientRects())) {
              if (rect.width === 0) continue;
              left = Math.min(left, rect.left);
              right = Math.max(right, rect.right);
            }
          }
          if (left === Infinity) return 0;
          return Math.max(0, r.left - left, right - r.right);
        };
        const boxes = controls.map((el) => ({
          name: (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 24),
          r: el.getBoundingClientRect(),
          innerOverflow: textOverflow(el),
          // The pill and the Ask ghost are one designed cluster (`.header-actions`, 10 px apart) —
          // the min-gap rule is about the nav's neighbours, not the spacing inside that cluster.
          cluster: !!el.closest(".header-actions"),
        }));
        const overlaps: string[] = [];
        for (let i = 0; i < boxes.length; i++) {
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i]!.r;
            const b = boxes[j]!.r;
            const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
            const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
            if (x > 0.5 && y > 0.5) overlaps.push(`${boxes[i]!.name} ∩ ${boxes[j]!.name} = ${x.toFixed(1)}px`);
          }
        }
        const outside = boxes
          .filter(({ r }) => r.left < hb.left - 0.5 || r.right > hb.right + 0.5 || r.top < hb.top - 0.5 || r.bottom > hb.bottom + 0.5)
          .map(({ name }) => name);
        const squeezed = boxes.filter((b) => b.innerOverflow > 1).map((b) => `${b.name}: text overflows its box by ${b.innerOverflow.toFixed(1)}px`);
        const sorted = [...boxes].sort((a, b) => a.r.left - b.r.left);
        const minGap = Math.min(
          ...sorted.slice(1).map((b, i) => (b.cluster && sorted[i]!.cluster ? Infinity : b.r.left - sorted[i]!.r.right)),
        );
        return { count: boxes.length, overlaps, outside, squeezed, minGap };
      });
      const where = `${route} @ ${target}`;
      // TKT-112: < 1440 the nav collapses to the menu button (brand + pill + Ask + menu); ≥ 1440 the full nav.
      const expected = target < 1440 ? 4 : 3 + navItems.length;
      expect(report.count, `${where}: brand + ${target < 1440 ? "menu" : "every nav item"} + pill + Ask visible`).toBe(expected);
      expect(report.overlaps, `${where}: overlapping header controls`).toEqual([]);
      expect(report.outside, `${where}: controls outside the header`).toEqual([]);
      expect(report.squeezed, `${where}: a control squeezed below its content`).toEqual([]);
      expect(report.minGap, `${where}: min gap between adjacent controls`).toBeGreaterThanOrEqual(HEADER_MIN_GAP_PX);
      test.info().annotations.push({ type: `min-gap-${target}`, description: `${route}: ${report.minGap.toFixed(1)}px` });
    }
  });
}

// ---------------------------------------------------------------------------
// TC-133 (TKT-71 AC 6) — the reading-progress bar exists only on case studies, is aria-hidden, and
// its scaleX tracks the scroll fraction (also under reduced motion — position, not motion).
// ---------------------------------------------------------------------------
test("reading progress: present on /work/teachspark, absent on / and /about, scaleX follows scroll", async ({
  page,
  withReducedMotion,
}) => {
  test.skip(width(page) !== 1440 && width(page) !== 390, "progress geometry checked at 390 and 1440");
  for (const route of ["/", "/about"]) {
    await page.goto(route, { waitUntil: "load" });
    await expect(page.locator("[data-progress]")).toHaveCount(0);
  }

  await withReducedMotion(page);
  await page.goto("/work/teachspark", { waitUntil: "load" });
  const bar = page.locator("[data-progress]");
  await expect(bar).toHaveCount(1);
  await expect(bar).toHaveAttribute("aria-hidden", "true");
  const scaleX = () =>
    bar.evaluate((el) => {
      const t = getComputedStyle(el).transform;
      const m = /matrix\(([^,]+),/.exec(t);
      return m ? parseFloat(m[1]!) : NaN;
    });
  await expect.poll(scaleX).toBeCloseTo(0, 2);

  const half = await page.evaluate(() => {
    const doc = document.documentElement;
    const range = doc.scrollHeight - doc.clientHeight;
    window.scrollTo(0, range / 2);
    return range;
  });
  expect(half, "the case study must scroll").toBeGreaterThan(0);
  await expect.poll(scaleX, { timeout: 5000 }).toBeGreaterThan(0.4);
  await expect.poll(scaleX).toBeLessThan(0.6);
});

// ---------------------------------------------------------------------------
// S05.01 — Container gutters + max-width ladder
// ---------------------------------------------------------------------------
test("Container gutters and max-width match the token ladder", { tag: "@primitives" }, async ({ page }) => {
  await gotoDev(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Paper primitive system");

  const container = page.getByTestId("layout-demo-container");
  const { paddingLeft, paddingRight, maxWidth } = await container.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      paddingLeft: parseFloat(s.paddingLeft),
      paddingRight: parseFloat(s.paddingRight),
      maxWidth: parseFloat(s.maxWidth),
    };
  });

  const w = width(page);
  const expectedGutter = w >= 1024 ? 64 : w >= 768 ? 40 : 24;
  expect(paddingLeft, `paddingLeft at ${w}`).toBeCloseTo(expectedGutter, 0);
  expect(paddingRight, `paddingRight at ${w}`).toBeCloseTo(expectedGutter, 0);

  // max-width only becomes the binding constraint once the viewport exceeds it; below 1024 the
  // element is narrower than either cap so `maxWidth` is still the correct CSS value regardless.
  const expectedMax = w >= 1440 ? 1320 : 1200;
  expect(maxWidth, `max-width at ${w}`).toBeCloseTo(expectedMax, 0);
});

// ---------------------------------------------------------------------------
// S05.01 — Section vertical-rhythm ladder (72/96/128) + single-tone wash
// ---------------------------------------------------------------------------
test("Section vertical rhythm matches the 72/96/128 token ladder", { tag: "@primitives" }, async ({ page }) => {
  await gotoDev(page);

  const section = page.getByTestId("layout-demo-section");
  const { paddingTop, paddingBottom } = await section.evaluate((el) => {
    const s = getComputedStyle(el);
    return { paddingTop: parseFloat(s.paddingTop), paddingBottom: parseFloat(s.paddingBottom) };
  });

  const w = width(page);
  const expected = w >= 1024 ? 128 : w >= 768 ? 96 : 72;
  expect(paddingTop, `paddingTop at ${w}`).toBeCloseTo(expected, 0);
  expect(paddingBottom, `paddingBottom at ${w}`).toBeCloseTo(expected, 0);

  await expect(section).toHaveAttribute("aria-labelledby", "layout-demo-heading");
  await expect(page.locator("#layout-demo-heading")).toHaveText("Section rhythm");
});

// ---------------------------------------------------------------------------
// S05.02 — Reveal: visible in static HTML with JS disabled
// ---------------------------------------------------------------------------
test("Reveal leaves content visible in static HTML with JS disabled", { tag: "@primitives" }, async ({
  page,
  browser,
}) => {
  test.skip(width(page) !== 1440, "runs once at w1440");
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  try {
    const p = await context.newPage();
    const resp = await p.goto(PRIMITIVES_PATH, { waitUntil: "domcontentloaded" });
    test.skip((resp?.status() ?? 404) === 404, "/dev/primitives 404s without ALLOW_DEV_ROUTES=1");
    const target = p.getByTestId("reveal-demo");
    await expect(target).toBeVisible();
    const opacity = await target.evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity, "no-JS Reveal content must render fully visible (no .reveal class applied)").toBe(
      "1",
    );
  } finally {
    await context.close();
  }
});

// ---------------------------------------------------------------------------
// S05.02 — Reveal fires once and never re-triggers
// ---------------------------------------------------------------------------
test("Reveal fires once via IntersectionObserver and does not re-trigger", { tag: "@primitives" }, async ({
  page,
}) => {
  test.skip(width(page) !== 1440, "runs once at w1440");
  await gotoDev(page);
  const target = page.getByTestId("reveal-demo");
  await target.scrollIntoViewIfNeeded();
  await expect(target).toHaveAttribute("data-revealed", "");
  await expect(target).toHaveCSS("opacity", "1");

  // Scroll away and back; a re-triggered observer would be harmless here (state is already true),
  // but a leaked, still-connected observer is the real risk — poked indirectly via the attribute
  // staying stable across scroll churn.
  await page.evaluate(() => window.scrollTo(0, 0));
  await target.scrollIntoViewIfNeeded();
  await expect(target).toHaveAttribute("data-revealed", "");
});

// ---------------------------------------------------------------------------
// S05.02 — reduced motion: Reveal is opacity-only, transform never animates between frames
// ---------------------------------------------------------------------------
test("Reveal is opacity-only under reduced motion (transform never animates)", {
  tag: "@primitives",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "runs once at w1440");
  await withReducedMotion(page);
  await gotoDev(page);

  const target = page.getByTestId("reveal-demo");
  await target.scrollIntoViewIfNeeded();
  await expect(target).toHaveAttribute("data-revealed", "");

  const samples = await target.evaluate(
    (el) =>
      new Promise<string[]>((resolve) => {
        const vals: string[] = [];
        let n = 0;
        const tick = () => {
          vals.push(getComputedStyle(el).transform);
          n++;
          if (n < 6) requestAnimationFrame(tick);
          else resolve(vals);
        };
        requestAnimationFrame(tick);
      }),
  );
  const unique = new Set(samples);
  expect(
    unique.size,
    `transform sampled across frames must be constant under reduced motion: ${samples.join(", ")}`,
  ).toBe(1);

  const transitionProperty = await target.evaluate((el) => getComputedStyle(el).transitionProperty);
  expect(transitionProperty, "reduced motion must collapse .reveal to an opacity-only transition").toBe(
    "opacity",
  );
});

// ---------------------------------------------------------------------------
// TKT-72 — the terracotta band footer (S16) replaces the S05.04 two-tier Footer on every route.
// TC-134 (AC 1, AC 4): exactly one <footer> per route (static + every slug + 404), landmark resolves
// to h2#band-h ("Let's …"), band unit count 1 (`torn`). TC-135 (AC 5, S18): `hero.tagline` renders
// exactly once per route, as a `data-hand="quote"` with an sr-only "Source:" sibling.
// ---------------------------------------------------------------------------
const BAND_ROUTES = [
  ...SITEMAP_STATIC_ROUTES,
  ...projects.filter((p) => p.category === "personal").map((p) => `/work/${p.slug}`),
  ...writing.map((e) => `/thinking/${e.slug}`),
  "/definitely-missing",
];

test("band footer: one <footer> per route, landmark → h2#band-h, torn unit 1, tagline once", async ({ page }) => {
  test.skip(width(page) !== 1440, "route sweep is viewport-independent; runs once at w1440 (geometry below)");
  test.setTimeout(BAND_ROUTES.length * 5_000 + 30_000);
  for (const route of BAND_ROUTES) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const footer = page.locator("footer");
    await expect(footer, `${route}: exactly one <footer>`).toHaveCount(1);
    await expect(footer).toHaveAttribute("aria-labelledby", "band-h");
    await expect(footer.locator("h2#band-h"), `${route}: band heading`).toHaveText(/^Let.s /);
    await expect(footer.locator("[data-decor]"), `${route}: band unit count`).toHaveCount(1);
    await expect(footer.locator('[data-decor="torn"]')).toHaveCount(1);

    const quote = page.getByText(hero.tagline.text, { exact: true });
    await expect(quote, `${route}: tagline exactly once`).toHaveCount(1);
    await expect(quote).toHaveAttribute("data-hand", "quote");
    const source = footer.locator(".band-tagline .sr-only");
    await expect(source).toHaveText(/^Source: /);
    await expect(footer.getByText("Bengaluru, India"), `${route}: location hidden (showLocation=false)`).toHaveCount(0);
  }
});

test("band footer geometry: social circles 48 px with names, no overflow, safe-area padding declared", async ({
  page,
  noOverflow,
}) => {
  test.skip(width(page) !== 1440 && width(page) !== 390, "band geometry checked at 390 and 1440");
  await page.goto("/", { waitUntil: "load" });
  const band = page.locator("footer.band");
  await band.scrollIntoViewIfNeeded();
  await noOverflow(page);

  const circles = band.locator(".band-social a");
  const n = await circles.count();
  expect(n, "LinkedIn + GitHub (S5: public repo exists) + résumé").toBe(3);
  for (let i = 0; i < n; i++) {
    const circle = circles.nth(i);
    await expect(circle).toHaveAttribute("aria-label", /.+/);
    const box = await circle.boundingBox();
    // 56 → 48 px with the compact band (TKT-109, Tushar 2026-09-26, Design.md §11 Dev-43); still ≥ 44 px targets.
    expect(box!.width).toBeGreaterThanOrEqual(48);
    expect(box!.height).toBeGreaterThanOrEqual(48);
  }
  // TKT-109 (Tushar 2026-09-26: "compress and compact it and make the height shorter"): was 622 px at
  // 1440 and 687 px at 390; compact band measures 347 / 528 px — guard against it growing back.
  const bandBox = await band.boundingBox();
  expect(bandBox!.height, "compact band height (Dev-43)").toBeLessThanOrEqual(width(page) === 1440 ? 400 : 580);
  const email = await band.locator(".band-email").boundingBox();
  expect(email!.height, "email link is a ≥ 44 px target").toBeGreaterThanOrEqual(44);

  // TC-134 step 4: the © bar's declared padding-bottom carries the home-indicator inset.
  const declared = await page.evaluate(() => {
    const out: string[] = [];
    const walk = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule && rule.selectorText === ".band-bar") {
          out.push(rule.style.getPropertyValue("padding-bottom"));
        }
        if ("cssRules" in rule && (rule as CSSGroupingRule).cssRules) walk((rule as CSSGroupingRule).cssRules);
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        walk(sheet.cssRules);
      } catch {
        /* cross-origin sheet — not ours */
      }
    }
    return out;
  });
  expect(declared.some((v) => v.includes("env(safe-area-inset-bottom")), `declared: ${declared.join(" | ")}`).toBe(true);
});
