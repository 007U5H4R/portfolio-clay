/**
 * avatar.ts (TP4 / A7) — avatar export pipeline.
 *
 * Reads the alpha cutout `content/media/avatar/avatar-cutout.png` (1856×2304, already
 * background-removed by S4/D5 — `avatar-source.png` stays untouched) and writes four
 * derived assets to `public/avatar/`:
 *
 *   avatar.webp        long edge 1800, alpha preserved, quality ladder 82 → 78 → 74
 *                       until ≤300 kB (307200 bytes); exits 1 if still over at 74.
 *   avatar@2x.webp      long edge 2304 (source size, no upscale), quality 80, alpha preserved.
 *   avatar-poster.webp  flattened onto #FAF9FF (opaque), exactly 1200×1500, for OG/fallback.
 *   avatar-blur.txt     base64 data URL of a 16px-wide blurred placeholder (for
 *                       next/image `blurDataURL`).
 *
 * Usage: `pnpm media:avatar` (= `tsx scripts/avatar.ts`). Pass `--erode 1` to shrink the
 * alpha matte by 1px, on the two transparent outputs (avatar.webp, avatar@2x.webp), before
 * encoding — a fix for a visible light-fringe halo found at the S02.02 edge-inspection gate
 * (re-run with this flag, don't hand-edit the PNG). Erosion is applied *after* resize, at each
 * output's own resolution, by rewriting the alpha byte of a raw interleaved RGBA buffer in
 * place (sharp's `joinChannel` operator does not reliably survive re-encoding to WebP/PNG in
 * this sharp version — it reports `hasAlpha: true` in `metadata()` but silently drops the
 * channel on write; a single raw RGBA buffer ingested directly does not have that problem).
 */
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

type SharpInstance = ReturnType<typeof sharp>;

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const SOURCE = resolve(ROOT, "content/media/avatar/avatar-cutout.png");
const OUT_DIR = resolve(ROOT, "public/avatar");

const LONG_EDGE = 1800;
const LONG_EDGE_2X = 2304;
const POSTER_WIDTH = 1200;
const POSTER_HEIGHT = 1500;
const POSTER_BG = "#FAF9FF";
const MAX_BYTES = 307200; // 300 kB
const QUALITY_LADDER = [82, 78, 74];
const BLUR_WIDTH = 16;

const erodePx = (() => {
  const flagIndex = process.argv.indexOf("--erode");
  if (flagIndex === -1) return 0;
  const value = Number(process.argv[flagIndex + 1]);
  if (!Number.isFinite(value) || value < 0) {
    console.error(`avatar.ts: --erode expects a non-negative number, got ${process.argv[flagIndex + 1]}`);
    process.exit(1);
  }
  return value;
})();

/**
 * Resizes to `width`×`height` (fit: inside, no enlargement), then — if `px` > 0 — shrinks the
 * resulting alpha channel by `px` pixels (morphological erosion) and writes it back into a raw
 * RGBA buffer, pulling the opaque edge in from a light fringe halo without touching the RGB
 * colour bands. Erosion runs after resize, at each output's own final pixel dimensions.
 */
async function resizeAndErode(
  source: SharpInstance,
  width: number,
  height: number,
  px: number,
): Promise<SharpInstance> {
  const resizedPng = await source
    .clone()
    .resize({ width, height, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
  const resized = sharp(resizedPng);
  if (px <= 0) return resized;

  const { data: rgba, info } = await resized.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data: erodedAlpha } = await resized
    .clone()
    .ensureAlpha()
    .extractChannel("alpha")
    .erode(px)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const combined = Buffer.from(rgba);
  const pixelCount = info.width * info.height;
  for (let i = 0; i < pixelCount; i += 1) {
    combined[i * 4 + 3] = erodedAlpha[i]!;
  }

  return sharp(combined, { raw: { width: info.width, height: info.height, channels: 4 } });
}

async function bytesOf(path: string): Promise<number> {
  return statSync(path).size;
}

async function writeMain(source: SharpInstance): Promise<{ path: string; bytes: number; quality: number }> {
  const outPath = resolve(OUT_DIR, "avatar.webp");
  const prepared = await resizeAndErode(source, LONG_EDGE, LONG_EDGE, erodePx);

  let lastBytes = Infinity;
  let usedQuality = QUALITY_LADDER[QUALITY_LADDER.length - 1]!;

  for (const quality of QUALITY_LADDER) {
    await prepared.clone().webp({ quality, alphaQuality: 90, effort: 6 }).toFile(outPath);

    lastBytes = await bytesOf(outPath);
    usedQuality = quality;
    if (lastBytes <= MAX_BYTES) break;
    console.log(`avatar.ts: avatar.webp at quality ${quality} is ${lastBytes} bytes (> ${MAX_BYTES}), stepping down`);
  }

  if (lastBytes > MAX_BYTES) {
    console.error(
      `avatar.ts: avatar.webp is ${lastBytes} bytes after the full quality ladder (${QUALITY_LADDER.join(" → ")}), still over the ${MAX_BYTES} byte target.`,
    );
    process.exit(1);
  }

  return { path: outPath, bytes: lastBytes, quality: usedQuality };
}

async function write2x(source: SharpInstance): Promise<{ path: string; bytes: number }> {
  const outPath = resolve(OUT_DIR, "avatar@2x.webp");
  const prepared = await resizeAndErode(source, LONG_EDGE_2X, LONG_EDGE_2X, erodePx);
  await prepared.webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(outPath);
  return { path: outPath, bytes: await bytesOf(outPath) };
}

async function writePoster(source: SharpInstance): Promise<{ path: string; bytes: number }> {
  const outPath = resolve(OUT_DIR, "avatar-poster.webp");
  await source
    .clone()
    .resize({ width: POSTER_WIDTH, height: POSTER_HEIGHT, fit: "cover", position: sharp.strategy.attention })
    .flatten({ background: POSTER_BG })
    .webp({ quality: 82, effort: 6 })
    .toFile(outPath);
  return { path: outPath, bytes: await bytesOf(outPath) };
}

async function writeBlur(source: SharpInstance): Promise<{ path: string; bytes: number }> {
  const outPath = resolve(OUT_DIR, "avatar-blur.txt");
  const buffer = await source.clone().resize({ width: BLUR_WIDTH }).blur(2).webp({ quality: 40 }).toBuffer();
  const dataUrl = `data:image/webp;base64,${buffer.toString("base64")}`;
  writeFileSync(outPath, dataUrl);
  return { path: outPath, bytes: await bytesOf(outPath) };
}

async function main(): Promise<void> {
  if (!existsSync(SOURCE)) {
    console.error(`avatar.ts: source cutout not found at ${SOURCE}`);
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const base = sharp(SOURCE);
  const metadata = await base.metadata();
  if (!metadata.hasAlpha) {
    console.error(`avatar.ts: ${SOURCE} has no alpha channel — cannot export a transparent avatar.`);
    process.exit(1);
  }

  if (erodePx > 0) {
    console.log(`avatar.ts: eroding alpha matte by ${erodePx}px on avatar.webp / avatar@2x.webp`);
  }

  const main = await writeMain(base);
  const twoX = await write2x(base);
  const poster = await writePoster(base);
  const blur = await writeBlur(base);

  for (const result of [main, twoX, poster, blur]) {
    console.log(`${result.path} — ${result.bytes} bytes`);
  }

  const finalMeta = await sharp(main.path).metadata();
  console.log(
    `avatar.ts: avatar.webp final quality ${main.quality}, ${finalMeta.width}×${finalMeta.height}, hasAlpha=${finalMeta.hasAlpha}`,
  );
}

main().catch((err) => {
  console.error("avatar.ts: failed", err);
  process.exit(1);
});
