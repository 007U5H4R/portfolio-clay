import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import type { Tone } from "@/components/clay/tiers";
import { site } from "@/lib/site";

/**
 * `OgCard` — the one `ImageResponse` template every page family's `opengraph-image.tsx` calls
 * (technical-plan.md §A8). Satori (the renderer behind `ImageResponse`) cannot read this app's
 * oklch CSS custom properties, so the palette here is a hard-coded hex copy of DESIGN_DIRECTION.md
 * §2 — the authoritative source if the two ever drift. Manrope Bold/ExtraBold are loaded once
 * (module-level cache) from the OFL-licensed static TTFs in `assets/fonts/` (S06.02); the home
 * avatar poster is embedded as a base64 data URL for the same reason (`ImageResponse` cannot
 * resolve a `next/image`-optimised `/avatar/*` URL at build time).
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

const HEX = {
  bg: "#FAF9FF",
  ink: "#101646",
  ink2: "#3D4270",
  ink3: "#6B6F94",
} as const;

/** DESIGN_DIRECTION.md §2 tone hexes — same seven tones `components/clay/tiers.ts` exposes to the app. */
const TONE_HEX: Record<Tone, string> = {
  neutral: "#F4F2FF",
  lavender: "#BFA8FF",
  sky: "#A8D7FF",
  mint: "#A5EBD2",
  blush: "#FFB4C6",
  peach: "#FFD2B2",
  butter: "#FFE389",
};

function withAlpha(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** `ImageResponse`'s Satori/opentype font parser wants a real `ArrayBuffer`, not a Node `Buffer`
 * view over Node's shared pool — passing the `Buffer` itself intermittently throws deep inside
 * the parser ("… is not iterable") because it may be a view over a larger, unrelated buffer. */
function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

let fontsPromise: Promise<{ bold: ArrayBuffer; extraBold: ArrayBuffer }> | null = null;
function loadFonts() {
  fontsPromise ??= (async () => {
    const dir = join(process.cwd(), "assets/fonts");
    const [bold, extraBold] = await Promise.all([
      readFile(join(dir, "Manrope-Bold.ttf")),
      readFile(join(dir, "Manrope-ExtraBold.ttf")),
    ]);
    return { bold: toArrayBuffer(bold), extraBold: toArrayBuffer(extraBold) };
  })();
  return fontsPromise;
}

let avatarPromise: Promise<string> | null = null;
function loadAvatarDataUrl() {
  // Satori's image loader (bundled inside `next/og`'s ImageResponse) throws ("… is not iterable")
  // on WebP source data — it only sniffs PNG/JPEG/GIF headers for intrinsic size — so the poster
  // is re-encoded to PNG once (via `sharp`, already a project dependency) before embedding.
  avatarPromise ??= (async () => {
    const webp = await readFile(join(process.cwd(), "public/avatar/avatar-poster.webp"));
    const png = await sharp(webp).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  })();
  return avatarPromise;
}

/** Title size steps down as the string grows, so a long project tagline or headline still fits
 * inside the fixed 1200x630 canvas without Satori clipping it against the card edge. */
function titleFontSize(title: string): number {
  if (title.length <= 20) return 64;
  if (title.length <= 40) return 54;
  return 46;
}

export interface OgCardProps {
  /** Small caps line above the title (e.g. "Case study", "Selected Work"). */
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Clay tone driving the corner accent + badge tint — never the body-text background (contrast). */
  tone: Tone;
  /** Optional status/label chip under the subtitle (e.g. a project's `statusLabel`). */
  badge?: string;
  /** Home family only: renders the avatar poster beside the text column. */
  avatar?: boolean;
}

/** Renders one 1200x630 OG/Twitter card PNG. Every `app/**\/opengraph-image.tsx` default export
 * is a one-line call into this. */
export async function renderOgCard({ eyebrow, title, subtitle, tone, badge, avatar }: OgCardProps) {
  const [fonts, avatarSrc] = await Promise.all([
    loadFonts(),
    avatar ? loadAvatarDataUrl() : Promise.resolve(null),
  ]);
  const accentHex = TONE_HEX[tone];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          backgroundColor: HEX.bg,
          fontFamily: "Manrope",
          padding: "80px",
          overflow: "hidden",
        }}
      >
        {/* Decorative clay-tone corner accent — kept clear of the text column (contrast rule). */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: "-150px",
            right: "-150px",
            width: "420px",
            height: "420px",
            borderRadius: "999px",
            backgroundColor: withAlpha(accentHex, 0.55),
          }}
        />

        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "56px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              maxWidth: avatarSrc ? "660px" : "1000px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "26px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: HEX.ink3,
                marginBottom: "20px",
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: `${titleFontSize(title)}px`,
                fontWeight: 800,
                lineHeight: 1.1,
                color: HEX.ink,
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "28px",
                fontWeight: 700,
                lineHeight: 1.4,
                color: HEX.ink2,
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
                  padding: "12px 28px",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: HEX.ink,
                  backgroundColor: withAlpha(accentHex, 0.4),
                }}
              >
                {badge}
              </div>
            ) : null}
          </div>

          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- Satori renders raw <img>, not next/image.
            <img
              src={avatarSrc}
              alt=""
              width={360}
              height={360}
              style={{ borderRadius: "36px", objectFit: "cover" }}
            />
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "56px",
            left: "80px",
            fontSize: "24px",
            fontWeight: 700,
            color: HEX.ink3,
          }}
        >
          {site.name}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Manrope", data: fonts.bold, weight: 700, style: "normal" },
        { name: "Manrope", data: fonts.extraBold, weight: 800, style: "normal" },
      ],
    },
  );
}
