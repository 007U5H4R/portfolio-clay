import { TORN_PATHS, TORN_VIEWBOX } from "./sketch-paths";

export type TornFill = "paper" | "paper-2" | "terracotta" | "navy";

export type TornEdgeProps = {
  /** The fill of the section this edge belongs to (it is that section's first child). */
  fill?: TornFill | undefined;
  className?: string | undefined;
};

// Static class strings so Tailwind sees every utility (no interpolation).
const FILL_CLASS: Record<TornFill, string> = {
  paper: "fill-paper h-[44px]",
  "paper-2": "fill-paper-2 h-[44px]",
  navy: "fill-navy h-[44px]",
  terracotta: "fill-terracotta h-[46px]",
};

/**
 * Torn paper edge between sections (Design.md §3.1 row 1; S70.01). One counted decoration
 * (`data-decor="torn"`); render it as the **first child** of the section it belongs to. The band
 * (terracotta) edge is 46 px with its own denser silhouette; every other fill is 44 px.
 */
export function TornEdge({ fill = "paper", className }: TornEdgeProps) {
  const classes = ["block w-full -mb-px", FILL_CLASS[fill], className].filter(Boolean).join(" ");
  return (
    <svg
      data-decor="torn"
      aria-hidden="true"
      viewBox={TORN_VIEWBOX}
      preserveAspectRatio="none"
      focusable="false"
      className={classes}
    >
      <path d={fill === "terracotta" ? TORN_PATHS.band : TORN_PATHS.paper} />
    </svg>
  );
}
