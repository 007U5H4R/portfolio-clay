/**
 * TASK-301: encodes the five origami action-button icons (512 px transparent PNG masters) into transparent WebP.
 *   node scripts/origami-icons/encode.mjs <masters-dir>
 * Masters live outside the repo (E Drive scratch: origami-icons/masters/origami-{play,camera,rocket,cat,document}.png);
 * provenance (model, prompts, job ids) is in public/media/illustrations/origami-icons/README.md.
 * Alpha is eroded ~1 px (drops the matte fringe), then written at 2x of the largest rendered size (play 40 css px -> 128 px
 * is enough for 3x, so we ship 256 px) plus a 128 px variant.
 */
import sharp from "sharp";
import { join } from "node:path";
import { statSync } from "node:fs";

const dir = process.argv[2];
if (!dir) throw new Error("usage: encode.mjs <masters-dir>");
const out = join(process.cwd(), "public/media/illustrations/origami-icons");

for (const k of ["play", "camera", "rocket", "cat", "document"]) {
  const src = join(dir, `origami-${k}.png`);
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alpha = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3];
  const mask = (blur, thr) =>
    sharp(alpha, { raw: { width: info.width, height: info.height, channels: 1 } }).blur(blur).threshold(thr).extractChannel(0).raw().toBuffer();
  const eroded = await mask(0.8, 200); // ~1 px in
  const core = await mask(2.2, 250); // ~3 px in: the matte fringe band is everything outside it
  for (let i = 0; i < alpha.length; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    // matte residue: in the edge band, near-neutral near-white pixels are leftover studio backdrop (ivory #F5EBDD is warmer, B ~ 221)
    const residue = !core[i] && Math.min(r, g, b) > 228 && Math.max(r, g, b) - Math.min(r, g, b) < 16;
    data[i * 4 + 3] = residue ? 0 : Math.min(data[i * 4 + 3], eroded[i]);
  }
  const base = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
  for (const w of [256, 128]) {
    const file = join(out, `origami-${k}${w === 128 ? "-128" : ""}.webp`);
    await base.clone().resize(w, w).webp({ quality: 88, alphaQuality: 100 }).toFile(file);
    console.log(file, statSync(file).size);
  }
}
