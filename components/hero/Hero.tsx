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
 * Vertical focal point (TKT-92r2): at ≥ 1024 the banner box is capped by the viewport height (the
 * 5-second-test fold, app/globals.css "TKT-92r2" block), so it is much wider than the scene's 21:9 and
 * crops top/bottom — 0.36 keeps his face and the pinned notes in (a centred crop cut the top of his
 * head at 1440×900). No effect < 768, where the 4:3 box crops sideways only.
 */
const BANNER_FOCAL_Y = 0.36;

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
 * Three taped polaroids down the banner's left edge (Dev-21): crops of existing scenes, decorative
 * (`alt=""`, group `aria-hidden` — Dev-23), rotations inside the photo cap (±2.4°, Design.md §3.1).
 * Their job is to cover the outpaint's garbled corkboard (the banner's top-left ~21 % × 45 %): the first
 * two sit side by side across it (the first tucked under the header's edge, its tape on the right so
 * the visible fastener is not under the header), the third crosses the torn edge at the bottom-left;
 * positions live in app/globals.css `.hero-polaroid:nth-child(n)`. Mounted ≥ 768 only (`MediaGate`,
 * TP14) — below that the 4:3 crop already removes the corkboard and they would cover the character.
 */
const POLAROIDS: readonly { id: SceneId; rotate: number; tape: TapeSide }[] = [
  { id: "scene-work", rotate: -2.4, tape: "r" },
  { id: "scene-about", rotate: 1.8, tape: "c" },
  { id: "scene-playground", rotate: -1.2, tape: "l" },
];

/**
 * Home hero (Design.md §5 modes/lifecycle + §11 Dev-21/Dev-23; decisions S14 / D10 / TP13 / EXE-15;
 * TKT-93). Server component. Order: the full-bleed `SceneBanner` (the 3168×1344 outpaint — the LCP
 * `<img>` in the static HTML in every mode) with `HeroClip` mounting the once-and-hold `<video>` in
 * default mode inside a slot registered on the banner's pixel grid (components/hero/registration.ts)
 * and masked to the character; a paper `TornEdge` as the banner's bottom edge; the polaroids; the
 * postmark; then the centred copy block — every string verbatim from `data/hero.ts` (D7), h1 in
 * Fraunces (EXE-15). Four counted decorations (§3.2 budget ≤ 4 at both widths): torn edge, h1
 * underline sketch, hand-sub annotation, postmark sketch — the TSK-37 figcaption is gone.
 */
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-h">
      <div className="hero-banner">
        <SceneBanner id="hero-banner" priority focalX={BANNER_FOCAL_X} focalY={BANNER_FOCAL_Y} sizes="100vw" narrow={BANNER_NARROW}>
          <div className="hero-clip-slot" style={clipSlotStyle()}>
            <HeroClip poster={POSTER.publicSrc!} webm={CLIP.publicSrc!} mp4={CLIP_MP4} />
          </div>
        </SceneBanner>

        <TornEdge fill="paper" className="hero-torn" />

        <MediaGate min={768}>
          <div className="hero-polaroids" aria-hidden="true">
            {POLAROIDS.map((polaroid) => (
              <Sheet key={polaroid.id} variant="photo" rotate={polaroid.rotate} className="hero-polaroid">
                <Tape side={polaroid.tape} />
                <Image src={sceneImage(polaroid.id)} alt="" sizes="224px" className="hero-polaroid-img" />
              </Sheet>
            ))}
          </div>
        </MediaGate>

        <Postmark className="hero-stamp" />
      </div>

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
    </section>
  );
}
