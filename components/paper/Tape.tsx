import { paperWarning } from "./enforce";
import { FASTENER, HOSTED_PROP } from "./fastener";
import { ROTATION_CAP, rotationStyle } from "./rotation";

type TapeCommon = {
  /** Degrees; clamped to ±12 (Design.md §3.1). */
  rotate?: number | undefined;
  className?: string | undefined;
};

/** Free-standing: not attached to a host, so it counts as a decoration (Design.md §3.1). */
export type FreeTapeProps = TapeCommon & { free: true };

/**
 * Fastener: fixes its host `Sheet` (not counted — D6; ≤ 2 per host). Must be a direct child of a
 * `Sheet`. `side` places it like the mockups' `.tape` / `.tape.l` / `.tape.r` (centre −3°, left −9°,
 * right 7° unless `rotate` is given).
 */
export type FastenerTapeProps = TapeCommon & { free?: false | undefined; side?: TapeSide | undefined };

export type TapeSide = "l" | "c" | "r";
export type TapeProps = FreeTapeProps | FastenerTapeProps;

const SIDE_ROT: Record<TapeSide, number> = { l: -9, c: -3, r: 7 };

/**
 * A strip of tape (Design.md §3.1; S70.02 free, S70.05 fastener). Always `aria-hidden`.
 *   - `free` → `<span data-decor="tape">`: one counted decoration.
 *   - default → `<span data-fastener="tape">`: fastens the `Sheet` it is a direct child of.
 */
export function Tape(props: TapeProps) {
  const { rotate, className } = props;
  if (props.free === true) {
    return (
      <span
        data-decor="tape"
        aria-hidden="true"
        className={["paper-tape", className].filter(Boolean).join(" ")}
        style={rotationStyle(rotate, -3, ROTATION_CAP.tape)}
      />
    );
  }

  const side = props.side ?? "c";
  if (!(props as Record<string, unknown>)[HOSTED_PROP]) {
    paperWarning("A fastener <Tape/> was rendered outside a <Sheet>; it must be a direct child of its host (Design.md §3.2 rule 8).");
  }
  return (
    <span
      data-fastener="tape"
      aria-hidden="true"
      data-side={side}
      className={["paper-tape paper-fastener", className].filter(Boolean).join(" ")}
      style={rotationStyle(rotate, SIDE_ROT[side], ROTATION_CAP.tape)}
    />
  );
}
Tape.isFastener = FASTENER;
Tape.displayName = "Fastener(Tape)";
