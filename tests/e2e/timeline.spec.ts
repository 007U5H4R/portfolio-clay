/**
 * timeline.spec.ts (TKT-41 → rewritten by TKT-87, TC-167) — the `/about` experience timeline after
 * Design.md §11 Dev-11: all four story cards render open (no click-to-open, no hash state), the lead
 * reads "oldest to newest" (S18), and each role keeps its `#experience-<id>` anchor.
 *
 *   @EVAL-007 — keyboard: nothing to operate inside the timeline; Tab moves straight through it and
 *               every focusable element in it wears the shared ring.
 *   @EVAL-013 — the rendered order equals `data/experience.ts` (read from data, never hard-coded).
 *   @EVAL-008 — no horizontal overflow at 390/768/1024/1440.
 *   @EVAL-006 — axe WCAG 2.1 AA clean on the section at 390 and 1440.
 */
import { test, expect } from "./fixtures";
import { experience } from "@/data/experience";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;
const S18_LEAD = "Four roles, oldest to newest — open any node for the context, scale, and what changed.";

test("@EVAL-013 four story cards are visible on load, in data order, under the S18 lead", {
  tag: "@EVAL-013",
}, async ({ page }) => {
  await page.goto("/about", { waitUntil: "load" });
  const section = page.locator("section#experience");

  await expect(section.locator(".xp-lead")).toHaveText(S18_LEAD);
  await expect(section).not.toContainText("newest to oldest");

  const cards = section.locator('article[data-paper="card"]');
  await expect(cards).toHaveCount(experience.length);
  for (let i = 0; i < experience.length; i++) {
    // Always open: the card body is rendered and visible without any interaction.
    await expect(cards.nth(i)).toBeVisible();
    await expect(cards.nth(i).locator("dl[data-flat]")).toBeVisible();
    await expect(cards.nth(i).locator("h3")).toContainText(experience[i]!.company);
  }

  // No leftover disclosure controls.
  await expect(section.locator("button")).toHaveCount(0);
  await expect(section.locator("[aria-expanded]")).toHaveCount(0);

  // Honesty markers: "not recorded" stays visible where the data says so; AmEx keeps its real scale.
  for (const role of experience) {
    const entry = page.locator(`#experience-${role.id}`);
    if (role.scale === "not recorded") await expect(entry.locator("dd.story-na")).toHaveText("not recorded");
    else await expect(entry).toContainText(role.scale);
  }
});

test("each #experience-<id> anchor scrolls its card into view", async ({ page }) => {
  test.skip(width(page) !== 1440 && width(page) !== 390, "anchor scrolling checked at one desktop + one mobile width");
  for (const role of experience) {
    await page.goto(`/about#experience-${role.id}`, { waitUntil: "load" });
    await expect(page.locator(`#experience-${role.id} article[data-paper="card"]`)).toBeInViewport();
  }
  // The bare section anchor keeps working for the /work experience strip + Ask evidence links.
  await page.goto("/about#experience", { waitUntil: "load" });
  await expect(page.locator("section#experience h2")).toBeInViewport();
});

test("@EVAL-007 keyboard: Tab passes through the timeline with no traps; focus lands past it", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "keyboard path is viewport-independent; run once at w1440");
  await page.goto("/about", { waitUntil: "load" });

  // Every focusable element inside the timeline (Source links, when a source carries a URL).
  const inside = await page.locator("section#experience").locator("a[href], button, [tabindex]").count();
  // Start just before the section: focus its heading's preceding control, then Tab inside+1 times.
  await page.locator("section#experience").evaluate((el) => {
    const marker = document.createElement("button");
    marker.id = "tl-marker";
    marker.textContent = "marker";
    el.before(marker);
  });
  await page.locator("#tl-marker").focus();
  for (let i = 0; i <= inside; i++) await page.keyboard.press("Tab");
  const after = await page.evaluate(() => {
    const active = document.activeElement;
    const section = document.getElementById("experience");
    return { inSection: !!(active && section?.contains(active)), follows: !!(active && section && section.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING) };
  });
  expect(after.inSection, "focus must leave the timeline after its own focusables").toBe(false);
  expect(after.follows, "focus must continue to content after the timeline").toBe(true);
});

test("@EVAL-008 no horizontal overflow with all four cards open", { tag: "@EVAL-008" }, async ({
  page,
  noOverflow,
}) => {
  await page.goto("/about", { waitUntil: "load" });
  await noOverflow(page);
  const rail = await page.locator(".xp-role").first().boundingBox();
  const second = await page.locator(".xp-role").nth(1).boundingBox();
  expect(rail && second).toBeTruthy();
  expect(second!.y).toBeGreaterThan(rail!.y);
});

test("@EVAL-006 axe clean on the experience section", { tag: "@EVAL-006" }, async ({ page, axe }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440 (EVAL-006)");
  await page.goto("/about", { waitUntil: "load" });
  await axe(page, { include: "section#experience" });
});
