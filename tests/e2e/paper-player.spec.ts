/**
 * paper-player.spec.ts — TASK-304: with PAPER_PLAYER_ENABLED the desktop (>= 1024 px) vertical-carousel stage is the origami paper player:
 * a terracotta frame ring, a notched section tab, a title panel and a folded play triangle over the product's EXISTING poster (the cover
 * art, unchanged). The phone/tablet player is untouched. Runs once (w1440 project); sizes are set inside the tests.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { PAPER_PLAYER_ENABLED } from "@/components/portfolio/paper-player-flag";
import { VERTICAL_CAROUSEL_ENABLED } from "@/components/portfolio/vertical-carousel-flag";
import { portfolioEntries } from "@/data/portfolio";
import { projects } from "@/data/projects";
import { resolveVideoMedia } from "@/lib/portfolio";

// the cover art's served file is public/media/illustrations/covers/<coverArt id>.webp (the same file the carousel + stage use)
const PRODUCTS = portfolioEntries.map((entry) => {
  const project = projects.find((p) => p.slug === entry.slug)!;
  return {
    id: entry.slug,
    art: { src: `/media/illustrations/covers/${entry.coverArt}.webp` },
    pitchVideo: entry.pitchVideo ? resolveVideoMedia(entry.pitchVideo, project.name, "pitch") : undefined,
  };
});
const SLUGS = ["teachspark", "campfire-board", "urja"] as const;
const SIZES = [[1280, 800], [1440, 900], [1920, 1080]] as const;

test.beforeEach(() => {
  test.skip(test.info().project.name !== "w1440", "sizes are set inside the tests; run once");
});

async function open(page: Page, vw: number, vh: number, slug: string, theme?: "light" | "dark") {
  await page.setViewportSize({ width: vw, height: vh });
  await page.goto(`/projects?product=${slug}`, { waitUntil: "load" });
  await page.waitForFunction(() => {
    const tab = document.querySelector('[role="tab"]');
    return !!tab && Object.keys(tab).some((k) => k.startsWith("__react"));
  });
  if (theme) await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
}

test.describe("paper player (desktop)", () => {
  test.skip(!PAPER_PLAYER_ENABLED || !VERTICAL_CAROUSEL_ENABLED, "TASK-304 flag is off");

  for (const [vw, vh] of SIZES) {
    for (const theme of ["light", "dark"] as const) {
      for (const slug of SLUGS) {
        test(`${slug} @${vw} ${theme}: frame, tab, existing poster, play control`, async ({ page }) => {
          const product = PRODUCTS.find((p) => p.id === slug)!;
          const video = product.pitchVideo!;
          await open(page, vw, vh, slug, theme);

          const stage = page.locator(".pf-stage.pf-paper");
          await expect(stage).toHaveCount(1);
          await expect(stage.locator('[data-paper-player]')).toHaveCount(1);
          await expect(stage.locator(".pf-stage-label")).toBeVisible();
          await expect(stage).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

          // the poster is the product's own existing cover art, loaded + decoded, at the art's aspect
          const img = stage.locator(".pf-stage-screen .pf-cover-img");
          await expect(img).toHaveCount(1);
          const src = await img.getAttribute("src");
          const decodedSrc = src!.startsWith("/_next/image") ? new URL(src!, "http://x").searchParams.get("url") : src;
          expect(decodedSrc).toBe(product.art.src);
          await page.waitForFunction(() => {
            const i = document.querySelector<HTMLImageElement>(".pf-paper .pf-cover-img");
            return !!i && i.complete && i.naturalWidth > 0;
          });
          const dims = await img.evaluate(async (el: HTMLImageElement) => {
            await el.decode();
            const r = el.getBoundingClientRect();
            return { nw: el.naturalWidth, nh: el.naturalHeight, w: r.width, h: r.height };
          });
          expect(dims.nw).toBeGreaterThan(0);
          // the art is shown in the 16:9 screen exactly as before (the screen, not the art, owns the aspect)
          const screen = (await page.locator(".pf-paper .pf-stage-screen").boundingBox())!;
          expect(screen.width / screen.height).toBeCloseTo(16 / 9, 1);
          expect(Math.abs(dims.w / dims.h - 16 / 9)).toBeLessThan(0.03);

          // the play control: labelled, >= 44 px, real video on click
          const play = stage.getByRole("button", { name: `Play ${video.title}` });
          await expect(play).toBeVisible();
          const box = (await play.boundingBox())!;
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
          await expect(play.locator("svg.pp-origami")).toBeVisible();
          // no disc behind the triangle
          await expect(play).toHaveCSS("border-radius", "0px");
          await expect(play).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

          // title overlay carries only existing data
          await expect(stage.locator(".pp-title-text")).toHaveText(video.title);

          // keyboard play works
          await play.focus();
          await page.keyboard.press("Enter");
          const frame = stage.locator("iframe");
          await expect(frame).toHaveCount(1);
          expect(new URL((await frame.getAttribute("src"))!).pathname).toBe(`/embed/${video.videoId}`);
          // the frame and tab stay around the iframe
          await expect(stage.locator(".pf-stage-label")).toBeVisible();
        });
      }
    }
  }

  test("click (mouse) starts the real video", async ({ page }) => {
    const video = PRODUCTS.find((p) => p.id === "urja")!.pitchVideo!;
    await open(page, 1440, 900, "urja");
    await page.getByRole("button", { name: `Play ${video.title}` }).click();
    await expect(page.locator(".pf-stage iframe")).toHaveAttribute("src", new RegExp(`/embed/${video.videoId}`));
  });
});

test.describe("paper player (phone/tablet)", () => {
  for (const [vw, vh] of [[390, 844], [768, 1024]] as const) {
    test(`no paper-player markup at ${vw}px; the existing player is unchanged`, async ({ page }) => {
      await open(page, vw, vh, "teachspark");
      await expect(page.locator(".pf-paper, [data-paper-player], .pp-origami, .pp-title")).toHaveCount(0);
      // the existing player: its screen is there, and the play button (when the phone has not auto-started the video) is the plain one
      await expect(page.locator(".pf-stage-screen[data-player-state]")).toHaveCount(1);
      const play = page.locator(".pf-stage-screen").getByRole("button", { name: /^Play / });
      // either the plain poster + Play button, or (a phone deep link may auto-start) the real iframe
      await expect(play.or(page.locator(".pf-stage-screen iframe"))).toHaveCount(1);
      if (await play.count()) await expect(play.locator("svg.lucide-play")).toHaveCount(1);
      await expect(page.locator(".pp-origami, .pp-watch")).toHaveCount(0);
    });
  }
});
