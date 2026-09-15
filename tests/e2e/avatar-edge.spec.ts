/**
 * avatar-edge.spec.ts (S02.02 / TKT-02) — cutout edge inspection frame.
 *
 * Renders `public/avatar/avatar.webp` over a sky→lavender gradient (the Design.md hero frame
 * colours: `--color-sky` #A8D7FF → `--color-lavender` #BFA8FF) at 1440 CSS px width,
 * `deviceScaleFactor: 2`, then clips a 400×400 region around the hair/beard silhouette so a
 * light fringe halo (a known risk of alpha-matte cutouts on a light background) is visible at
 * 2x zoom. Saves `docs/screenshots/tracer/avatar-edge@2x.png` for the orchestrator to eyeball
 * at the TKT-02 visual gate.
 *
 * NOT RUN as part of TSK-02 — Chromium is not installed until TSK-07/S07.02. This file only
 * needs to exist and be ready; run it with `pnpm test:e2e tests/e2e/avatar-edge.spec.ts` once
 * Chromium is available. If a halo shows up, rerun `pnpm media:avatar -- --erode 1` (or
 * `tsx scripts/avatar.ts --erode 1`) and re-shoot — do not hand-edit the PNG.
 *
 * The clip box below is a first-pass estimate (avatar.webp is 1450×1800; the head sits at
 * roughly x∈[24,240], y∈[56,185] within a 480px-wide displayed frame per the AvatarStage
 * layout in technical-plan.md §S05.02) — nudge `CLIP` if the real render frames it off-centre.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect } from "@playwright/test";

// Playwright runs from the repo root under its CommonJS transform (no "type":"module", so
// import.meta is unavailable — S07.03). cwd is the project root, the anchor these paths need.
const ROOT = process.cwd();
const AVATAR_PATH = resolve(ROOT, "public/avatar/avatar.webp");
const OUT_PATH = resolve(ROOT, "docs/screenshots/tracer/avatar-edge@2x.png");

const VIEWPORT = { width: 1440, height: 900 };
const FRAME_WIDTH = 480; // matches AvatarStage's lg: 480px frame (technical-plan.md §S05.02)
const FRAME_LEFT = (VIEWPORT.width - FRAME_WIDTH) / 2;
const FRAME_TOP = 150;

// 400×400 clip centred on the hair/beard silhouette, in page (CSS px) coordinates.
const CLIP = { x: FRAME_LEFT + 165 - 200, y: FRAME_TOP + 120 - 200, width: 400, height: 400 };

function pageHtml(avatarDataUrl: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; }
      body {
        width: ${VIEWPORT.width}px;
        height: ${VIEWPORT.height}px;
        background: linear-gradient(135deg, #A8D7FF 0%, #BFA8FF 100%);
      }
      .frame {
        position: absolute;
        left: ${FRAME_LEFT}px;
        top: ${FRAME_TOP}px;
        width: ${FRAME_WIDTH}px;
      }
      .frame img { display: block; width: 100%; height: auto; }
    </style>
  </head>
  <body>
    <div class="frame"><img src="${avatarDataUrl}" alt="" /></div>
  </body>
</html>`;
}

test.use({ viewport: VIEWPORT, deviceScaleFactor: 2 });

test("avatar cutout edge shows no light halo on sky/lavender gradient", { tag: "@manual-shot" }, async ({ page }) => {
  const avatarBuffer = readFileSync(AVATAR_PATH);
  const avatarDataUrl = `data:image/webp;base64,${avatarBuffer.toString("base64")}`;

  await page.setContent(pageHtml(avatarDataUrl));
  await page.waitForSelector("img");

  await page.screenshot({ path: OUT_PATH, clip: CLIP });

  // The screenshot itself is the artifact under review; this assertion just confirms the
  // rendered frame loaded (non-zero natural size) before the orchestrator eyeballs the PNG.
  const naturalWidth = await page.locator(".frame img").evaluate((el) => (el as HTMLImageElement).naturalWidth);
  expect(naturalWidth).toBeGreaterThan(0);
});
