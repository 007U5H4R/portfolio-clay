/**
 * TASK-280: encodes the Higgsfield masters for the Pratyasa paper case study. No colour key, no alpha cutout.
 *   node scripts/pratyasa-art/encode.mjs <masters-dir> [next-light-band-hex]
 * Expects <dir>/{hero,next}-{light,dark}-2k.png, each painted on a flat background close to (not exactly) the surface it sits on:
 * the hero on the page colour (--color-paper), the next-project band art on the band colour. Same correction as
 * scripts/nuptis-art/encode.mjs: the background is measured from the border, then every pixel is shifted by (target - measured)
 * weighted by how close it is to that background, so the field lands exactly on the surface colour while paper keeps its tones.
 * The page also feathers the edges with a CSS mask.
 */
import sharp from "sharp";
import { join } from "node:path";
import { statSync } from "node:fs";

const dir = process.argv[2];
if (!dir) throw new Error("usage: encode.mjs <masters-dir> [next-light-band-hex]");
const hex = (s) => [1, 3, 5].map((i) => parseInt(s.replace("#", "").slice(i - 1, i + 1), 16));
const nextLight = hex(process.argv[3] ?? "#f7f1e7");
const out = join(process.cwd(), "public/media/case-studies/pratyasa/art");
const JOBS = [
  { name: "hero-light", src: "hero-light-2k.png", target: [0xf7, 0xf1, 0xe7] }, // --color-paper, light
  { name: "hero-dark", src: "hero-dark-2k.png", target: [0x0b, 0x15, 0x30] }, // --color-paper, dark
  { name: "next-light", src: "next-light-2k.png", target: nextLight }, // the cream next-project band (TASK-279 `tone`)
  { name: "next-dark", src: "next-dark-2k.png", target: [0x17, 0x26, 0x46] }, // the dark next-project band
];
const WIDTH = 1600;

for (const job of JOBS) {
  const { data, info } = await sharp(join(dir, job.src)).removeAlpha().resize({ width: WIDTH, kernel: "lanczos3" }).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const samples = [[], [], []]; // median, not mean: leaves touch the hero's side edges and would drag a mean off the field
  const sample = (x, y) => { const i = (y * w + x) * 3; for (let c = 0; c < 3; c++) samples[c].push(data[i + c]); };
  for (let x = 0; x < w; x += 4) for (let y = 0; y < 12; y++) { sample(x, y); sample(x, h - 1 - y); }
  for (let y = 0; y < h; y += 4) for (let x = 0; x < 12; x++) { sample(x, y); sample(w - 1 - x, y); }
  const bg = samples.map((a) => { a.sort((x, y) => x - y); return a[a.length >> 1]; });
  const delta = job.target.map((t, c) => t - bg[c]);
  const R0 = 26, R1 = 90;
  for (let p = 0; p < w * h; p++) {
    const i = p * 3;
    const d = Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);
    const k = d <= R0 ? 1 : d >= R1 ? 0 : 1 - (d - R0) / (R1 - R0);
    const s = k * k * (3 - 2 * k);
    for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round(data[i + c] + delta[c] * s)));
  }
  const file = join(out, `${job.name}.webp`);
  const res = await sharp(data, { raw: { width: w, height: h, channels: 3 } }).webp({ quality: 80, effort: 6 }).toFile(file);
  console.log(`${job.name}.webp ${res.width}x${res.height} ${statSync(file).size}B bg=${bg.map(Math.round)} -> ${job.target}`);
}
