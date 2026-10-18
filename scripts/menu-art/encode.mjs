/**
 * TASK-255 (Tushar 2026-10-18): encodes the Higgsfield masters for the phone menu drawer's two art slots into transparent WebP.
 *   node scripts/menu-art/encode.mjs <masters-dir>
 * Masters live outside the repo (E Drive scratch: raw/); provenance (model, prompts, job ids) is in public/media/illustrations/card-art-README.md.
 * Expects <dir>/{light,dark}-{moon,land}.png. A master that came back opaque on flat white (the dark landscape) is keyed first: near-white pixels
 * connected to the frame edge become transparent. Every master is then trimmed to its alpha bounds, the alpha is eroded ~1 px to drop the
 * light fringe, and the result is resized to the slot at 3x DPR and written as WebP (alpha).
 *   moon: header vignette slot (`.more-deco`, 80 CSS px wide) -> 288 px wide
 *   land: drawer-footer strip (`.more-land`, full sheet width <= 340 CSS px) -> 1020 px wide
 */
import sharp from "sharp";
import { join } from "node:path";
import { statSync } from "node:fs";

const dir = process.argv[2];
if (!dir) throw new Error("usage: encode.mjs <masters-dir>");
const out = join(process.cwd(), "public/media/menu");

async function keyWhite(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const white = (i) => data[i] > 244 && data[i + 1] > 244 && data[i + 2] > 244;
  const seen = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    const p = y * w + x;
    if (!seen[p] && white(p * 4)) {
      seen[p] = 1;
      stack.push(p);
    }
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (stack.length) {
    const p = stack.pop();
    const x = p % w;
    const y = (p - x) / w;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }
  for (let p = 0; p < w * h; p++) if (seen[p]) data[p * 4 + 3] = 0;
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function prepare(file) {
  const meta = await sharp(file).metadata();
  let png = meta.hasAlpha ? await sharp(file).png().toBuffer() : await keyWhite(file);
  // erode the alpha by ~1 px (blur + hard-ish curve) so no light halo survives on a dark drawer
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alpha = Buffer.alloc(info.width * info.height);
  for (let p = 0; p < alpha.length; p++) alpha[p] = data[p * 4 + 3];
  const blurred = await sharp(alpha, { raw: { width: info.width, height: info.height, channels: 1 } })
    .blur(1.2)
    .linear(2.2, -255 * 0.95)
    .toColourspace("b-w")
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = blurred.info.channels;
  for (let p = 0; p < alpha.length; p++) data[p * 4 + 3] = Math.min(alpha[p], blurred.data[p * ch]);
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

const JOBS = [
  ["light-sun", "sun-light.webp", 288], // TASK-260: light mode shows a sun with clouds
  ["dark-moon", "moon-dark.webp", 288],
  ["light-land", "landscape-light.webp", 1020],
  ["dark-land", "landscape-dark.webp", 1020],
];
for (const [name, file, width] of JOBS) {
  const png = await prepare(join(dir, `${name}.png`));
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = 0, y1 = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * 4 + 3] > 16) {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
  const trimmed = await sharp(png).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }).toBuffer();
  const wrote = await sharp(trimmed).resize({ width }).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(join(out, file));
  console.log(file, `${wrote.width}x${wrote.height}`, statSync(join(out, file)).size, "bytes");
}
