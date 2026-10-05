"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import styles from "./lab.module.css";

/** Static first paint while the lab chunk loads (and the no-JS state): a labelled shell with the exit. */
function LabLoading() {
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
