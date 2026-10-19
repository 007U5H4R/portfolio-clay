/**
 * TASK-282: encodes the Higgsfield masters for the Slag City paper case study. No colour key, no alpha cutout.
 *   node scripts/slag-city-art/encode.mjs <masters-dir>
 * Expects <dir>/{hero,sign,band}-{light,dark}-2k.png, each painted on a flat background close to (not exactly) its target.
 * Same method as scripts/nuptis-art/encode.mjs: crop to the subject with a clean margin, measure the border colour, shift every
 * pixel by (target - measured) weighted by closeness to that background, so the field lands exactly on the page / band colour.
 * The page feathers the edges with a CSS mask. hero + sign sit on the page paper; band sits on the next-project band.
 */
import sharp from "sharp";
import { join } from "node:path";
import { statSync } from "node:fs";

const dir = process.argv[2];
if (!dir) throw new Error("usage: encode.mjs <masters-dir>");
const out = join(process.cwd(), "public/media/case-studies/slag-city/art");
const PAPER = { light: [0xf7, 0xf1, 0xe7], dark: [0x0b, 0x15, 0x30] }; // --color-paper in each theme
const BAND = { light: [0x0d, 0x17, 0x34], dark: [0x17, 0x26, 0x46] }; // .cs-next band fill in each theme (TASK-275)
const JOBS = [
  { name: "hero", target: PAPER, crop: { left: 260, top: 200, width: 1580, height: 900 }, width: 1400 },
  { name: "sign", target: PAPER, crop: { left: 260, top: 300, width: 1560, height: 1440 }, width: 900 },
  { name: "band", target: BAND, crop: { left: 380, top: 290, width: 1320, height: 876 }, width: 1320 },
];

for (const job of JOBS) for (const theme of ["light", "dark"]) {
  const { data, info } = await sharp(join(dir, `${job.name}-${theme}-2k.png`)).extract(job.crop).removeAlpha().resize({ width: job.width, kernel: "lanczos3" }).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const bg = [0, 0, 0];
  let n = 0;
  const sample = (x, y) => { const i = (y * w + x) * 3; for (let c = 0; c < 3; c++) bg[c] += data[i + c]; n++; };
  for (let x = 0; x < w; x += 4) for (let y = 0; y < 12; y++) { sample(x, y); sample(x, h - 1 - y); }
  for (let y = 0; y < h; y += 4) for (let x = 0; x < 12; x++) { sample(x, y); sample(w - 1 - x, y); }
  for (let c = 0; c < 3; c++) bg[c] /= n;
  const target = job.target[theme];
  const R0 = 26, R1 = 90; // full shift within R0 of the background, none beyond R1
  const border = (buf) => { // mean colour of the outer ring (the field)
    const m = [0, 0, 0]; let k = 0;
    const at = (x, y) => { const i = (y * w + x) * 3; for (let c = 0; c < 3; c++) m[c] += buf[i + c]; k++; };
    for (let x = 0; x < w; x += 4) for (let y = 0; y < 12; y++) { at(x, y); at(x, h - 1 - y); }
    for (let y = 0; y < h; y += 4) for (let x = 0; x < 12; x++) { at(x, y); at(w - 1 - x, y); }
    return m.map((v) => v / k);
  };
  const file = join(out, `${job.name}-${theme}.webp`);
  // Lossy WebP shifts flat colour by a level or two (YUV rounding), so encode, decode, measure the field and correct the shift
  // by the residual; the decoded field lands within one level of the target hex (lossy WebP cannot hit every flat value exactly; the radial CSS mask hides the rest).
  let delta = target.map((t, c) => t - bg[c]);
  let res;
  for (let pass = 0; pass < 2; pass++) {
    const buf = Buffer.from(data);
    for (let p = 0; p < w * h; p++) {
      const i = p * 3;
      const d = Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);
      const k = d <= R0 ? 1 : d >= R1 ? 0 : 1 - (d - R0) / (R1 - R0);
      const sm = k * k * (3 - 2 * k);
      const f = d <= 5 ? 1 : d >= 14 ? 0 : 1 - (d - 5) / 9; // generation noise in the field itself is flattened to the exact target
      const fs = f * f * (3 - 2 * f);
      for (let c = 0; c < 3; c++) {
        const shifted = data[i + c] + delta[c] * sm;
        buf[i + c] = Math.max(0, Math.min(255, Math.round(shifted * (1 - fs) + (target[c] + (delta[c] - (target[c] - bg[c]))) * fs)));
      }
    }
    res = await sharp(buf, { raw: { width: w, height: h, channels: 3 } }).webp({ quality: 80, effort: 6 }).toFile(file);
    const dec = await sharp(file).removeAlpha().raw().toBuffer();
    const got = border(dec);
    const err = target.map((t, c) => t - got[c]);
    if (err.every((e) => Math.abs(e) < 0.35)) break;
    delta = delta.map((d, c) => d + err[c]);
  }
  console.log(`${job.name}-${theme}.webp ${res.width}x${res.height} ${statSync(file).size}B bg=${bg.map(Math.round)} -> ${target}`);
}
