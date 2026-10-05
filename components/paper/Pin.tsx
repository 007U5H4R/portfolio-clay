import { paperWarning } from "./enforce";
import { FASTENER, HOSTED_PROP } from "./fastener";

/** No HTML-attribute spread — the props type has no `aria-hidden` (Design.md §3.2 rule 6). */
export type PinProps = {
  /** Pin head colour (mockups: rust default, `.pin.g` forest, `.pin.s` steel). */
  tone?: "rust" | "forest" | "steel" | undefined;
  className?: string | undefined;
};

/**
 * A push-pin fastening its host `Sheet` (Design.md §3.1; S70.05) — `<span data-fastener="pin">`,
 * not counted (D6), ≤ 2 per host, never rotated. Must be a direct child of a `Sheet`.
 */
export function Pin(props: PinProps) {
  const { tone = "rust", className } = props;
  if (!(props as Record<string, unknown>)[HOSTED_PROP]) {
    paperWarning("A fastener <Pin/> was rendered outside a <Sheet>; it must be a direct child of its host (Design.md §3.2 rule 8).");
  }
  return (
    <span
      data-fastener="pin"
      aria-hidden="true"
      data-tone={tone}
      className={["paper-pin", className].filter(Boolean).join(" ")}
    />
  );
}
Pin.isFastener = FASTENER;
Pin.displayName = "Fastener(Pin)";
