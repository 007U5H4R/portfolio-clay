"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { canGoBackToPortfolio, readReturnRoute } from "@/lib/lab/session";
import styles from "./lab.module.css";

/** Static first paint while the lab chunk loads (and the no-JS state): a labelled shell with the exit. */
function LabLoading() {
  // ESC works from the first moment, not only once the game has loaded (users must never feel trapped, §36).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (canGoBackToPortfolio()) window.history.back();
      else window.location.assign(readReturnRoute());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className={styles.root} data-lab="loading">
      <Link className={styles.back} href="/">
        <span aria-hidden="true">←</span> Back to Portfolio
      </Link>
      <p className={styles.loading} role="status">
        Warming up the Gummy Lab…
      </p>
    </div>
  );
}

const LabApp = dynamic(() => import("./LabApp"), { ssr: false, loading: () => <LabLoading /> });

export function LabLoader() {
  return <LabApp />;
}
