/**
 * carousel.spec.ts — the Portfolio carousel + selected-project detail (TASK-197, Tushar's Carousel V2 spec).
 *
 *   ORDER     on a phone the explorer reads carousel → details → video → actions, and (390 × 844) the whole of it
 *             fits in the viewport under the sticky header, with every action present;
 *   KEYBOARD  the tablist is named, ←/→ move and select, Home/End jump, the arrow buttons are labelled buttons;
 *   ANNOUNCE  the selection is announced as "<name>, n of N" through a status region;
 *   DATA      the actions that show are exactly the ones the project data supports (live link, public repo, videos);
 *   OVERFLOW  no horizontal overflow and ≥ 44 px targets with a non-default project selected.
 */
import { test, expect } from "./fixtures";
import { projects } from "@/data/projects";
import { isListed } from "@/lib/portfolio";
import { portfolioEntries } from "@/data/portfolio";

// TASK-249 (Tushar 2026-10-18): the carousel / cards list the listed builds only.
const PERSONAL = projects.filter(isListed);
const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;
const hydrated = async (page: import("@playwright/test").Page) => {
  await page.waitForFunction(() => {
    const tab = document.querySelector('[role="tab"]');
    return !!tab && Object.keys(tab).some((k) => k.startsWith("__react"));
  });
};

test("TASK-217: below 900 px the window stacks poster → details → actions with the carousel beneath it; a phone has no carousel (TASK-210)", async ({ page }) => {
  test.skip(width(page) < 640 || width(page) > 899, "stacked tablet arrangement");
  await page.goto("/projects", { waitUntil: "load" });
  const box = async (sel: string) => (await page.locator(sel).first().boundingBox())!;
  const stage = await box(".pf-stage");
  const head = await box(".pf-info-head");
  const actions = await box(".pf-action-set .pf-action");
  const carousel = await box(".pf-carousel");
  expect(head.y).toBeGreaterThan(stage.y + stage.height - 1);
  expect(actions.y).toBeGreaterThan(head.y + head.height - 1);
  expect(carousel.y).toBeGreaterThan(actions.y + actions.height - 1);
});

test("carousel is keyboard-operable and announces its position", async ({ page }) => {
  test.skip(width(page) !== 1440, "interaction checked at the desktop width (a phone has no carousel, TASK-210)");
  await page.goto("/projects", { waitUntil: "load" });
  await hydrated(page);
  const list = page.getByRole("tablist", { name: "Select a product" });
  await expect(list).toBeVisible();
  const status = page.getByTestId("pf-announce");
  await expect(status).toHaveText(`${PERSONAL[0]!.name}, 1 of ${PERSONAL.length}`);
  await expect(status).toHaveAttribute("role", "status");
  const first = list.getByRole("tab").first();
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(status).toHaveText(`${PERSONAL[1]!.name}, 2 of ${PERSONAL.length}`);
  await expect(page.locator(".pf-count")).toHaveText(`02 / ${String(PERSONAL.length).padStart(2, "0")}`);  // TASK-274: two digits at desktop
  await expect(list.getByRole("tab").nth(1)).toBeFocused();
  await page.keyboard.press("End");
  await expect(status).toHaveText(`${PERSONAL.at(-1)!.name}, ${PERSONAL.length} of ${PERSONAL.length}`);
  await page.keyboard.press("Home");
  await expect(status).toHaveText(`${PERSONAL[0]!.name}, 1 of ${PERSONAL.length}`);
  // the arrows are real, named buttons
  const next = page.getByRole("button", { name: "Next product" });
  await next.click();
  await expect(status).toHaveText(`${PERSONAL[1]!.name}, 2 of ${PERSONAL.length}`);
  await expect(page.getByRole("button", { name: "Previous product" })).toBeVisible();
});

test("the actions shown follow the project data for every product", async ({ page }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "data-driven actions checked at the two boundary widths");
  for (const project of PERSONAL) {
    const entry = portfolioEntries.find((e) => e.slug === project.slug)!;
    await page.goto(`/projects?product=${project.slug}`, { waitUntil: "load" });
    await hydrated(page);
    const set = page.locator(".pf-action-set");
    await expect(set.locator('[data-action="pitch"]'), `${project.slug} pitch`).toHaveCount(entry.pitchVideo ? 1 : 0);
    await expect(set.locator('[data-action="demo"]'), `${project.slug} demo`).toHaveCount(entry.demoVideo ? 1 : 0);
    await expect(set.locator('[data-action="product"]'), `${project.slug} product`).toHaveCount(project.links.live ? 1 : 0);
    await expect(set.locator('[data-action="github"]'), `${project.slug} github`).toHaveCount(project.links.repoPublic && project.links.github ? 1 : 0);
    await expect(set.locator('[data-action="case"]')).toHaveAttribute("href", `/work/${project.slug}`);
    if (project.links.live) await expect(set.locator('[data-action="product"]')).toHaveAttribute("href", project.links.live);
  }
});

test("no overflow and ≥ 44 px targets with a non-default product selected", async ({ page, noOverflow, minTargets }) => {
  await page.goto(`/projects?product=${PERSONAL[3]!.slug}`, { waitUntil: "load" });
  await hydrated(page);
  await noOverflow(page);
  await minTargets(page);
});
