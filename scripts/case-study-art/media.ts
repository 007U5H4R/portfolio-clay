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
  // Nuptis — the live mock-data app (docs/screenshots; fictional agencies, couples and vendors).
  { slug: "nuptis", from: "dashboard.jpg", to: "dashboard.webp", width: 1200 },
  { slug: "nuptis", from: "onboarding.jpg", to: "onboarding.webp", width: 1000 },
  { slug: "nuptis", from: "procurement.jpg", to: "procurement.webp", width: 1000 },
  { slug: "nuptis", from: "contingency-drawer.jpg", to: "contingency-drawer.webp", width: 1000 },
  // Bhakti Vilas — the prototype's own imagery (assets/tea-circle.jpg) and Tushar's Madhu Mukti
  // staged-reveal funnel (its shares are labelled directional estimates in the image itself).
  { slug: "bhakti-vilas", from: "tea-circle.jpg", to: "tea-circle.webp", width: 1200 },
  { slug: "bhakti-vilas", from: "Madhu-Mukti-TOFU-MOFU-BOFU-Funnel.jpg", to: "madhu-mukti-funnel.webp", width: 1200 },
  // Pratyasa — the real device (pratyasa-site/assets/device-photo.jpg) and its framed case photo.
  { slug: "pratyasa", from: "device-photo.jpg", to: "device.webp", width: 1400 },
  { slug: "pratyasa", from: "pratyasa-framed.jpg", to: "framed.webp", width: 900 },
  // Dino Arcade — the app's home-screen icon (assets/icon-512.png); no screenshots exist.
  { slug: "dino-arcade-pwa", from: "icon-512.jpg", to: "icon.webp", width: 360 },
  // Cinematic Portfolio — poster frames of the scroll film (assets/posters/*.jpg).
  { slug: "cinematic-portfolio", from: "hero.jpg", to: "film-hero.webp", width: 1400 },
  { slug: "cinematic-portfolio", from: "work.jpg", to: "film-work.webp", width: 900 },
  { slug: "cinematic-portfolio", from: "close.jpg", to: "film-close.webp", width: 900 },
  // Campfire Board — the local dashboard's own screens (docs/screenshots).
  { slug: "campfire-board", from: "kanban.jpg", to: "kanban.webp", width: 1400 },
  { slug: "campfire-board", from: "gantt.jpg", to: "gantt.webp", width: 1000 },
  { slug: "campfire-board", from: "workflow.jpg", to: "workflow.webp", width: 1000 },
  // Slag City — critique captures of the live game (docs/verification/critique2). The intro slides
  // are not used: they name story characters, which the site never does (Tushar, 2026-09-29).
  { slug: "slag-city", from: "11-coin-new.jpg", to: "attract.webp", width: 1400 },
  { slug: "slag-city", from: "06-gameplay-combat.jpg", to: "combat.webp", width: 1000 },
  { slug: "slag-city", from: "20-continue-desktop.jpg", to: "continue.webp", width: 1000 },
  { slug: "slag-city", from: "18-mobile-portrait-play.jpg", to: "mobile.webp", width: 420 },
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
