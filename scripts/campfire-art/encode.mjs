/**
 * TASK-281: encodes the Higgsfield masters for the Campfire Board paper case study. No colour key, no alpha cutout.
 *   node scripts/campfire-art/encode.mjs <masters-dir>
 * Expects <dir>/{hero-light,hero-dark,slag-light,slag-dark}.png (2048 wide), each painted on a flat background close to
 * (not exactly) the colour it lands on. Same background-drift correction as scripts/nuptis-art/encode.mjs: measure the
 * border colour, shift every pixel by (target - measured) weighted by closeness to that background, so the field lands
 * exactly on the page / band hex while paper and contact shadows keep their tones. The page feathers edges with a CSS mask.
 */
import sharp from "sharp";
import { join } from "node:path";
import { statSync } from "node:fs";

const dir = process.argv[2];
if (!dir) throw new Error("usage: encode.mjs <masters-dir>");
const out = join(process.cwd(), "public/media/case-studies/campfire-board/art");
const WIDTH = 1600;
const JOBS = [
  { src: "hero-light", file: "hero-light", target: [0xf7, 0xf1, 0xe7] }, // --color-paper, light
  { src: "hero-dark", file: "hero-dark", target: [0x0b, 0x15, 0x30] }, // --color-paper, dark
  { src: "slag-light", file: "slag-next-light", target: [0x0d, 0x17, 0x34] }, // .cs-next band, light theme
  { src: "slag-dark", file: "slag-next-dark", target: [0x17, 0x26, 0x46] }, // .cs-next band, dark theme
];

for (const job of JOBS) {
  const { data, info } = await sharp(join(dir, `${job.src}.png`)).removeAlpha().resize({ width: WIDTH, kernel: "lanczos3" }).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const bg = [0, 0, 0];
  let n = 0;
  const sample = (x, y) => { const i = (y * w + x) * 3; for (let c = 0; c < 3; c++) bg[c] += data[i + c]; n++; };
  for (let x = 0; x < w; x += 4) for (let y = 0; y < 12; y++) sample(x, y);
  for (let y = 0; y < h; y += 4) for (let x = 0; x < 12; x++) sample(x, y);
  for (let c = 0; c < 3; c++) bg[c] /= n;
  const delta = job.target.map((t, c) => t - bg[c]);
  const R0 = 26, R1 = 90;
  for (let p = 0; p < w * h; p++) {
    const i = p * 3;
    const d = Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);
    const k = d <= R0 ? 1 : d >= R1 ? 0 : 1 - (d - R0) / (R1 - R0);
    const s = k * k * (3 - 2 * k);
    for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round(data[i + c] + delta[c] * s)));
  }
  const file = join(out, `${job.file}.webp`);
  const res = await sharp(data, { raw: { width: w, height: h, channels: 3 } }).webp({ quality: 80, effort: 6 }).toFile(file);
  console.log(`${job.file}.webp ${res.width}x${res.height} ${statSync(file).size}B bg=${bg.map(Math.round)} -> ${job.target}`);
}
