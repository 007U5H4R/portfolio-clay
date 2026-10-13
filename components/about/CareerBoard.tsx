"use client";

import { useState, type CSSProperties } from "react";
import type { Era } from "./about-content";
import { PINBOARD_CENTER } from "./about-content";
import { ERA_ART } from "./about-paper-art";
import { PaperImg, ThemedPaperImg } from "./PaperImg";

/**
 * The career pinboard (TASK-196): a teal map with four pinned photographs and notes, joined to the
 * "common thread" knot by red string. The map and photographs are Higgsfield art; the notes, the pins and
 * every thread are HTML/SVG. Choosing an era (its name is a button, 44 px high) lifts its note and
 * emphasises its string; all four eras stay visible. State is one `data-selected` on the board, so the
 * highlight is plain CSS (hover, focus-visible and the selection all drive the same rule).
 *
 * `.crx-thread` is the one hand-drawn sketch (EVAL-018 counts it): the slack string that draws in once
 * along the board's top and bottom. `.crx-links` are the four short threads to the knot.
 */
export function CareerBoard({ eras }: { eras: readonly Era[] }) {
  const [selected, setSelected] = useState<Era["id"] | null>(null);
  return (
    <div className="crx-board" data-selected={selected ?? ""}>
      <div className="crx-map" aria-hidden="true">
        <ThemedPaperImg id="map" className="crx-map-img" />
      </div>
      <svg className="sketch crx-thread" data-decor="sketch" data-sketch="thread" viewBox="0 0 1000 690" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path pathLength={1} d="M185 28 C 380 88, 620 88, 815 28 M185 390 C 380 452, 620 452, 815 390" />
      </svg>
      <svg className="crx-links" viewBox="0 0 1000 690" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {(
          [
            ["research", "M185 28 C 235 150, 400 230, 500 312"],
            ["ai", "M815 28 C 765 150, 600 230, 500 312"],
            ["cloud", "M185 390 C 260 400, 400 400, 500 378"],
            ["enterprise", "M815 390 C 740 400, 600 400, 500 378"],
          ] as const
        ).map(([id, d]) => (
          <g key={id} className="crx-link" data-era={id}>
            <path className="crx-link-base" d={d} />
            <path className="crx-link-hi" d={d} />
          </g>
        ))}
      </svg>
      <div className="crx-center" aria-hidden="true">
        <span className="crx-center-pin crx-center-pin-top" />
        <span className="crx-center-text">{PINBOARD_CENTER}</span>
        <span className="crx-center-pin crx-center-pin-bottom" />
      </div>
      <ol className="crx-list">
        {eras.map((era, index) => (
          <li key={era.id} className="crx-era" data-era={era.id} data-on={selected === era.id ? "" : undefined} style={{ "--era-i": index } as CSSProperties}>
            <span className="crx-dot" aria-hidden="true" />
            <div className="crx-card">
              <PaperImg id={ERA_ART[era.id]} className="crx-photo" />
              <h3 className="crx-name">
                <button type="button" className="crx-pick" aria-pressed={selected === era.id} onClick={() => setSelected((cur) => (cur === era.id ? null : era.id))}>
                  {era.name}
                </button>
              </h3>
              <p className="crx-desc">{era.descriptor}</p>
              <p className="crx-focus">{era.focus}</p>
              <p className="crx-refs">{era.refs}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
