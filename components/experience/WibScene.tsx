"use client";

import Image from "next/image";
import { Fragment, type CSSProperties } from "react";
import { useTheme } from "@/lib/use-theme";
import { wibScenes, type StageId, type WibStroke } from "@/lib/wib/scenes";

/**
 * One "What I Bring" paper scene (TASK-203): the depth-ordered part sprites plus the hand-drawn SVG strokes of
 * `lib/wib/scenes.ts`, in the artwork for the active theme only (`useTheme()`: `null` on the server and the first client
 * render, so nothing is requested until the theme is known and a dark visitor never downloads the light set).
 * All motion is CSS keyed off the stage's `data-active` (hover / focus / pin) and `data-phase` (the scene machine).
 */
function Strokes({ strokes, stage }: { strokes: WibStroke[]; stage: StageId }) {
  if (strokes.length === 0) return null;
  return (
    <svg className="wib-ink" viewBox="0 0 720 720" aria-hidden="true" focusable="false">
      {strokes.map((k) => (
        <path key={k.id} d={k.d} pathLength={1} data-s={stage} data-o={k.id} data-kind={k.kind ?? "line"} data-rest={k.rest ? "" : undefined} />
      ))}
    </svg>
  );
}

export function WibScene({ stage }: { stage: StageId }) {
  const theme = useTheme();
  const sc = wibScenes[stage];
  const dir = theme ? `/media/what-i-bring/scenes/${stage}/${theme}` : null;
  const img = (name: string, extra?: string) =>
    dir ? (
      <Image
        className={`wib-img${extra ? ` ${extra}` : ""}`}
        src={`${dir}/${name}.webp`}
        alt=""
        width={512}
        height={512}
        sizes="(min-width: 1100px) 200px, 120px"
        loading="lazy"
        draggable={false}
      />
    ) : null;
  const sceneStrokes = sc.strokes.filter((k) => !k.on);
  return (
    <div className="wib-art" aria-hidden="true" data-s={stage}>
      {sc.parts.map((p) => (
        <Fragment key={p.id}>
          <Strokes stage={stage} strokes={sceneStrokes.filter((k) => k.before === p.id)} />
          {sc.shade?.part === p.id ? (
            <span
              className="wib-shade"
              style={{ left: `${sc.shade.box[0]}%`, top: `${sc.shade.box[1]}%`, width: `${sc.shade.box[2]}%`, height: `${sc.shade.box[3]}%` }}
            />
          ) : null}
          <span
            className="wib-layer wib-part"
            data-s={stage}
            data-p={p.id}
            data-depth={p.depth}
            style={p.origin ? ({ "--o": p.origin } as CSSProperties) : undefined}
          >
            <span className="wib-move">
              {img(p.id)}
              {p.lit ? img(`${p.id}-lit`, "wib-lit") : null}
              <Strokes stage={stage} strokes={sc.strokes.filter((k) => k.on === p.id)} />
            </span>
          </span>
        </Fragment>
      ))}
      <Strokes stage={stage} strokes={sceneStrokes.filter((k) => !k.before)} />
    </div>
  );
}
