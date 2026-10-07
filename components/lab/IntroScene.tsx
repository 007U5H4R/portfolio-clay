"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { paperMotion } from "@/lib/paper-world/motion";
import styles from "./lab.module.css";

/**
 * The Gummy Lab intro (TASK-168 scope addition): the entrance to the same handcrafted world. Two layers of paper
 * sandwich the live 3D gummy, which stands on the stage disc:
 *   IntroBack  (under the canvas)  bg 1x, arch 2x, stage 2x, props-left 2x, props-right 2x (with the signpost tags)
 *   [canvas]                        the gummy, 3x (CSS on `.canvasWrap`)
 *   IntroFront (over the canvas)   fg 4x, then paper plates carrying LIVE text: banner, instruction sheet, keyboard
 *                                   label, and the paper pull-tab CTA.
 * Text is never baked into art. All art is registered on one 2400 x 1350 box (1080 x 1350 on a portrait phone) that
 * is cover-fitted; the tags sit inside the props-right layer so they stay registered at every size.
 * Parallax reuses `paperMotion` (the base is ~4 px: `--ib` in lab.module.css). Images are only rendered once `show`
 * (the canvas exists), so the lab's first load is unchanged.
 */
const DIR = "/media/lab/intro";
const PORTRAIT = "(max-width: 767px) and (orientation: portrait)";

interface Spec {
  id: string;
  k: number;
  /** Extra box around the layer, in %, so parallax never shows an edge (bg >= 1.04, fg >= 1.08 scale). */
  bleed: number;
  /** Has a `-mobile` crop; layers without one are hidden on a portrait phone. */
  mobile: boolean;
}
const BACK: Spec[] = [
  { id: "bg", k: 1, bleed: 3, mobile: true },
  { id: "arch", k: 2, bleed: 1, mobile: true },
  { id: "stage", k: 2, bleed: 1, mobile: true },
  { id: "props-left", k: 2, bleed: 1, mobile: false },
  { id: "props-right", k: 2, bleed: 1, mobile: false },
];
const FG: Spec = { id: "fg", k: 4, bleed: 4.5, mobile: false };

/** The four blank signpost tags in art pixels (same in light and dark), with their slight tilt. */
const TAGS = [
  { text: "Fun", x: 1714, y: 266, w: 314, h: 142, r: -2 },
  { text: "Physics", x: 1752, y: 411, w: 317, h: 124, r: 1.5 },
  { text: "Experiment", x: 1740, y: 542, w: 295, h: 137, r: -1 },
  { text: "Play", x: 1743, y: 684, w: 292, h: 132, r: 2 },
] as const;

const layerStyle = (s: Spec) => ({ "--k": s.k, "--bleed": `${s.bleed}%` }) as CSSProperties;

function Art({ spec }: { spec: Spec }) {
  const file = (theme: "light" | "dark", mobile = false) => `${DIR}/intro-${spec.id}-${theme}${mobile ? "-mobile" : ""}.webp`;
  return (
    <>
      {(["light", "dark"] as const).map((theme) => (
        <picture key={theme} data-theme-art={theme}>
          {spec.mobile ? <source media={PORTRAIT} srcSet={file(theme, true)} type="image/webp" /> : null}
          {/* Layer art is already WebP at its shipped size; no next/image loader (same as the Paper World scenes). */}
          <img src={file(theme)} alt="" aria-hidden="true" draggable={false} decoding="async" loading="lazy" className={styles.introImg} />
        </picture>
      ))}
    </>
  );
}

function Layer({ spec, children }: { spec: Spec; children?: ReactNode }) {
  return (
    <div data-intro-layer={spec.id} data-mobile={spec.mobile ? "on" : "off"} className={styles.introLayer} style={layerStyle(spec)}>
      <Art spec={spec} />
      {children}
    </div>
  );
}

/** Registers the element with paperMotion while mounted (pointer now, phone tilt once TASK-169 lands). */
function useParallax(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    return el ? paperMotion.register(el) : undefined;
  }, [ref]);
}

export function IntroBack({ show, leaving }: { show: boolean; leaving: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useParallax(root);
  return (
    <div ref={root} className={`${styles.introRoot} ${styles.introBack}`} data-leaving={leaving ? "" : undefined} data-lab-intro-back="" aria-hidden="true">
      <div className={styles.introBox}>
        {show
          ? BACK.map((s) => (
              <Layer key={s.id} spec={s}>
                {s.id === "props-right" ? (
                  <div className={styles.tags} aria-hidden="true">
                    {TAGS.map((t) => (
                      <span
                        key={t.text}
                        className={styles.tag}
                        style={{ left: `${(t.x / 2400) * 100}%`, top: `${(t.y / 1350) * 100}%`, width: `${(t.w / 2400) * 100}%`, height: `${(t.h / 1350) * 100}%`, rotate: `${t.r}deg` }}
                      >
                        {t.text}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Layer>
            ))
          : null}
      </div>
    </div>
  );
}

const ICON = { width: 28, height: 28, viewBox: "0 0 32 32", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const HOW: { main: string; sub?: string; icon: ReactNode }[] = [
  {
    main: "Drag",
    sub: "to move",
    icon: (
      <svg {...ICON}>
        <path d="M11 17V8a2 2 0 0 1 4 0v7m0-3a2 2 0 0 1 4 0v3m0-2a2 2 0 0 1 4 0v6c0 4-3 7-7 7h-2c-3 0-5-2-6-4l-3-5a2 2 0 0 1 3-2l3 3" />
        <path d="M24 5h5m-2-2 2 2-2 2" />
      </svg>
    ),
  },
  {
    main: "Flick",
    sub: "to bounce",
    icon: (
      <svg {...ICON}>
        <path d="M5 27c1-9 7-15 18-17m-6-4 6 4-5 6" />
      </svg>
    ),
  },
  {
    main: "Collect",
    sub: "stars & rings",
    icon: (
      <svg {...ICON}>
        <path d="m16 4 3.6 7.4 8 1.1-5.8 5.6 1.4 8L16 22.2 8.8 26.1l1.4-8-5.8-5.6 8-1.1z" />
      </svg>
    ),
  },
  {
    main: "Don't let it fall",
    icon: (
      <svg {...ICON}>
        <path d="M16 4 29 27H3z" />
        <path d="M16 13v7m0 3.5v.5" />
      </svg>
    ),
  },
];

export function IntroFront({ art, text, leaving, onPlay }: { art: boolean; text: boolean; leaving: boolean; onPlay: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLButtonElement>(null);
  useParallax(root);
  // Keyboard focus lands on the CTA when the intro appears (no `autoFocus`, which a11y lint rightly discourages).
  useEffect(() => {
    if (!text) return;
    const t = window.setTimeout(() => cta.current?.focus({ preventScroll: true }), 60);
    return () => window.clearTimeout(t);
  }, [text]);
  return (
    <div ref={root} className={`${styles.introRoot} ${styles.introFront}`} data-leaving={leaving ? "" : undefined} data-lab-intro-front="">
      <div className={styles.introBox}>
        {art ? (
          <div data-intro-layer="fg" data-mobile="off" className={styles.introLayer} style={layerStyle(FG)} aria-hidden="true">
            <Art spec={FG} />
          </div>
        ) : null}
        {text ? (
        <section className={styles.introContent} aria-label="Gummy Lab" data-lab-intro="">
          <div className={`${styles.plate2} ${styles.banner}`} style={{ "--k": 4 } as CSSProperties}>
            <p className={styles.micro}>You found the secret lab.</p>
            <h1 className={styles.introTitle}>Gummy Lab</h1>
            <p className={styles.introSub}>Keep the Gummy Alive</p>
          </div>
          <div className={`${styles.plate2} ${styles.sheet}`} style={{ "--k": 4 } as CSSProperties}>
            <ul className={styles.how} aria-label="How to play">
              {HOW.map((h) => (
                <li key={h.main} className={styles.howItem}>
                  {h.icon}
                  <span className={styles.howMain}>{h.main}</span>
                  {h.sub ? <span className={styles.howSub}>{h.sub}</span> : null}
                </li>
              ))}
            </ul>
          </div>
          <div className={`${styles.plate2} ${styles.keyLabel}`} style={{ "--k": 4 } as CSSProperties} data-lab-keys="">
            <p className={styles.keyTitle}>Keyboard</p>
            <p className={styles.keyRow}>← → nudge</p>
            <p className={styles.keyRow}>Space bounce</p>
            <p className={styles.keyRow}>P pause</p>
            <p className={styles.keyRow}>Esc exit</p>
          </div>
          <button ref={cta} type="button" className={`${styles.plate2} ${styles.pull}`} style={{ "--k": 4 } as CSSProperties} onClick={onPlay} disabled={leaving} data-lab-play="">
            <span className={styles.pullText}>
              Let&apos;s play <span aria-hidden="true">→</span>
            </span>
          </button>
        </section>
        ) : null}
      </div>
    </div>
  );
}
