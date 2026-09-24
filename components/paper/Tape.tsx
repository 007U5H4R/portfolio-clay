import { ROTATION_CAP, rotationStyle } from "./rotation";

/**
 * Free-standing tape only (TSK-33). The fastener variant (`data-fastener="tape"`, rendered inside a
 * host, not counted — D6) arrives with TSK-34 and widens this props type.
 */
export type TapeProps = {
  /** Free-standing: not attached to a host, so it counts as a decoration (Design.md §3.1). */
  free: true;
  /** Degrees; clamped to ±12 (Design.md §3.1). */
  rotate?: number | undefined;
  className?: string | undefined;
};

/** A strip of tape on its own (Design.md §3.1; S70.02) — one counted decoration, `aria-hidden`. */
export function Tape({ rotate, className }: TapeProps) {
  return (
    <span
      data-decor="tape"
      aria-hidden="true"
      className={["paper-tape", className].filter(Boolean).join(" ")}
      style={rotationStyle(rotate, -3, ROTATION_CAP.tape)}
    />
  );
}
