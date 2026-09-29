/**
 * TASK-130 · recorded product images → optimised WebP for the case studies.
 * Source: docs/case-study-sources/<slug>/ (copied from Tushar's project folders; provenance per file
 * in docs/case-study-sources/INDEX.md). Output: public/media/case-studies/<slug>/<name>.webp.
 * Each row names its original so the chain is: original path → INDEX.md → this manifest → page.
 */
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

export interface MediaRow {
  slug: string;
  from: string; // file in docs/case-study-sources/<slug>/
  to: string; // webp name
  width: number; // output width (px)
  /** Optional crop of the source (px, in the source's own size) before resizing. */
  extract?: { left: number; top: number; width: number; height: number };
}

export const MEDIA: MediaRow[] = [];

export async function buildMedia(only?: string) {
  for (const row of MEDIA) {
    if (only && only !== row.slug) continue;
    const src = join(process.cwd(), "docs", "case-study-sources", row.slug, row.from);
    if (!existsSync(src)) throw new Error(`media: missing source ${src}`);
    const dir = join(process.cwd(), "public", "media", "case-studies", row.slug);
    mkdirSync(dir, { recursive: true });
    const out = join(dir, row.to);
    const input = row.extract ? sharp(src).extract(row.extract) : sharp(src);
    const info = await input.resize({ width: row.width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
    console.log(`${row.slug}/${row.to}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)} kB`);
  }
}
