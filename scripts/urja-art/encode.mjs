/**
 * TASK-284: encodes the Higgsfield masters for the Urja paper case study and its TeachSpark next-project band.
 *   node scripts/urja-art/encode.mjs <masters-dir>
 * Expects <dir>/hero-{light,dark}.png (Urja diorama, 16:9) and <dir>/ts-{light,dark}-2k.png (TeachSpark vignette, upscaled 2k).
 * No colour key, no alpha cutout: each master is painted on a flat field close to (not exactly) the surface it lands on. The
 * field is measured from the border, then every pixel is shifted by (target - measured) weighted by closeness to that field
 * (smooth falloff), so the field decodes to the exact surface colour while paper and soft shadows keep their tones. The page
 * also feathers the edges with a CSS mask. Same method as scripts/nuptis-art/encode.mjs.
 * Surfaces: hero = page paper (#f7f1e7 / #0b1530); band = #f7f0e7 (cream band, TASK-279) / #172646 (dark band, --color-ivory).
 */
import sharp from "sharp";
import { join } from "node:path";
import { statSync } from "node:fs";

sharp.cache(false); // the decode-check below re-reads a file this process just rewrote
const dir = process.argv[2];
if (!dir) throw new Error("usage: encode.mjs <masters-dir>");
const out = join(process.cwd(), "public/media/case-studies/urja/art");
const JOBS = [
  { file: "hero-light.png", name: "hero-light.webp", target: [0xf7, 0xf1, 0xe7], crop: { left: 440, top: 20, width: 904, height: 680 }, nearLossless: 40 },
  { file: "hero-dark.png", name: "hero-dark.webp", target: [0x0b, 0x15, 0x30], crop: { left: 440, top: 20, width: 904, height: 680 }, nearLossless: 40 },
  { file: "ts-light-2k.png", name: "teachspark-next-light.webp", target: [0xf7, 0xf0, 0xe7], width: 1600 },
  { file: "ts-dark-2k.png", name: "teachspark-next-dark.webp", target: [0x17, 0x26, 0x46], width: 1600 },
];

for (const job of JOBS) {
  let img = sharp(join(dir, job.file)).removeAlpha();
  if (job.crop) img = img.extract(job.crop);
  if (job.width) img = img.resize({ width: job.width, kernel: "lanczos3" });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const bg = [0, 0, 0];
  let n = 0;
  const sample = (x, y) => { const i = (y * w + x) * 3; for (let c = 0; c < 3; c++) bg[c] += data[i + c]; n++; };
  for (let x = 0; x < w; x += 4) for (let y = 0; y < 12; y++) { sample(x, y); sample(x, h - 1 - y); }
  for (let y = 0; y < h; y += 4) for (let x = 0; x < 12; x++) { sample(x, y); sample(w - 1 - x, y); }
  for (let c = 0; c < 3; c++) bg[c] /= n;
  const R0 = 26, R1 = 90; // shift: full within R0 of the field, none beyond R1
  const F0 = 12, F1 = 24; // flatten: pixels within F0 of the field are set to the exact surface (removes the master's faint vignette)
  const src = Buffer.from(data);
  const file = join(out, job.name);
  let bias = [0, 0, 0], res;
  // lossy WebP decodes flat fields up to 1 level off: encode, decode, nudge the target by the residual, repeat (max 10 passes)
  for (let pass = 0; pass < 10; pass++) {
    const aim = job.target.map((t, c) => t + bias[c]);
    const delta = aim.map((t, c) => t - bg[c]);
    for (let p = 0; p < w * h; p++) {
      const i = p * 3;
      const d = Math.hypot(src[i] - bg[0], src[i + 1] - bg[1], src[i + 2] - bg[2]);
      const k = d <= R0 ? 1 : d >= R1 ? 0 : 1 - (d - R0) / (R1 - R0);
      const s = k * k * (3 - 2 * k);
      const f = d <= F0 ? 1 : d >= F1 ? 0 : 1 - (d - F0) / (F1 - F0);
      for (let c = 0; c < 3; c++) {
        const shifted = src[i + c] + delta[c] * s;
        data[i + c] = Math.max(0, Math.min(255, Math.round(shifted + (aim[c] - shifted) * f)));
      }
    }
    res = await sharp(data, { raw: { width: w, height: h, channels: 3 } }).webp(job.nearLossless ? { nearLossless: true, quality: job.nearLossless, effort: 6 } : { quality: 88, effort: 6, smartSubsample: true }).toFile(file);
    const dec = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const med = [0, 1, 2].map((c) => { const v = []; for (let x = 0; x < w; x += 3) { v.push(dec.data[(4 * w + x) * 3 + c]); v.push(dec.data[((h - 5) * w + x) * 3 + c]); } v.sort((m, n) => m - n); return v[v.length >> 1]; });
    const err = job.target.map((t, c) => t - med[c]);
    if (process.env.DEBUG_ENC) console.log(job.name, pass, "aim", aim, "got", med);
    if (err.every((e) => e === 0)) break;
    bias = bias.map((b0, c) => b0 + err[c]);
  }
  // decoded check: the border field must land within 1 level of the target
  const dec = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => [0, 1, 2].map((c) => dec.data[(y * dec.info.width + x) * 3 + c]);
  console.log(`${job.name} ${res.width}x${res.height} ${statSync(file).size}B bg=${bg.map(Math.round)} -> ${job.target} decoded corners=${[px(3, 3), px(w - 4, 3), px(3, h - 4), px(w - 4, h - 4), px(w >> 1, 3)].map((p) => p.join(",")).join(" | ")}`);
}
