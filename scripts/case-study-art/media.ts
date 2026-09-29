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

export const MEDIA: MediaRow[] = [
  // TeachSpark — the real mobile landing (web/public/demo-poster.jpg), and the phone from the Final
  // PRD's "2-Minute WhatsApp Loop" slide (docs/assets/p2-whatsapp-loop.jpg; an illustrative chat).
  { slug: "teachspark", from: "demo-poster.jpg", to: "landing-mobile.webp", width: 560 },
  { slug: "teachspark", from: "p2-whatsapp-loop.jpg", to: "loop-chat.webp", width: 560, extract: { left: 95, top: 135, width: 292, height: 615 } },
  // Velora — the real app screens (docs/screenshots of the live mock-data build), and Nuptis's
  // roster dashboard for the pivot hero. Screens with third-party certification marks are not used.
  { slug: "velora", from: "trust-profile.jpg", to: "trust-profile.webp", width: 540 },
  { slug: "velora", from: "bids.jpg", to: "bids.webp", width: 540 },
  { slug: "velora", from: "rfps.jpg", to: "rfps.webp", width: 540 },
  { slug: "velora", from: "role-select.jpg", to: "role-select.webp", width: 540 },
  { slug: "velora", from: "../nuptis/dashboard.jpg", to: "nuptis-dashboard.webp", width: 1000 },
  // Tegaki — the live pilot's own screens (docs/screenshots; the report excerpt is a labelled
  // fictional sample). Sign-in and pricing are not shown as screenshots.
  { slug: "tegaki", from: "hero.jpg", to: "landing.webp", width: 1200 },
  { slug: "tegaki", from: "anatomy.jpg", to: "anatomy.webp", width: 1000 },
  { slug: "tegaki", from: "report-excerpt.jpg", to: "report-excerpt.webp", width: 1000 },
];

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
