import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { tierClass, toneClass, type ClayProps } from "./tiers";

const paddingClass: Record<"card" | "hero", string> = {
  card: "p-[var(--card-padding)]",
  hero: "p-[var(--card-padding-hero)]",
};

/**
 * `interactive` physics verbatim from technical-plan.md §B S03.02: 200ms hover lift + shadow
 * swap, 90ms press scale, collapsed under `motion-reduce`. `.focus-ring` gives the shared
 * 3px-accent / 3px-offset focus treatment (Design.md §2).
 */
const interactiveClass =
  "transition-[transform,box-shadow] duration-200 ease-[var(--ease-hover)] hover:-translate-y-[5px] hover:shadow-[var(--shadow-clay-hover)] active:translate-y-px active:scale-[.98] active:shadow-[var(--shadow-clay-press)] motion-reduce:hover:translate-y-0";

type ClayCardOwnProps<E extends ElementType> = ClayProps & {
  as?: E | undefined;
  /** Reads `--card-padding` / `--card-padding-hero` (Design.md §2, E-6). */
  padding?: "card" | "hero" | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
};

export type ClayCardProps<E extends ElementType = "div"> = ClayCardOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof ClayCardOwnProps<E>>;

/** Polymorphic clay surface — `ClayProps` fixes which tone/interactive combinations compile (D1). */
export function ClayCard<E extends ElementType = "div">(props: ClayCardProps<E>) {
  const { as, tier, tone, interactive, padding, className, children, ...rest } = props;
  const Component = (as ?? "div") as ElementType;

  const classes = [
    tierClass[tier],
    tone ? toneClass[tone] : "",
    padding ? paddingClass[padding] : "",
    interactive ? `${interactiveClass} focus-ring` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
