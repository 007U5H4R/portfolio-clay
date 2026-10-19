/**
 * TASK-273: encodes the cut-out Velora art into transparent WebP.
 *   node scripts/velora-art/encode.mjs <matted-dir>
 * Expects RGBA PNGs with a REAL alpha channel in <matted-dir> (kept at /Volumes/E Drive/Dev/.scratch/velora-redesign/masters-matted/):
 *   {light,dark}-hero.png, {light,dark}-footer.png, objects.png (2x2 sheet).
 * How those files are produced - there is no colour keying anywhere in this pipeline:
 *   - objects.png: Higgsfield upscale_image (2k) of the white master, then remove_background (clean on the small, isolated objects).
 *   - {light,dark}-hero.png, {light,dark}-footer.png: Higgsfield generate_image (gpt_image_2_5, background "transparent", the original
 *     white master as the only reference; heroes 2k, footers 4k) - native alpha. remove_background was tried on the scenes and left
 *     cloudy semi-opaque patches where the white table / aisle / desk met cream paper and warm lamp glow, so the scenes were re-cut instead.
 * The hero's blank device screen is detected and its rectangle written to <out>/hero-screen.json (percent of the encoded image) so the
 * page composites the REAL screenshot in HTML/CSS. The footers are cropped tight; footer-fit.json records the left offset (fraction of
 * the band) where each crop sits so the layout stays where the old art was.
 */
import sharp from "sharp";
import { join } from "node:path";
import { statSync, writeFileSync } from "node:fs";

const dir = process.argv[2];
if (!dir) throw new Error("usage: encode.mjs <matted-dir>");
const out = join(process.cwd(), "public/media/case-studies/velora/art");

const WEBP = { quality: 76, effort: 6, alphaQuality: 92, smartSubsample: true };
const pad = 4;

async function raw(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}
const png = (data, w, h) => sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();

/** Edge colour clean-up for a remove_background matte: un-mix the white that bled into semi-transparent pixels, and choke the matte a hair. */
async function defringe(file) {
  const { data, w, h } = await raw(file);
  for (let i = 0; i < w * h * 4; i += 4) {
    const a = data[i + 3];
    if (a === 0 || a === 255) continue;
    const k = a / 255;
    for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round((data[i + c] - 255 * (1 - k)) / k)));
    data[i + 3] = Math.max(0, Math.min(255, Math.round(((a - 18) * 255) / (255 - 36))));
  }
  return png(data, w, h);
}

async function bounds(input) {
  const { data, w, h } = await raw(input);
  let top = h, bottom = 0, left = w, right = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (data[(y * w + x) * 4 + 3] > 40) { top = Math.min(top, y); bottom = Math.max(bottom, y); left = Math.min(left, x); right = Math.max(right, x); }
  }
  return { top, bottom, left, right, w, h };
}
function region(b) {
  const left = Math.max(0, b.left - pad), top = Math.max(0, b.top - pad);
  return { left, top, width: Math.min(b.w, b.right + 1 + pad) - left, height: Math.min(b.h, b.bottom + 1 + pad) - top };
}

/**
 * The blank screen: flood-fill the flat light-grey, low-chroma region around the middle of the artwork (on the image flattened onto
 * white), then take the MEDIAN left/right edge over the middle rows and top/bottom edge over the middle columns, so a stray leak
 * through an anti-aliased bezel corner can't widen the rectangle. The result is slightly OUTSET so no flat-grey sliver of the blank screen shows around the screenshot.
 */
async function findScreen(buf) {
  const { data, info } = await sharp(buf).flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  const lumAt = (x, y) => { const i = (y * w + x) * ch; return (data[i] + data[i + 1] + data[i + 2]) / 3; };
  const chroma = (x, y) => { const i = (y * w + x) * ch; return Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]); };
  let seed = null;
  for (let y = Math.round(h * 0.4); y < h * 0.6 && !seed; y += 8) for (let x = Math.round(w * 0.45); x < w * 0.8 && !seed; x += 8) {
    const l = lumAt(x, y);
    if (l > 170 && l < 235 && chroma(x, y) < 12) seed = { x, y, l };
  }
  if (!seed) throw new Error("screen not found");
  const isScreen = (x, y) => Math.abs(lumAt(x, y) - seed.l) < 14 && chroma(x, y) < 14;
  const seen = new Uint8Array(w * h);
  const stack = [seed.y * w + seed.x]; seen[stack[0]] = 1;
  const inRegion = new Uint8Array(w * h);
  let n = 0;
  while (stack.length) {
    const p = stack.pop(); inRegion[p] = 1; n++;
    const px = p % w, py = (p - px) / w;
    for (const [nx, ny] of [[px - 1, py], [px + 1, py], [px, py - 1], [px, py + 1]]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const q = ny * w + nx;
      if (!seen[q] && isScreen(nx, ny)) { seen[q] = 1; stack.push(q); }
    }
  }
  if (n < 20000) throw new Error("screen region too small");
  let rows = [], cols = [];
  for (let y = 0; y < h; y++) { let l = -1, r = -1; for (let x = 0; x < w; x++) if (inRegion[y * w + x]) { if (l < 0) l = x; r = x; } if (l >= 0 && r - l > 60) rows.push({ y, l, r }); }
  for (let x = 0; x < w; x++) { let t = -1, b = -1; for (let y = 0; y < h; y++) if (inRegion[y * w + x]) { if (t < 0) t = y; b = y; } if (t >= 0 && b - t > 60) cols.push({ x, t, b }); }
  const median = (a) => a.sort((u, v) => u - v)[Math.floor(a.length / 2)];
  const mid = (arr) => arr.slice(Math.floor(arr.length * 0.2), Math.ceil(arr.length * 0.8));
  // tilt of the screen (dx/dy of its vertical edges), from a least-squares fit of the row midpoints
  const m = mid(rows); const my = m.reduce((a, q) => a + q.y, 0) / m.length; const mx = m.reduce((a, q) => a + (q.l + q.r) / 2, 0) / m.length;
  const slope = m.reduce((a, q) => a + (q.y - my) * ((q.l + q.r) / 2 - mx), 0) / m.reduce((a, q) => a + (q.y - my) ** 2, 0);
  const inset = -1; // grow by a hair so the screenshot overlaps the anti-aliased bezel edge (the bezel is opaque art, the screenshot is clipped to the rect)
  return {
    slope,
    l: median(mid(rows).map((q) => q.l)) + inset, r: median(mid(rows).map((q) => q.r)) - inset,
    t: median(mid(cols).map((q) => q.t)) + inset, b: median(mid(cols).map((q) => q.b)) - inset,
  };
}

const screens = {};
const fits = {};
const sizes = [];
function report(file, info) { const size = statSync(file).size; sizes.push(size); console.log(`${file.split("/").pop()} ${info.width}x${info.height} ${size}`); }

for (const theme of ["light", "dark"]) {
  // hero: crop to the artwork, native resolution up to 1400px wide (it renders at <= 680 css px, so 2x)
  const hero = join(dir, `${theme}-hero.png`);
  const hr = region(await bounds(hero));
  let cropped = await sharp(hero).extract(hr).png().toBuffer();
  let hrr = hr;
  // generated devices sit a degree or two off-vertical: straighten the art so the screen is an axis-aligned rectangle the real screenshot can fill
  const angle = (Math.atan((await findScreen(cropped)).slope) * 180) / Math.PI;
  if (Math.abs(angle) > 0.15) {
    const rotated = await sharp(cropped).rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    hrr = region(await bounds(rotated));
    cropped = await sharp(rotated).extract(hrr).png().toBuffer();
  }
  console.log(`  ${theme} hero straightened by ${angle.toFixed(2)} deg`);
  const scr = await findScreen(cropped);
  const width = Math.min(hrr.width, 1400);
  const s = width / hrr.width;
  const heroFile = join(out, `hero-${theme}.webp`);
  const hi = await sharp(cropped).resize({ width }).webp(WEBP).toFile(heroFile);
  screens[theme] = {
    left: +(((scr.l * s) / hi.width) * 100).toFixed(2),
    top: +(((scr.t * s) / hi.height) * 100).toFixed(2),
    width: +((((scr.r - scr.l + 1) * s) / hi.width) * 100).toFixed(2),
    height: +((((scr.b - scr.t + 1) * s) / hi.height) * 100).toFixed(2),
    w: hi.width, h: hi.height,
  };
  report(heroFile, hi);
  console.log("  screen", screens[theme]);

  // footer: tight crop, positioned where the original art sat (x0 = left offset as a fraction of the band)
  const foot = join(dir, `${theme}-footer.png`);
  const fr = region(await bounds(foot));
  const ff = join(out, `footer-${theme}.webp`);
  const fi = await sharp(foot).extract(fr).resize({ width: Math.min(fr.width, 2600) }).webp(WEBP).toFile(ff);
  fits[theme] = { x0: theme === "light" ? 0.362 : 0.333, w: fi.width, h: fi.height };
  report(ff, fi);
}
writeFileSync(join(out, "hero-screen.json"), JSON.stringify(screens, null, 2) + "\n");
writeFileSync(join(out, "footer-fit.json"), JSON.stringify(fits, null, 2) + "\n");

// objects: 2x2 sheet, one theme-neutral set (defringed so they sit on both the cream and the night page)
const sheetBuf = await defringe(join(dir, "objects.png"));
const sheet = await raw(sheetBuf);
for (const [i, name] of ["referral", "directory", "tag", "lens"].entries()) {
  const x0 = (i % 2) * (sheet.w / 2), y0 = Math.floor(i / 2) * (sheet.h / 2);
  const q = await sharp(sheetBuf).extract({ left: Math.round(x0), top: Math.round(y0), width: Math.round(sheet.w / 2), height: Math.round(sheet.h / 2) }).png().toBuffer();
  const r = region(await bounds(q));
  const file = join(out, `obj-${name}.webp`);
  const info = await sharp(q).extract(r).resize({ width: Math.min(r.width, 340) }).webp(WEBP).toFile(file);
  report(file, info);
}
console.log("total bytes", sizes.reduce((a, b) => a + b, 0));
