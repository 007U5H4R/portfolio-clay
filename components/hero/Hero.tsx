import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { HeroClip } from "@/components/hero/HeroClip";
import { Postmark } from "@/components/hero/Postmark";
import { clipSlotStyle } from "@/components/hero/registration";
import { Annotation, Sheet, Sketch, Tape, TornEdge, type TapeSide } from "@/components/paper";
import { MediaGate } from "@/components/paper/MediaGate";
import { SceneBanner } from "@/components/paper/SceneBanner";
import { hero } from "@/data/hero";
import { illustration, sceneImage, type SceneId } from "@/lib/illustrations";

/**
 * The h1 in its three reference lines (TKT-108): `data/hero.ts` splits the headline where Tushar's
 * reference breaks it, and each part is a `.hero-h1-line` (block ≥ 768, inline below — the spaces
 * between them are real text nodes, so the accessible name is the plain sentence). The rust underline
 * `Sketch` sits under the last line, "people actually use." (Design.md §5.1 / Dev-21).
 */
const H1_LINES = [hero.headline.before.trim(), hero.headline.highlight.trim(), hero.headline.after.trim()] as const;
/** The hand line's faint underline sits under "problems." (TKT-108 reference). */
const HAND_MARK = "problems.";
const [HAND_HEAD = "", HAND_TAIL = ""] = hero.handLine.text.split(HAND_MARK);

const POSTER = illustration("hero-desk");
const CLIP = illustration("hero-clip");
/** The mp4 is the second rendition of the same clip (Design.md §5.2 source order webm → mp4). */
const CLIP_MP4 = CLIP.publicSrc!.replace(/\.webm$/, ".mp4");

/** The character stands at ≈ 49 % of the banner's width — the crop keeps him centred (EXE-15 prototype). */
const BANNER_FOCAL_X = 0.49;
/**
 * Narrow-screen rendition of the banner (TKT-92r2, mobile LCP): < 768 the 4:3 box shows only the scene's
 * x 0.2072–0.7728 (box 100vw × 75vw over a 176.8vw canvas at focal 0.49 — vw-proportional, so the same
 * at every narrow width; a classic scrollbar only narrows it). The crop is x 640–2464 of 3168 (that
 * region plus ≈ 0.5 % a side), full height, 1824×1344 — provenance in
 * content/media/illustrations/README.md. `sizes` is a density cap, not the displayed width (≈ 102vw):
 * `54vw` keeps the image at about the pixels-per-CSS-px the full banner gets today (its `100vw` covers
 * a 177vw-wide canvas), so a 412 px / DPR 1.75 phone takes the 390w rendition (≈ half the bytes of
 * today's 768w full scene) instead of a sharper but heavier crop.
 */
const BANNER_NARROW = {
  src: "/media/illustrations/hero-banner-mobile.webp",
  width: 1824,
  height: 1344,
  left: 640 / 3168,
  span: 1824 / 3168,
  sizes: "54vw",
} as const;

/**
 * Three taped polaroids pinned onto the banner's blank papers (Dev-21, Dev-80 — Tushar 2026-09-26,
 * TKT-111): crops of existing scenes, decorative (`alt=""`, group `aria-hidden` — Dev-23), rotations
 * inside the photo cap (±2.4°, Design.md §3.1). One per blank paper, in this order: the tall cream
 * sheet left of the character, the square yellow note top-right, the large cream sheet right; the
 * mountain photo and the (now clean, TKT-105) corkboard stay bare. They belong to the image layer, so
 * the paper sheet scrolls over them (TKT-96); positions live in app/globals.css
 * `.hero-polaroid:nth-child(n)` in banner-canvas units. Mounted ≥ 768 only (`MediaGate`, TP14) — below
 * that the 4:3 crop cuts the right-hand papers and they would crowd the character.
 */
const POLAROIDS: readonly { id: SceneId; rotate: number; tape: TapeSide }[] = [
  { id: "scene-about", rotate: -1.6, tape: "c" },
  { id: "scene-playground", rotate: 2, tape: "c" },
  { id: "scene-work", rotate: -1.2, tape: "c" },
];

/**
 * Home hero (Design.md §5 modes/lifecycle + §11 Dev-21/Dev-23; decisions S14 / D10 / TP13 / EXE-15;
 * TKT-93). Server component. Order: the full-bleed `SceneBanner` (the 3168×1344 outpaint — the LCP
 * `<img>` in the static HTML in every mode) with `HeroClip` mounting the once-and-hold `<video>` in
 * default mode inside a slot registered on the banner's pixel grid (components/hero/registration.ts)
 * and masked to the character, the polaroids and the postmark — the image layer; then the paper sheet
 * (TKT-96): a paper `TornEdge` as its top edge over the banner's bottom, and the centred copy block —
 * every string verbatim from `data/hero.ts` (D7), h1 in Fraunces (EXE-15). At ≥ 768 the banner shows
 * the whole 3168×1344 scene; as the page scrolls the image layer moves at half speed and the sheet
 * slides over it, torn edge leading (app/globals.css "TKT-96" block — CSS scroll-driven, no JS).
 * TKT-108 (Tushar 2026-09-26, Design.md §11 Dev-50) rebuilt the copy block to his reference: letter-
 * spaced eyebrow, a three-line h1 with the rust underline, the Caveat hand line, support, "View my
 * work →" + "✦ Ask Tushky" (Tushky's head sticker beside it), and faint marginalia. The sheet is its
 * own nested `<section>` (a §3.2 counting unit): the outer section counts 1 (postmark), the sheet 4 —
 * torn edge, h1 underline sketch (its two accent strokes are CSS on the same host), hand-line
 * annotation, and the one `collage` backdrop — at every width.
 */
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-h">
      <div className="hero-banner">
        <SceneBanner id="hero-banner" priority focalX={BANNER_FOCAL_X} sizes="100vw" narrow={BANNER_NARROW}>
          <div className="hero-clip-slot" style={clipSlotStyle()}>
            <HeroClip poster={POSTER.publicSrc!} webm={CLIP.publicSrc!} mp4={CLIP_MP4} />
          </div>
        </SceneBanner>

        <MediaGate min={768}>
          <div className="hero-polaroids" aria-hidden="true">
            {POLAROIDS.map((polaroid) => (
              <Sheet key={polaroid.id} variant="photo" rotate={polaroid.rotate} className="hero-polaroid">
                <Tape side={polaroid.tape} />
                <Image src={sceneImage(polaroid.id)} alt="" sizes="11vw" className="hero-polaroid-img" />
              </Sheet>
            ))}
          </div>
        </MediaGate>

        <Postmark className="hero-stamp" />
      </div>

      {/* TKT-108: the paper sheet is its own counting unit (nested section, Design.md §3.2 rule 1 / Dev-50). */}
      <section className="hero-sheet" id="hero-copy">
        <TornEdge fill="paper" className="hero-torn" />

        {/* TKT-108 marginalia + faint backdrop — ONE counted `collage` object (Design.md §3.1 / Dev-50):
            its pieces carry no `data-decor`, the whole unit is `aria-hidden` and pointer-events none.
            Server-rendered and absolutely positioned (no layout shift); pieces are shown by width in
            app/globals.css, the Caveat notes ≥ 1024 only. */}
        <div className="hero-margin" data-decor="collage" aria-hidden="true">
          <span className="hero-margin-patch" data-patch="tl" />
          <span className="hero-margin-patch" data-patch="h1" />
          <span className="hero-margin-patch hero-margin-grid" data-patch="br" />
          <svg className="hero-margin-leaf" viewBox="0 0 200 260" focusable="false">
            <path d="M100 258 C 96 190, 84 120, 60 20" />
            <path d="M92 200 C 60 190, 30 160, 22 128 C 52 132, 80 160, 92 200 Z" />
            <path d="M88 160 C 118 146, 146 116, 150 84 C 120 90, 96 120, 88 160 Z" />
            <path d="M78 116 C 48 104, 30 76, 30 46 C 56 56, 74 84, 78 116 Z" />
            <path d="M70 76 C 92 60, 104 36, 102 8 C 80 20, 70 46, 70 76 Z" />
          </svg>
          <svg className="hero-margin-loop" viewBox="0 0 160 200" focusable="false">
            <path d="M8 4 C 30 60, 60 96, 110 92 C 150 88, 150 44, 118 48 C 84 52, 90 110, 130 150 C 142 162, 150 178, 152 196" />
          </svg>
          <p className="hero-margin-note font-hand" data-note="why">
            real
            <br />
            problems
            <br />
            real people
            <br />
            bigger impact
            <svg className="hero-margin-arrow" viewBox="0 0 80 40" focusable="false">
              <path d="M4 34 C 22 12, 44 6, 72 12" />
              <path d="M62 4 L 74 12 L 62 20" />
            </svg>
          </p>
          <p className="hero-margin-note font-hand" data-note="flow">
            problem → insight → build → learn
          </p>
        </div>

        <Container className="hero-copy">
          <p className="hero-eyebrow">{hero.eyebrow.text}</p>

          <h1 id="hero-h" className="hero-h1">
            <span className="hero-h1-line">{H1_LINES[0]}</span>{" "}
            <span className="hero-h1-line">{H1_LINES[1]}</span>{" "}
            <span className="hero-h1-line underline-host">
              {H1_LINES[2]}
              <Sketch variant="underline" />
            </span>
          </h1>

          {/* The faint stroke under "problems." is part of this one annotation object (CSS on the span). */}
          <Annotation size="hero" rotate={-1} className="hero-hand-sub">
            {HAND_HEAD}
            <span className="hero-hand-mark">{HAND_MARK}</span>
            {HAND_TAIL}
          </Annotation>

          <p className="hero-support">{hero.support.text}</p>

          <div className="hero-cta-row">
            <Link href="/projects" className="hero-btn hero-btn-primary focus-ring">
              View my work →
            </Link>
            <div className="hero-ask">
              <a href="#ask" className="hero-btn hero-btn-secondary focus-ring" aria-describedby="hero-ask-cap">
                <span className="hero-btn-spark" aria-hidden="true">
                  ✦
                </span>
                Ask Tushky
              </a>
              <p id="hero-ask-cap" className="hero-ask-cap" data-micro-label="">
                My AI portfolio assistant
              </p>
              {/* Tushky (the banner's golden retriever) + its pointer: one decorative illustration,
                  not a counted decoration (like the polaroid photos) — Design.md §11 Dev-50. */}
              <span className="hero-tushky" aria-hidden="true">
                <Image src="/media/illustrations/tushky-head.webp" alt="" width={64} height={64} className="hero-tushky-img" />
                <svg className="hero-tushky-arrow" viewBox="0 0 48 32" focusable="false">
                  <path d="M4 28 C 18 26, 30 18, 38 6" />
                  <path d="M30 8 L 39 5 L 40 14" />
                </svg>
              </span>
            </div>
          </div>
        </Container>
      </section>
    </section>
  );
}
