import type { Project, SourceRef } from "@/data/schema";
import { Prose } from "@/components/common/Prose";
import { Hand } from "@/components/paper";
import { ArtifactGrid, ArtifactRenderer } from "@/components/case-study/artifacts";

/** One chapter of a project (the schema exports no standalone `Chapter` type). */
type ChapterData = Project["chapters"][number];

export interface ChapterProps {
  /** One non-empty chapter (the page filters out empty ones before rendering). */
  chapter: ChapterData;
  /** 1-based position among the RENDERED chapters — the "01".."08" the ChapterNav mirrors. */
  number: number;
  /** The presentation anchor (`CHAPTER_ANCHORS[id].anchor`, e.g. `05-what-i-built`) — E-3. */
  anchor: string;
  /** The owning project's sources — passed to `ArtifactRenderer` for provenance resolution. */
  sources: readonly SourceRef[];
}

/**
 * One case-study chapter (TKT-83 / Design.md §7.3 deep dive): a nested `<section class="chapter">` —
 * an `h2` whose numeral is a Caveat `Hand label` in rust, the body in `Prose` (a **flat zone**,
 * `data-flat`, ≤ 68ch — §3.2 rule 4: 0 decorations inside, ever), then the artifact cluster
 * (`ArtifactGrid`, paper objects alternating ±0.6°). The section carries the chapter's `id={anchor}`
 * so `/work/<slug>#<anchor>` deep links (How I Think, Ask evidence, `ChapterNav`) resolve to it
 * (E-3, EVAL-011); `scroll-margin-top` (`.chapter`, 7rem) keeps the heading clear of the sticky
 * header — Lenis reads it too (`lib/smooth-scroll.ts`).
 *
 * As a nested `<section>` it is its own EVAL-018 counting unit (§3.2 rule 1) — planned count 0 (§3.3):
 * the artifacts are `data-paper`, never `data-decor`.
 *
 * Rendered only for chapters that actually have content — an empty chapter is omitted by the page
 * (short honest page). Body paragraphs render as plain text (D7 — verbatim from `data/projects.ts`).
 */
export function Chapter({ chapter, number, anchor, sources }: ChapterProps) {
  const numberLabel = String(number).padStart(2, "0");

  return (
    <section id={anchor} aria-labelledby={`chapter-${anchor}`} className="chapter">
      {/* QA-003 (TKT-48): `h2` so the outline reads h1 → h2 (chapter) → h3 (decision) with no skip.
          The space after the numeral keeps the accessible name "01 Context", not "01Context". */}
      <h2 id={`chapter-${anchor}`}>
        <Hand kind="label" className="chapter-num">
          {numberLabel}
        </Hand>{" "}
        {chapter.title}
      </h2>

      {chapter.body.length > 0 ? (
        <Prose>
          {chapter.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </Prose>
      ) : null}

      {chapter.artifacts.length > 0 ? (
        <ArtifactGrid>
          {chapter.artifacts.map((artifact) => (
            <ArtifactRenderer key={artifact.id} artifact={artifact} sources={sources} />
          ))}
        </ArtifactGrid>
      ) : null}
    </section>
  );
}
