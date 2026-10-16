import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { Annotation, Sheet, Tape, TornEdge, type TapeSide } from "@/components/paper";
import { CHAPTERS, CHAPTERS_HEAD } from "./about-content";
import { CHAPTER_ART } from "./about-paper-art";
import { MobileCarousel } from "@/components/home/MobileCarousel";
import { PaperImg } from "./PaperImg";

/** Per-card paper (spec §11): its own tint, a subtle rotation, light tape. */
const PLACEMENT: readonly { rotate: number; tape: TapeSide; tint: "peach" | "blue" | "sage" }[] = [
  { rotate: -0.6, tape: "l", tint: "peach" },
  { rotate: 0.4, tape: "c", tint: "blue" },
  { rotate: -0.3, tape: "r", tint: "sage" },
];

/**
 * THREE CHAPTERS (TASK-136, spec §7–§11) — the page's conceptual backbone: 01 Builder · 02 Operator ·
 * 03 Researcher (Still). `section#chapters` on `paper-2` under its torn edge. Each chapter is a torn
 * editorial card (`data-paper="card"`, its own tint, ±0.6°, one tape strip): the big Fraunces number,
 * the h3, one dominant cut-paper print (decorative, `alt=""`), and the spec's two sentences.
 *
 * ≥ 1024 three columns · 640–1023 two + one (the third card centred) · < 640 stacked.
 * EVAL-018: torn · the "Different hats. Same curiosity." annotation = 2.
 * Motion (spec §56–§57): cards settle in 90 ms apart, once; the P1 lift on hover (TASK-196). None under reduced motion.
 * TASK-196: the print is a Higgsfield origami miniature (WebP) and each card ends in its keyword tags.
 */
export function ThreeChapters() {
  return (
    <section id="chapters" aria-labelledby="chapters-heading" className="chx">
      <TornEdge fill="paper-2" />
      <div className="chx-body">
        <Container className="chx-wrap">
          <div className="ab-head">
            <div>
              <p className="ab-eyebrow">{CHAPTERS_HEAD.eyebrow}</p>
              <h2 id="chapters-heading" className="ab-h2">
                {CHAPTERS_HEAD.title}
              </h2>
            </div>
            <Annotation rotate={-3} size="lg" className="ab-aside chx-aside">
              {CHAPTERS_HEAD.note}
            </Annotation>
          </div>
          <MobileCarousel noun="chapter" label="Chapters" count={CHAPTERS.length}>
            <ol className="chx-grid">
              {CHAPTERS.map((chapter, index) => {
                const place = PLACEMENT[index]!;
                return (
                  <li key={chapter.id} className="chx-slot">
                    <Reveal index={index} className="chx-rv">
                      <Sheet as="article" variant="card" rotate={place.rotate} className="chx-card">
                        <Tape side={place.tape} />
                        <div className="chx-paper" data-tint={place.tint} data-chapter={chapter.id}>
                          <h3 className="chx-title">
                            <span className="chx-num">{chapter.number}</span>
                            <span className="chx-name">{chapter.title}</span>
                          </h3>
                          <PaperImg id={CHAPTER_ART[chapter.id]} className="chx-art" />
                          <p className="chx-text">{chapter.body}</p>
                          <ul className="chx-tags" aria-label={`${chapter.title} keywords`}>
                            {chapter.tags.map((tag) => (
                              <li key={tag}>{tag}</li>
                            ))}
                          </ul>
                        </div>
                      </Sheet>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </MobileCarousel>
        </Container>
      </div>
    </section>
  );
}
