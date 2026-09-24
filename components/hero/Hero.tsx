import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { HeroClip } from "@/components/hero/HeroClip";
import { Annotation, Hand, Sketch } from "@/components/paper";
import { hero } from "@/data/hero";
import { illustration } from "@/lib/illustrations";

/** The h1 split so the rust underline `Sketch` sits under the last three words (Design.md §5.1). */
const HEADLINE = `${hero.headline.before}${hero.headline.highlight}${hero.headline.after}`;
const HEADLINE_WORDS = HEADLINE.trim().split(/\s+/);
const UNDERLINED = HEADLINE_WORDS.slice(-3).join(" ");
const HEADLINE_HEAD = HEADLINE_WORDS.slice(0, -3).join(" ");

const POSTER = illustration("hero-desk");
const CLIP = illustration("hero-clip");
/** The mp4 is the second rendition of the same clip (Design.md §5.2 source order webm → mp4). */
const CLIP_MP4 = CLIP.publicSrc!.replace(/\.webm$/, ".mp4");

/**
 * Home hero (Design.md §5; S14 / D10 / TP13; TSK-37). Server component: the §5.1 grid (copy 42fr /
 * scene 58fr ≥ 1024, single column below with the copy first), every string from `data/hero.ts`
 * (D7), and the §5.2 markup — the `next/image` poster is in the static HTML in every mode as the
 * LCP element; `HeroClip` mounts the once-and-hold `<video>` over it only in default mode, after
 * hydration. Three counted decorations (§3.3): the hand-sub annotation, the h1 underline sketch and
 * the scene caption. The poster's `src`/`alt` are `illustration("hero-desk")` — never inline (§6.1).
 */
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-h">
      <Container className="hero-wrap">
        <div className="hero-copy">
          <p className="hero-eyebrow">{hero.eyebrow.text}</p>

          <h1 id="hero-h" className="hero-h1">
            {HEADLINE_HEAD}{" "}
            <span className="underline-host">
              {UNDERLINED}
              <Sketch variant="underline" />
            </span>
          </h1>

          <Annotation size="hero" rotate={-1.5} className="hero-hand-sub">
            Same curiosity.
            <br />
            Bigger problems.
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
        </div>

        <figure className="hero-scene" data-illustration={POSTER.id}>
          <div className="frame">
            <Image
              src={POSTER.publicSrc!}
              alt={POSTER.alt}
              width={POSTER.width}
              height={POSTER.height}
              sizes="(min-width: 1024px) 58vw, 100vw"
              preload
              // Next 16 does not derive fetchpriority from preload; the poster is the LCP image (§5.2).
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="hero-poster"
            />
            <HeroClip poster={POSTER.publicSrc!} webm={CLIP.publicSrc!} mp4={CLIP_MP4} />
          </div>
          <Annotation as="figcaption" size="sm" className="hero-caption">
            the desk where most of it happens
          </Annotation>
        </figure>
      </Container>
    </section>
  );
}
