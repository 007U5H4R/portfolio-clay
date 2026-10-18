/**
 * TASK-259 (reversible test): encodes the Higgsfield masters for the phone /projects list background into transparent WebP.
 *   node scripts/projects-bg/encode.mjs <masters-dir> [out-dir]
 * Expects <dir>/{light,dark}-{facet,orbit,ridge}.png. The masters carry real alpha (gpt_image_2_5 with background=transparent);
 * the alpha is hardened (>=150 kept) to drop the generator's soft halo, trimmed, optionally cropped (the ridge's baked ground
 * strip), resized to the rendered size at ~2x DPR and written as WebP. Provenance: public/media/illustrations/card-art-README.md.
 */
import sharp from "sharp";
import { join } from "node:path";
import { statSync } from "node:fs";

const dir = process.argv[2];
if (!dir) throw new Error("usage: encode.mjs <masters-dir> [out-dir]");
const out = process.argv[3] ?? join(process.cwd(), "public/media/projects-bg");

// width = rendered CSS width x ~2; quality tuned to the size budget (sculptures <= 45 kB, ridges <= 80 kB)
const specs = { facet: { w: 360, q: 82 }, orbit: { w: 360, q: 82 }, ridge: { w: 960, q: 80, cropBottom: 0.08 } };

for (const theme of ["light", "dark"]) {
  for (const [name, spec] of Object.entries(specs)) {
    const file = join(dir, `${theme}-${name}.png`);
    let { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 3; i < data.length; i += 4) data[i] = data[i] < 150 ? 0 : 255;
    let img = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
    if (spec.cropBottom) img = sharp(await img.extract({ left: 0, top: 0, width: info.width, height: Math.round(info.height * (1 - spec.cropBottom)) }).png().toBuffer());
    const trimmed = await img.trim({ threshold: 1, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const dest = join(out, `${theme}-${name}.webp`);
    await sharp(trimmed).resize({ width: spec.w }).webp({ quality: spec.q, alphaQuality: 80, effort: 6 }).toFile(dest);
    console.log(dest, Math.round(statSync(dest).size / 1024) + " kB");
  }
}
