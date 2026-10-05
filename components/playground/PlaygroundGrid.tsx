import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { Project } from "@/data/schema";
import { VisuallyHidden } from "@/components/common/VisuallyHidden";
import { Container } from "@/components/layout/Container";
import { Annotation } from "@/components/paper/Annotation";
import { Hand } from "@/components/paper/Hand";
import { Pin } from "@/components/paper/Pin";
import { Sheet, type SheetVariant } from "@/components/paper/Sheet";
import { Sketch } from "@/components/paper/Sketch";
import { Tape } from "@/components/paper/Tape";
import { TornEdge } from "@/components/paper/TornEdge";
import { cinematicPortfolio, dinoArcadePwa, pratyasa, tegaki } from "@/data/projects";

/**
 * One experiment on the bench (Design.md §7.7 board, Dev-07). Fixed order; each project is imported
 * by name (not looked up by slug string) so a typo can't silently resolve to `undefined` — and so
 * Slag City / Mock Interview / Game (CONTENT_INVENTORY §6 exclusions) have no path onto this page.
 *
 * `rotate` is the §7.7 angle; `Sheet` clamps it to the §3.1 cap (±0.9°), so Tegaki's −2.2° and
 * Cinematic Portfolio's +1.1° render at the cap (the §3.1 table is normative — see docs/reports/TSK-45.md).
 */
interface BenchEntry {
  project: Project;
  variant: SheetVariant;
  /** Board slot (`.pg-ex-1` … `.pg-ex-4` in the TKT-88a globals block). */
  slot: 1 | 2 | 3 | 4;
  rotate: number;
  /** ≤ 2 fasteners, direct children of the host (§3.2 rule 8) — an array, never a fragment, so
   * `Sheet`'s child scan sees each one. */
  fasteners: ReactNode[];
}

const ENTRIES: BenchEntry[] = [
  { project: pratyasa, variant: "index", slot: 1, rotate: 0.6, fasteners: [<Tape key="l" side="l" />] },
  { project: tegaki, variant: "card", slot: 2, rotate: -2.2, fasteners: [<Tape key="c" side="c" />] },
  { project: dinoArcadePwa, variant: "card", slot: 3, rotate: -0.9, fasteners: [<Pin key="pin" tone="forest" />] },
  {
    project: cinematicPortfolio,
    variant: "card",
    slot: 4,
    rotate: 1.1,
    // Two corner tapes; ≤ 640 CSS moves the left one to the centre and hides the right (§7.7
    // "one centre tape ≤ 640") — so the host never carries a third fastener.
    fasteners: [<Tape key="l" side="l" />, <Tape key="r" side="r" />],
  },
];

/**
 * `/playground` bench (TKT-88 · TSK-45, S88.01; Design.md §7.7 "Bench", §11 Dev-07): `section#experiments`
 * on `paper-2` with its torn top edge; head = h2 eyebrow "Experiments" + the "no status badges" aside;
 * a 12-col board of four paper objects (lined index card · kraft label · pinned card · wide taped card)
 * and the tools sketch bottom-right. **No tone line and no Caveat notebook sheet** (Dev-07 — retired
 * clay tones / Caveat body copy). The mockup's quiet close is not built (D9 / Dev-08: the band closes).
 *
 * EVAL-018 (§3.3 bench = 3): torn · annotation · tools sketch. Fasteners and the cards don't count.
 * The tools sketch is hidden ≤ 1024 by CSS but stays in the DOM, so the count is 3 at every width.
 */
export function PlaygroundGrid() {
  return (
    <section id="experiments" className="pg-bench" aria-labelledby="bench-h">
      <TornEdge fill="paper-2" className="pg-bench-torn" />
      <Container className="pg-bench-body">
        <div className="pg-bench-head">
          <h2 id="bench-h" className="pg-eyebrow">
            Experiments
          </h2>
          <Annotation size="md" className="pg-bench-aside">
            no status badges here — they’re all just live
          </Annotation>
        </div>
        <div className="pg-board">
          {ENTRIES.map((entry) => (
            <Experiment key={entry.project.slug} {...entry} />
          ))}
          <Sketch variant="tools" className="pg-tools" />
        </div>
      </Container>
    </section>
  );
}

/**
 * One card: Caveat numeral label (`data-hand="label"`), Fraunces h3, Inter tagline, and the live URL as
 * an Inter 14 link with the external icon + sr-only "(opens in new tab)" (EVAL-011). `live` is read off
 * the project record (`links.live`), so the href can never drift from `/work`'s copy of the same URL.
 */
function Experiment({ project, variant, slot, rotate, fasteners }: BenchEntry) {
  const { name, tagline, links } = project;
  if (!links.live) return null; // defensive: every sanctioned entry carries a live URL (schema `links.live`)

  return (
    <Sheet as="article" variant={variant} rotate={rotate} className={`pg-ex pg-ex-${slot}`}>
      {fasteners}
      <Hand kind="label" className="pg-ex-num">
        {String(slot).padStart(2, "0")}
      </Hand>
      <h3 className="pg-ex-title">{name}</h3>
      <p className="pg-ex-tag">{tagline}</p>
      <a href={links.live} target="_blank" rel="noopener noreferrer" className="pg-ex-live focus-ring">
        <span className="pg-ex-url">{links.live}</span>
        <ArrowUpRight size={12} strokeWidth={1.75} aria-hidden="true" className="pg-ex-icon" />
        <VisuallyHidden>(opens in new tab)</VisuallyHidden>
      </a>
    </Sheet>
  );
}
