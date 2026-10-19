/**
 * TASK-273: encodes the Higgsfield masters for the Velora paper case study into transparent WebP.
 *   node scripts/velora-art/encode.mjs <masters-dir>
 * Expects <dir>/{light,dark}-hero.png, <dir>/objects.png (2x2 sheet) and <dir>/{light,dark}-footer.png, all generated on plain white.
 * White is removed the same way as scripts/railcite-art/encode.mjs (edge-connected + large enclosed near-white regions become alpha,
 * soft contact shadows survive as translucent ink). The hero's blank device screen is detected, kept opaque, and its rectangle is
 * written to <out>/hero-screen.json (percent of the encoded image) so the page composites the REAL screenshot in HTML/CSS.
 */
import sharp from "sharp";
import { join } from "node:path";
import { statSync, writeFileSync } from "node:fs";

const dir = process.argv[2];
if (!dir) throw new Error("usage: encode.mjs <masters-dir>");
const out = join(process.cwd(), "public/media/case-studies/velora/art");

async function raw(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}
const png = (data, w, h) => sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();

/** The blank screen: grow from the image-centre-right pixel of the device while the pixel stays light grey. */
function findScreen({ data, w, h }) {
  const lum = (x, y) => { const i = (y * w + x) * 4; return (data[i] + data[i + 1] + data[i + 2]) / 3; };
  // seed: the first light-grey pixel that follows a dark bezel run and is itself at least 150px wide
  let seed = null;
  const y0 = Math.round(h * 0.45);
  for (let x = Math.round(w * 0.4); x < w * 0.9 && !seed; x++) {
    if (lum(x, y0) < 60 && lum(x + 1, y0) < 60) {
      let k = x; while (k < w - 1 && lum(k, y0) < 90) k++;
      let m = k; while (m < w - 1 && lum(m, y0) > 185 && lum(m, y0) < 238) m++;
      if (m - k > 150) seed = [k + 4, y0]; else x = m;
    }
  }
  if (!seed) throw new Error("screen not found");
  const [sx, sy] = seed;
  const ok = (x, y) => lum(x, y) > 185;
  let l = sx, r = sx, t = sy, b = sy;
  while (ok(l - 1, sy)) l--; while (ok(r + 1, sy)) r++;
  const cx = Math.round((l + r) / 2);
  while (ok(cx, t - 1)) t--; while (ok(cx, b + 1)) b++;
  return { l, r, t, b };
}

async function keyWhite({ data, w, h }, protect) {
  const lo = (i) => Math.min(data[i], data[i + 1], data[i + 2]);
  const isBg = (i) => { const c = Math.max(data[i], data[i + 1], data[i + 2]) - lo(i); return (lo(i) > 205 && c < 16) || (lo(i) > 226 && c < 44); };
  const seen = new Uint8Array(w * h);
  const keep = new Uint8Array(w * h);
  const inProtect = (p) => { if (!protect) return false; const x = p % w, y = (p - x) / w; return x >= protect.l - 6 && x <= protect.r + 6 && y >= protect.t - 6 && y <= protect.b + 6; };
  for (let start = 0; start < w * h; start++) {
    if (seen[start] || !isBg(start * 4) || inProtect(start)) continue;
    const stack = [start]; const region = []; let edge = false;
    seen[start] = 1;
    while (stack.length) {
      const p = stack.pop(); region.push(p);
      const x = p % w, y = (p - x) / w;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge = true;
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const q = ny * w + nx;
        if (!seen[q] && isBg(q * 4) && !inProtect(q)) { seen[q] = 1; stack.push(q); }
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
  return png(data, w, h);
}

async function bounds(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let top = info.height, bottom = 0, left = info.width, right = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 120) { top = Math.min(top, y); bottom = Math.max(bottom, y); left = Math.min(left, x); right = Math.max(right, x); }
  }
  return { top, bottom, left, right, w: info.width, h: info.height };
}

const webp = (s, file, width) => s.resize({ width }).webp({ quality: 74, effort: 6, alphaQuality: 90 }).toFile(file);
const pad = 6;
const screens = {};

for (const theme of ["light", "dark"]) {
  // hero
  const img = await raw(join(dir, `${theme}-hero.png`));
  const screen = findScreen(img);
  const buf = await keyWhite(img, screen);
  const b = await bounds(buf);
  const region = { left: Math.max(0, b.left - pad), top: Math.max(0, b.top - pad), width: Math.min(b.w, b.right + pad) - Math.max(0, b.left - pad), height: Math.min(b.h, b.bottom + pad) - Math.max(0, b.top - pad) };
  const width = 900;
  const s = width / region.width;
  const file = join(out, `hero-${theme}.webp`);
  const info = await webp(sharp(buf).extract(region), file, width).then((i) => i);
  screens[theme] = {
    left: +(((screen.l - region.left) / region.width) * 100).toFixed(2),
    top: +(((screen.t - region.top) / info.height / (1 / s)) * 100 * (1)).toFixed(2),
    width: +(((screen.r - screen.l + 1) / region.width) * 100).toFixed(2),
    height: +((((screen.b - screen.t + 1) * s) / info.height) * 100).toFixed(2),
    w: info.width, h: info.height,
  };
  // fix top: recompute cleanly
  screens[theme].top = +((((screen.t - region.top) * s) / info.height) * 100).toFixed(2);
  console.log(`hero-${theme}.webp ${info.width}x${info.height} ${statSync(file).size}`, screens[theme]);

  // footer
  const f = await keyWhite(await raw(join(dir, `${theme}-footer.png`)), null);
  const fb = await bounds(f);
  const fr = { left: 0, top: Math.max(0, fb.top - pad), width: fb.w, height: Math.min(fb.h, fb.bottom + pad) - Math.max(0, fb.top - pad) };
  const ff = join(out, `footer-${theme}.webp`);
  const fi = await webp(sharp(f).extract(fr), ff, 1344);
  console.log(`footer-${theme}.webp ${fi.width}x${fi.height} ${statSync(ff).size}`);
}
writeFileSync(join(out, "hero-screen.json"), JSON.stringify(screens, null, 2) + "\n");

// objects: 2x2 sheet, one theme-neutral set
const sheet = await raw(join(dir, "objects.png"));
const keyed = await keyWhite(sheet, null);
const names = ["referral", "directory", "tag", "lens"];
for (const [i, name] of names.entries()) {
  const x0 = (i % 2) * (sheet.w / 2), y0 = Math.floor(i / 2) * (sheet.h / 2);
  const q = await sharp(keyed).extract({ left: Math.round(x0), top: Math.round(y0), width: Math.round(sheet.w / 2), height: Math.round(sheet.h / 2) }).png().toBuffer();
  const b = await bounds(q);
  const r = { left: Math.max(0, b.left - pad), top: Math.max(0, b.top - pad), width: Math.min(b.w, b.right + pad) - Math.max(0, b.left - pad), height: Math.min(b.h, b.bottom + pad) - Math.max(0, b.top - pad) };
  const file = join(out, `obj-${name}.webp`);
  const info = await webp(sharp(q).extract(r), file, 220);
  console.log(`obj-${name}.webp ${info.width}x${info.height} ${statSync(file).size}`);
}
