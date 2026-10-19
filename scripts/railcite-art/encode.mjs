/**
 * TASK-268: encodes the Higgsfield masters for the RailCite paper case study into transparent WebP.
 *   node scripts/railcite-art/encode.mjs <masters-dir>
 * Expects <dir>/{light,dark}-hero.png (generated on plain white; the model ignores "transparent") and
 * <dir>/cut-{light,dark}-footer.png (Higgsfield image_background_remover output of the footer jobs; flood-keying white
 * left white gaps inside the garment rack and ate the white shirt).
 * The white is removed by flood-filling near-neutral light pixels from the image edges and converting them to alpha
 * (alpha = how far from white), so the soft contact shadows survive as semi-transparent ink instead of grey blotches.
 * Hero keeps its empty top band (the page lays the real screenshot card there); footer is trimmed vertically only.
 */
import sharp from "sharp";
import { join } from "node:path";
import { statSync } from "node:fs";

const dir = process.argv[2];
if (!dir) throw new Error("usage: encode.mjs <masters-dir>");
const out = join(process.cwd(), "public/media/case-studies/railcite/art");

async function keyWhite(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const lo = (i) => Math.min(data[i], data[i + 1], data[i + 2]);
  const isBg = (i) => lo(i) > 205 && Math.max(data[i], data[i + 1], data[i + 2]) - lo(i) < 16;
  // Label every connected region of near-white pixels; keep as background the ones that touch an edge and the
  // large enclosed ones (the gap inside the garment rack). Small enclosed highlights (a white shirt) stay opaque.
  const seen = new Uint8Array(w * h);
  const keep = new Uint8Array(w * h);
  for (let start = 0; start < w * h; start++) {
    if (seen[start] || !isBg(start * 4)) continue;
    const stack = [start]; const region = []; let edge = false;
    seen[start] = 1;
    while (stack.length) {
      const p = stack.pop(); region.push(p);
      const x = p % w, y = (p - x) / w;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge = true;
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const q = ny * w + nx;
        if (!seen[q] && isBg(q * 4)) { seen[q] = 1; stack.push(q); }
      }
    }
    if (edge || region.length >= 4000) for (const p of region) keep[p] = 1;
  }
  for (let p = 0; p < w * h; p++) {
    if (!keep[p]) continue;
    const i = p * 4;
    const a = Math.max(0, Math.min(255, Math.round(((247 - lo(i)) * 255) / 42)));
    data[i] = 28; data[i + 1] = 34; data[i + 2] = 52; data[i + 3] = a;
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function harden(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) data[i] = Math.max(0, Math.min(255, Math.round(((data[i] - 90) * 255) / 100)));
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function bounds(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let top = info.height, bottom = 0, left = info.width, right = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 120) { top = Math.min(top, y); bottom = Math.max(bottom, y); left = Math.min(left, x); right = Math.max(right, x); }
  }
  return { top, bottom, left, right, w: info.width, h: info.height };
}

const SPECS = { hero: { width: 900, headroom: 60 }, footer: { width: 1344 } };
for (const theme of ["light", "dark"]) {
  for (const [name, spec] of Object.entries(SPECS)) {
    const buf = name === "hero" ? await keyWhite(join(dir, `${theme}-hero.png`)) : await harden(join(dir, `cut-${theme}-footer.png`));
    const b = await bounds(buf);
    const pad = 6;
    const region = name === "hero"
      ? { left: Math.max(0, b.left - pad), top: spec.headroom, width: Math.min(b.w, b.right + pad) - Math.max(0, b.left - pad), height: Math.min(b.h, b.bottom + pad) - spec.headroom }
      : { left: 0, top: Math.max(0, b.top - pad), width: b.w, height: Math.min(b.h, b.bottom + pad) - Math.max(0, b.top - pad) };
    const file = join(out, `${name}-${theme}.webp`);
    const info = await sharp(buf).extract(region).resize({ width: spec.width }).webp({ quality: 72, effort: 6, alphaQuality: 90 }).toFile(file);
    console.log(`${name}-${theme}.webp ${info.width}x${info.height} ${statSync(file).size}`);
  }
}
