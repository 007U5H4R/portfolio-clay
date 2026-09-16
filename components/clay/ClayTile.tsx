import type { ReactNode } from "react";
import { tierClass, toneClass, type Tone } from "./tiers";

/**
 * 56/120/140/180 per technical-plan.md §B S03.04 (icon tiles, floating hero tiles, playground
 * tiles); 40 added so `ClayIcon`'s 40×40 nav-mark size (Design.md §3) can reuse this component
 * as its shell without a second near-duplicate tile primitive — a minimal, non-breaking widening
 * of the declared union, not a token change.
 */
export type ClayTileSize = 40 | 56 | 120 | 140 | 180;

type ClayTileBase = {
  size?: ClayTileSize | undefined;
  tone?: Tone | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
};

/**
 * `interactive` is only offered on the `card` tier (playground's "stronger clay", Design.md §3) —
 * the utility tier has no press state (Design.md §2 / D1), so `{tier:'utility', interactive:true}`
 * does not type-check, exactly as with `ClayProps`.
 */
export type ClayTileProps = ClayTileBase &
  ({ tier?: "utility" | undefined; interactive?: false | undefined } | { tier: "card"; interactive?: boolean | undefined });

/** Playground/interactive lift — the div carries the hover physics; a wrapping <a> owns focus. */
const interactiveTile =
  "transition-[transform,box-shadow] duration-200 ease-[var(--ease-hover)] hover:-translate-y-[5px] hover:shadow-[var(--shadow-clay-hover)] active:translate-y-px active:scale-[.98] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100";

/** Square icon/decorative tile — icon tiles, floating hero tiles, playground tiles (Design.md §3). */
export function ClayTile(props: ClayTileProps) {
  const { size = 56, tone, tier = "utility", className, children } = props;
  const interactive = "interactive" in props ? props.interactive : false;

  const classes = [
    "inline-flex shrink-0 items-center justify-center",
    tierClass[tier],
    tone ? toneClass[tone] : "",
    interactive ? interactiveTile : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={{ width: size, height: size }}>
      {children}
    </div>
  );
}
