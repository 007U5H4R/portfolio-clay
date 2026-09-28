/**
 * Builds the `/projects` product covers (TASK-127): renders every hand-authored scene in
 * `scripts/portfolio-art/scenes/` to `public/media/illustrations/covers/cover-<slug>.svg`, and the
 * shared paper materials (`decor.ts`) to `public/media/portfolio/decor/`.
 *
 *   pnpm exec tsx scripts/portfolio-art/build.ts            # write all covers + the decor
 *   pnpm exec tsx scripts/portfolio-art/build.ts railcite   # write one cover
 *   pnpm exec tsx scripts/portfolio-art/build.ts decor      # write the decor only
 *
 * Each file must stay ≤ 40 kB (the brief's per-file budget; `tests/unit/eval-021.test.ts` re-checks
 * the shipped files). The printed sha256 goes into the provenance row in
 * `content/media/illustrations/README.md` whenever a cover changes.
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { decorAssets } from "./decor";
import { scenes } from "./scenes";

const OUT_DIR = join(process.cwd(), "public", "media", "illustrations", "covers");
const DECOR_DIR = join(process.cwd(), "public", "media", "portfolio", "decor");
export const COVER_BUDGET_BYTES = 40_000;

const only = new Set(process.argv.slice(2));
let failed = false;
for (const scene of scenes) {
  if (only.size > 0 && !only.has(scene.slug)) continue;
  const svg = scene.render();
  const bytes = Buffer.byteLength(svg);
  const sha = createHash("sha256").update(svg).digest("hex");
  const file = join(OUT_DIR, `cover-${scene.slug}.svg`);
  if (bytes > COVER_BUDGET_BYTES) {
    failed = true;
    console.error(`✗ cover-${scene.slug}.svg is ${bytes} bytes (budget ${COVER_BUDGET_BYTES})`);
    continue;
  }
  writeFileSync(file, svg);
  console.log(`✓ cover-${scene.slug}.svg  ${bytes} bytes  sha256 ${sha}`);
}
if (only.size === 0 || only.has("decor")) {
  mkdirSync(DECOR_DIR, { recursive: true });
  for (const asset of decorAssets) {
    const svg = asset.render();
    writeFileSync(join(DECOR_DIR, asset.file), svg);
    console.log(`✓ decor/${asset.file}  ${Buffer.byteLength(svg)} bytes`);
  }
}
if (failed) process.exit(1);
