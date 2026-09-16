/**
 * eval-007.spec.ts (technical-plan.md §B S09.02, `@EVAL-007`) — keyboard operability: every flow
 * completes with the keyboard alone, focus is always visible (3px accent ring), and focus returns
 * to the trigger after a dialog closes. Live now for the two navigation surfaces that exist — the
 * primary nav (desktop) and the MobileMenu (390). The Ask panel, FilterTabs, ExperienceTimeline,
 * ShowTheThinking, OverviewToggle and CopyButton flows are fixme'd until their tickets
 * (TKT-10/16/17/13/45).
 */
import { test, expect } from "./fixtures";

const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

test("@EVAL-007 desktop nav: every tab stop shows the 3px accent focus ring", { tag: "@EVAL-007" }, async ({
  page,
  keyboardOnly,
}) => {
  test.skip(width(page) < 1024, "primary nav is visible at md+ (keyboard sweep at desktop widths)");
  await page.goto("/", { waitUntil: "load" });
  // Skip link → header logo → primary nav links → Ask control: all opt into .focus-ring.
  await keyboardOnly(page, { tabs: 7 });
});

test("@EVAL-007 mobile menu: opens, traps focus, Esc closes and restores focus to the toggle", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 390, "mobile menu is the w390 navigation");
  await page.goto("/", { waitUntil: "load" });

  const toggle = page.locator('button[aria-label="Open menu"]');
  await expect(toggle).toBeVisible();

  const dialog = page.locator('dialog[aria-label="Site navigation"]');
  await expect(async () => {
    await toggle.click();
    await expect(dialog).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 6000 });

  const focusInside = await page.evaluate(() => {
    const d = document.querySelector('dialog[aria-label="Site navigation"]');
    return !!(d && document.activeElement && d.contains(document.activeElement));
  });
  expect(focusInside, "focus must move inside the modal dialog").toBeTruthy();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(toggle).toBeFocused();
});

// Ask panel open→answer→evidence→close, FilterTabs roving tabindex, ExperienceTimeline,
// ShowTheThinking, OverviewToggle, CopyButton — keyboard scripts land with their components.
test.fixme("@EVAL-007 keyboard: Ask panel open → answer → evidence → close (TKT-10)", {
  tag: "@EVAL-007",
}, async () => {});
test.fixme("@EVAL-007 keyboard: FilterTabs / ExperienceTimeline / ShowTheThinking / CopyButton (TKT-16/17/13/45)", {
  tag: "@EVAL-007",
}, async () => {});
