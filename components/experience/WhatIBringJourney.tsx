"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type FocusEvent, type PointerEvent } from "react";
import { wibHint, wibStages, type WibStage } from "@/data/what-i-bring";

/**
 * "What I Bring" journey (TASK-187). One list of seven stages; CSS lays it out as a continuous paper landscape
 * (>= 1100 px) or a vertical tap-to-expand trail (below). Behaviour contract (TASK-181 P1, EXE-59…64):
 *  - one active stage at a time: a fine pointer activates on hover, the keyboard on :focus-visible, a tap or Enter pins;
 *  - desktop (the landscape layout) never shows an empty detail panel: stage 01 is selected on load and the last-selected
 *    stage stays shown after the pointer or focus leaves. The mobile trail keeps its own collapsed-by-default state;
 *  - all hover/focus styling keys off `data-active` (no `:hover` rules), so a tap leaves nothing stuck;
 *  - pointer parallax (<= 6 px, `--px/--py` in [-1, 1]) is computed for the active stage only, from one element-level
 *    listener, one write per frame, no loop; reduced motion and coarse pointers never attach it;
 *  - no infinite animations; the detail text is always in the DOM, so nothing is pointer-only.
 */

const ART: Record<WibStage["id"], { alt: string }> = {
  ambiguity: { alt: "Crumpled paper, scattered notes and a question-mark tag" },
  discovery: { alt: "An open research notebook with a magnifying glass" },
  product: { alt: "A product blueprint on an easel with a compass and a lightbulb" },
  "ai-genai": { alt: "A paper-cut AI brain with a chip, data blocks, documents and a check mark" },
  technology: { alt: "Layered paper architecture blocks under a cloud" },
  execution: { alt: "A delivery board with sticky notes, a target and a gear" },
  impact: { alt: "A paper mountain with a flag, a road to the summit and a rising chart" },
};

/** Marker + path geometry in the strip's 2400 x 1028 box (path = Catmull-Rom through the seven road points). */
const ROAD: [number, number][] = [
  [171, 826],
  [514, 852],
  [857, 898],
  [1200, 914],
  [1543, 890],
  [1886, 836],
  [2229, 788],
];
function segment(i: number): string {
  const p = (k: number) => ROAD[Math.min(Math.max(k, 0), ROAD.length - 1)]!;
  const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
  const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
  const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
  return `M${p1[0]} ${p1[1]}C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
}

type Mode = "hover" | "pin";

export function WhatIBringJourney() {
  const [active, setActive] = useState<string | null>(null); // hovered / focused / tapped right now
  const [selected, setSelected] = useState<string>(wibStages[0]!.id); // last selection; desktop keeps it shown
  const [isDesktop, setIsDesktop] = useState(false);
  const modeRef = useRef<Mode>("hover");
  const listRef = useRef<HTMLOListElement>(null);

  const open = useCallback((id: string, mode: Mode) => {
    modeRef.current = mode;
    setActive(id);
    setSelected(id);
  }, []);

  const onPointerEnter = (e: PointerEvent, id: string) => {
    if (e.pointerType === "mouse" && modeRef.current !== "pin") open(id, "hover");
  };
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && modeRef.current === "hover") setActive(null);
  };
  const onFocus = (e: FocusEvent<HTMLElement>, id: string) => {
    if (e.target.matches(":focus-visible")) open(id, "pin");
  };
  const onBlur = (e: FocusEvent<HTMLElement>) => {
    if (!listRef.current?.contains(e.relatedTarget as Node | null) && modeRef.current === "pin") setActive(null);
  };
  const onClick = (id: string) => {
    if (active === id && modeRef.current === "pin") setActive(null);
    else open(id, "pin");
  };

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1100px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Pointer parallax for the active stage only (fine pointer, motion allowed).
  useEffect(() => {
    if (!active) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-stage="${active}"]`);
    if (!el) return;
    let raf = 0;
    let rect = el.getBoundingClientRect();
    const onMove = (e: globalThis.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = e.clientX;
      const y = e.clientY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        rect = el.getBoundingClientRect();
        el.style.setProperty("--px", String(Math.max(-1, Math.min(1, ((x - rect.left) / rect.width) * 2 - 1)).toFixed(3)));
        el.style.setProperty("--py", String(Math.max(-1, Math.min(1, ((y - rect.top) / rect.height) * 2 - 1)).toFixed(3)));
      });
    };
    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      el.style.removeProperty("--px");
      el.style.removeProperty("--py");
    };
  }, [active]);

  // what the page shows: the landscape keeps the last selection, the trail only what is expanded
  const shown = isDesktop ? selected : active;
  const activeIndex = wibStages.findIndex((s) => s.id === shown);

  return (
    <div className="wib" data-active={shown ?? undefined}>
      <div className="wib-scene">
        <Image
          className="wib-strip"
          src="/media/what-i-bring/landscape/strip.webp"
          alt=""
          width={2400}
          height={1028}
          sizes="(min-width: 1100px) 1280px, 1px"
          loading="lazy"
        />
        <svg className="wib-road" viewBox="0 0 2400 1028" aria-hidden="true" focusable="false" preserveAspectRatio="none">
          {wibStages.slice(0, -1).map((s, i) => (
            <path
              key={s.id}
              d={segment(i)}
              pathLength={1}
              data-on={activeIndex === i || activeIndex === i + 1 ? "" : undefined}
            />
          ))}
        </svg>
        <ol className="wib-stages" ref={listRef} onPointerLeave={onPointerLeave}>
          {wibStages.map((s, i) => {
            const isActive = shown === s.id;
            const [mx, my] = ROAD[i]!;
            return (
              <li
                key={s.id}
                className="wib-stage"
                data-stage={s.id}
                data-active={isActive ? "" : undefined}
                style={{ "--i": i, "--mx": `${(mx / 2400) * 100}%`, "--my": `${(my / 1028) * 100}%` } as React.CSSProperties}
                onPointerEnter={(e) => onPointerEnter(e, s.id)}
              >
                <button
                  type="button"
                  className="wib-card"
                  aria-expanded={isActive}
                  aria-controls={`wib-panel-${s.id}`}
                  onClick={() => onClick(s.id)}
                  onFocus={(e) => onFocus(e, s.id)}
                  onBlur={onBlur}
                >
                  <span className="wib-num" data-micro-label="">{s.number}</span>
                  <span className="wib-title">{s.title}</span>
                  <span className="wib-principle">
                    {s.principle.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </span>
                </button>
                <div className="wib-art" aria-hidden="true">
                  {(["back", "mid", "front"] as const).map((layer) => (
                    <Image
                      key={layer}
                      className="wib-layer"
                      data-layer={layer}
                      src={`/media/what-i-bring/${s.id}/${layer}.webp`}
                      alt=""
                      width={720}
                      height={720}
                      sizes="(min-width: 1100px) 190px, 120px"
                      loading="lazy"
                    />
                  ))}
                </div>
                <span className="wib-marker" aria-hidden="true" />
                <span className="sr-only">{ART[s.id].alt}</span>
                <div
                  id={`wib-panel-${s.id}`}
                  role="region"
                  aria-labelledby={`wib-h-${s.id}`}
                  className="wib-panel"
                  data-open={isActive ? "" : undefined}
                >
                  <div className="wib-panel-inner">
                    <h3 id={`wib-h-${s.id}`} className="wib-panel-h">
                      {s.heading}
                    </h3>
                    <ul className="wib-caps">
                      {s.capabilities.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                    {s.flow ? (
                      <ol className="wib-flow" aria-label="Flow">
                        {s.flow.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ol>
                    ) : null}
                    {s.tools.length > 0 ? (
                      <p className="wib-tools">
                        <span className="wib-tools-label" data-micro-label="">Tools I use</span>
                        {s.tools.map((t) => t.label).join(" · ")}
                      </p>
                    ) : null}
                    {s.examples ? (
                      <ul className="wib-evidence" aria-label="From my work">
                        {s.examples.map((ex) => (
                          <li key={ex.name}>{ex.name}</li>
                        ))}
                      </ul>
                    ) : null}
                    {s.proof ? (
                      <ul className="wib-proof" aria-label="Evidence from my work">
                        {s.proof.map((p) => (
                          <li key={p.label}>
                            <b>{p.value}</b>
                            <span>{p.label}</span>
                            {p.note ? <i>({p.note})</i> : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="wib-hint">{wibHint}</p>
    </div>
  );
}
