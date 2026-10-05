/**
 * Builds the `/about` art (TASK-136) into `public/about/<slug>.svg`: the hero collage pieces, the three
 * chapter scenes, the three research artifacts and the mountain horizon. Hand-authored SVG only (no
 * image generation), in the TASK-127 / TASK-133 cut-paper grammar (`scripts/portfolio-art/kit.ts`,
 * `collage.ts`); palette and helpers in `./shared.ts`.
 *
 *   pnpm exec tsx scripts/about-art/build.ts                 # write every asset
 *   pnpm exec tsx scripts/about-art/build.ts books-stack     # write one
 *
 * Each file must stay ≤ 40 kB (the TASK-127 per-file budget); `tests/unit/about-art.test.ts` re-checks
 * the shipped files and that none carries lettering other than the four book spines. Deterministic
 * (seeded), so a rebuild is byte-identical.
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Collage } from "../portfolio-art/collage";
import { chapterScenes } from "./chapters";
import { heroPieces } from "./hero";
import { horizon } from "./horizon";
import { researchArtifacts } from "./research";

export const ABOUT_ART_DIR = join(process.cwd(), "public", "about");
export const ABOUT_ART_BUDGET_BYTES = 40_000;
export const aboutArt: readonly Collage[] = [...heroPieces, ...chapterScenes, ...researchArtifacts, horizon];

const only = new Set(process.argv.slice(2));
let failed = false;
mkdirSync(ABOUT_ART_DIR, { recursive: true });
for (const art of aboutArt) {
  if (only.size > 0 && !only.has(art.slug)) continue;
  const svg = art.render();
  const bytes = Buffer.byteLength(svg);
  const sha = createHash("sha256").update(svg).digest("hex").slice(0, 16);
  if (bytes > ABOUT_ART_BUDGET_BYTES) {
    failed = true;
    console.error(`✗ ${art.slug}.svg is ${bytes} bytes (budget ${ABOUT_ART_BUDGET_BYTES})`);
    continue;
  }
  writeFileSync(join(ABOUT_ART_DIR, `${art.slug}.svg`), svg);
  console.log(`✓ ${art.slug}.svg  ${bytes} bytes  sha256 ${sha}…`);
}
if (failed) process.exit(1);
