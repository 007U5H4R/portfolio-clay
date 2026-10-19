/**
 * TASK-278: encodes the Higgsfield masters for the Nuptis paper case study. No colour key, no alpha cutout.
 *   node scripts/nuptis-art/encode.mjs <masters-dir>
 * Expects <dir>/hero-{light,dark}-2k.png, painted on a flat background that is close to (not exactly) the page colour.
 * Each master's background is measured from its border, then every pixel is shifted by (target - measured) weighted by how
 * close the pixel is to that background (smooth falloff), so the field lands exactly on the page colour while paper and
 * soft contact shadows keep their own tones. The page also feathers the edges with a CSS mask.
 */
import sharp from "sharp";
import { join } from "node:path";
import { statSync } from "node:fs";

const dir = process.argv[2];
if (!dir) throw new Error("usage: encode.mjs <masters-dir>");
const out = join(process.cwd(), "public/media/case-studies/nuptis/art");
const TARGET = { light: [0xf7, 0xf1, 0xe7], dark: [0x0b, 0x15, 0x30] }; // --color-paper in each theme
const WIDTH = 1600;

for (const theme of ["light", "dark"]) {
  const { data, info } = await sharp(join(dir, `hero-${theme}-2k.png`)).removeAlpha().resize({ width: WIDTH, kernel: "lanczos3" }).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const bg = [0, 0, 0];
  let n = 0;
  const sample = (x, y) => { const i = (y * w + x) * 3; for (let c = 0; c < 3; c++) bg[c] += data[i + c]; n++; };
  for (let x = 0; x < w; x += 4) for (let y = 0; y < 12; y++) { sample(x, y); sample(x, h - 1 - y); }
  for (let y = 0; y < h; y += 4) for (let x = 0; x < 12; x++) { sample(x, y); sample(w - 1 - x, y); }
  for (let c = 0; c < 3; c++) bg[c] /= n;
  const delta = TARGET[theme].map((t, c) => t - bg[c]);
  const R0 = 26, R1 = 90; // full shift within R0 of the background, none beyond R1
  for (let p = 0; p < w * h; p++) {
    const i = p * 3;
    const d = Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);
    const k = d <= R0 ? 1 : d >= R1 ? 0 : 1 - (d - R0) / (R1 - R0);
    const s = k * k * (3 - 2 * k);
    for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round(data[i + c] + delta[c] * s)));
  }
  const file = join(out, `hero-${theme}.webp`);
  const res = await sharp(data, { raw: { width: w, height: h, channels: 3 } }).webp({ quality: 82, effort: 6 }).toFile(file);
  console.log(`hero-${theme}.webp ${res.width}x${res.height} ${statSync(file).size}B bg=${bg.map(Math.round)} -> ${TARGET[theme]}`);
}
