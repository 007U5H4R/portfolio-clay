/**
 * layout.spec.ts (technical-plan.md §B S05.05; TKT-71 S71.02/S71.04 header + reading-progress
 * gates) — the paper header contract (TC-130, TC-131, TC-133) at all 4 widths, then the S05.01/S05.02
 * assertions for `Container` / `Section` / `SectionHeading` / `Reveal`, plus the S05.04 `Footer`
 * content gate.
 *
 * Deliberately tagged `@primitives`, NOT `@EVAL-*` — same reasoning as `primitives.spec.ts`
 * (TKT-04): the `/dev/primitives` board it targets is a QA-only route that only renders on an
 * `ALLOW_DEV_ROUTES` build, so it must not be pulled into the eval harness's plain-build grep.
 * Run with: `ALLOW_DEV_ROUTES=1 pnpm build && ALLOW_DEV_ROUTES=1 pnpm test:e2e --grep primitives`
 * (folded into EVAL-008/EVAL-010 formally at TKT-07, per docs/reports/TKT-04.md).
 *
 * The Footer tests below target `/` directly (Footer is mounted globally in app/layout.tsx) and
 * need no dev-route flag — they run under the plain `pnpm test:e2e` default too.
 */
import { test, expect } from "./fixtures";

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
// nav is hidden < 1024 with five items and an aria-current underline ≥ 1024, every control ≥ 44 px.
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

test("primary nav: five items (D8), hidden < 1024, aria-current draws the underline on /work", async ({ page }) => {
  await page.goto("/work", { waitUntil: "load" });
  const nav = page.locator('header nav[aria-label="Primary"]').first();
  const links = nav.locator("a");
  await expect(links).toHaveCount(5);
  await expect(links.nth(4)).toHaveAttribute("href", "/playground");
  if (width(page) < 1024) {
    await expect(nav).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(page.locator('header a[href="/contact"]:visible')).toHaveCount(0);
    return;
  }
  await expect(nav).toBeVisible();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
  const active = nav.locator('a[aria-current="page"]');
  await expect(active).toHaveText("Work");
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
// S05.04 — Footer: tier 1 actions, tier 2 site map + credit, safe-area padding
// ---------------------------------------------------------------------------
test("Footer tier 1 actions resolve to the expected hrefs", async ({ page }) => {
  test.skip(width(page) !== 1440, "footer content checked once at w1440");
  await page.goto("/", { waitUntil: "load" });
  const footer = page.locator("footer");

  await expect(
    footer.getByRole("heading", { name: "Still curious? Let's build what's next." }),
  ).toBeVisible();
  await expect(footer.getByRole("link", { name: "Resume — updating" })).toHaveAttribute(
    "href",
    "/contact#resume",
  );
  await expect(footer.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
    "href",
    "https://www.linkedin.com/in/pathaktushar",
  );
  await expect(footer.getByRole("link", { name: "Let's Talk" })).toHaveAttribute("href", "/contact");
});

test("Footer tier 2 site map, GitHub/prior-site links and safe-area padding", async ({ page }) => {
  test.skip(width(page) !== 1440, "footer content checked once at w1440");
  await page.goto("/", { waitUntil: "load" });
  const footer = page.locator("footer");

  // Internal routes that already exist in this build resolve for real; /about and /thinking are
  // later-ticket pages (M-003+) so only their href is asserted here — exhaustive site-wide link
  // resolution is TC-037's crawler (TKT-07, EVAL-011), per test-cases.md TC-029 note 5.
  await expect(footer.getByRole("link", { name: "Work", exact: true })).toHaveAttribute("href", "/work");
  await expect(footer.getByRole("link", { name: "Contact", exact: true })).toHaveAttribute(
    "href",
    "/contact",
  );
  await expect(footer.getByRole("link", { name: "About", exact: true })).toHaveAttribute("href", "/about");
  await expect(footer.getByRole("link", { name: "Thinking", exact: true })).toHaveAttribute(
    "href",
    "/thinking",
  );
  for (const path of ["/work", "/contact"]) {
    const res = await page.request.get(path);
    expect(res.status(), `${path} must resolve 200`).toBe(200);
  }

  await expect(footer.getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/007U5H4R",
  );
  await expect(footer.getByRole("link", { name: "Previous portfolio" })).toHaveAttribute(
    "href",
    "https://tushar-pathak.vercel.app/",
  );

  // External links carry the new-tab safety attributes (TC-029 step 4).
  for (const name of ["LinkedIn", "GitHub", "Previous portfolio"]) {
    const link = footer.getByRole("link", { name }).first();
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  }

  // CRITICAL correction (decision TP10/E-1): the credit line is exactly "Built with curiosity." —
  // never "Built with Claude Code" (that authorship line lives on the /about colophon, M-006).
  await expect(footer.getByText("Built with curiosity.", { exact: true })).toBeVisible();
  await expect(footer.getByText("Built with Claude Code")).toHaveCount(0);

  const paddingBottom = await footer.evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
  expect(paddingBottom, "footer bottom padding must be >= the 40px floor + safe-area inset").toBeGreaterThanOrEqual(
    40,
  );
});
