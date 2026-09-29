/**
 * TASK-130 · builds the hand-authored case-study art (stamps, motifs) into
 * public/media/case-studies/<slug>/, and copies the recorded product screenshots from
 * docs/case-study-sources/<slug>/ as WebP (see ./media.ts for the manifest + provenance).
 *
 *   pnpm exec tsx scripts/case-study-art/build.ts            # everything
 *   pnpm exec tsx scripts/case-study-art/build.ts railcite   # one product
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Asset } from "./kit";
import { railciteAssets } from "./assets/railcite";
import { teachsparkAssets } from "./assets/teachspark";
import { tegakiAssets } from "./assets/tegaki";
import { nuptisAssets } from "./assets/nuptis";
import { cubicleJournalAssets } from "./journal/cubicle";
import { journalSharedAssets } from "./journal/shared";
import { dinoJournalAssets } from "./journal/dino";
import { veloraJournalAssets } from "./journal/velora";
import { buildMedia } from "./media";

const ART: Record<string, Asset[]> = {
  railcite: railciteAssets,
  teachspark: teachsparkAssets,
  velora: veloraJournalAssets,
  tegaki: tegakiAssets,
  nuptis: nuptisAssets,
  cubicle: cubicleJournalAssets,
  journal: journalSharedAssets,
  "dino-arcade-pwa": dinoJournalAssets,
};

async function main() {
  const only = process.argv[2];
  for (const [slug, assets] of Object.entries(ART)) {
    if (only && only !== slug) continue;
    const dir = join(process.cwd(), "public", "media", "case-studies", slug);
    mkdirSync(dir, { recursive: true });
    for (const asset of assets) {
      writeFileSync(join(dir, asset.file), asset.svg);
      console.log(`${slug}/${asset.file}  ${(Buffer.byteLength(asset.svg) / 1024).toFixed(1)} kB`);
    }
  }
  await buildMedia(only);
}

void main();
