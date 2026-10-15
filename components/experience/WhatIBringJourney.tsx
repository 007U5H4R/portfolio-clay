"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { wibHint, wibStages, type WibStage } from "@/data/what-i-bring";

/**
 * "What I Bring" journey (TASK-216, replaces the TASK-187 card strip and the TASK-203 scene machine).
 * One continuous paper-cut landscape (a generated image, light and dark variants swapped by CSS on `<html data-theme>`,
 * so nothing is downloaded for the theme that is not showing), seven stage markers positioned over it in percent of the
 * image, a right-hand detail panel and a seven-stage track below. One piece of state, `selected`, drives all three plus
 * prev / next; nothing routes. Semantics: the track is the tablist (roving tabindex, arrows / Home / End select and move
 * focus), the panels are its tabpanels, the markers are extra pointer / touch targets (aria-pressed, out of the tab order
 * so keyboard users do not meet every stage twice), and one polite live region announces the new stage.
 * Motion: a short opacity change on the panel and a lift on the active marker, none under reduced motion; the landscape
 * itself never animates (below 960 px it is panned to the active stage with one CSS transition).
 */

/** Marker anchors (where the pin points) as a fraction of the 1344 x 576 landscape image, one per stage in order. */
const ANCHOR: [number, number][] = [
  [140 / 1344, 150 / 576], // Ambiguity: the question-mark rock
  [300 / 1344, 318 / 576], // Discovery: compass and notebook
  [470 / 1344, 185 / 576], // Product: the district
  [672 / 1344, 205 / 576], // AI + GenAI: the core and its nodes
  [830 / 1344, 180 / 576], // Technology: the dish and data blocks
  [985 / 1344, 172 / 576], // Execution: crane and bridge
  [1250 / 1344, 92 / 576], // Impact: the summit
];

const LAND_W = 1344;
const LAND_H = 576;

function Landscape() {
  const common = { width: LAND_W, height: LAND_H, sizes: "(min-width: 960px) 62vw, 240vw", draggable: false } as const;
  return (
    <>
      <Image className="wibj-land wibj-land-light" src="/media/experience/journey-landscape-light.webp" alt="" {...common} loading="lazy" />
      <Image className="wibj-land wibj-land-dark" src="/media/experience/journey-landscape-dark.webp" alt="" {...common} loading="lazy" />
    </>
  );
}

function Panel({ stage, active, total }: { stage: WibStage; active: boolean; total: number }) {
  const [tapChip, setTapChip] = useState<string | null>(null); // touch: the chip whose project label is showing
  return (
    <div
      id={`wib-panel-${stage.id}`}
      role="tabpanel"
      aria-labelledby={`wib-tab-${stage.id}`}
      className="wibj-panel"
      data-active={active ? "" : undefined}
    >
      <p className="wibj-count" data-micro-label="">
        {stage.number} / {String(total).padStart(2, "0")}
      </p>
      <h3 className="wib-title wibj-title">{stage.title}</h3>
      <p className="wibj-line">{stage.heading}</p>
      <p className="wibj-text">{stage.principle.join(" ")}</p>
      <ul className="wib-caps" aria-label="What I bring at this stage">
        {stage.capabilities.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      {stage.flow ? (
        <ol className="wib-flow" aria-label="Flow">
          {stage.flow.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ol>
      ) : null}
      {stage.tools.length > 0 ? (
        <div className="wib-tools">
          <span className="wib-tools-label" data-micro-label="">Tools I use</span>
          <ul className="wib-chips">
            {stage.tools.map((t) => {
              const key = `${stage.id}:${t.label}`;
              return (
                <li
                  key={t.label}
                  className="wib-chip focus-ring"
                  tabIndex={0}
                  data-project={t.project ? "" : undefined}
                  data-tap={tapChip === key ? "" : undefined}
                  onPointerDown={(e) => {
                    if (e.pointerType !== "mouse" && t.project) setTapChip((cur) => (cur === key ? null : key));
                  }}
                  onBlur={() => setTapChip((cur) => (cur === key ? null : cur))}
                >
                  {t.label}
                  {t.project ? <span className="wib-chip-note">{`→ ${t.project.name}`}</span> : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {stage.examples ? (
        <ul className="wib-evidence" aria-label="From my work">
          {stage.examples.map((ex) => (
            <li key={ex.name}>{ex.name}</li>
          ))}
        </ul>
      ) : null}
      {stage.proof ? (
        <ul className="wib-proof" aria-label="Evidence from my work">
          {stage.proof.map((p) => (
            <li key={p.label}>
              <b>{p.value}</b>
              <span>{p.label}</span>
              {p.note ? <i>({p.note})</i> : null}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="wibj-art">
        {active ? (
          <Image src={stage.art.src} alt={stage.art.alt} width={880} height={663} sizes="(min-width: 960px) 380px, 90vw" loading="lazy" draggable={false} />
        ) : null}
      </div>
    </div>
  );
}

export function WhatIBringJourney() {
  const total = wibStages.length;
  const [selected, setSelected] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const focusTab = useRef(false);

  const select = (i: number, focus = false) => {
    focusTab.current = focus;
    setSelected(((i % total) + total) % total);
  };

  // Keep the active tab in view in the horizontally scrolling mobile track (the container only; never the page), and move
  // focus to it after a keyboard selection.
  useEffect(() => {
    const track = trackRef.current;
    const tab = track?.querySelector<HTMLElement>(`#wib-tab-${wibStages[selected]!.id}`);
    if (!track || !tab) return;
    if (track.scrollWidth > track.clientWidth + 1) {
      const left = tab.offsetLeft - (track.clientWidth - tab.offsetWidth) / 2;
      track.scrollTo({ left, behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    if (focusTab.current) {
      tab.focus({ preventScroll: true });
      focusTab.current = false;
    }
  }, [selected]);

  const onTabKey = (e: KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown") select(selected + 1, true);
    else if (k === "ArrowLeft" || k === "ArrowUp") select(selected - 1, true);
    else if (k === "Home") select(0, true);
    else if (k === "End") select(total - 1, true);
    else return;
    e.preventDefault();
  };

  const stage = wibStages[selected]!;
  const [ax] = ANCHOR[selected]!;

  return (
    <div className="wibj" data-stage={stage.id} style={{ "--ax": ax } as CSSProperties}>
      <div className="wibj-grid">
        <div className="wibj-left">
          <div className="wibj-frame">
            <div className="wibj-map">
              <Landscape />
              {wibStages.map((s, i) => {
                const [x, y] = ANCHOR[i]!;
                const on = i === selected;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className="wibj-pin"
                    data-on={on ? "" : undefined}
                    data-n={i + 1}
                    tabIndex={-1}
                    aria-pressed={on}
                    aria-label={`Stage ${i + 1}: ${s.title}`}
                    style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
                    onClick={() => select(i)}
                  >
                    <span className="wibj-pin-num" aria-hidden="true">{i + 1}</span>
                    <span className="wibj-pin-label" aria-hidden="true">{s.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="wibj-trackwrap">
            <div className="wibj-track" role="tablist" aria-label="Seven stages, ambiguity to impact" ref={trackRef}>
              {wibStages.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  id={`wib-tab-${s.id}`}
                  className="wibj-tab"
                  data-n={i + 1}
                  aria-selected={i === selected}
                  aria-controls={`wib-panel-${s.id}`}
                  tabIndex={i === selected ? 0 : -1}
                  onClick={() => select(i)}
                  onKeyDown={onTabKey}
                >
                  <span className="wibj-tab-num" aria-hidden="true">{i + 1}</span>
                  <span className="wibj-tab-name">{s.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="wibj-right">
          <div className="wibj-card">
            <div className="wibj-nav">
              <button type="button" className="wibj-step focus-ring" aria-label="Previous stage" onClick={() => select(selected - 1)}>
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path d="M12 4 6 10l6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" className="wibj-step focus-ring" aria-label="Next stage" onClick={() => select(selected + 1)}>
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path d="m8 4 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className="wibj-panels">
              {wibStages.map((s, i) => (
                <Panel key={s.id} stage={s} active={i === selected} total={total} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite" role="status">
        {`Stage ${selected + 1} of ${total}: ${stage.title}. ${stage.heading}`}
      </p>
      <p className="wib-hint">{wibHint}</p>
    </div>
  );
}
