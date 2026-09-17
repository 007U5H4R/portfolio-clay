"use client";

/**
 * AskPanelLazy (technical-plan.md §B S11.01, EVAL-005) — the code-split boundary for `AskPanel`.
 *
 * `next/dynamic(..., { ssr: false })` puts the whole `AskPanel` tree (and everything it pulls in
 * that isn't already shared) into its OWN chunk, fetched only when this component first renders.
 * `AskProvider` renders it only AFTER the first `openPanel()`, so the panel's JS never appears in the
 * `/` prerendered HTML's script/modulepreload set and therefore never counts toward `/` first-load
 * JS (the bundle-budget gate reads exactly those refs). The panel stays mounted once opened, so
 * re-opening is instant and the chunk is fetched at most once.
 */
import dynamic from "next/dynamic";
import type { AskPanelProps } from "./AskPanel";

export const AskPanelLazy = dynamic<AskPanelProps>(
  () => import("./AskPanel").then((mod) => mod.AskPanel),
  { ssr: false },
);
