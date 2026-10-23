/**
 * home-credentials.spec.ts (TASK-211) — Home's Credentials · Selected Work · Awards & Recognition, which
 * replace Featured Work and How I think. Hero, Ask and the band footer are covered by their own specs
 * (home.spec.ts DOM order + fills + EVAL-018 counts, home-ask-tushky.spec.ts, hero-*.spec.ts); this file pins:
 *   - the three sections sit in order between the hero and Ask, and the old two are gone;
 *   - every Credentials / Selected Work card has exactly ONE link, to a route that exists;
 *   - the five awards show their exact names (and issuer · year) in order, the granted patent first (TASK-359) —
 *     literals here on purpose, so a data edit that changes an award has to change this test too;
 *   - every image loads, has its intrinsic size reserved; scene art has an empty alt, logos and trophies are named;
 *   - no horizontal overflow at 320 / 390 (and the projects' own widths).
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const width = (page: Page) => page.viewportSize()?.width ?? 0;

const CREDENTIALS = [
  { org: "American Express", role: "Senior Product Manager (Accounts Receivable)", dates: "Jun 2026 – Present", href: "/work#work-experience" },
  { org: "Quantiphi Analytics", role: "Technical Project Manager – GCP Division", dates: "Aug 2022 – Apr 2026", href: "/work#work-experience" },
  { org: "Godrej Infotech", role: "Assistant Product Manager", dates: "Sep 2016 – Dec 2018", href: "/work#work-experience" },
  { org: "Independent Builder", role: "Personal products & MVPs", dates: null, href: "/projects" },
] as const;

const WORK = [
  { name: "RailCite", href: "/projects?product=railcite" },
  { name: "TeachSpark", href: "/projects?product=teachspark" },
  { name: "Enterprise AI Products", href: "/projects#enterprise" },
] as const;

const AWARDS = [
  { name: "Granted Patent", detail: "IN 429867 · co-inventor · granted 2023" },
  { name: "Google Cloud Partner All-Star", detail: "Delivery Excellence · 2024" },
  { name: "Annual Unsung Hero Award", detail: "Quantiphi Analytics Solutions · 2024" },
  { name: "12 in 11 Award", detail: "Godrej Infotech · 2018" },
  { name: "Best AI Operator", detail: "ReThink System Buildathon 2026" },
] as const;

test("@EVAL-017 Credentials, Selected Work and Awards sit between the hero and Ask; Featured Work and How I think are gone", async ({ page }) => {
  test.skip(width(page) !== 1440, "DOM order is viewport-independent; checked once at w1440");
  await page.goto("/", { waitUntil: "load" });
  const ids = await page.locator("#main > section").evaluateAll((els) => els.map((e) => e.id));
  expect(ids.slice(1)).toEqual(["credentials", "selected-work", "awards", "ask"]);
  await expect(page.locator("#work-featured, #how-i-think")).toHaveCount(0);
  await expect(page.getByText(/^Featured work$/i)).toHaveCount(0);
  await expect(page.getByText(/^How I think$/i)).toHaveCount(0);

  await expect(page.getByRole("heading", { level: 2, name: /Where I.ve made an impact\./ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /A few things I.ve built\./ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Recognized for impact." })).toBeVisible();
  await expect(page.locator("#credentials .hs-sub")).toHaveText("Enterprise experience. Real-world execution. Independent building.");
  await expect(page.locator("#selected-work .hs-sub")).toHaveText("From enterprise systems to personal products.");
  await expect(page.locator("#awards .hs-sub")).toHaveText("Recognition for contributions across cloud, product delivery, and AI.");
});

test("Credentials: four cards in order, each with one link to a real route and the site's verified role and dates", async ({ page, request }) => {
  await page.goto("/", { waitUntil: "load" });
  const cards = page.locator("#credentials .hs-li");
  await expect(cards).toHaveCount(4);
  for (const [i, want] of CREDENTIALS.entries()) {
    const card = cards.nth(i);
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(want.org);
    await expect(card).toContainText(want.role);
    if (want.dates) await expect(card).toContainText(want.dates);
    const links = card.locator("a[href]");
    await expect(links, `${want.org} has exactly one link`).toHaveCount(1);
    await expect(links.first()).toHaveAttribute("href", want.href);
    const res = await request.get(want.href.split("#")[0]!);
    expect(res.status(), `${want.href} resolves`).toBe(200);
  }
});

test("Selected Work: three cards, one link each to a real route, and View all work → /projects", async ({ page, request }) => {
  await page.goto("/", { waitUntil: "load" });
  const cards = page.locator("#selected-work .hs-li");
  await expect(cards).toHaveCount(3);
  for (const [i, want] of WORK.entries()) {
    const card = cards.nth(i);
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(want.name);
    const links = card.locator("a[href]");
    await expect(links, `${want.name} has exactly one link`).toHaveCount(1);
    await expect(links.first()).toHaveAttribute("href", want.href);
    expect((await request.get(want.href.split("#")[0]!)).status(), `${want.href} resolves`).toBe(200);
  }
  const all = page.locator("#selected-work").getByRole("link", { name: "View all work" });
  await expect(all).toHaveAttribute("href", "/projects");
  // the enterprise anchor target really exists on /projects
  await page.goto("/projects", { waitUntil: "load" });
  await expect(page.locator("section#enterprise")).toHaveCount(1);
});

test("Awards: all five exact names in order with issuer and year, one trophy each, and no links", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  const tiles = page.locator("#awards .hs-award");
  await expect(tiles).toHaveCount(5);
  for (const [i, want] of AWARDS.entries()) {
    const tile = tiles.nth(i);
    await expect(tile.getByRole("heading", { level: 3 })).toHaveText(want.name);
    await expect(tile.locator(".hs-award-detail")).toHaveText(want.detail);
    await expect(tile.locator(".hs-trophy img")).toHaveCount(1);
  }
  await expect(page.locator("#awards a[href]")).toHaveCount(0);
});

test("every image in the three sections loads, reserves its size, and is lazy; scene art is decorative (alt empty), logos and trophies are named", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  for (const id of ["credentials", "selected-work", "awards"]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  }
  await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>("#credentials img, #selected-work img, #awards img")].every((i) => i.complete));
  const imgs = await page.locator("#credentials img, #selected-work img, #awards img").evaluateAll((els) =>
    (els as HTMLImageElement[]).map((i) => ({
      src: i.getAttribute("src"),
      alt: i.getAttribute("alt"),
      ok: i.complete && i.naturalWidth > 0,
      w: i.getAttribute("width"),
      h: i.getAttribute("height"),
      lazy: i.loading,
      named: Boolean(i.closest(".hs-plaque, .hs-trophy")),
    })),
  );
  // 4 + 3 scene arts, 3 logos (Independent Builder shows its name in type, no logo), 5 trophies
  expect(imgs).toHaveLength(15);
  for (const img of imgs) {
    expect(img.ok, `${img.src} loads`).toBe(true);
    expect(img.w && img.h, `${img.src} has width/height attributes`).toBeTruthy();
    expect(img.lazy, `${img.src} is lazy`).toBe("lazy");
    if (img.named) expect(img.alt, `${img.src} has alt text`).toMatch(/\S/);
    else expect(img.alt, `${img.src} is decorative`).toBe("");
  }
});

test("no horizontal overflow on Home, including the three sections", async ({ page }) => {
  const check = async () => {
    await page.goto("/", { waitUntil: "load" });
    for (const id of ["credentials", "selected-work", "awards"]) await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `overflow at ${page.viewportSize()?.width}px`).toBeLessThanOrEqual(0);
    const wide = await page.locator("#credentials, #selected-work, #awards").evaluateAll((els) =>
      els.flatMap((s) => [...s.querySelectorAll("*")].filter((n) => n.getBoundingClientRect().right > innerWidth + 1 && !n.closest(".hs-carousel > ul") /* TASK-228: off-screen slides sit inside the phone scroll-snap row, clipped by it */).map((n) => `${s.id} ${n.tagName}.${n.className}`)),
    );
    expect(wide).toEqual([]);
  };
  await check();
  if (width(page) === 390) {
    await page.setViewportSize({ width: 320, height: 700 });
    await check();
  }
});

test("reduced motion: the cards and View all work pill do not translate on hover", async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "hover check runs at w1440 (fine pointer)");
  await withReducedMotion(page);
  await page.goto("/", { waitUntil: "load" });
  const go = page.locator("#selected-work .hs-go").first();
  await go.scrollIntoViewIfNeeded();
  const before = await go.boundingBox();
  await page.locator("#selected-work .hs-link").first().hover();
  await page.waitForTimeout(350);
  const after = await go.boundingBox();
  expect(Math.abs(after!.x - before!.x) + Math.abs(after!.y - before!.y)).toBeLessThan(0.5);
});

test("keyboard: every card link takes a visible focus ring", async ({ page }) => {
  test.skip(width(page) !== 1440, "runs once at w1440");
  await page.goto("/", { waitUntil: "load" });
  const links = page.locator("#credentials .hs-link, #selected-work .hs-link");
  await expect(links).toHaveCount(7);
  await page.keyboard.press("Tab"); // keyboard modality, so .focus() below is :focus-visible
  for (let i = 0; i < 7; i++) {
    const link = links.nth(i);
    await link.focus();
    const outline = await link.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { style: cs.outlineStyle, w: Number.parseFloat(cs.outlineWidth) };
    });
    expect(outline.style).not.toBe("none");
    expect(outline.w).toBeGreaterThanOrEqual(2);
  }
});
