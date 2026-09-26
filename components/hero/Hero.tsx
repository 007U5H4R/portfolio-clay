import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { HeroClip } from "@/components/hero/HeroClip";
import { Postmark } from "@/components/hero/Postmark";
import { clipSlotStyle } from "@/components/hero/registration";
import { Annotation, Hand, Sheet, Sketch, Tape, TornEdge, type TapeSide } from "@/components/paper";
import { MediaGate } from "@/components/paper/MediaGate";
import { SceneBanner } from "@/components/paper/SceneBanner";
import { hero } from "@/data/hero";
import { illustration, sceneImage, type SceneId } from "@/lib/illustrations";

/** The h1 split so the rust underline `Sketch` sits under the last three words (Design.md §5.1 / Dev-21). */
const HEADLINE = `${hero.headline.before}${hero.headline.highlight}${hero.headline.after}`;
const HEADLINE_WORDS = HEADLINE.trim().split(/\s+/);
const UNDERLINED = HEADLINE_WORDS.slice(-3).join(" ");
const HEADLINE_HEAD = HEADLINE_WORDS.slice(0, -3).join(" ");

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
 * slides over it, torn edge leading (app/globals.css "TKT-96" block — CSS scroll-driven, no JS). Four
 * counted decorations (§3.2 budget ≤ 4 at both widths): torn edge, h1 underline sketch, hand-sub
 * annotation, postmark sketch — the TSK-37 figcaption is gone.
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

      <div className="hero-sheet">
        <TornEdge fill="paper" className="hero-torn" />

        <Container className="hero-copy">
          <p className="hero-eyebrow">{hero.eyebrow.text}</p>

          <h1 id="hero-h" className="hero-h1">
            {HEADLINE_HEAD}{" "}
            <span className="underline-host">
              {UNDERLINED}
              <Sketch variant="underline" />
            </span>
          </h1>

          <Annotation size="hero" rotate={-1.5} className="hero-hand-sub">
            Same curiosity. Bigger problems.
          </Annotation>

          {/* Hidden below md so the CTAs clear the 390 fold (5-second test, §5.1). */}
          <p className="hero-support">{hero.support.text}</p>

          <div className="hero-cta-row">
            <Link href="/work" className="hero-btn hero-btn-primary focus-ring">
              <Hand kind="cta">View my work →</Hand>
            </Link>
            <a href="#ask" className="hero-btn hero-btn-secondary focus-ring">
              <svg className="hero-btn-glyph" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <circle cx="7" cy="7" r="5" />
                <path d="M11 11 L 15 15" />
              </svg>
              Ask my portfolio
            </a>
          </div>
        </Container>
      </div>
    </section>
  );
}
