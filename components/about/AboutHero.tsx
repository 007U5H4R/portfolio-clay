import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { Annotation, Sketch } from "@/components/paper";
import { ABOUT_HERO } from "./about-content";
import { AboutArtImg } from "./AboutArtImg";

/**
 * `/about` hero (TASK-136, spec §2–§6; supersedes TASK-117's "machines → systems → people" hero). Server
 * component, directly under the page's scene opener.
 *
 *   ≥ 1024  LEFT ~44 %: eyebrow ABOUT, the h1 (rust hand-drawn underline under "real-world impact."), one
 *           short paragraph — no biography. RIGHT ~56 %: the editorial paper collage, overlapping the
 *           paper: the research sketches, the city under the terracotta sun, the book stack (AI · Systems
 *           · Products · Impact) and the product desk (notebook, laptop, mug), plus two handwritten notes.
 *   < 1024  copy first, then the collage (spec §45); < 640 the collage drops to the city + the books.
 *
 * EVAL-018 (Design.md §3.3 `/about` hero): underline sketch · collage (one object, every piece inside,
 * `aria-hidden`) · two annotations = 4 at every width (hidden pieces stay in the DOM).
 * Motion: the copy and the collage settle in once (`Reveal`); nothing moves under reduced motion.
 */
export function AboutHero() {
  const [before] = ABOUT_HERO.title.split(ABOUT_HERO.underlined);
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
          <div className="abh-collage" data-decor="collage" aria-hidden="true">
            <AboutArtImg id="research-sketches" className="abh-piece abh-sketches" />
            <AboutArtImg id="systems-collage" className="abh-piece abh-city" />
            <AboutArtImg id="product-desk" className="abh-piece abh-desk" />
            <AboutArtImg id="books-stack" className="abh-piece abh-books" />
          </div>
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
