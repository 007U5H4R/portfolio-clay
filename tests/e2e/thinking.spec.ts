/**
 * thinking.spec.ts (TKT-21) — the ShowTheThinking interaction and its `/dev/thinking` QA board.
 *
 * Like artifacts.spec.ts, the `@thinking` block is the QA-only board gate (routes.json `dev`,
 * ALLOW_DEV_ROUTES build only — a plain run SKIPs on the 404, never fails). The `@EVAL-007` and
 * `@EVAL-010` tests exercise `ShowTheThinking` itself and replace the fixmes those specs carried
 * for this component (eval-007.spec.ts / eval-010.spec.ts).
 *
 * Run with: `ALLOW_DEV_ROUTES=1 pnpm build && ALLOW_DEV_ROUTES=1 pnpm start` then
 * `pnpm test:e2e --grep thinking` (the QA job). A plain run skips the board-dependent tests.
 */
import { test, expect } from "./fixtures";

const PATH = "/dev/thinking";
const width = (page: import("@playwright/test").Page) => page.viewportSize()?.width ?? 0;

async function gotoDev(page: import("@playwright/test").Page): Promise<void> {
  const resp = await page.goto(PATH, { waitUntil: "load" });
  test.skip(
    (resp?.status() ?? 404) === 404,
    "/dev/thinking 404s without ALLOW_DEV_ROUTES=1 — run the QA job to exercise it",
  );
}

const board = (page: import("@playwright/test").Page) =>
  page.locator('section[aria-labelledby="board-thinking"]');

const toggle = (page: import("@playwright/test").Page) => board(page).getByRole("button");

const panel = (page: import("@playwright/test").Page) => board(page).locator("#show-the-thinking-panel");

test("thinking board · no-overflow + min-targets + screenshots", { tag: "@thinking" }, async ({
  page,
  noOverflow,
  minTargets,
}) => {
  await gotoDev(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Show the thinking");

  await noOverflow(page);
  await minTargets(page);

  const w = width(page);
  if (w === 390 || w === 1440) {
    await page.screenshot({
      path: `docs/screenshots/thinking/${w}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
});

test("thinking board · axe wcag2.1 AA", { tag: "@thinking" }, async ({ page, axe }) => {
  test.skip(width(page) !== 390 && width(page) !== 1440, "axe runs at 390 and 1440");
  await gotoDev(page);
  await axe(page);
});

// ---------------------------------------------------------------------------
// AC 1 — a thin project's empty chain hides the interaction entirely (no empty toggle).
// ---------------------------------------------------------------------------
test("thinking: empty chain renders no toggle and no list", { tag: "@thinking" }, async ({ page }) => {
  test.skip(width(page) !== 1440, "structural check run once at w1440");
  await gotoDev(page);
  const mount = page.locator('[data-testid="thin-chain-mount"]');
  await expect(mount.locator("button")).toHaveCount(0);
  await expect(mount.locator("ol")).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// TC-084 step 2 — never auto-plays: scrolling the toggle into view and waiting does not open it.
// ---------------------------------------------------------------------------
test("thinking: never auto-plays — scrolling into view and waiting does not open the panel", {
  tag: "@thinking",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "no-auto-play check run once at w1440");
  await gotoDev(page);
  const trigger = toggle(page);
  await trigger.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

// ---------------------------------------------------------------------------
// AC 1/2 — 8 nodes render from the chain; they exist in the DOM before open (Reveal pattern) but
// are removed from the a11y tree/tab order (`visibility:hidden`) until the toggle opens the panel.
// ---------------------------------------------------------------------------
test("thinking: toggle has aria-expanded/aria-controls, 8 nodes exist in the DOM before open, and open reveals them", {
  tag: "@thinking",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "reveal behaviour checked once at w1440");
  await gotoDev(page);

  const trigger = toggle(page);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toHaveAttribute("aria-controls", "show-the-thinking-panel");
  // The VisuallyHidden summary is part of the accessible name, announced before opening.
  await expect(trigger).toHaveAccessibleName(/8-step reasoning chain, expand to read/i);

  const nodes = panel(page).locator("li");
  await expect(nodes).toHaveCount(8);
  await expect(nodes.first()).toBeHidden(); // present in the DOM, not yet visible

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(nodes.first()).toBeVisible();
  await expect(nodes.last()).toBeVisible();

  // Only the 4 nodes with a real chapter anchor render a link; the other 4 (no href) don't.
  const links = panel(page).getByRole("link");
  await expect(links).toHaveCount(4);
  const href = await links.first().getAttribute("href");
  expect(href, "a node source link must carry an href").toBeTruthy();
  const res = await page.request.get(href!);
  expect(res.status(), `${href} must resolve 200`).toBe(200);
});

// ---------------------------------------------------------------------------
// @EVAL-007 — keyboard: Tab to the toggle, Enter opens, focus stays on the toggle (not moved into
// the panel — this is a disclosure, not a modal), then Tab reaches the nodes' source links in order.
// ---------------------------------------------------------------------------
test("@EVAL-007 thinking keyboard: Enter opens the toggle, focus stays on it, Tab reaches source links in order", {
  tag: "@EVAL-007",
}, async ({ page }) => {
  test.skip(width(page) !== 1440, "keyboard script run once at w1440");
  await gotoDev(page);

  const trigger = toggle(page);
  await trigger.focus();
  await expect(trigger).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger).toBeFocused(); // AC 4: focus remains on the toggle after open

  const links = panel(page).getByRole("link");
  await page.keyboard.press("Tab");
  await expect(links.nth(0)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(links.nth(1)).toBeFocused();
});

// ---------------------------------------------------------------------------
// @EVAL-010 — reduced motion: opening collapses every node's transition to opacity-only with no
// stagger delay, and the connector's clip-path wipe is removed entirely (no transform/clip-path
// animation observed).
// ---------------------------------------------------------------------------
test("@EVAL-010 thinking reduced motion: nodes fade opacity-only with no stagger, connector unanimated", {
  tag: "@EVAL-010",
}, async ({ page, withReducedMotion }) => {
  test.skip(width(page) !== 1440, "reduced-motion check runs at w1440");
  await withReducedMotion(page);
  await gotoDev(page);

  const trigger = toggle(page);
  await trigger.click();

  const nodeStyle = await panel(page)
    .locator("li")
    .nth(1) // a non-zero stagger index, so a real delay would be observable if not zeroed
    .evaluate((el) => {
      const s = getComputedStyle(el);
      return { property: s.transitionProperty, delay: s.transitionDelay };
    });
  expect(nodeStyle.property, "node transition must collapse to opacity only").toBe("opacity");
  expect(nodeStyle.delay, "node transition-delay must be zeroed under reduced motion").toMatch(/^0s?$/);

  const connectorTransition = await panel(page)
    .locator("li")
    .nth(1)
    .evaluate((el) => getComputedStyle(el, "::before").transitionProperty);
  expect(connectorTransition, "connector must have no animated property under reduced motion").toBe(
    "none",
  );
});
