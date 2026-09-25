import Link from "next/link";
import type { Essay } from "@/data/schema";
import { getProject } from "@/data/projects";
import { DraftTag } from "@/components/paper/DraftTag";
import { FlatZone } from "@/components/paper/FlatZone";
import { Hand } from "@/components/paper/Hand";
import { EssayMargin } from "./EssayMargin";

export interface EssayPagerLink {
  slug: string;
  title: string;
}

export interface EssayBodyProps {
  essay: Essay;
  /** 1-based position in `data/writing.ts` — the header eyebrow "Essay · nn". */
  number: number;
  /** The next essay in `data/writing.ts` order, if any (pager). */
  next?: EssayPagerLink | undefined;
}

/**
 * `/thinking/[slug]` essay (TKT-84 S84.02, Design.md §7.6; decision S18, Dev-17): the `article` grid
 * `minmax(0, 68ch) minmax(220px, 1fr)` — crumb "← Thinking" (`Hand cta`), header (eyebrow
 * "Essay · nn", h1, dek, meta row with reading time · related link · **one** `DraftTag`), the margin
 * column, the `.prose` flat zone and the pager.
 *
 * `.prose` is `data-flat` (0 decorations): each sourced passage is a `blockquote data-hand="quote"`
 * with an Inter "Source: …" cite (never `.ref`, the local inventory path), then the framing paragraph
 * in Inter, then "Related project: … →" (`Hand cta`).
 *
 * S18 / TC-164: the framing paragraph renders `essay.framing` **as is**. Every `framing` in
 * `data/writing.ts` already begins with "Draft — pending sign-off:", so the component must never add
 * that prefix again (it did until TKT-84 — the page showed it twice). The `DraftTag` in the meta row
 * reads "Draft — pending sign-off" without the colon; the regression tests count the colon form.
 */
export function EssayBody({ essay, number, next }: EssayBodyProps) {
  const relatedProject = essay.relatedProject ? getProject(essay.relatedProject) : undefined;
  const sourceById = new Map(essay.sources.map((source) => [source.id, source]));
  const numeral = String(number).padStart(2, "0");

  return (
    <article className="essay-article">
      <Link href="/thinking" className="essay-crumb focus-ring">
        <Hand kind="cta">← Thinking</Hand>
      </Link>

      <header className="essay-head">
        <p className="essay-eyebrow">
          Essay <span className="essay-eyebrow-dot" aria-hidden="true">·</span> {numeral}
        </p>
        <h1 id="essay-h" className="essay-h1">
          {essay.title}
        </h1>
        <p className="essay-dek">{essay.dek}</p>
        <p className="essay-meta">
          <span>{essay.readingMinutes} min read</span>
          {relatedProject ? (
            <Link href={`/work/${relatedProject.slug}`} className="essay-meta-rel focus-ring">
              Related project: {relatedProject.name} →
            </Link>
          ) : null}
          {essay.draft ? <DraftTag /> : null}
        </p>
      </header>

      <EssayMargin />

      <FlatZone className="essay-prose">
        {essay.passages.map((passage, index) => {
          const source = sourceById.get(passage.source);
          return (
            <figure key={index} className="essay-pull" data-tone={index % 2 === 1 ? "forest" : "rust"}>
              <Hand
                kind="quote"
                cite={
                  source ? (
                    <cite className="hand-cite essay-pull-cite">
                      <b>Source:</b> {source.label}
                    </cite>
                  ) : undefined
                }
              >
                “{passage.quote}”
              </Hand>
            </figure>
          );
        })}

        <p className="essay-framing">{essay.framing}</p>

        {relatedProject ? (
          <Link href={`/work/${relatedProject.slug}`} className="essay-related focus-ring">
            <Hand kind="cta">Related project: {relatedProject.name} →</Hand>
          </Link>
        ) : null}
      </FlatZone>

      <nav className="essay-pager" aria-label="Essay navigation">
        <Link href="/thinking" className="essay-pager-prev focus-ring">
          <Hand kind="cta" className="essay-pager-lbl">
            ← all notes
          </Hand>
          <span className="essay-pager-title">Thinking</span>
        </Link>
        {next ? (
          <Link href={`/thinking/${next.slug}`} className="essay-pager-next focus-ring">
            <Hand kind="cta" className="essay-pager-lbl">
              next note →
            </Hand>
            <span className="essay-pager-title">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
