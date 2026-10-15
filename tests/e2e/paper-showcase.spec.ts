/**
 * paper-showcase.spec.ts — the /projects paper-craft showcase (TASK-217): window above its tray, selection kept in sync across
 * poster, info panel and actions however the project is chosen, the play control only when a video exists, and the active
 * card raised. Tablet and desktop only: a phone (< 640 px) renders TASK-210's list / detail instead of this component.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { projects } from "@/data/projects";
import { portfolioEntries } from "@/data/portfolio";

const PERSONAL = projects.filter((p) => p.category === "personal");
const entryOf = (slug: string) => portfolioEntries.find((e) => e.slug === slug)!;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const pad2 = (n: number) => String(n).padStart(2, "0");
const panel = (page: Page) => page.getByRole("tabpanel");
const tabs = (page: Page) => page.getByRole("tablist", { name: "Select a product" }).getByRole("tab");

async function open(page: Page, slug?: string) {
  await page.goto(slug ? `/projects?product=${slug}` : "/projects", { waitUntil: "load" });
  await page.waitForFunction(() => {
    const tab = document.querySelector('[role="tab"]');
    return !!tab && Object.keys(tab).some((k) => k.startsWith("__react"));
  });
}

/** What the info panel and poster must show for a project, straight from the data. */
async function expectSynced(page: Page, index: number) {
  const project = PERSONAL[index]!;
  const entry = entryOf(project.slug);
  await expect(panel(page)).toHaveAttribute("data-active-product", project.slug);
  await expect(panel(page).getByRole("heading", { level: 2 })).toHaveText(project.name);
  await expect(panel(page).locator(".pf-info-count")).toHaveText(`${pad2(index + 1)} / ${pad2(PERSONAL.length)}`);
  await expect(panel(page).locator(".pf-info-category")).toHaveText(project.tags.slice(0, 2).join(" · "));
  await expect(page.locator(".pf-stage .pf-cover-name")).toHaveText(project.name);
  await expect(tabs(page).nth(index)).toHaveAttribute("aria-selected", "true");
  await expect(panel(page).locator('[data-action="pitch"]')).toHaveCount(entry.pitchVideo ? 1 : 0);
  await expect(panel(page).locator('[data-action="demo"]')).toHaveCount(entry.demoVideo ? 1 : 0);
  await expect(panel(page).locator('.pf-action-set [data-action="case"]')).toHaveAttribute("href", `/work/${project.slug}`);
}

test.beforeEach(({ page }) => {
  test.skip(width(page) < 640, "a phone renders the TASK-210 list / detail, not the showcase");
});

test("the window sits above a tray of the same width, the poster left of the info panel", async ({ page }) => {
  await open(page);
  const box = async (sel: string) => (await page.locator(sel).first().boundingBox())!;
  const feature = await box(".pf-feature");
  const tray = await box(".pf-carousel");
  const stage = await box(".pf-stage");
  const info = await box(".pf-info");
  expect(tray.y, "tray beneath the window").toBeGreaterThanOrEqual(feature.y + feature.height);
  expect(tray.y - (feature.y + feature.height), "small, consistent gap").toBeLessThan(48);
  expect(Math.abs(tray.x - feature.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(tray.width - feature.width)).toBeLessThanOrEqual(1);
  if (width(page) >= 900) {
    expect(info.x, "info beside the poster").toBeGreaterThanOrEqual(stage.x + stage.width);
    expect(stage.width / (stage.width + info.width), "poster is the larger part").toBeGreaterThan(0.5);
  } else {
    expect(info.y, "stacked: info under the poster").toBeGreaterThanOrEqual(stage.y + stage.height);
  }
});

test("a card click, the arrows and the keyboard all keep poster, title, count, category and actions in sync", async ({ page }) => {
  await open(page);
  await expectSynced(page, 0);

  await tabs(page).nth(2).click();
  await expectSynced(page, 2);

  await page.getByRole("button", { name: "Next product" }).click();
  await expectSynced(page, 3);
  await page.getByRole("button", { name: "Previous product" }).click();
  await expectSynced(page, 2);

  await tabs(page).nth(2).focus();
  await page.keyboard.press("ArrowRight");
  await expectSynced(page, 3);
  await page.keyboard.press("End");
  await expectSynced(page, PERSONAL.length - 1);
  await page.keyboard.press("Home");
  await expectSynced(page, 0);
});

test("the play control exists only for a project with a pitch video", async ({ page }) => {
  for (const [index, project] of PERSONAL.entries()) {
    await open(page, project.slug);
    await expectSynced(page, index);
    const plays = page.locator(".pf-stage-screen .pf-play");
    await expect(plays, `${project.slug} play control`).toHaveCount(entryOf(project.slug).pitchVideo ? 1 : 0);
    if (!entryOf(project.slug).pitchVideo) await expect(page.locator(".pf-stage-tag")).toBeVisible();
  }
});

test("exactly one action is primary, the primary is a real video when there is one, and no destination repeats", async ({ page }) => {
  for (const project of PERSONAL) {
    await open(page, project.slug);
    const entry = entryOf(project.slug);
    const primary = panel(page).locator('[data-tier="primary"]');
    await expect(primary, `${project.slug} primary`).toHaveCount(1);
    const expected = entry.pitchVideo ? "pitch" : entry.demoVideo ? "demo" : "case";
    await expect(panel(page).locator(`.pf-action[data-action="${expected}"]`)).toBeVisible();
    const hrefs = await panel(page).locator("a.pf-action").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(new Set(hrefs).size, `${project.slug} destinations`).toBe(hrefs.length);
  }
});

test("the active card is raised above its neighbours and ringed", async ({ page }) => {
  await open(page);
  const cards = tabs(page);
  const active = (await cards.nth(0).boundingBox())!;
  const other = (await cards.nth(1).boundingBox())!;
  expect(other.y - active.y, "selected card sits higher").toBeGreaterThanOrEqual(4);
  await cards.nth(1).click();
  await expect(cards.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.waitForTimeout(450); // let the 320 ms lift settle
  const now = (await cards.nth(1).boundingBox())!;
  const rest = (await cards.nth(0).boundingBox())!;
  expect(rest.y - now.y).toBeGreaterThanOrEqual(4);
  // the ring is the card's own border colour, not colour alone (the lift above is the shape cue)
  const ring = await cards.nth(1).evaluate((el) => getComputedStyle(el).borderTopColor);
  const idle = await cards.nth(0).evaluate((el) => getComputedStyle(el).borderTopColor);
  expect(ring).not.toBe(idle);
});

test("no horizontal overflow and the tray scrolls instead of squeezing the cards", async ({ page, noOverflow }) => {
  await open(page, PERSONAL[6]!.slug);
  await noOverflow(page);
  const track = page.locator(".pf-track");
  expect(await track.evaluate((el) => el.scrollWidth > el.clientWidth), "more cards than fit scroll sideways").toBe(true);
  const first = (await tabs(page).nth(0).boundingBox())!;
  expect(first.width, "cards keep a readable width").toBeGreaterThanOrEqual(120);
});
