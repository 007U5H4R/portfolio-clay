import Link from "next/link";
import type { Essay } from "@/data/schema";
import { Tag } from "@/components/common/Tag";

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
 * never imply one is finished). Each row carries a "Draft — pending sign-off" `Tag` so the DRAFT
 * status is visible without opening the essay.
 */
export function ThinkingList({ essays }: ThinkingListProps) {
  const publishedCount = essays.filter((essay) => !essay.draft).length;

  return (
    <div className="flex flex-col">
      {publishedCount === 0 ? (
        <p className="mb-[var(--space-6)] text-[length:var(--text-body)] text-ink-2">
          Essays in progress — five drafts, none published yet.
        </p>
      ) : null}

      <ol className="flex flex-col">
        {essays.map((essay, index) => (
          <li key={essay.slug} className="border-b border-ink/10">
            <Link
              href={`/thinking/${essay.slug}`}
              className="group flex items-baseline gap-[var(--space-5)] py-[var(--space-6)] transition-colors duration-200 ease-[var(--ease-hover)] hover:bg-lavender/[0.04] focus-ring"
            >
              <span
                aria-hidden="true"
                className="shrink-0 text-[length:var(--text-h3)] font-bold tabular-nums text-ink-3 transition-colors duration-200 ease-[var(--ease-hover)] group-hover:text-accent"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex flex-1 flex-col gap-[var(--space-2)]">
                <span className="flex flex-wrap items-center gap-[var(--space-3)]">
                  <span className="text-[length:var(--text-h3)] font-bold text-ink">
                    {essay.title}
                  </span>
                  {essay.draft ? <Tag>Draft — pending sign-off</Tag> : null}
                </span>
                <span className="text-[length:var(--text-body)] text-ink-2">{essay.dek}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
