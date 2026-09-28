import { Annotation } from "@/components/paper/Annotation";
import { Hand } from "@/components/paper/Hand";
import { Illustration } from "@/components/paper/Illustration";
import { Pin } from "@/components/paper/Pin";
import { Sheet } from "@/components/paper/Sheet";
import { Tape } from "@/components/paper/Tape";
import { ABOUT_COLLAGE_NOTE, ABOUT_POLAROID_CAPTION, ABOUT_PULL_QUOTE } from "./about-hero-data";
import { IntersectionSketch } from "./IntersectionSketch";

/**
 * The `/about` hero's right column (TASK-117, spec §11–§16, §28): a restrained scrapbook — the pinned
 * yellow philosophy note, the polaroid, the torn notebook page with the Venn, and one quiet hand line.
 * Everything here except the annotation and the sprig is content paper (in the accessibility tree).
 */

/** Spec §12: pale yellow lined note, terracotta pin, +2° (a sticky's tilt), terracotta underline. */
export function PhilosophyNote() {
  return (
    <div className="ahero-quote-wrap" data-enter="quote">
      <Sheet as="figure" variant="index" className="ahero-quote">
        <Pin />
        <Hand kind="quote" as="blockquote" cite={<span className="sr-only">Source: Tushar Pathak</span>}>
          {`“${ABOUT_PULL_QUOTE}”`}
        </Hand>
      </Sheet>
    </div>
  );
}

/**
 * Spec §13: the polaroid — a watercolour mountain sunrise (manifest `polaroid-sunrise`, lazy, never
 * the LCP). The caption is the photo's own content caption (`figcaption`, in the accessibility tree).
 */
export function JourneyPolaroid() {
  return (
    <div className="ahero-polaroid-wrap" data-enter="polaroid">
      <Illustration
        id="polaroid-sunrise"
        placement="photo"
        rotate={-1.5}
        sizes="(max-width: 639px) 62vw, (max-width: 899px) 280px, 240px"
        className="ahero-polaroid"
        caption={<figcaption className="ahero-polaroid-cap font-hand">{ABOUT_POLAROID_CAPTION}</figcaption>}
      >
        <Tape side="c" />
      </Illustration>
    </div>
  );
}

export function AboutCollage() {
  return (
    <div className="ahero-collage">
      <PhilosophyNote />
      <JourneyPolaroid />
      <IntersectionSketch />
      <div className="ahero-still-wrap" data-enter="notebook">
        <Annotation size="md" rotate={-2} arrow="up" className="ahero-still">
          {ABOUT_COLLAGE_NOTE}
        </Annotation>
      </div>
    </div>
  );
}
