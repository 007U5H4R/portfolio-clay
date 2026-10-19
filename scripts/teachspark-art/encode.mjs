/**
 * TASK-263: encodes the Higgsfield masters for the TeachSpark paper-classroom case study into transparent WebP.
 *   node scripts/teachspark-art/encode.mjs <masters-dir>
 * Masters live outside the repo (E Drive scratch: raw/); provenance (model, prompts, job ids) is in
 * public/media/illustrations/card-art-README.md. Expects <dir>/cut-{light,dark}-{hero,workflow,arch,footer}.png (Higgsfield
 * image_background_remover output) and <dir>/{light,dark}-footer.png (the raw landscapes: the remover ate their hills, so the baked
 * checkerboard sky is keyed here instead — near-neutral light pixels connected to the top/side edges become transparent).
 * Alpha is hardened (soft edge between 90 and 190) to drop the remover's haze; hero is trimmed to its alpha bounds; workflow and
 * arch keep the full width (the page positions HTML labels at fixed fractions of it) and are trimmed vertically only.
 */
import sharp from "sharp";
import { join } from "node:path";
import { statSync } from "node:fs";

const dir = process.argv[2];
if (!dir) throw new Error("usage: encode.mjs <masters-dir>");
const out = join(process.cwd(), "public/media/case-studies/teachspark/art");

async function keyChecker(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const bg = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    return r > 185 && g > 185 && b > 185 && Math.max(r, g, b) - Math.min(r, g, b) < 14;
  };
  const seen = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    const p = y * w + x;
    if (!seen[p] && bg(p * 4)) { seen[p] = 1; stack.push(p); }
  };
  for (let x = 0; x < w; x++) push(x, 0);
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const p = stack.pop();
    const x = p % w, y = (p - x) / w;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }
  // the checkerboard also shows through the bridge arch (not connected to the edge): key every neutral light pixel
  for (let p = 0; p < w * h; p++) if (seen[p] || bg(p * 4)) data[p * 4 + 3] = 0;
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function harden(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) data[i] = Math.max(0, Math.min(255, Math.round(((data[i] - 90) * 255) / 100)));
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function bounds(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let top = info.height, bottom = 0, left = info.width, right = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 40) { top = Math.min(top, y); bottom = Math.max(bottom, y); left = Math.min(left, x); right = Math.max(right, x); }
  }
  return { top, bottom, left, right, w: info.width, h: info.height };
}

const SPECS = {
  hero: { width: 1000, trim: "all" },
  workflow: { width: 1100, trim: "v" },
  arch: { width: 1100, trim: "v" },
  footer: { width: 1344, trim: "v" },
};

for (const theme of ["light", "dark"]) {
  for (const [name, spec] of Object.entries(SPECS)) {
    const src = name === "footer" ? await keyChecker(join(dir, `${theme}-footer.png`)) : join(dir, `cut-${theme}-${name}.png`);
    let buf = await harden(src);
    const b = await bounds(buf);
    const pad = 6;
    const region = spec.trim === "all"
      ? { left: Math.max(0, b.left - pad), top: Math.max(0, b.top - pad), width: Math.min(b.w, b.right + pad) - Math.max(0, b.left - pad), height: Math.min(b.h, b.bottom + pad) - Math.max(0, b.top - pad) }
      : { left: 0, top: Math.max(0, b.top - pad), width: b.w, height: Math.min(b.h, b.bottom + pad) - Math.max(0, b.top - pad) };
    const file = join(out, `${name}-${theme}.webp`);
    const info = await sharp(buf).extract(region).resize({ width: spec.width }).webp({ quality: 80, effort: 6, alphaQuality: 90 }).toFile(file);
    console.log(`${name}-${theme}.webp ${info.width}x${info.height} ${statSync(file).size}`);
  }
}
