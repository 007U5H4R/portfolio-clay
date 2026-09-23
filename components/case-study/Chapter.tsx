import type { Project, SourceRef } from "@/data/schema";
import { Prose } from "@/components/common/Prose";
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
 * One case-study chapter (Design.md §3): a flat text zone — numbered `h2` + `Prose` body capped at
 * the 60ch/≤600px reading measure — with 1–3 artifacts laid out 1/2/3-up **within** the chapter
 * column (never full-bleed, Law of Proximity). The `<section>` carries the chapter's `id={anchor}`
 * so `/work/<slug>#<anchor>` deep links (How I Think, Ask evidence) resolve to it (E-3, EVAL-011);
 * `scroll-mt` offsets the jump past the sticky header + pill nav so the heading isn't obscured.
 *
 * Rendered only for chapters that actually have content — an empty chapter is omitted by the page
 * (short honest page), so this component never renders a bare heading over nothing.
 *
 * Body paragraphs render as plain text today. The schema notes bodies may carry inline markdown
 * links; a link renderer is deferred to the content milestone (M-005) that first supplies real
 * bodies — no body ships today, so there is nothing to mis-render.
 */
export function Chapter({ chapter, number, anchor, sources }: ChapterProps) {
  const numberLabel = String(number).padStart(2, "0");

  return (
    <section
      id={anchor}
      aria-labelledby={`chapter-${anchor}`}
      className="scroll-mt-[7rem] flex flex-col gap-[var(--space-5)]"
    >
      {/* QA-003 (TKT-48): the case-study `h1` was followed directly by this chapter heading with
          nothing at h2 — a heading-outline skip (h1 → h3) for every screen-reader user navigating
          by heading, on every deep-dive study. Promoted to `h2` (font size stays `--text-h3`, set
          by class, not tag) and `DecisionCard`'s heading bumped h4 → h3 alongside it so the outline
          reads h1 → h2 (chapter) → h3 (decision) with no skip in either direction. */}
      <h2
        id={`chapter-${anchor}`}
        className="text-[length:var(--text-h3)] font-bold text-ink"
      >
        <span className="mr-[var(--space-3)] tabular-nums text-ink-3">{numberLabel}</span>
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
        <ArtifactGrid className="max-w-[60ch]">
          {chapter.artifacts.map((artifact) => (
            <ArtifactRenderer key={artifact.id} artifact={artifact} sources={sources} />
          ))}
        </ArtifactGrid>
      ) : null}
    </section>
  );
}
