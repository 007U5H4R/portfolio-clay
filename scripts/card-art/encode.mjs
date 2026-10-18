/**
 * TASK-202: encodes the Higgsfield masters (3D paper-cut art) into the shipped WebP/AVIF files.
 *   node scripts/card-art/encode.mjs <masters-dir>
 * Masters live outside the repo (E Drive scratch: raw/<name>.png); provenance (model, prompt, job ids, credits) is in
 * public/media/illustrations/card-art-README.md. Covers: 16:9 → 1344×756 WebP. Featured Work layers: the transparent
 * master is cropped to the card's aspect (the side cards keep ~92 % of their art width as transparent paper on the left, so the copy stays clear), padded with a transparent bleed either side and below (the parallax
 * contract, data/featured-layers.ts) and written as WebP + AVIF.
 */
import sharp from "sharp";
import { join } from "node:path";
import { mkdirSync, statSync } from "node:fs";

const raw = process.argv[2];
if (!raw) throw new Error("usage: encode.mjs <masters-dir>");
const covers = join(process.cwd(), "public/media/illustrations/covers");
const featured = join(process.cwd(), "public/media/illustrations/featured");
mkdirSync(covers, { recursive: true });
mkdirSync(featured, { recursive: true });

// cover slug → master file
const COVERS = {
  teachspark: "cover-teachspark", velora: "cover-velora", "token-toli": "cover-token-toli", "campfire-board": "cover-campfire-board",
  railcite: "r2-cover-railcite", "slag-city": "r2-cover-slag-city", "bhakti-vilas": "r2-cover-bhakti-vilas",
  cubicle: "cover-cubicle", nuptis: "cover-nuptis", pratyasa: "cover-pratyasa", tegaki: "cover-tegaki",
  "dino-arcade-pwa": "cover-dino-arcade-pwa", "cinematic-portfolio": "cover-cinematic-portfolio",
  "shravans-round": "cover-shravans-round",
  urja: "cover-urja",
};
// card → [w, h, bleed, crop-left px, masters back/mid/front]
const FEATURED = {
  railcite: { w: 1024, h: 688, bleed: 22, left: 0, files: { back: "f-railcite-back", mid: "f-railcite-mid", front: "f-railcite-front2" } },
  "slag-city": { w: 1252, h: 576, bleed: 24, left: 92, files: { back: "g-slag-back", mid: "g-slag-mid", front: "g-slag-front" } },
  "campfire-board": { w: 1252, h: 576, bleed: 24, left: 92, files: { back: "g-camp-back", mid: "g-camp-mid", front: "g-camp-front" } },
};

for (const [slug, file] of Object.entries(COVERS)) {
  const out = join(covers, `cover-${slug}.webp`);
  await sharp(join(raw, `${file}.png`)).resize(1344, 756, { fit: "cover" }).webp({ quality: 78, effort: 6, smartSubsample: true }).toFile(out);
  console.log(`cover-${slug}.webp ${statSync(out).size}`);
}
for (const [slug, c] of Object.entries(FEATURED)) {
  for (const [layer, file] of Object.entries(c.files)) {
    const base = layer === "back" ? `featured-${slug}` : `featured-${slug}--${layer}`;
    const src = await sharp(join(raw, `${file}.png`)).extract({ left: c.left, top: 0, width: c.w, height: c.h }).toBuffer();
    const canvas = () =>
      sharp(src).extend({ left: c.bleed, right: c.bleed, bottom: c.bleed, top: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } });
    await canvas().webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(join(featured, `${base}.webp`));
    await canvas().avif({ quality: 55, effort: 6 }).toFile(join(featured, `${base}.avif`));
    console.log(`${base} webp ${statSync(join(featured, `${base}.webp`)).size} avif ${statSync(join(featured, `${base}.avif`)).size}`);
  }
}
