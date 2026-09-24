import Link from "next/link";
import type { Essay } from "@/data/schema";
import { DraftTag } from "@/components/paper/DraftTag";

export interface ThinkingListProps {
  essays: Pick<Essay, "slug" | "title" | "dek" | "draft">[];
}

/**
 * `/thinking` numbered essay list (TKT-43, Design.md §3 "Thinking → ThinkingList"): "01" (`ink-3`,
 * large) + title (h3) + one-line dek, full width, 1px `ink-3`/10% bottom border, 32px vertical
 * padding. `hover`: number shifts to `accent`, row background tints `lavender` at 4% — a
 * deliberately quiet cue (this is an editorial list, not a card grid).
 *
 * No published essay exists yet (CONTENT_INVENTORY §5's own "Any published article/URL" row:
 * "MISSING — none exist"), so the honest empty-state line renders above the list every time — the
 * list itself still shows all 5 DRAFT rows underneath it (AC2/AC3: never silently hide the drafts,
 * never imply one is finished). Each row carries a "Draft — pending sign-off" `DraftTag` so the DRAFT
 * status is visible without opening the essay.
 *
 * The title renders as a real `<h3>` nested inside the row `<a>` (same transparent-content-model
 * pattern `ProjectCard.tsx` already uses) — a plain `<span>` styled with the h3 token passed axe
 * (axe doesn't flag a *missing* heading, only skipped order on ones that exist) but left every
 * essay title unreachable by screen-reader heading navigation. `app/thinking/page.tsx` adds the
 * matching `h2` this relies on so the document's heading order stays h1 → h2 → h3 with no skip.
 */
export function ThinkingList({ essays }: ThinkingListProps) {
  const publishedCount = essays.filter((essay) => !essay.draft).length;

  return (
    <div className="flex flex-col">
      {publishedCount === 0 ? (
        <p className="mb-[var(--space-6)] text-[length:var(--text-body)] text-navy-2">
          Essays in progress — five drafts, none published yet.
        </p>
      ) : null}

      <ol className="flex flex-col">
        {essays.map((essay, index) => (
          <li key={essay.slug} className="border-b border-navy/10">
            <Link
              href={`/thinking/${essay.slug}`}
              className="group flex items-baseline gap-[var(--space-5)] py-[var(--space-6)] transition-colors duration-200 ease-[var(--ease-hover)] hover:bg-paper-2/[0.04] focus-ring"
            >
              <span
                aria-hidden="true"
                className="shrink-0 text-[length:var(--text-h3)] font-bold tabular-nums text-ink-soft transition-colors duration-200 ease-[var(--ease-hover)] group-hover:text-rust"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex flex-1 flex-col gap-[var(--space-2)]">
                <span className="flex flex-wrap items-center gap-[var(--space-3)]">
                  <h3 className="text-[length:var(--text-h3)] font-bold text-navy">
                    {essay.title}
                  </h3>
                  {essay.draft ? <DraftTag /> : null}
                </span>
                <span className="text-[length:var(--text-body)] text-navy-2">{essay.dek}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
