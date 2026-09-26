import { Container } from "@/components/layout/Container";
import { Annotation, Sketch } from "@/components/paper";

/**
 * `/projects` opener copy (TKT-80 · TSK-39, Design.md §7.2 "Opener"; TKT-101 moved the index from
 * `/work` and renamed the h1 "Work" → "Projects" to match the new nav tab, Dev-90). The scene itself is already on the
 * page as the full-bleed `SceneOpener` above this section (TKT-95, EXE-18 / Dev-24 — one `<img>`,
 * manifest alt), so this section carries only the copy: eyebrow, the oversized Fraunces h1 "Work"
 * with the rust underline `Sketch`, the lead, and the scene's caption annotation.
 *
 * EVAL-018 (§3.3 `/work` opener = 2): the h1 underline sketch + the caption annotation. The h1 and
 * lead are unchanged verbatim copy (CONTENT_INVENTORY §2.1).
 */
export function WorkHero() {
  return (
    <Container as="section" className="work-hero" aria-labelledby="work-h">
      <div className="work-hero-copy">
        <p className="work-hero-eyebrow">Work</p>
        <h1 id="work-h" className="work-hero-h1">
          Projects
          <Sketch variant="underline" />
        </h1>
        <p className="work-hero-lead">
          Personal builds first. Corporate work is listed as experience, not product.
        </p>
      </div>
      <Annotation size="md" rotate={-1.2} className="work-hero-caption">
        the pinboard — every build gets a sketch first
      </Annotation>
    </Container>
  );
}
