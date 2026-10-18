"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

/**
 * TASK-259 (reversible test, Tushar 2026-10-18): the "living origami" background behind the PHONE /projects list
 * (< 640 px; the frosted `.pf-m-card.m-float` cards from TASK-233 blur it). One fixed, pointer-less, aria-hidden layer:
 * a theme wash, two slow lighting blooms, a few faint orbital curves, two folded-paper sculptures at the outer edges
 * and two paper-cut ridges at the lower corners. Everything animates transform/opacity only, each layer on its own
 * loop, and nothing moves under `prefers-reduced-motion`. Art: public/media/projects-bg/ (swapped per theme in CSS, so
 * only the active theme's files download); provenance in public/media/illustrations/card-art-README.md.
 *
 * Styles: the fenced TASK-259 block at the end of app/globals.css.
 *
 * UNDO: set the constant below to `false` (the mount renders nothing and no asset loads), or `git revert` the commit.
 */
export const ORIGAMI_BG_ENABLED = true;

const subscribeNever = () => () => {};

export function ProjectsMobileBackground({ active }: { active: boolean }) {
  // Portalled to <body>: the layer is page decoration, not part of the showcase's box tree (its cropped sculptures are
  // meant to overhang the viewport), and a fixed layer inside the page's wrappers could pick up a transformed ancestor.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  if (!ORIGAMI_BG_ENABLED || !active || !mounted) return null;
  return createPortal(
    <div className="ob-root" aria-hidden="true" data-testid="projects-bg">
      <div className="ob-wash" />
      <div className="ob-bloom ob-bloom-a" />
      <div className="ob-bloom ob-bloom-b" />
      <svg className="ob-orbits" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" fill="none">
        <ellipse cx="330" cy="150" rx="250" ry="92" transform="rotate(-24 330 150)" />
        <ellipse cx="40" cy="560" rx="300" ry="120" transform="rotate(18 40 560)" />
        <ellipse cx="200" cy="760" rx="340" ry="70" transform="rotate(-8 200 760)" />
      </svg>
      <div className="ob-par ob-par-ridge-far">
        <div className="ob-drift ob-ridge ob-ridge-far" />
      </div>
      <div className="ob-par ob-par-ridge-near">
        <div className="ob-drift ob-ridge ob-ridge-near" />
      </div>
      <div className="ob-par ob-par-facet">
        <div className="ob-drift ob-sculpt ob-facet" />
      </div>
      <div className="ob-par ob-par-orbit">
        <div className="ob-drift ob-sculpt ob-orbit" />
      </div>
    </div>,
    document.body,
  );
}
