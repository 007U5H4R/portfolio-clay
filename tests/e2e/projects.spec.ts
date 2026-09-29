/**
 * projects.spec.ts — the `/projects` Portfolio page (TASK-116, Tushar's spec 2026-09-28; replaces the
 * TKT-80 filterable index + ExperienceStrip suite). The spec §55 verification list, automated:
 *
 *   PORTFOLIO NAV     the tab says "Portfolio", `/projects` still works (200) and is `aria-current`.
 *   PRODUCT SHOWCASE  the old grid / filter tabs / strip are gone from the DOM; the first product is
 *                     selected in pitch mode; a carousel click updates the panel in place (no
 *                     navigation) and `?product=`; the carousel loops (arrows + keyboard) with a
 *                     roving tabindex and the focus ring; the deep link selects; no player mounts
 *                     before a press (no video exists yet, so none at all); unavailable actions are
 *                     absent; external links open a new tab with `noopener noreferrer`; the selected
 *                     cover is visibly marked by shape (outline), not colour alone.
 *   ENTERPRISE        below the showcase; six case files in the spec's grouping; no budgets, no links.
 *   GENERAL           no page overflow + 44 px targets (EVAL-008), axe (EVAL-006), the EVAL-018 unit
 *                     counts (products 2, enterprise 2), the ~62/38 desktop split and the mobile order.
 * Reduced motion lives in eval-010.spec.ts; the media switching with real sources is proven by the
 * fixture suite in tests/unit/portfolio.test.tsx; the real pairs (Campfire Board, TASK-124; Slag City, TASK-129) are in portfolio-video.spec.ts.
 *
 * Tags carried so the tests surface under the relevant eval ids (`pnpm eval --only …`).
 */
import { test, expect } from "./fixtures";
import { openCaseStudy } from "./case-study-system";
import { projects } from "@/data/projects";
import { enterpriseCases } from "@/data/enterprise";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

const PERSONAL = projects.filter((p) => p.category === "personal");
const panel = (page: import("@playwright/test").Page) => page.getByRole("tabpanel");
const hydrated = async (page: import("@playwright/test").Page) => {
  // The static HTML already carries the default selection; wait until React owns the tabs.
  await page.waitForFunction(() => {
    const tab = document.querySelector('[role="tab"]');
    return !!tab && Object.keys(tab).some((k) => k.startsWith("__react"));
  });
};

// ---------------------------------------------------------------------------
// PORTFOLIO NAV + intro
// ---------------------------------------------------------------------------
test("@EVAL-011 the nav tab says Portfolio, /projects is live and current, the intro is compact", { tag: "@EVAL-011" }, async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  const res = await page.goto("/projects", { waitUntil: "load" });
  expect(res?.status()).toBe(200);
  const tab = page.locator('nav[aria-label="Primary"] a[href="/projects"]');
  await expect(tab).toHaveText("Portfolio");
  await expect(tab).toHaveAttribute("aria-current", "page");
  await expect(page).toHaveTitle(/^Portfolio · /);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Products I’ve built, tested, and shipped.");
  await expect(page.getByText("Pick one. Watch the pitch. Open the demo. Explore the build.")).toBeVisible();
});

test("the old index is gone from the DOM: no filter tabs, grid cards, numbered rows or experience strip", async ({ page }) => {
  test.skip(width(page) !== 1440, "DOM presence is viewport-independent; checked once at w1440");
  await page.goto("/projects", { waitUntil: "load" });
  await expect(page.getByRole("tablist", { name: "Filter projects" })).toHaveCount(0);
  await expect(page.locator('[data-card-mode], .work-index, .work-hero, details[name="job"]')).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Professional experience" })).toHaveCount(0);
  // Enterprise work is never mixed into the carousel (spec §53).
  const tabs = await page.getByRole("tab").allTextContents();
  for (const client of enterpriseCases.map((c) => c.client)) {
    expect(tabs.join(" ")).not.toContain(client);
  }
});

// ---------------------------------------------------------------------------
// PRODUCT SHOWCASE
// ---------------------------------------------------------------------------
test("@EVAL-011 the carousel lists every personal build; the first is selected in pitch mode, poster only", { tag: "@EVAL-011" }, async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/projects", { waitUntil: "load" });
  const tabs = page.getByRole("tablist", { name: "Select a product" }).getByRole("tab");
  await expect(tabs).toHaveCount(PERSONAL.length);
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
  await expect(panel(page)).toHaveAttribute("data-media-mode", "pitch");
  await expect(page.getByRole("heading", { level: 2, name: PERSONAL[0]!.name })).toBeVisible();
  // Only the active media may load — and no recording exists yet, so nothing at all.
  await expect(page.locator("video, iframe")).toHaveCount(0);
  await expect(page.locator(".pf-stage .pf-cover")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /^Play / })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^(Pitch|Demo) video$/ })).toHaveCount(0);
});

test("@EVAL-002 @EVAL-011 a carousel click updates the panel in place and the URL; the case-study link opens in a new tab", {
  tag: ["@EVAL-002", "@EVAL-011"],
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "click flow verified once at w1440");
  await page.goto("/projects", { waitUntil: "load" });
  await hydrated(page);
  const target = PERSONAL[2]!;
  await page.getByRole("tab", { name: new RegExp(`^${target.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:`) }).click();
  await expect(panel(page)).toHaveAttribute("data-active-product", target.slug);
  await expect(panel(page)).toHaveAttribute("data-media-mode", "pitch");
  await expect(page.getByRole("heading", { level: 2, name: target.name })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/projects\\?product=${target.slug}$`));

  await page.goto("/projects", { waitUntil: "load" });
  const cs = page.getByRole("tabpanel").getByRole("link", { name: /Read the case study/ });
  await expect(cs).toHaveAttribute("href", `/work/${PERSONAL[0]!.slug}`);
  // TASK-130 (Dev-129): the case study opens in a new tab; /projects stays put.
  const study = await openCaseStudy(page, cs);
  await expect(study).toHaveURL(new RegExp(`/work/${PERSONAL[0]!.slug}$`));
  await expect(study.getByRole("heading", { level: 1 })).toHaveText(PERSONAL[0]!.name);
  await study.close();
});

test("@EVAL-011 the deep link selects its product; an unknown one falls back to the first", { tag: "@EVAL-011" }, async ({ page }) => {
  test.skip(width(page) !== 1440, "deep link verified once at w1440");
  const target = PERSONAL.find((p) => p.slug === "tegaki")!;
  await page.goto(`/projects?product=${target.slug}`, { waitUntil: "load" });
  await expect(panel(page)).toHaveAttribute("data-active-product", target.slug);
  await expect(page.getByRole("tab", { selected: true })).toHaveAttribute("data-product", target.slug);
  await page.goto("/projects?product=vendor-passport", { waitUntil: "load" });
  await hydrated(page);
  await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
});

test("@EVAL-007 @EVAL-011 the carousel loops: arrow buttons wrap, ←/→/Home/End move focus + selection with a focus ring", {
  tag: ["@EVAL-007", "@EVAL-011"],
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "keyboard sweep runs once at a desktop width");
  await page.goto("/projects", { waitUntil: "load" });
  await hydrated(page);
  const last = PERSONAL[PERSONAL.length - 1]!;
  await page.getByRole("button", { name: "Previous product" }).click();
  await expect(panel(page)).toHaveAttribute("data-active-product", last.slug);
  await page.getByRole("button", { name: "Next product" }).click();
  await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);

  const tabs = page.getByRole("tab");
  expect(await tabs.evaluateAll((els) => els.map((el) => (el as HTMLElement).tabIndex).filter((t) => t === 0).length)).toBe(1);
  await tabs.first().focus();
  await page.keyboard.press("ArrowLeft");
  await expect(panel(page)).toHaveAttribute("data-active-product", last.slug);
  await expect(page.locator(`[role="tab"][data-product="${last.slug}"]`)).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
  await page.keyboard.press("End");
  await expect(panel(page)).toHaveAttribute("data-active-product", last.slug);
  await page.keyboard.press("Home");
  await expect(panel(page)).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
  const ring = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const s = getComputedStyle(el);
    return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), visible: el.matches(":focus-visible") };
  });
  expect(ring).toEqual({ style: "solid", width: 2, visible: true });
  // The page never scrolled sideways while the track moved.
  expect(await page.evaluate(() => window.scrollX)).toBe(0);
});

test("@EVAL-011 actions: only what exists renders; external links open a new tab with noopener noreferrer", { tag: "@EVAL-011" }, async ({ page }) => {
  test.skip(width(page) !== 1440, "action matrix checked once at w1440");
  await page.goto("/projects", { waitUntil: "load" });
  await hydrated(page);
  for (const project of PERSONAL) {
    await page.getByRole("tab", { name: new RegExp(`^${project.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:`) }).click();
    await expect(panel(page)).toHaveAttribute("data-active-product", project.slug);
    const actions = page.getByRole("list", { name: `${project.name} actions` });
    await expect(actions.locator('[data-action="product"]')).toHaveCount(project.links.live ? 1 : 0);
    await expect(actions.locator('[data-action="github"]')).toHaveCount(project.links.repoPublic && project.links.github ? 1 : 0);
    await expect(actions.locator('[data-action="prd"]')).toHaveCount(0);
    for (const link of await actions.getByRole("link").all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      await expect(link).toHaveAttribute("aria-label", /\(opens in new tab\)$/);
    }
  }
  await expect(page.locator("button[disabled], [aria-disabled='true']")).toHaveCount(0);
  await expect(page.locator("video, iframe")).toHaveCount(0);
});

test("TASK-125 RailCite plays its real YouTube pitch, then its demo, in the same stage — one iframe at a time", async ({ page }) => {
  test.skip(width(page) !== 1440, "real-embed flow checked once at w1440 (loads youtube-nocookie over the network)");
  await page.goto("/projects?product=railcite", { waitUntil: "load" });
  await hydrated(page);
  await expect(panel(page)).toHaveAttribute("data-active-product", "railcite");
  await expect(panel(page)).toHaveAttribute("data-media-mode", "pitch");
  const actions = page.getByRole("list", { name: "RailCite actions" });
  await expect(actions.getByRole("button", { name: "Pitch video" })).toBeVisible();
  await expect(actions.getByRole("button", { name: "Demo video" })).toBeVisible();
  await expect(page.locator("video, iframe")).toHaveCount(0); // poster until the viewer presses play
  const stage = page.locator("#pf-stage-screen");
  await stage.getByRole("button", { name: /^Play .+ pitch video$/ }).click();
  await expect(stage.locator("iframe")).toHaveCount(1);
  const pitchSrc = new URL((await stage.locator("iframe").getAttribute("src"))!);
  expect(pitchSrc.origin).toBe("https://www.youtube-nocookie.com");
  expect(pitchSrc.pathname).toBe("/embed/nI3EqDXd5Io");
  await actions.getByRole("button", { name: "Demo video" }).click();
  await expect(page.locator("iframe")).toHaveCount(0); // switching unmounts the pitch player
  await stage.getByRole("button", { name: /^Play .+ product demonstration$/ }).click();
  await expect(page.locator("iframe")).toHaveCount(1);
  expect(new URL((await stage.locator("iframe").getAttribute("src"))!).pathname).toBe("/embed/B3x-I1J8JW8");
});

test("the selected cover is marked by shape (sketch outline + lift), not colour alone", async ({ page }) => {
  test.skip(width(page) !== 1440, "selection styling checked once at w1440");
  await page.goto("/projects", { waitUntil: "load" });
  const outline = (sel: string) =>
    page.locator(sel).evaluate((el) => {
      const s = getComputedStyle(el, "::after");
      return { content: s.content, border: s.borderTopStyle };
    });
  expect(await outline('[role="tab"][aria-selected="true"]')).toEqual({ content: '""', border: "solid" });
  expect((await outline('[role="tab"][aria-selected="false"] >> nth=0')).content).toBe("none");
});

// ---------------------------------------------------------------------------
// ENTERPRISE
// ---------------------------------------------------------------------------
test("@EVAL-013 enterprise: six grouped case files below the showcase, no budgets, no links", { tag: "@EVAL-013" }, async ({ page }) => {
  test.skip(width(page) !== 1440, "content is viewport-independent; checked once at w1440");
  await page.goto("/projects", { waitUntil: "load" });
  const section = page.locator("section#enterprise");
  await expect(section.getByRole("heading", { level: 2 })).toHaveText("Projects built inside larger systems.");
  const clients = await section.getByRole("heading", { level: 3 }).allTextContents();
  expect(clients).toEqual(enterpriseCases.map((c) => c.client));
  const showcaseBottom = await page.locator(".pf-carousel").evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
  const enterpriseTop = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  expect(enterpriseTop).toBeGreaterThan(showcaseBottom);
  const pear = section.locator("article").filter({ hasText: "Pear Health Labs" });
  await expect(pear.locator(".pf-case-streams li")).toHaveCount(3);
  const lifepoint = section.locator("article").filter({ hasText: "LifePoint Health" });
  await expect(lifepoint.locator(".pf-case-streams li")).toHaveCount(3);
  const text = (await section.textContent()) ?? "";
  expect(text).not.toMatch(/[$€£₹]|budget/i);
  await expect(section.locator("a")).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// GENERAL — layout, EVAL-018, EVAL-008, EVAL-006
// ---------------------------------------------------------------------------
test("layout: ~62/38 stage/panel at ≥1024; media → details → actions → carousel when stacked", async ({ page }) => {
  await page.goto("/projects", { waitUntil: "load" });
  const box = async (sel: string) => (await page.locator(sel).first().boundingBox())!;
  const stage = await box(".pf-stage");
  const info = await box(".pf-info");
  const actions = await box(".pf-actions");
  const carousel = await box(".pf-carousel");
  if (width(page) >= 1024) {
    expect(stage.x).toBeLessThan(info.x);
    const ratio = stage.width / (stage.width + info.width);
    expect(ratio).toBeGreaterThan(0.55);
    expect(ratio).toBeLessThan(0.66);
    expect(carousel.y).toBeGreaterThan(stage.y + stage.height - 1);
  } else {
    expect(info.y).toBeGreaterThan(stage.y + stage.height - 1);
    expect(actions.y).toBeGreaterThan(info.y);
    expect(carousel.y).toBeGreaterThan(actions.y);
  }
});

test("@EVAL-008 the carousel swipes inside its track; ~1.5–2.2 covers show at 390, 5–7 at 1440", { tag: "@EVAL-008" }, async ({ page }) => {
  const w = width(page);
  test.skip(w !== 390 && w !== 1440, "cover counts asserted at the two boundary widths");
  await page.goto("/projects", { waitUntil: "load" });
  const m = await page.locator(".pf-track").evaluate((el) => {
    const tab = el.querySelector('[role="tab"]') as HTMLElement;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return { scrolls: el.scrollWidth > el.clientWidth, visible: el.clientWidth / (tab.offsetWidth + gap), overflowX: getComputedStyle(el).overflowX };
  });
  expect(m.scrolls).toBe(true);
  expect(m.overflowX).toBe("auto");
  if (w === 390) {
    expect(m.visible).toBeGreaterThanOrEqual(1.5);
    expect(m.visible).toBeLessThanOrEqual(2.2);
  } else {
    expect(m.visible).toBeGreaterThanOrEqual(5);
    expect(m.visible).toBeLessThanOrEqual(7);
  }
});

test("@EVAL-008 /projects has no horizontal overflow and ≥44 targets", { tag: "@EVAL-008" }, async ({ page, noOverflow, minTargets }) => {
  await page.goto("/projects", { waitUntil: "load" });
  await noOverflow(page);
  await minTargets(page);
});

test("@EVAL-018 /projects: one scene img; decoration counts products 2 / enterprise 2", { tag: ["@EVAL-018", "@EVAL-013"] }, async ({ page }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "counts asserted at the two boundary widths");
  await page.goto("/projects", { waitUntil: "load" });
  await expect(page.locator('img[src*="scene-work"], img[srcset*="scene-work"]')).toHaveCount(1);
  const img = page.locator('[data-opener="scene-work"] img');
  await expect(img).toHaveCount(1);
  expect((await img.getAttribute("alt"))?.length ?? 0).toBeGreaterThan(20);
  const counts = await page.evaluate(() => {
    const unitOf = (el: Element) => el.closest("section, footer");
    const count = (selector: string) => {
      const unit = document.querySelector(selector);
      if (!unit) return -1;
      return Array.from(unit.querySelectorAll("[data-decor]")).filter((d) => unitOf(d) === unit).length;
    };
    return { products: count("section#products"), enterprise: count("section#enterprise") };
  });
  expect(counts).toEqual({ products: 2, enterprise: 2 });
});

test("@EVAL-006 /projects is axe-clean", { tag: "@EVAL-006" }, async ({ page, axe }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe run at the two boundary widths");
  await page.goto("/projects", { waitUntil: "load" });
  await axe(page);
});

test("@EVAL-006 /projects is axe-clean with a non-default product selected", { tag: "@EVAL-006" }, async ({ page, axe }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe run at the two boundary widths");
  await page.goto("/projects?product=dino-arcade-pwa", { waitUntil: "load" });
  await expect(panel(page)).toHaveAttribute("data-active-product", "dino-arcade-pwa");
  await axe(page);
});

// ---------------------------------------------------------------------------
// Cover titles fit (orchestrator review of TASK-116: "TEACHSPARK" rendered "TEACHSPAR" on the stage
// cover). The name is content, so no ellipsis: every glyph box must sit inside the cover, the title
// never scrolls, and it wraps to at most two lines — stage cover for every product, and every thumb.
// ---------------------------------------------------------------------------
async function titleFit(page: import("@playwright/test").Page, scope: string) {
  return page.$$eval(`${scope} .pf-cover`, (covers) =>
    covers.map((cover) => {
      const name = cover.querySelector(".pf-cover-name") as HTMLElement;
      const range = document.createRange();
      range.selectNodeContents(name);
      const text = range.getBoundingClientRect();
      const box = cover.getBoundingClientRect();
      const lh = parseFloat(getComputedStyle(name).lineHeight) || parseFloat(getComputedStyle(name).fontSize) * 1.05;
      // A word split across lines ("TEACHSPAR" / "K") reads as clipped too: each word must be one box.
      const node = name.firstChild;
      let splitWord = false;
      if (node && node.nodeType === Node.TEXT_NODE) {
        const txt = node.textContent ?? "";
        const re = /\S+/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec(txt))) {
          const wr = document.createRange();
          wr.setStart(node, m.index);
          wr.setEnd(node, m.index + m[0].length);
          const tops = new Set(Array.from(wr.getClientRects()).map((r) => Math.round(r.top)));
          if (tops.size > 1) splitWord = true;
        }
      }
      return {
        name: name.textContent ?? "",
        splitWord,
        scrolls: name.scrollWidth > name.clientWidth + 0.5,
        inside: text.left >= box.left - 0.5 && text.right <= box.right + 0.5 && text.top >= box.top - 0.5 && text.bottom <= box.bottom + 0.5,
        lines: Math.round(range.getClientRects().length ? text.height / lh : 0),
        fontPx: parseFloat(getComputedStyle(name).fontSize),
      };
    }),
  );
}

test("@EVAL-008 every cover title fits its cover — stage (each product) and thumbnails, ≤ 2 lines, ≥ 14 px", { tag: "@EVAL-008" }, async ({ page }) => {
  const w = width(page);
  test.skip(w !== 390 && w !== 1440, "fit asserted at the two boundary widths");
  await page.goto("/projects", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await hydrated(page);
  const bad: string[] = [];
  const check = (where: string, rows: Awaited<ReturnType<typeof titleFit>>) => {
    for (const r of rows) {
      if (r.scrolls || r.splitWord || !r.inside || r.lines > 2 || r.fontPx < 13.5) bad.push(`${where} · ${r.name}: ${JSON.stringify(r)}`);
    }
  };
  check("thumb", await titleFit(page, ".pf-track"));
  for (const project of PERSONAL) {
    await page.locator(`[role="tab"][data-product="${project.slug}"]`).click();
    await expect(panel(page)).toHaveAttribute("data-active-product", project.slug);
    await page.waitForTimeout(350); // let the 300 ms enter settle before measuring
    check("stage", await titleFit(page, ".pf-stage"));
  }
  expect(bad, "cover titles must never be clipped").toEqual([]);
});
