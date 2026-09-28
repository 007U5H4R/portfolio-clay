/**
 * portfolio-video.spec.ts (TASK-122, video-embed spec §5, §6, §11–§15, §20) — the video player wired
 * into the REAL Portfolio showcase (TASK-121 visuals), via `/dev/portfolio-video`: the real product
 * data with TEST-ONLY YouTube ids overlaid on product 1 (pitch + demo) and product 2 (pitch only).
 * `data/portfolio.ts` carries no ids, so `/projects` itself only shows "coming" tags (projects.spec).
 *
 * Only renders under `ALLOW_DEV_ROUTES=1`; every test SKIPs (never fails) on a plain build. Run:
 * `ALLOW_DEV_ROUTES=1 pnpm build && ALLOW_DEV_ROUTES=1 pnpm test:e2e portfolio-video`.
 * Loads the real privacy-enhanced embed over the network (YouTube must be reachable).
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { FIXTURE_YOUTUBE_ID, FIXTURE_YOUTUBE_ID_2 } from "@/app/dev/media-player/fixtures";

const PATH = "/dev/portfolio-video";
const panel = (page: Page) => page.getByRole("tabpanel");
const stage = (page: Page) => page.locator("#pf-stage-screen");
const frames = (page: Page) => page.locator("iframe");
const actions = (page: Page) => panel(page).locator(".pf-actions");

async function gotoBoard(page: Page): Promise<void> {
  const resp = await page.goto(PATH, { waitUntil: "load" });
  const missing = (resp?.status() ?? 404) === 404;
  test.skip(missing, `${PATH} 404s without ALLOW_DEV_ROUTES=1 — run the QA job to exercise it`);
  await page.waitForFunction(() => {
    const tab = document.querySelector('[role="tab"]');
    return !!tab && Object.keys(tab).some((k) => k.startsWith("__reactProps"));
  });
}

function cspWatch(page: Page): string[] {
  const found: string[] = [];
  page.on("console", (msg) => {
    if (/Content Security Policy/i.test(msg.text())) found.push(msg.text());
  });
  return found;
}

const embedId = async (page: Page) => new URL((await frames(page).getAttribute("src"))!).pathname.replace("/embed/", "");

test.describe("Portfolio showcase video (TASK-122)", () => {
  test.beforeEach(() => {
    test.skip(!["w390", "w1440"].includes(test.info().project.name), "verified at w390 (touch) and w1440");
  });

  test("pitch poster first; Pitch → Demo unmounts and remounts in the SAME left frame; one iframe at a time", async ({ page, noOverflow }) => {
    const violations = cspWatch(page);
    await gotoBoard(page);
    await expect(panel(page)).toHaveAttribute("data-media-mode", "pitch");
    await expect(frames(page)).toHaveCount(0);
    const pitchBtn = actions(page).getByRole("button", { name: "Pitch video" });
    const demoBtn = actions(page).getByRole("button", { name: "Demo video" });
    await expect(pitchBtn).toHaveAttribute("aria-pressed", "true");
    await expect(demoBtn).toHaveAttribute("aria-pressed", "false");

    await stage(page).getByRole("button", { name: /^Play .+ pitch video$/ }).click();
    await expect(frames(page)).toHaveCount(1);
    expect(await embedId(page)).toBe(FIXTURE_YOUTUBE_ID);
    expect(new URL((await frames(page).getAttribute("src"))!).origin).toBe("https://www.youtube-nocookie.com");
    await expect(stage(page)).toHaveAttribute("data-player-state", "ready", { timeout: 20_000 });
    // The iframe lives inside the left stage — no new tab, no second frame (§6).
    await expect(stage(page).locator("iframe")).toHaveCount(1);
    expect(page.context().pages()).toHaveLength(1);
    await noOverflow(page);

    await demoBtn.click();
    await expect(panel(page)).toHaveAttribute("data-media-mode", "demo");
    await expect(demoBtn).toHaveAttribute("aria-pressed", "true");
    await expect(pitchBtn).toHaveAttribute("aria-pressed", "false");
    await expect(frames(page)).toHaveCount(0); // the pitch player is gone — stopped (§5)
    await stage(page).getByRole("button", { name: /^Play .+ product demonstration$/ }).click();
    await expect(frames(page)).toHaveCount(1);
    expect(await embedId(page)).toBe(FIXTURE_YOUTUBE_ID_2);
    await expect(stage(page)).toHaveAttribute("data-player-state", "ready", { timeout: 20_000 });

    await pitchBtn.click();
    await expect(frames(page)).toHaveCount(0);
    await expect(stage(page).getByRole("button", { name: /^Play .+ pitch video$/ })).toBeVisible();
    expect(violations).toEqual([]);
  });

  test("changing product unmounts the player and resets to the new product's pitch poster (§13)", async ({ page }) => {
    await gotoBoard(page);
    await actions(page).getByRole("button", { name: "Demo video" }).click();
    await stage(page).getByRole("button", { name: /^Play / }).click();
    await expect(frames(page)).toHaveCount(1);

    const second = page.getByRole("tab").nth(1);
    await second.click();
    await expect(second).toHaveAttribute("aria-selected", "true");
    await expect(panel(page)).toHaveAttribute("data-media-mode", "pitch");
    await expect(frames(page)).toHaveCount(0);
    await expect(stage(page).getByRole("button", { name: /^Play .+ pitch video$/ })).toBeVisible();
    // Product 2 has no demo: no Demo action at all (never a dead control).
    await expect(actions(page).getByRole("button", { name: "Demo video" })).toHaveCount(0);

    // Product 3 has no video: the "coming" tag, no Play button, no Pitch action.
    await page.getByRole("tab").nth(2).click();
    await expect(stage(page).getByText("Pitch video coming")).toBeVisible();
    await expect(stage(page).getByRole("button", { name: /^Play / })).toHaveCount(0);
    await expect(actions(page).getByRole("button", { name: "Pitch video" })).toHaveCount(0);
  });

  test("keyboard: the Demo strip and the Play button work from the keyboard; focus lands in the player", async ({ page }) => {
    await gotoBoard(page);
    const demoBtn = actions(page).getByRole("button", { name: "Demo video" });
    await demoBtn.focus();
    await page.keyboard.press("Enter");
    await expect(demoBtn).toHaveAttribute("aria-pressed", "true");
    const play = stage(page).getByRole("button", { name: /^Play .+ product demonstration$/ });
    await play.focus();
    await page.keyboard.press("Space");
    await expect(frames(page)).toHaveCount(1);
    await expect(frames(page)).toBeFocused();
    await actions(page).getByRole("button", { name: "Pitch video" }).focus();
    await page.keyboard.press("Enter");
    await expect(frames(page)).toHaveCount(0);
  });

  test("poster state passes axe on the showcase", async ({ page, axe }) => {
    await gotoBoard(page);
    await axe(page, { include: ".pf-showcase" });
  });
});
