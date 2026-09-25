import Link from "next/link";
import type { Essay } from "@/data/schema";
import { getProject } from "@/data/projects";
import { Container } from "@/components/layout/Container";
import { Annotation } from "@/components/paper/Annotation";
import { DraftTag } from "@/components/paper/DraftTag";
import { Hand } from "@/components/paper/Hand";
import { MediaGate } from "@/components/paper/MediaGate";
import { Sheet } from "@/components/paper/Sheet";
import { Sketch } from "@/components/paper/Sketch";
import { Sticky } from "@/components/paper/Sticky";
import { TornEdge } from "@/components/paper/TornEdge";

export type ThinkingListEssay = Pick<
  Essay,
  "slug" | "title" | "dek" | "draft" | "readingMinutes" | "relatedProject" | "publishedOn"
>;

export interface ThinkingListProps {
  essays: readonly ThinkingListEssay[];
}

/** The Dev-02 empty-state line (Inter, `[data]`) — shown while no essay carries `publishedOn`. */
export const ESSAYS_EMPTY_LINE = "Essays in progress — five drafts, none published yet.";

/** Row rhythm from the mockup: a large lead entry, entries 2 and 4 indented, a quiet last entry. */
function entryVariant(index: number, total: number): "lead" | "shift" | "quiet" | undefined {
  if (index === 0) return "lead";
  if (total > 2 && index === total - 1) return "quiet";
  return index % 2 === 1 ? "shift" : undefined;
}

/**
 * `/thinking` essays section (TKT-84 S84.01, Design.md §7.5 / §3.3; Dev-02): `section aria-label="Essays"`
 * on `paper-2` with its torn top edge, a visible h2 "Essays" with the underline sketch, the Inter
 * empty-state line while `essays.filter(e => e.publishedOn).length === 0`, a "start here ↓" sticky,
 * the margin annotation "the same lesson, told twice" (≥ 1320 only — `MediaGate` keeps it out of the
 * DOM below, so the unit is 4 at 1440 and 3 at 390), and the ruled notebook `Sheet` with one `li` per
 * essay: Caveat numeral label, h3 link, dek, meta (reading time · related project · `DraftTag`).
 * Empty collection: the sheet area shows the empty-state line alone.
 */
export function ThinkingList({ essays }: ThinkingListProps) {
  const publishedCount = essays.filter((essay) => essay.publishedOn).length;

  return (
    <section aria-label="Essays" className="thinking-essays">
      <TornEdge fill="paper-2" />
      <div className="thinking-essays-body">
        <Container>
          <div className="essays-head">
            <h2 className="essays-h2">
              <span className="essays-ul">
                Essays
                <Sketch variant="underline" />
              </span>
            </h2>
            {publishedCount === 0 ? <p className="essays-empty">{ESSAYS_EMPTY_LINE}</p> : null}
          </div>

          {essays.length > 0 ? (
            <div className="essays-sheet-wrap">
              <Sticky rotate={5} className="essays-start">
                start here ↓
              </Sticky>
              <MediaGate min={1320}>
                <Annotation size="sm" arrow="left" className="essays-margin">
                  the same lesson, told twice
                </Annotation>
              </MediaGate>

              <Sheet variant="notebook" className="essays-sheet">
                <ol className="essays-list">
                  {essays.map((essay, index) => {
                    const related = essay.relatedProject ? getProject(essay.relatedProject) : undefined;
                    return (
                      <li
                        key={essay.slug}
                        className="essay-entry"
                        data-variant={entryVariant(index, essays.length)}
                      >
                        <span className="essay-num" aria-hidden="true">
                          <Hand kind="label">{String(index + 1).padStart(2, "0")}</Hand>
                        </span>
                        <div className="essay-entry-body">
                          <h3 className="essay-entry-title">
                            <Link href={`/thinking/${essay.slug}`} className="focus-ring">
                              {essay.title}
                            </Link>
                          </h3>
                          <p className="essay-entry-dek">{essay.dek}</p>
                          <p className="essay-meta">
                            <span>{essay.readingMinutes} min read</span>
                            {related ? (
                              <Link href={`/work/${related.slug}`} className="essay-meta-rel focus-ring">
                                Related project: {related.name} →
                              </Link>
                            ) : null}
                            {essay.draft ? <DraftTag /> : null}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Sheet>
            </div>
          ) : null}
        </Container>
      </div>
    </section>
  );
}
