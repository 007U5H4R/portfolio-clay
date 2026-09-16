import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { tierClass, toneClass, type ClayProps, type Tier } from "./tiers";

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

/** Tiers that carry the clay "volume" — the only tiers that get the tone-gradient sheen overlay. */
const VOLUME_TIERS: ReadonlySet<Tier> = new Set<Tier>(["hero", "card"]);

/**
 * S04.02 — tone-gradient volume overlay rendered as an `after:` pseudo, NOT a second background
 * on the element. `isolate` opens a stacking context; `after:-z-10` then paints the sheen
 * *between* the card's own background (the tone tint + `tierClass` base volume) and its content
 * (which stays fully legible on top). This is the layer Design.md §3's Featured-Work hover
 * intensifies ("tone gradient +8% opacity") — opacity-only, so it is a permitted reduced-motion
 * change (Design.md §4 card-hover row). The "6% darker bottom edge" ships in `--shadow-clay-rest`
 * itself (`inset 0 -3px 6px …`), so no extra class is needed for it.
 */
const volumeOverlayClass =
  "relative isolate after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:bg-[image:var(--gradient-clay-volume)] after:opacity-0 after:transition-opacity after:duration-200 after:ease-[var(--ease-hover)]";
const volumeOverlayHoverClass = "hover:after:opacity-100";

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

  const hasVolume = VOLUME_TIERS.has(tier);

  const classes = [
    tierClass[tier],
    tone ? toneClass[tone] : "",
    padding ? paddingClass[padding] : "",
    hasVolume ? volumeOverlayClass : "",
    hasVolume && interactive ? volumeOverlayHoverClass : "",
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
