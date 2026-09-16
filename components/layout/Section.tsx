import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { toneClass, type Tone } from "@/components/clay/tiers";
import { Container } from "./Container";

type SectionOwnProps = {
  /**
   * One accent tone for the whole section (Design.md §3 "one accent per section"). The prop
   * itself is the mechanism — a `Section` can only ever request a single tone, never a mix.
   */
  tone?: Tone | undefined;
  /** Extra classes for the inner `Container` (gutters/max-width stay Container's own contract). */
  containerClassName?: string | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
};

export type SectionProps = SectionOwnProps &
  Omit<ComponentPropsWithoutRef<"section">, keyof SectionOwnProps>;

/**
 * Page-composition rhythm shell (technical-plan.md §B S05.01, Design.md §2 section-gap tokens).
 * Applies the 72/96/128px vertical-rhythm ladder (mobile/tablet/desktop) plus an optional single
 * accent-tone wash on the outer `<section>`, wrapping children in `Container` so gutters/max-width
 * stay centralised in one place. `id` / `aria-labelledby` pass straight through via `...rest` —
 * pair `aria-labelledby` with the `id` set on a child `SectionHeading`'s heading.
 */
export function Section(props: SectionProps) {
  const { tone, containerClassName, className, children, ...rest } = props;

  const classes = [
    "py-[var(--section-gap-mobile)] md:py-[var(--section-gap-tablet)] lg:py-[var(--section-gap-desktop)]",
    tone ? toneClass[tone] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} {...rest}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
