/**
 * Builds the portfolio decor SVGs (`public/media/portfolio/decor/`). TASK-202 retired the hand-authored product
 * covers and Featured Work collages from this script: that art is now 3D paper-cut (Higgsfield), encoded by
 * `scripts/card-art/encode.mjs`. The old scene/collage sources stay in `scenes/` and `featured/` for history.
 *
 *   pnpm exec tsx scripts/portfolio-art/build.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { decorAssets } from "./decor";

const DECOR_DIR = join(process.cwd(), "public", "media", "portfolio", "decor");
mkdirSync(DECOR_DIR, { recursive: true });
for (const asset of decorAssets) {
  const svg = asset.render();
  writeFileSync(join(DECOR_DIR, asset.file), svg);
  console.log(`✓ decor/${asset.file}  ${Buffer.byteLength(svg)} bytes`);
}
