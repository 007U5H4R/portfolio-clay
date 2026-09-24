import type { ReactNode } from "react";

export interface TagProps {
  children: ReactNode;
  className?: string | undefined;
}

/**
 * Static tag pill (M-009 Design.md §2.2 "Eyebrow / kicker / tags": Inter 600 uppercase 12 px,
 * tracking .12em, `green-2`) on an ivory pill with a `--line` hairline. Deliberately no hover
 * state, so it is never mistaken for an interactive control (Law of Similarity). Never Caveat
 * (§3.4). No longer wraps the clay pill (TSK-34).
 */
export function Tag({ children, className }: TagProps) {
  const classes = [
    "inline-flex items-center rounded-full border border-[var(--line)] bg-ivory px-[10px] py-[3px] font-body text-[12px] font-semibold uppercase leading-[1.4] tracking-[.12em] text-green-2",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={classes} data-micro-label="">
      {children}
    </span>
  );
}
