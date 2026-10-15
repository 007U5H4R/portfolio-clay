/**
 * projects-mobile.spec.ts (TASK-210) — the phone Portfolio listing + project detail on `/projects`.
 *
 * Phone (< 640, the w390 project; widths 320–430 swept by hand-set viewports):
 *   LISTING   one card per personal build in data order; the filter chips (real statuses + "Has video") change the
 *             visible list without reordering it; an empty combination shows the empty state; every card is a real link
 *             to its detail view and opens it.
 *   DETAIL    "Watch demo" only with a real video (and it plays the real demo); an honest no-video state otherwise;
 *             "Live product" only with a real URL, "GitHub" only for a public repo; no dead buttons.
 *   BACK      the bar's Back and the browser's Back return to the listing with the filter kept; a fresh deep link's
 *             Back replaces the URL with the listing.
 *   OVERFLOW  nothing sticks out of the viewport at 320 / 360 / 375 / 390 / 430.
 * ≥ 640: the phone blocks are not shown and the carousel is (the desktop design is unchanged; projects.spec.ts holds its
 * behaviour).
 */
import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import { projects } from "@/data/projects";
import { portfolioEntries } from "@/data/portfolio";

const width = (page: Page) => page.viewportSize()?.width ?? 0;
const PERSONAL = projects.filter((p) => p.category === "personal");
const entryOf = (slug: string) => portfolioEntries.find((e) => e.slug === slug)!;
const hasPitch = (slug: string) => Boolean(entryOf(slug).pitchVideo);
const hasDemo = (slug: string) => Boolean(entryOf(slug).demoVideo);
const hasAnyVideo = (slug: string) => hasPitch(slug) || hasDemo(slug);
const names = (list: typeof PERSONAL) => list.map((p) => p.name);

const hydrated = async (page: Page) => {
  await page.waitForFunction(() => {
    const el = document.querySelector(".pf-showcase");
    return !!el && Object.keys(el).some((k) => k.startsWith("__react"));
  });
};
const openList = async (page: Page, query = "") => {
  await page.goto(`/projects${query}`, { waitUntil: "load" });
  await hydrated(page);
};
const cardNames = (page: Page) => page.locator(".pf-m-card .pf-m-name").allTextContents();
const chip = (page: Page, name: string) => page.getByRole("group", { name: "Filter projects" }).getByRole("button", { name, exact: true });
const showcase = (page: Page) => page.locator(".pf-showcase");
const detailName = (page: Page) => page.locator(".pf-showcase[data-view='detail'] .pf-info-name");

test.describe("Portfolio on phones (TASK-210)", () => {
  test.beforeEach(({ page }) => {
    test.skip(width(page) !== 390, "phone tier: asserted at the w390 project (other widths are swept in the overflow test)");
  });

  test("the listing shows every personal build in data order, with the carousel and desktop panel hidden", async ({ page }) => {
    await openList(page);
    await expect(showcase(page)).toHaveAttribute("data-view", "list");
    expect(await cardNames(page)).toEqual(names(PERSONAL));
    await expect(page.locator(".pf-carousel")).toBeHidden();
    await expect(page.locator(".pf-feature")).toBeHidden();
    await expect(page.getByTestId("pf-m-count")).toHaveText(`${PERSONAL.length} projects`);
    // the intro is compact: the first card starts in the top half of the screen
    const firstCard = await page.locator(".pf-m-card").first().boundingBox();
    expect(firstCard!.y).toBeLessThan(560);
  });

  test("filters change the visible list and keep its order; chips carry aria-pressed; an empty combination says so", async ({ page }) => {
    await openList(page);
    const group = page.getByRole("group", { name: "Filter projects" });
    await expect(chip(page, "All")).toHaveAttribute("aria-pressed", "true");
    // only the statuses that exist are offered
    const statuses = Array.from(new Set(PERSONAL.map((p) => p.status)));
    for (const label of ["Live", "Pilot", "Prototype", "Research"]) {
      await expect(chip(page, label)).toHaveCount(statuses.includes(label.toLowerCase() as never) ? 1 : 0);
    }
    await expect(group.getByRole("button")).toHaveCount(statuses.length + 2); // All + statuses + Has video

    for (const status of statuses) {
      const label = status[0]!.toUpperCase() + status.slice(1);
      await chip(page, label).click();
      const expected = PERSONAL.filter((p) => p.status === status);
      expect(await cardNames(page), status).toEqual(names(expected));
      await expect(chip(page, label)).toHaveAttribute("aria-pressed", "true");
      await expect(chip(page, "All")).toHaveAttribute("aria-pressed", "false");
      await expect(page.getByTestId("pf-m-count")).toHaveText(`${expected.length} of ${PERSONAL.length} projects`);
      await expect(page).toHaveURL(new RegExp(`/projects\\?filter=${status}$`));
    }

    await chip(page, "All").click();
    expect(await cardNames(page)).toEqual(names(PERSONAL));
    await expect(page).toHaveURL(/\/projects$/);

    await chip(page, "Has video").click();
    expect(await cardNames(page)).toEqual(names(PERSONAL.filter((p) => hasAnyVideo(p.slug))));
    await expect(chip(page, "Has video")).toHaveAttribute("aria-pressed", "true");

    // a status with no video-bearing build: the empty state, never a blank page
    const noVideoStatus = statuses.find((s) => !PERSONAL.some((p) => p.status === s && hasAnyVideo(p.slug)));
    expect(noVideoStatus, "fixture: some status has no product with a video").toBeTruthy();
    await chip(page, noVideoStatus![0]!.toUpperCase() + noVideoStatus!.slice(1)).click();
    await expect(page.getByTestId("pf-m-empty")).toBeVisible();
    await expect(page.locator(".pf-m-card")).toHaveCount(0);
    await expect(page.getByTestId("pf-m-count")).toHaveText(`0 of ${PERSONAL.length} projects`);
    await page.getByRole("button", { name: "Clear filters" }).click();
    expect(await cardNames(page)).toEqual(names(PERSONAL));
    await expect(page.getByTestId("pf-m-empty")).toHaveCount(0);
  });

  test("filter chips work from the keyboard (Tab + Space/Enter)", async ({ page }) => {
    await openList(page);
    await chip(page, "Live").focus();
    await page.keyboard.press("Enter");
    await expect(chip(page, "Live")).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Space");
    await expect(chip(page, "Pilot")).toHaveAttribute("aria-pressed", "true");
    expect(await cardNames(page)).toEqual(names(PERSONAL.filter((p) => p.status === "pilot")));
  });

  test("every card links to its real destination and opens that project's detail", async ({ page }) => {
    await openList(page);
    const hrefs = await page.locator(".pf-m-card").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs).toEqual(PERSONAL.map((p) => `/projects?product=${p.slug}`));
    for (const project of PERSONAL) {
      await page.locator(`.pf-m-card[data-product="${project.slug}"]`).click();
      await expect(showcase(page)).toHaveAttribute("data-view", "detail");
      await expect(detailName(page)).toHaveText(project.name);
      await expect(page).toHaveURL(new RegExp(`/projects\\?product=${project.slug}$`));
      await expect(page.getByRole("button", { name: "Back to portfolio" })).toBeVisible();
      await page.getByRole("button", { name: "Back to portfolio" }).click();
      await expect(showcase(page)).toHaveAttribute("data-view", "list");
      await expect(page.locator(`.pf-m-card[data-product="${project.slug}"]`)).toBeVisible();
    }
  });

  test("the detail shows what the record has and nothing it lacks: video, links, outcomes, tags", async ({ page }) => {
    for (const project of PERSONAL) {
      await page.goto(`/projects?product=${project.slug}`, { waitUntil: "load" });
      await hydrated(page);
      await expect(showcase(page)).toHaveAttribute("data-view", "detail");
      const actions = page.getByRole("group", { name: `${project.name} actions` });
      const where = project.slug;

      // video: "Watch demo" (else "Watch pitch") only for a real video; otherwise the honest note and no play button
      const watch = actions.locator('[data-action="watch"]');
      const wantWatch = (hasDemo(project.slug) || hasPitch(project.slug) ? 1 : 0) + (hasDemo(project.slug) && hasPitch(project.slug) ? 1 : 0);
      await expect(watch, where).toHaveCount(wantWatch);
      if (hasAnyVideo(project.slug)) {
        await expect(actions.locator(".pf-m-primary"), where).toHaveText(hasDemo(project.slug) ? "Watch demo" : "Watch pitch");
        await expect(page.locator(".pf-stage-screen").getByRole("button", { name: /^Play / }), where).toBeVisible();
        await expect(page.locator(".pf-m-novideo"), where).toBeHidden();
      } else {
        await expect(actions.locator(".pf-m-primary"), where).toHaveCount(0);
        await expect(page.locator(".pf-m-novideo"), where).toBeVisible();
        await expect(page.locator(".pf-m-novideo"), where).toHaveText("No video for this project yet");
        await expect(page.locator(".pf-stage-screen").getByRole("button"), where).toHaveCount(0);
      }

      // Live product only with a real URL; GitHub only for a public repo; Case study always (the real /work route)
      const live = actions.locator('[data-action="live"]');
      await expect(live, where).toHaveCount(project.links.live ? 1 : 0);
      if (project.links.live) await expect(live, where).toHaveAttribute("href", project.links.live);
      await expect(actions.locator('[data-action="github"]'), where).toHaveCount(project.links.repoPublic && project.links.github ? 1 : 0);
      await expect(actions.locator('[data-action="case"]'), where).toHaveAttribute("href", `/work/${project.slug}`);
      for (const link of await actions.getByRole("link").all()) {
        await expect(link, where).toHaveAttribute("target", "_blank");
        await expect(link, where).toHaveAttribute("rel", "noopener noreferrer");
        expect(((await link.getAttribute("href")) ?? "").length, where).toBeGreaterThan(1);
        await expect(link.locator(".sr-only"), where).toHaveText(/opens in a new tab/);
        expect((await link.boundingBox())!.height, where).toBeGreaterThanOrEqual(44);
      }
      for (const button of await actions.getByRole("button").all()) expect((await button.boundingBox())!.height, where).toBeGreaterThanOrEqual(44);
      await expect(page.locator(".pf-m-actions button[disabled], .pf-m-actions [aria-disabled='true']"), where).toHaveCount(0);

      // tags and outcomes come from the record
      await expect(page.locator(".pf-m-detail-tags li"), where).toHaveText(project.tags);
      const outcomes = page.locator(".pf-m-outcomes");
      if (project.metrics.length > 0) {
        await expect(outcomes.getByRole("heading", { name: "Key outcomes" }), where).toBeVisible();
        const values = await outcomes.locator(".pf-m-metric-value").allTextContents();
        expect(values, where).toEqual(project.metrics.slice(0, 3).map((m) => m.value));
      } else {
        await expect(outcomes.getByRole("heading", { name: "At a glance" }), where).toBeVisible();
        await expect(outcomes.locator(".pf-m-metrics"), where).toHaveCount(0);
        await expect(outcomes.locator(".pf-m-facts"), where).toContainText(project.role);
      }
    }
  });

  test("Watch demo plays the real demo in the hero (one iframe, user-initiated, privacy-enhanced)", async ({ page }) => {
    const railcite = entryOf("railcite");
    await page.goto("/projects?product=railcite", { waitUntil: "load" });
    await hydrated(page);
    await expect(page.locator("video, iframe")).toHaveCount(0); // poster until the viewer asks
    await page.getByRole("button", { name: "Watch demo" }).click();
    const stage = page.locator("#pf-stage-screen");
    await expect(stage.locator("iframe")).toHaveCount(1);
    const src = new URL((await stage.locator("iframe").getAttribute("src"))!);
    expect(src.origin).toBe("https://www.youtube-nocookie.com");
    expect(src.pathname).toBe(`/embed/${railcite.demoVideo!.videoId}`);
    await page.getByRole("button", { name: "Watch pitch" }).click();
    await expect(page.locator("iframe")).toHaveCount(1); // the pitch replaced the demo, never two at once
    expect(new URL((await stage.locator("iframe").getAttribute("src"))!).pathname).toBe(`/embed/${railcite.pitchVideo!.videoId}`);
  });

  test("Back returns to the listing with the filter kept: the bar's Back, the browser's Back, and a fresh deep link", async ({ page }) => {
    await openList(page);
    await chip(page, "Prototype").click();
    const prototypes = PERSONAL.filter((p) => p.status === "prototype");
    const target = prototypes[1]!;
    await page.locator(`.pf-m-card[data-product="${target.slug}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/projects\\?product=${target.slug}&filter=prototype$`));
    await expect(detailName(page)).toHaveText(target.name);

    await page.getByRole("button", { name: "Back to portfolio" }).click();
    await expect(showcase(page)).toHaveAttribute("data-view", "list");
    await expect(page).toHaveURL(/\/projects\?filter=prototype$/);
    await expect(chip(page, "Prototype")).toHaveAttribute("aria-pressed", "true");
    expect(await cardNames(page)).toEqual(names(prototypes));
    await expect(page.locator(`.pf-m-card[data-product="${target.slug}"]`)).toHaveAttribute("aria-current", "true");
    await expect(page.locator(`.pf-m-card[data-product="${target.slug}"]`)).toBeFocused();

    // the browser's own Back / Forward walk the same two screens
    await page.goForward();
    await expect(showcase(page)).toHaveAttribute("data-view", "detail");
    await expect(detailName(page)).toHaveText(target.name);
    await page.goBack();
    await expect(showcase(page)).toHaveAttribute("data-view", "list");
    await expect(chip(page, "Prototype")).toHaveAttribute("aria-pressed", "true");

    // a fresh load of a detail URL has no listing behind it: Back replaces the URL with the (filtered) listing
    await page.goto("/projects?product=railcite&filter=live", { waitUntil: "load" });
    await hydrated(page);
    await expect(detailName(page)).toHaveText("RailCite");
    await page.getByRole("button", { name: "Back to portfolio" }).click();
    await expect(showcase(page)).toHaveAttribute("data-view", "list");
    await expect(page).toHaveURL(/\/projects\?filter=live$/);
    await expect(chip(page, "Live")).toHaveAttribute("aria-pressed", "true");
    expect(await cardNames(page)).toEqual(names(PERSONAL.filter((p) => p.status === "live")));
  });

  test("nothing sticks out of the viewport at 320 / 360 / 375 / 390 / 430 — listing, empty, detail with and without video", async ({ page }) => {
    const noVideo = PERSONAL.find((p) => !hasAnyVideo(p.slug))!;
    const withVideo = PERSONAL.find((p) => hasDemo(p.slug) && hasPitch(p.slug))!;
    const longName = PERSONAL.reduce((a, b) => (b.name.length > a.name.length ? b : a));
    const pages = [
      { label: "list", url: "/projects" },
      { label: "empty", url: "/projects?filter=research&video=1" },
      { label: `detail ${withVideo.slug}`, url: `/projects?product=${withVideo.slug}` },
      { label: `detail ${noVideo.slug}`, url: `/projects?product=${noVideo.slug}` },
      { label: `detail ${longName.slug}`, url: `/projects?product=${longName.slug}` },
    ];
    for (const w of [320, 360, 375, 390, 430]) {
      await page.setViewportSize({ width: w, height: 800 });
      for (const { label, url } of pages) {
        await page.goto(url, { waitUntil: "load" });
        await hydrated(page);
        // `.pf-products` clips sideways overflow, so measure the boxes themselves (the chip scroller scrolls by design)
        const out = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const bad: string[] = [];
          const root = document.querySelector(".pf-products-wrap");
          for (const el of Array.from(root?.querySelectorAll("*") ?? [])) {
            if (el.closest(".pf-m-filters") || (el as HTMLElement).offsetParent === null) continue;
            if (el.closest(".pf-stage-screen")) continue;
            if (el.closest(".sr-only")) continue; // visually hidden by design (1px clipped box), not visible overflow
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            if (r.left < -0.5 || r.right > vw + 0.5) bad.push(`${el.tagName.toLowerCase()}.${(el as HTMLElement).className.toString().slice(0, 40)} ${Math.round(r.left)}..${Math.round(r.right)}`);
          }
          const scroller = document.querySelector(".pf-m-filters") as HTMLElement | null;
          return { vw, bad: bad.slice(0, 6), pageScrolls: document.documentElement.scrollWidth > vw, chipRowFits: scroller ? scroller.getBoundingClientRect().right <= vw + 0.5 : true };
        });
        expect(out.pageScrolls, `${label} @${w}`).toBe(false);
        expect(out.bad, `${label} @${w}`).toEqual([]);
        expect(out.chipRowFits, `${label} @${w}`).toBe(true);
      }
    }
  });

  test("the detail screen at the smallest phone: title and primary action stay on screen, nothing overlaps", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/projects?product=railcite", { waitUntil: "load" });
    await hydrated(page);
    const hero = (await page.locator(".pf-stage").boundingBox())!;
    const title = (await detailName(page).boundingBox())!;
    const primary = (await page.locator(".pf-m-primary").boundingBox())!;
    expect(hero.y + hero.height).toBeLessThanOrEqual(title.y + 1);
    expect(title.y + title.height).toBeLessThanOrEqual(primary.y + 1);
    expect(primary.width).toBeGreaterThan(250);
    expect(primary.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe("Portfolio at ≥ 640: the phone design stays out of the way (TASK-210)", () => {
  test.beforeEach(({ page }) => {
    test.skip(width(page) < 640, "tablet/desktop only");
  });

  test("the carousel and panel are shown; none of the phone blocks are", async ({ page }) => {
    await page.goto("/projects", { waitUntil: "load" });
    await expect(page.locator(".pf-carousel")).toBeVisible();
    await expect(page.locator(".pf-feature")).toBeVisible();
    for (const sel of [".pf-m-list", ".pf-m-actions", ".pf-m-outcomes", ".pf-m-detail-tags"]) {
      for (const el of await page.locator(sel).all()) await expect(el).toBeHidden();
    }
    await expect(page.locator(".scene-opener")).toBeVisible();
    // the first product is selected with its panel, exactly as before
    await expect(page.getByRole("tabpanel")).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
    // and a `?product=` deep link does not switch the desktop into the phone detail
    await page.goto(`/projects?product=${PERSONAL[2]!.slug}`, { waitUntil: "load" });
    await expect(page.getByRole("tabpanel")).toHaveAttribute("data-active-product", PERSONAL[2]!.slug);
    await expect(page.locator(".pf-carousel")).toBeVisible();
    await expect(page.locator(".pf-m-bar")).toBeHidden();
  });
});
