import type { ReactNode } from "react";

export interface SectionHeadingProps {
  /** Sets the `<h2>`'s id — pair with the parent `Section`'s `aria-labelledby` to wire them. */
  id?: string | undefined;
  eyebrow?: string | undefined;
  title: ReactNode;
  lead?: ReactNode | undefined;
  className?: string | undefined;
}

/**
 * Eyebrow + h2 + optional lead, capped at Design.md §2's 44ch reading measure
 * (technical-plan.md §B S05.01).
 */
export function SectionHeading({ id, eyebrow, title, lead, className }: SectionHeadingProps) {
  const classes = ["flex max-w-[44ch] flex-col gap-[var(--space-2)]", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {eyebrow ? (
        // ink-2, not Hero's ink-3 (Hero's eyebrow sits on the plain `bg`, never a toned Section):
        // ink-3 only clears WCAG AA 4.5:1 on `bg`/`surface` (~4.4-4.6) and fails against every
        // clay tone wash (e.g. lavender/30 measures ~3.85 — axe `color-contrast`, caught while
        // wiring this ticket's own `/dev/primitives` demo). ink-2 clears every tone with margin.
        <p className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-navy-2">
          {eyebrow}
        </p>
      ) : null}
      <h2 id={id} className="text-[length:var(--text-h2)] font-extrabold text-navy">
        {title}
      </h2>
      {lead ? <p className="text-[length:var(--text-lead)] text-navy-2">{lead}</p> : null}
    </div>
  );
}
