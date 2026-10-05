import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { site } from "@/lib/site";

/**
 * `OgCard` — the one `ImageResponse` template every page family's `opengraph-image.tsx` calls
 * (technical-plan.md §A8), re-skinned in the paper style per Design.md §9 / decision D11 (TKT-78).
 *
 * Satori (the renderer behind `ImageResponse`) cannot read this app's oklch CSS custom properties
 * or variable fonts and only sniffs PNG/JPEG image data, so:
 *   - colours are a hex copy of the 13 paper tokens (Design.md §2.1 is authoritative);
 *   - fonts are static OFL TTFs in `assets/fonts/` (licences in `assets/fonts/OFL.txt`);
 *   - the hero poster WebP is re-encoded to PNG via `sharp` before embedding.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

/**
 * EVAL-020 allow-list: the only module holding colour literals (besides the token source
 * `app/globals.css`). Exactly the 13 paper hexes from Design.md §2.1 — nothing else; any tint is
 * derived from these via `withAlpha`. `tests/unit/og.test.ts` pins this set.
 */
const HEX = {
  paper: "#F7F1E7",
  ivory: "#FBF7EF",
  paper2: "#EFE7D8",
  navy: "#0D1735",
  navy2: "#2E3854",
  inkSoft: "#5A6178",
  rust: "#B64927",
  terracotta: "#92381F",
  forest: "#214F43",
  green2: "#496D58",
  steel: "#63799E",
  note: "#EEDCA9",
  kraft: "#D7BE93",
} as const;

function withAlpha(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** `ImageResponse`'s Satori/opentype font parser wants a real `ArrayBuffer`, not a Node `Buffer`
 * view over Node's shared pool — passing the `Buffer` itself intermittently throws deep inside
 * the parser ("… is not iterable") because it may be a view over a larger, unrelated buffer. */
function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

/** The four static TTFs the card uses (Design.md §9 → Fonts). Exported so the unit test can assert
 * the files exist on disk and no other font is referenced. */
export const OG_FONT_FILES = {
  fraunces500: "Fraunces_144pt-Medium.ttf",
  inter400: "Inter-Regular.ttf",
  inter600: "Inter-SemiBold.ttf",
  caveat400: "Caveat-Regular.ttf",
} as const;

type FontKey = keyof typeof OG_FONT_FILES;

let fontsPromise: Promise<Record<FontKey, ArrayBuffer>> | null = null;
function loadFonts() {
  fontsPromise ??= (async () => {
    const dir = join(process.cwd(), "assets/fonts");
    const keys = Object.keys(OG_FONT_FILES) as FontKey[];
    const bufs = await Promise.all(keys.map((k) => readFile(join(dir, OG_FONT_FILES[k]))));
    return Object.fromEntries(keys.map((k, i) => [k, toArrayBuffer(bufs[i]!)])) as Record<
      FontKey,
      ArrayBuffer
    >;
  })();
  return fontsPromise;
}

/** Hero poster (the tighter crop of the hero scene — the figure stays legible at thumbnail size,
 * where the wide banner shrinks him to a speck), framed in ivory at 520 px and tilted −1.5°. */
export const OG_POSTER_PATH = "public/media/illustrations/hero-poster.webp";
const FRAME = 12;
const POSTER_WIDTH = 520 - 2 * FRAME; // the framed poster is 520 px wide (Design.md §9)
const POSTER_HEIGHT = Math.round((POSTER_WIDTH * 684) / 1280); // source is 1280x684
const POSTER_TILT = -1.5;
const FRAMED_W = POSTER_WIDTH + 2 * FRAME;
const FRAMED_H = POSTER_HEIGHT + 2 * FRAME;
function rgb(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, alpha: 1 };
}

let posterPromise: Promise<{ src: string; width: number; height: number }> | null = null;
function loadPoster() {
  // Satori's image loader throws ("… is not iterable") on WebP — it only sniffs PNG/JPEG/GIF
  // headers — so the poster is re-encoded to PNG. The ivory frame and the −1.5° tilt are baked in
  // here, then quantised: letting Satori rotate it resamples every pixel at render time and roughly
  // doubles the card's PNG weight (≈ 325 kB, over the 300 kB budget); pre-tilted + palette ≈ half.
  posterPromise ??= (async () => {
    const webp = await readFile(join(process.cwd(), OG_POSTER_PATH));
    const framed = await sharp(webp)
      .resize(POSTER_WIDTH, POSTER_HEIGHT, { fit: "cover" })
      .extend({ top: FRAME, bottom: FRAME, left: FRAME, right: FRAME, background: rgb(HEX.ivory) })
      .png()
      .toBuffer();
    const { data, info } = await sharp(framed)
      .rotate(POSTER_TILT, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, palette: true, colours: 64, dither: 0 })
      .toBuffer({ resolveWithObject: true });
    return {
      src: `data:image/png;base64,${data.toString("base64")}`,
      width: info.width,
      height: info.height,
    };
  })();
  return posterPromise;
}

/** Title size steps down as the string grows (72 → 56 → 44, Design.md §9), so a long project
 * tagline or headline still fits the fixed canvas without Satori clipping it. */
function titleFontSize(title: string): number {
  if (title.length <= 20) return 72;
  if (title.length <= 40) return 56;
  return 44;
}

/** Deterministic torn-paper top edge for the bottom strip (Satori renders inline SVG paths). */
function tornStripPath(width: number, height: number): string {
  const teeth = [2, 4, 1, 3, 2, 5, 1, 3, 0, 4, 2, 1, 5, 0, 3, 1, 4, 2];
  const step = width / 60;
  let d = `M0 ${height} L0 ${teeth[0]}`;
  for (let i = 1; i <= 60; i++) d += ` L${(i * step).toFixed(1)} ${teeth[i % teeth.length]}`;
  return `${d} L${width} ${height} Z`;
}

export interface OgCardProps {
  /** Uppercase eyebrow above the title (e.g. "Case study", "Selected Work"). */
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Hand-written Caveat caption, bottom-right — one per page family (Design.md §9). */
  caption: string;
  /** Optional status pill under the subtitle (case studies: the project's `statusLabel`). */
  badge?: string;
  /** Home + case-study families: embed the hero poster at the right. */
  poster?: boolean;
}

/** Renders one 1200x630 OG/Twitter card PNG. Every `app/**\/opengraph-image.tsx` default export
 * is a one-line call into this. */
export async function renderOgCard({ eyebrow, title, subtitle, caption, badge, poster }: OgCardProps) {
  const [fonts, posterImg] = await Promise.all([
    loadFonts(),
    poster ? loadPoster() : Promise.resolve(null),
  ]);
  const W = OG_SIZE.width;
  const STRIP_H = 8;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: HEX.paper,
          fontFamily: "Inter",
          overflow: "hidden",
        }}
      >
        {/* Text block (left, 64 px padding), centred in the band above the footer. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "absolute",
            left: "64px",
            top: "48px",
            bottom: "104px",
            width: posterImg ? "540px" : "1040px",
          }}
        >
         <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          {/* Tape scrap at the block's top-left corner (−4°). */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              left: "-28px",
              top: "-44px",
              width: "120px",
              height: "30px",
              backgroundColor: withAlpha(HEX.kraft, 0.55),
              border: `1px solid ${withAlpha(HEX.terracotta, 0.08)}`,
              transform: "rotate(-4deg)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              fontSize: "24px",
              lineHeight: 1.3,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: HEX.navy2,
              marginBottom: "22px",
            }}
          >
            <span style={{ color: HEX.rust, fontSize: "40px", lineHeight: "31px", marginRight: "12px" }}>·</span>
            <span style={{ display: "flex" }}>{eyebrow}</span>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontSize: `${titleFontSize(title)}px`,
              fontWeight: 500,
              lineHeight: 1.08,
              color: HEX.navy,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "28px",
              fontWeight: 400,
              lineHeight: 1.4,
              color: HEX.navy2,
              marginTop: "24px",
            }}
          >
            {subtitle}
          </div>
          {badge ? (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                marginTop: "28px",
                borderRadius: "999px",
                padding: "10px 24px",
                fontSize: "22px",
                fontWeight: 600,
                color: HEX.navy,
                backgroundColor: HEX.ivory,
                border: `2px solid ${HEX.steel}`,
              }}
            >
              {badge}
            </div>
          ) : null}
         </div>
        </div>

        {posterImg ? (
          <div
            style={{
              display: "flex",
              position: "absolute",
              right: "44px",
              top: "120px",
              width: `${posterImg.width}px`,
              height: `${posterImg.height}px`,
            }}
          >
            {/* Flat offset shadow under the tilted frame (a flat fill is cheap for Satori to rotate). */}
            <div
              style={{
                display: "flex",
                position: "absolute",
                left: `${(posterImg.width - FRAMED_W) / 2 + 6}px`,
                top: `${(posterImg.height - FRAMED_H) / 2 + 8}px`,
                width: `${FRAMED_W}px`,
                height: `${FRAMED_H}px`,
                backgroundColor: withAlpha(HEX.navy, 0.1),
                transform: `rotate(${POSTER_TILT}deg)`,
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders raw <img>, not next/image. */}
            <img
              src={posterImg.src}
              alt=""
              width={posterImg.width}
              height={posterImg.height}
              style={{ position: "absolute", left: 0, top: 0 }}
            />
          </div>
        ) : null}

        {/* Footer: name bottom-left, hand caption bottom-right. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: "64px",
            bottom: "52px",
            fontSize: "22px",
            fontWeight: 600,
            color: HEX.navy2,
          }}
        >
          {site.name}
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: "64px",
            bottom: "44px",
            fontFamily: "Caveat",
            fontSize: "30px",
            color: HEX.inkSoft,
          }}
        >
          {caption}
        </div>

        {/* Faint terracotta torn strip along the bottom edge. */}
        <svg
          width={W}
          height={STRIP_H}
          viewBox={`0 0 ${W} ${STRIP_H}`}
          style={{ position: "absolute", left: 0, bottom: 0 }}
        >
          <path d={tornStripPath(W, STRIP_H)} fill={withAlpha(HEX.terracotta, 0.75)} />
        </svg>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Fraunces", data: fonts.fraunces500, weight: 500, style: "normal" },
        { name: "Inter", data: fonts.inter400, weight: 400, style: "normal" },
        { name: "Inter", data: fonts.inter600, weight: 600, style: "normal" },
        { name: "Caveat", data: fonts.caveat400, weight: 400, style: "normal" },
      ],
    },
  );
}
