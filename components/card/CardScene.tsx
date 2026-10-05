"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { flipLabel, flipReducer, initialFlip } from "@/lib/card/flip";
import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";
import styles from "./card.module.css";

const FLIP_MS = 1150;

/**
 * The card object on its paper scene (TASK-146.3/.4). The flip is a real <button> under the card;
 * clicking or tapping the card does the same. Pointer/touch movement only writes four CSS custom
 * properties (no React state, no layout), which the stylesheet turns into transform/opacity motion
 * (tilt, parallax, light). Reduced motion: no listeners attached, no 3D, crossfade only (§34).
 */
export function CardScene({ url }: { url: string }) {
  const [state, dispatch] = useReducer(flipReducer, initialFlip);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Track prefers-reduced-motion live.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => dispatch({ type: "motion", reduced: mq.matches });
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const setVars = useCallback((nx: number, ny: number) => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = rootRef.current;
      if (!el) return;
      el.style.setProperty("--nx", nx.toFixed(3));
      el.style.setProperty("--ny", ny.toFixed(3));
    });
  }, []);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (state.reduced) return;
      const r = cardRef.current?.getBoundingClientRect();
      if (!r) return;
      const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      setVars(nx, ny);
    },
    [setVars, state.reduced],
  );

  const reset = useCallback(() => setVars(0, 0), [setVars]);

  const flip = useCallback(() => {
    const el = rootRef.current;
    if (el && !state.reduced) {
      el.dataset.flipping = "true";
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => delete el.dataset.flipping, FLIP_MS);
    }
    dispatch({ type: "toggle" });
  }, [state.reduced]);

  useEffect(() => () => {
    cancelAnimationFrame(raf.current);
    window.clearTimeout(timer.current);
  }, []);

  // Clicking the card (not its links/buttons) flips it, like picking it up. Keyboard users use the button.
  const onCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    flip();
  };

  return (
    <div
      ref={rootRef}
      className={styles.scene}
      data-side={state.side}
      data-reduced={state.reduced ? "true" : "false"}
      data-card-root
      onPointerMove={onMove}
      onPointerLeave={reset}
      onPointerUp={reset}
      onPointerCancel={reset}
    >
      <div className={styles.stage}>
        <div className={styles.shadow} aria-hidden="true" />
        <div className={styles.lift}>
          <div className={styles.tilt}>
            <div ref={cardRef} className={styles.card} onClick={onCardClick} data-card>
              <i className={styles.edge} data-e="3" aria-hidden="true" />
              <i className={styles.edge} data-e="2" aria-hidden="true" />
              <i className={styles.edge} data-e="1" aria-hidden="true" />
              <CardFront hidden={state.side === "back"} />
              <CardBack url={url} hidden={state.side === "front"} />
            </div>
          </div>
        </div>
      </div>
      <button
        ref={buttonRef}
        type="button"
        className={styles.flip}
        aria-label={flipLabel(state.side)}
        aria-expanded={state.side === "back"}
        aria-controls="card-back"
        onClick={flip}
        data-flip
      >
        <span aria-hidden="true">Flip card</span>
      </button>
      <p className="sr-only" aria-live="polite" role="status">
        {state.side === "back" ? "Showing the back of the card: QR code, save contact and links." : "Showing the front of the card."}
      </p>
    </div>
  );
}
