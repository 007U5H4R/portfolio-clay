/**
 * media-player.spec.ts (TASK-122, video-embed spec §1, §9, §11, §15, §17, §20) — `ProductMediaPlayer`
 * in a real browser, under the site's real CSP, via the QA-only `/dev/media-player` board and its
 * TEST-ONLY YouTube id (`app/dev/media-player/fixtures.ts`; never product data).
 *
 * The board only renders under an `ALLOW_DEV_ROUTES=1` build, so every test SKIPs (never fails) on a
 * plain build. Run: `ALLOW_DEV_ROUTES=1 pnpm build && ALLOW_DEV_ROUTES=1 pnpm test:e2e media-player`.
 *
 * The "live" tests load the real privacy-enhanced embed over the network (YouTube must be reachable);
 * the blocked-embed test aborts the embed request with `page.route`.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { FIXTURE_PITCH, FIXTURE_YOUTUBE_ID } from "@/app/dev/media-player/fixtures";

const PATH = "/dev/media-player";
const PLAY = `Play ${FIXTURE_PITCH.title}`;
const width = (page: Page) => page.viewportSize()?.width ?? 0;
const player = (page: Page) => page.locator("#fixture-player");

async function gotoBoard(page: Page): Promise<Record<string, string>> {
  const resp = await page.goto(PATH, { waitUntil: "load" });
  const missing = (resp?.status() ?? 404) === 404;
  test.skip(missing, `${PATH} 404s without ALLOW_DEV_ROUTES=1 — run the QA job to exercise it`);
  // Hydrated: the Play button's click handler is attached.
  await page.waitForFunction(() => {
    const btn = document.querySelector("#fixture-player button");
    return !!btn && Object.keys(btn).some((k) => k.startsWith("__reactProps"));
  });
  return resp!.headers();
}

/** Every CSP report the page raises (`securitypolicyviolation`) plus any console CSP message. */
async function collectCspViolations(page: Page): Promise<string[]> {
  const found: string[] = [];
  page.on("console", (msg) => {
    if (/Content Security Policy/i.test(msg.text())) found.push(msg.text());
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => {
      console.error(`Content Security Policy violation: ${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  return found;
}

test.describe("ProductMediaPlayer (TASK-122)", () => {
  test.beforeEach(() => {
    test.skip(!["w390", "w1440"].includes(test.info().project.name), "verified at w390 (touch) and w1440");
  });

  test("poster first, no iframe; Play mounts ONE privacy-enhanced iframe that comes up under the CSP", async ({ page, consoleErrors }) => {
    void consoleErrors;
    const violations = await collectCspViolations(page);
    const embedRequests: string[] = [];
    page.on("request", (req) => {
      if (/youtube(-nocookie)?\.com\/embed\//.test(req.url())) embedRequests.push(req.url());
    });
    const headers = await gotoBoard(page);

    // The served CSP admits exactly the privacy-enhanced host for frames.
    const frameSrc = headers["content-security-policy"]?.split(";").map((d) => d.trim()).find((d) => d.startsWith("frame-src"));
    expect(frameSrc).toBe("frame-src https://www.youtube-nocookie.com");

    await expect(player(page)).toHaveAttribute("data-player-state", "poster");
    await expect(page.locator("iframe")).toHaveCount(0);
    expect(embedRequests).toEqual([]); // nothing loads before the press (§11)

    await page.getByRole("button", { name: PLAY }).click();
    const frame = page.locator("iframe");
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute("title", FIXTURE_PITCH.title);
    const src = new URL((await frame.getAttribute("src"))!);
    expect(src.origin).toBe("https://www.youtube-nocookie.com");
    expect(src.pathname).toBe(`/embed/${FIXTURE_YOUTUBE_ID}`);

    // The real player answers the handshake → ready (proves the embed loads under the CSP).
    await expect(player(page)).toHaveAttribute("data-player-state", "ready", { timeout: 20_000 });
    await expect(page.locator("iframe")).toHaveCount(1);
    expect(embedRequests.length).toBeGreaterThan(0);
    expect(embedRequests.every((u) => u.startsWith("https://www.youtube-nocookie.com/embed/"))).toBe(true);
    expect(violations).toEqual([]);
  });

  test("keyboard: Play takes focus, Enter mounts the player and focus moves into it", async ({ page }) => {
    await gotoBoard(page);
    const play = page.getByRole("button", { name: PLAY });
    await play.focus();
    await expect(play).toBeFocused();
    await page.keyboard.press("Enter");
    const frame = page.locator("iframe");
    await expect(frame).toHaveCount(1);
    await expect(frame).toBeFocused();
  });

  test("blocked embed → poster back, 'Video unavailable here.' + Watch on YouTube, no iframe (§17)", async ({ page }) => {
    await page.route("https://www.youtube-nocookie.com/embed/**", (route) => route.abort("blockedbyclient"));
    await gotoBoard(page);
    await page.getByRole("button", { name: PLAY }).click();
    const alert = player(page).getByRole("alert");
    const pressed = Date.now();
    await expect(alert).toContainText("Video unavailable here.", { timeout: 25_000 });
    await expect(player(page)).toHaveAttribute("data-player-state", "error");
    test.info().annotations.push({ type: "fallback-ms", description: String(Date.now() - pressed) });
    await expect(page.locator("iframe")).toHaveCount(0);
    const link = alert.getByRole("link", { name: /^Watch on YouTube/ });
    await expect(link).toHaveAttribute("href", `https://www.youtube.com/watch?v=${FIXTURE_YOUTUBE_ID}`);
    await expect(link).toHaveAttribute("target", "_blank");
    // The fallback sits inside the 16:9 box — never a large blank region.
    const box = (await player(page).boundingBox())!;
    const alertBox = (await alert.boundingBox())!;
    expect(alertBox.y).toBeGreaterThanOrEqual(box.y);
    expect(alertBox.y + alertBox.height).toBeLessThanOrEqual(box.y + box.height + 1);
  });

  test("mobile width: the 16:9 player fits the viewport, the Play target is ≥44px, no page overflow", async ({ page, noOverflow, axe }) => {
    await gotoBoard(page);
    const box = (await player(page).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width(page));
    expect(Math.abs(box.width / box.height - 16 / 9)).toBeLessThan(0.02);
    const play = (await page.getByRole("button", { name: PLAY }).boundingBox())!;
    expect(play.width).toBeGreaterThanOrEqual(44);
    expect(play.height).toBeGreaterThanOrEqual(44);
    await noOverflow(page);
    await axe(page, { include: "#fixture-player" });
    await page.getByRole("button", { name: PLAY }).click();
    const frameBox = (await page.locator("iframe").boundingBox())!;
    expect(Math.round(frameBox.width)).toBe(Math.round(box.width));
    await noOverflow(page);
  });
});
