import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { Annotation, Sketch } from "@/components/paper";
import { ABOUT_HERO } from "./about-content";
import { ABOUT_ARTWORK } from "./about-artwork";

/**
 * `/about` hero (TASK-136, spec §2–§6; supersedes TASK-117's "machines → systems → people" hero). Server
 * component, directly under the page's scene opener.
 *
 *   ≥ 1024  LEFT ~44 %: eyebrow ABOUT, the h1 (rust hand-drawn underline under "real-world impact."), one
 *           short paragraph — no biography. RIGHT ~56 %: one paper-craft diorama (TASK-212: research sheet,
 *           the four books, the city under the terracotta sun, laptop, notebook) with two handwritten notes
 *           set over its empty cream corner as real HTML (the art itself carries no lettering).
 *   < 1024  copy first, then the diorama (spec §45); < 640 it keeps one note.
 *
 * EVAL-018 (Design.md §3.3 `/about` hero): underline sketch · two annotations = 3 at every width (the hidden
 * note stays in the DOM). The diorama is a meaningful image (alt text), not decoration.
 * Motion: the copy and the collage settle in once (`Reveal`); nothing moves under reduced motion.
 */
export function AboutHero() {
  const [before] = ABOUT_HERO.title.split(ABOUT_HERO.underlined);
  const hero = ABOUT_ARTWORK["about-hero"];
  return (
    <Container as="section" aria-labelledby="about-hero-heading" className="abh">
      <div className="abh-grid">
        <Reveal className="abh-copy" index={0}>
          <p className="ab-eyebrow">{ABOUT_HERO.eyebrow}</p>
          <h1 id="about-hero-heading" className="abh-title">
            {before}
            <span className="abh-mark">
              {ABOUT_HERO.underlined}
              <Sketch variant="underline" />
            </span>
          </h1>
          <p className="abh-lead">{ABOUT_HERO.lead}</p>
        </Reveal>

        <Reveal className="abh-stage" index={2}>
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized, pre-compressed static WebP */}
          <img
            className="abh-art"
            src={hero.src}
            width={hero.width}
            height={hero.height}
            alt={hero.alt}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            data-about-artwork="about-hero"
          />
          <Annotation rotate={-3} size="lg" className="abh-note abh-note-a">
            {ABOUT_HERO.notes[0]}
          </Annotation>
          <Annotation rotate={3} size="lg" className="abh-note abh-note-b">
            {ABOUT_HERO.notes[1]}
          </Annotation>
        </Reveal>
      </div>
    </Container>
  );
}
