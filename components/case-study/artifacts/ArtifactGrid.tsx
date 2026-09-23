import type { ReactNode } from "react";

export interface ArtifactGridProps {
  children: ReactNode;
  className?: string | undefined;
}

/**
 * The chapter-column artifact layout (TKT-20 AC 3, Design.md §3): evidence sits inside the
 * chapter's own column, never full-bleed (Law of Proximity: it stays anchored to the paragraph it
 * supports). The single home for this grid so `Chapter` (TKT-19), `Impact`, and the
 * `/dev/artifacts` board don't each re-decide the breakpoints.
 *
 * DES-001/DES-002 (Stage-8 critique) fix: the previous fixed `md:grid-cols-2 lg:grid-cols-3` made
 * every card 3-up inside the ≤60ch chapter column → ~184px cards, which (a) overflowed
 * `ExperimentCard`'s horizontal Setup/Result/Learning row past the card edge, and (b) left two
 * empty tracks whenever a chapter had a single artifact. Replaced with a container-driven
 * `auto-fit` track so cards never shrink below a legible 15rem, a lone artifact fills the column,
 * and the effective column count follows the real available width (2-up in the ≤60ch prose column,
 * more on the wider Impact / dev board) — no viewport-breakpoint guess. `min(100%,15rem)` keeps a
 * <240px container (narrow mobile) on a single full-width track instead of forcing an overflow.
 */
export function ArtifactGrid({ children, className }: ArtifactGridProps) {
  return (
    <div
      className={[
        // QA-007 (Stage 9): the original DES-002 template `repeat(auto-fit,minmax(min(100%,15rem),1fr))`
        // at EVERY width made the case-study page's single mobile column intrinsically size to 601px
        // (=60ch) at a 390px viewport → horizontal overflow (probe-verified: scrollWidth 649). The
        // pre-Stage-8 mobile behaviour (an explicit single column) was overflow-free, so it is
        // restored below `md`; auto-fit runs only from `md` up, where the chapter column is always
        // ≥15rem and the `min(100%,…)` clamp is unnecessary. `min-w-0` lets the grid shrink as a
        // flex/grid child. DES-002's wins (2-up cards, a lone artifact filling the row) are kept.
        "grid min-w-0 gap-[var(--space-5)] grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
