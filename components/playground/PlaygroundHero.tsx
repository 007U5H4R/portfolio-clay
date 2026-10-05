import { Container } from "@/components/layout/Container";
import { Annotation } from "@/components/paper/Annotation";
import { Sketch } from "@/components/paper/Sketch";

/**
 * `/playground` opener copy (TKT-88 · TSK-45, S88.01; Design.md §7.7 "Opener"). The bench scene is
 * already on the page as TKT-95's full-bleed `SceneOpener` directly above this section (EXE-18 /
 * Dev-24 — one `<img>`, manifest alt), so the §7.7 "wide masked scene" is **not** rebuilt here: this
 * section carries the eyebrow, the h1 with the rust underline `Sketch`, the "go poke at it" aside
 * (with its arrow) and the scene's ivory caption chip, which sits up against the banner above.
 *
 * EVAL-018 (§3.3 `/playground` opener = 3): underline sketch · poke annotation · caption annotation.
 * Copy is Design.md §7.7 verbatim (h1 unchanged from TKT-44).
 */
export function PlaygroundHero() {
  return (
    <Container as="section" className="pg-opener" aria-labelledby="pg-h">
      <Annotation as="p" size="md" rotate={-1.5} className="pg-caption">
        the bench, most evenings
      </Annotation>
      <div className="pg-opener-copy">
        <p className="pg-eyebrow">
          Playground<span className="pg-eyebrow-dot">·</span>Four live experiments
        </p>
        <h1 id="pg-h" className="pg-h1">
          Small experiments.{" "}
          <span className="pg-ul">
            Big questions.
            <Sketch variant="underline" />
          </span>
        </h1>
      </div>
      <Annotation arrow="right" size="hero" rotate={-1.5} className="pg-aside">
        each one links straight to the live build — go poke at it
      </Annotation>
    </Container>
  );
}
