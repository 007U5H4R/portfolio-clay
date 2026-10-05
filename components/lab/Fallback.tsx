"use client";

import Link from "next/link";
import styles from "./lab.module.css";

/**
 * Shown instead of the canvas when WebGL is unavailable (headless/software GL, blocked GPU) — a
 * labelled fallback with the Back link, so the visitor is never stuck (gummy-bear.md §43, EVAL-030).
 */
export function Fallback({ onBack }: { onBack: () => void }) {
  return (
    <div className={styles.layer}>
      <section className={styles.fallback} data-lab="fallback" aria-labelledby="lab-fallback-title">
        <p className={styles.micro}>You found the secret lab.</p>
        <h1 id="lab-fallback-title" className={styles.title} style={{ fontSize: "2.2rem" }}>
          Gummy Lab
        </h1>
        <p>
          The gummy needs WebGL to bounce, and this browser can&apos;t give it any right now. Try another browser or device —
          the portfolio is exactly where you left it.
        </p>
        <Link
          className={styles.play}
          href="/"
          style={{ marginTop: 8 }}
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
        >
          <span aria-hidden="true">←</span>&nbsp;Back to Portfolio
        </Link>
      </section>
    </div>
  );
}
