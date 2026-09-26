"use client";

import { useEffect, useId, useRef, useState } from "react";
import { journeyPathSegments, type Point } from "./path-geometry";

export interface AnimatedJourneyPathProps {
  className?: string | undefined;
}

interface Geometry {
  w: number;
  h: number;
  segments: string[];
}

/** Layout position (transform-free: offsets ignore the roll's translate / tilt) of `el` inside `root`. */
function offsetIn(el: HTMLElement, root: HTMLElement): Point {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    const parent = node.offsetParent as HTMLElement | null;
    // offsetParent skipped past the root (root not positioned) — fall back to the root's own offset.
    if (parent && !root.contains(parent) && parent !== root) {
      x -= root.offsetLeft;
      y -= root.offsetTop;
      break;
    }
    node = parent;
  }
  return { x, y };
}

/**
 * The journey line drawn ACROSS the board (TKT-110, spec §2 / §3 / §20). Keeps the counted
 * decoration contract of the sketch it replaces (`svg[data-decor="sketch"][data-sketch="journey"]`,
 * `aria-hidden`, EVAL-018) and is still mounted through `MediaGate min={1025}` by its host.
 *
 * Geometry is measured, not stretched: each stage's pin sits at the top-centre of its
 * `[data-journey-stage]` box, so the pins are read from layout offsets (ResizeObserver keeps them
 * current) and `journeyPathSegments` routes the arcs above the pin row. Each segment is a dashed
 * path shown through its own solid mask path (`pathLength=1`, `data-journey-segment=i`); the runner
 * flips the mask path's `data-draw` and CSS animates its dashoffset 1 → 0, so the dash pattern of
 * the visible line never changes while it draws.
 */
export function AnimatedJourneyPath({ className }: AnimatedJourneyPathProps) {
  const ref = useRef<SVGSVGElement>(null);
  const maskId = `jr-mask-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [geo, setGeo] = useState<Geometry | null>(null);

  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-journey]");
    if (!root) return undefined;
    const measure = () => {
      const stages = Array.from(root.querySelectorAll<HTMLElement>("[data-journey-stage]"));
      const pins = stages.map((el) => {
        const o = offsetIn(el, root);
        return { x: o.x + el.offsetWidth / 2, y: o.y };
      });
      setGeo({ w: root.clientWidth, h: root.clientHeight, segments: journeyPathSegments(pins) });
    };
    measure();
    if (typeof ResizeObserver !== "function") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  const classes = ["sketch", "jr-path", className].filter(Boolean).join(" ");
  return (
    <svg
      ref={ref}
      data-decor="sketch"
      aria-hidden="true"
      data-sketch="journey"
      className={classes}
      viewBox={geo ? `0 0 ${geo.w} ${geo.h}` : undefined}
      focusable="false"
    >
      {geo ? (
        <>
          <defs>
            <mask id={maskId} className="jr-mask" maskUnits="userSpaceOnUse" x={-200} y={-200} width={geo.w + 400} height={geo.h + 400}>
              {geo.segments.map((d, i) => (
                <path key={i} d={d} pathLength={1} className="jr-seg-mask" data-journey-segment={i} />
              ))}
            </mask>
          </defs>
          <g mask={`url(#${maskId})`}>
            {geo.segments.map((d, i) => (
              <path key={i} d={d} className="jr-seg" />
            ))}
          </g>
        </>
      ) : null}
    </svg>
  );
}
