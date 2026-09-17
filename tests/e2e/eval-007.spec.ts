/**
 * eval-007.spec.ts (technical-plan.md §B S09.02, `@EVAL-007`) — keyboard operability: every flow
 * completes with the keyboard alone, focus is always visible (3px accent ring), and focus returns
 * to the trigger after a dialog closes. Live now for the two navigation surfaces that exist — the
 * primary nav (desktop) and the MobileMenu (390). The Ask panel, FilterTabs, ExperienceTimeline,
 * OverviewToggle and CopyButton flows are fixme'd until their tickets (TKT-10/16/17/45).
 * ShowTheThinking's keyboard flow is real now, in thinking.spec.ts (TKT-21).
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

const focusInsidePanel = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const d = document.querySelector("dialog.ask-panel");
    return !!(d && document.activeElement && d.contains(document.activeElement));
  });

/**
 * Whether focus has escaped the modal to an interactive control on the inert page (header / main /
 * footer). A native modal <dialog> traps focus but wraps through `document.body` at the last→first
 * boundary — a benign, non-interactive stop — so the trap contract is "focus never reaches a page
 * control", not "focus is inside the dialog on literally every keystroke".
 */
const focusEscapedToPage = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body || a === document.documentElement) return false;
    return ["header", "#main", "footer"].some((sel) => document.querySelector(sel)?.contains(a));
  });

test("@EVAL-007 keyboard: AskPanel opens, traps focus, answers, Esc closes and restores focus (desktop)", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) < 1024, "the header Ask AI trigger is desktop-only (MobileMenu covers 390)");
  await page.goto("/", { waitUntil: "load" });

  const trigger = page.locator("header").getByRole("button", { name: "Ask AI" });
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");

  const panel = page.locator("dialog.ask-panel");
  await expect(panel).toBeVisible();
  expect(await focusInsidePanel(page), "focus must move into the panel on open").toBeTruthy();

  // Focus is trapped: 20 Tabs never reach a control on the inert page (native showModal + inert
  // background), and focus is repeatedly back inside the panel (proving the wrap, not an escape).
  let landedInside = false;
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Tab");
    expect(await focusEscapedToPage(page), `Tab ${i + 1} reached a page control`).toBeFalsy();
    if (await focusInsidePanel(page)) landedInside = true;
  }
  expect(landedInside, "focus must cycle back inside the panel").toBeTruthy();

  // Full keyboard answer path: type into the field, submit, land on the answer heading, Tab to evidence.
  await panel.locator("#ask-panel-input").focus();
  await page.keyboard.type("What products have you built?");
  await page.keyboard.press("Enter");
  const heading = panel.getByRole("heading", { level: 3, name: "Answer" });
  await expect(heading).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(panel.getByRole("list", { name: "Sources" }).getByRole("link").first()).toBeFocused();

  // Esc closes and returns focus to the trigger (EVAL-007 hard requirement).
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("@EVAL-007 keyboard: AskPanel Esc closes and restores focus to the MobileMenu trigger (390)", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 390, "the MobileMenu Ask row is the w390 trigger");
  await page.goto("/", { waitUntil: "load" });

  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.locator('dialog[aria-label="Site navigation"]');
  await expect(menu).toBeVisible();
  const askRow = menu.getByRole("button", { name: "Ask AI" });
  await askRow.click();

  const panel = page.locator("dialog.ask-panel");
  await expect(panel).toBeVisible();
  expect(await focusInsidePanel(page), "focus must move into the panel on open").toBeTruthy();

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  // The menu is still open behind the sheet, so focus returns to the exact Ask row that opened it.
  await expect(askRow).toBeFocused();
});

// FilterTabs roving tabindex, ExperienceTimeline, OverviewToggle, CopyButton — keyboard scripts
// land with their components. ShowTheThinking's real keyboard test now lives in thinking.spec.ts
// (TKT-21).
test.fixme("@EVAL-007 keyboard: FilterTabs / ExperienceTimeline / CopyButton (TKT-16/17/45)", {
  tag: "@EVAL-007",
}, async () => {});
