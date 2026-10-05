import { RIDGE_PATHS, TORN_VIEWBOX } from "./sketch-paths";

export type TornFill = "paper" | "paper-2" | "terracotta" | "navy";

export type TornVariant = keyof typeof RIDGE_PATHS;

export type TornEdgeProps = {
  /** The fill of the section this edge belongs to (it is that section's first child). */
  fill?: TornFill | undefined;
  /** Ridge silhouette (TASK-145.4). Defaults by fill: paper → hills, paper-2 → ridge, navy → dunes, terracotta → ridge. */
  variant?: TornVariant | undefined;
  className?: string | undefined;
};

const DEFAULT_VARIANT: Record<TornFill, TornVariant> = {
  paper: "hills",
  "paper-2": "ridge",
  navy: "dunes",
  terracotta: "ridge",
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
 * (`data-decor="torn"`, three paper ridge layers since TASK-145.4: back, mid, and the section-fill front); render it as the **first child** of the section it belongs to. The band
 * (terracotta) edge is 46 px with its own denser silhouette; every other fill is 44 px.
 */
export function TornEdge({ fill = "paper", variant, className }: TornEdgeProps) {
  const [back, mid, front] = RIDGE_PATHS[variant ?? DEFAULT_VARIANT[fill]];
  const classes = ["block w-full -mb-px", FILL_CLASS[fill], className].filter(Boolean).join(" ");
  return (
    <svg
      data-decor="torn"
      data-ridge={variant ?? DEFAULT_VARIANT[fill]}
      aria-hidden="true"
      viewBox={TORN_VIEWBOX}
      preserveAspectRatio="none"
      focusable="false"
      className={classes}
    >
      <path className="torn-layer torn-back" d={back} />
      <path className="torn-layer torn-mid" d={mid} />
      <path className="torn-front" d={front} />
    </svg>
  );
}
