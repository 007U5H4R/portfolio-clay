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
import { VERTICAL_CAROUSEL_ENABLED } from "@/components/portfolio/vertical-carousel-flag";
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
  test.skip(VERTICAL_CAROUSEL_ENABLED && (page.viewportSize()?.width ?? 0) >= 1024, "TASK-301 experiment: from 1024 up the vertical-carousel layout replaces this one (vertical-carousel.spec.ts); with the flag off this runs");
  await page.goto(`/projects?product=${PERSONAL[3]!.slug}`, { waitUntil: "load" });
  await hydrated(page);
  await noOverflow(page);
  await minTargets(page);
});

// TASK-287 (Tushar 2026-10-20): "make the carousel a circular loop" — next on the last product lands on the first, prev on the
// first lands on the last, and the strip keeps moving the same way (clones beside the ends, silently re-centred).
test("TASK-287: the desktop carousel loops — next from the last is the first, prev from the first is the last", async ({ page, noOverflow }) => {
  test.skip(width(page) < 1024, "the centred, looping tray is the desktop tier (< 1024 px keeps the plain tray)");
  const last = PERSONAL.length;
  const pad = (n: number) => String(n).padStart(2, "0");
  await page.goto(`/projects?product=${PERSONAL.at(-1)!.slug}`, { waitUntil: "load" });
  await hydrated(page);
  const list = page.getByRole("tablist", { name: "Select a product" });
  const panel = page.getByRole("tabpanel");
  const track = page.locator(".pf-track");
  const centred = async (slug: string) => {
    // the selected real card settles in the middle of the tray (clone swap done), whichever copy it was reached on
    await expect
      .poll(async () =>
        track.evaluate((el, s) => {
          const tab = el.querySelector<HTMLElement>(`[data-product="${s}"]`)!;
          const t = tab.getBoundingClientRect();
          const r = el.getBoundingClientRect();
          return Math.abs(t.left + t.width / 2 - (r.left + r.width / 2));
        }, slug),
      )
      .toBeLessThan(3);
  };
  await expect(page.locator(".pf-count")).toHaveText(`${pad(last)} / ${pad(last)}`);
  await centred(PERSONAL.at(-1)!.slug);
  // clones: aria-hidden, unfocusable, no id / data-product duplicates, not in the accessible tab list
  await expect(track.locator("[data-clone]")).toHaveCount(PERSONAL.length * 2);
  expect(await track.locator("[data-clone][aria-hidden='true'][tabindex='-1']").count()).toBe(PERSONAL.length * 2);
  expect(await track.locator("[data-clone][id]").count()).toBe(0);
  await expect(list.getByRole("tab")).toHaveCount(PERSONAL.length);
  expect(await page.evaluate(() => new Set([...document.querySelectorAll("[id]")].map((e) => e.id)).size === document.querySelectorAll("[id]").length)).toBe(true);

  await page.getByRole("button", { name: "Next product" }).click();
  await expect(page.locator(".pf-count")).toHaveText(`01 / ${pad(last)}`);
  await expect(panel).toHaveAttribute("data-active-product", PERSONAL[0]!.slug);
  await expect(panel.getByRole("heading", { level: 2 })).toHaveText(PERSONAL[0]!.name);
  await centred(PERSONAL[0]!.slug);

  await page.getByRole("button", { name: "Previous product" }).click();
  await expect(page.locator(".pf-count")).toHaveText(`${pad(last)} / ${pad(last)}`);
  await expect(panel).toHaveAttribute("data-active-product", PERSONAL.at(-1)!.slug);
  await centred(PERSONAL.at(-1)!.slug);

  // the keyboard wraps the same way
  await list.getByRole("tab", { selected: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".pf-count")).toHaveText(`01 / ${pad(last)}`);
  await centred(PERSONAL[0]!.slug);
  await noOverflow(page);
});

test("TASK-287: no horizontal page overflow with the loop at the first and last product", async ({ page, noOverflow }) => {
  for (const p of [PERSONAL[0]!, PERSONAL.at(-1)!]) {
    await page.goto(`/projects?product=${p.slug}`, { waitUntil: "load" });
    await hydrated(page);
    await noOverflow(page);
  }
});
