/**
 * TASK-283: encodes the Higgsfield masters for the Shravan's Round paper case study. No colour key, no alpha cutout.
 *   node scripts/shravans-round-art/encode.mjs <masters-dir>
 * Expects <dir>/{hero,urja-next}-{light,dark}-2k.png, painted on a flat background close to (not exactly) the surface they sit on.
 * Same method as scripts/nuptis-art/encode.mjs: the background is measured from each master's border, then every pixel shifts by
 * (target - measured) weighted by closeness to that background, so the field lands exactly on the surface colour while paper and
 * soft contact shadows keep their own tones. After encoding, the WebP is decoded and its border field is checked against the target
 * (lossy WebP can land one level off, which shows as a faint box).
 */
import sharp from "sharp";
import { join } from "node:path";
import { statSync } from "node:fs";

const dir = process.argv[2];
if (!dir) throw new Error("usage: encode.mjs <masters-dir>");
const out = join(process.cwd(), "public/media/case-studies/shravans-round/art");
// hero: --color-paper in each theme; urja-next: the .cs-next band colour in each theme (light = the cream tone #f7f0e7, TASK-279; dark = #172646)
const JOBS = [
  { name: "hero-light", src: "hero-light-2k.png", target: [0xf7, 0xf1, 0xe7] },
  { name: "hero-dark", src: "hero-dark-2k.png", target: [0x0b, 0x15, 0x30] },
  { name: "urja-next-light", src: "urja-next-light-2k.png", target: [0xf7, 0xf0, 0xe7] },
  { name: "urja-next-dark", src: "urja-next-dark-2k.png", target: [0x17, 0x26, 0x46] },
];
const WIDTH = { hero: 1400, "urja-next": 1200 };
// Near-lossless WebP keeps flat runs bit-exact (plain lossy goes through YUV and lands some colours 1-3 levels off, which shows as a box).
const WEBP = { nearLossless: true, quality: Number(process.env.NL_QUALITY ?? 20), effort: 6 };

const border = (data, w, h, fn) => {
  for (let x = 0; x < w; x += 4) for (let y = 0; y < 12; y++) { fn(x, y); fn(x, h - 1 - y); }
  for (let y = 0; y < h; y += 4) for (let x = 0; x < 12; x++) { fn(x, y); fn(w - 1 - x, y); }
};

for (const { name, src, target } of JOBS) {
  const meta = await sharp(join(dir, src)).metadata();
  // the hero scene sits in generous margin; trim it so the diorama fills the slot (the page mask still feathers what is left)
  const c = name.startsWith("hero") ? { l: 0.1, t: 0.1, r: 0.1, b: 0.08 } : { l: 0, t: 0, r: 0, b: 0 };
  const box = { left: Math.round(meta.width * c.l), top: Math.round(meta.height * c.t), width: Math.round(meta.width * (1 - c.l - c.r)), height: Math.round(meta.height * (1 - c.t - c.b)) };
  const { data, info } = await sharp(join(dir, src)).removeAlpha().extract(box).resize({ width: WIDTH[name.startsWith("hero") ? "hero" : "urja-next"], kernel: "lanczos3" }).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const bg = [0, 0, 0];
  let n = 0;
  border(data, w, h, (x, y) => { const i = (y * w + x) * 3; for (let c = 0; c < 3; c++) bg[c] += data[i + c]; n++; });
  for (let c = 0; c < 3; c++) bg[c] /= n;
  const delta = target.map((t, c) => t - bg[c]);
  const R0 = 26, R1 = 90; // full shift within R0 of the background, none beyond R1
  const file = join(out, `${name}.webp`);
  // Lossy WebP converts through YUV and can land the flat field 1 level off the colour it was given. So encode, decode, measure the
  // field, and nudge the colour the field is snapped to by the error; repeat until the decoded field equals the surface exactly.
  const snapTo = target;
  const px = Buffer.from(data);
  for (let p = 0; p < w * h; p++) {
    const i = p * 3;
    const d = Math.hypot(px[i] - bg[0], px[i + 1] - bg[1], px[i + 2] - bg[2]);
    const k = d <= R0 ? 1 : d >= R1 ? 0 : 1 - (d - R0) / (R1 - R0);
    const s = k * k * (3 - 2 * k);
    // grain in the flat field would survive lossy WebP as +-few levels: snap the near-background field to one exact colour
    const q = d <= 8 ? 1 : d >= 18 ? 0 : 1 - (d - 8) / 10;
    const snap = q * q * (3 - 2 * q);
    for (let c = 0; c < 3; c++) {
      const shifted = px[i + c] + delta[c] * s;
      px[i + c] = Math.max(0, Math.min(255, Math.round(shifted + (snapTo[c] - shifted) * snap)));
    }
  }
  const res = await sharp(px, { raw: { width: w, height: h, channels: 3 } }).webp(WEBP).toFile(file);
  // verify the decoded border field against the surface
  const dec = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const got = [0, 0, 0];
  let m = 0;
  let maxOff = 0;
  border(dec.data, dec.info.width, dec.info.height, (x, y) => { const i = (y * dec.info.width + x) * 3; for (let c = 0; c < 3; c++) { got[c] += dec.data[i + c]; maxOff = Math.max(maxOff, Math.abs(dec.data[i + c] - target[c])); } m++; });
  if (maxOff !== 0) throw new Error(`${name}: decoded field is not exactly the surface colour (max off ${maxOff})`);
  const mean = got.map((v) => (v / m).toFixed(2));
  console.log(`${name}.webp ${res.width}x${res.height} ${statSync(file).size}B bg=${bg.map(Math.round)} -> ${target} decoded border mean=${mean} maxOff=${maxOff}`);
}
