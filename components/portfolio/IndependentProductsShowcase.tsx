"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseProductParam, productHref, type MediaMode, type PortfolioProduct } from "@/lib/portfolio";
import { MainMediaStage } from "./MainMediaStage";
import { ProductCarousel } from "./ProductCarousel";
import { ProductInfoPanel } from "./ProductInfoPanel";

export interface IndependentProductsShowcaseProps {
  products: readonly PortfolioProduct[];
}

const PANEL_ID = "pf-panel";
const STAGE_ID = "pf-stage-screen";
const NAME_ID = "pf-product-name";
const tabId = (id: string) => `pf-tab-${id}`;

/**
 * Section 1's interactive core (TASK-116, spec §3, §6, §8–§10, §18, §50): media stage (left, ~62 %),
 * product panel (right, ~38 %), carousel (full width below). Mobile order is the DOM order: media →
 * details → actions → carousel (spec §46).
 *
 * State is explicit React state (spec §9) — never DOM hacks:
 *   activeProductId  the selected product; changing it ALWAYS resets `mediaMode` to "pitch",
 *   mediaMode        "pitch" | "demo", switched only by the panel's Pitch / Demo buttons,
 *   enter            which change produced the current stage (drives the §20 enter transition).
 * The stage is keyed by `product:mode`, so a change unmounts the old player (stopping it) and the new
 * stage starts at its poster — two videos can never play at once (spec §10).
 *
 * Deep link (spec §50): `/projects?product=<id>` is read once on mount (the page stays statically
 * prerendered — no `useSearchParams` suspense) and each selection REPLACES the URL
 * (`history.replaceState`, which Next's App Router integrates with) — no history spam and no
 * RSC refetch per click.
 */
export function IndependentProductsShowcase({ products }: IndependentProductsShowcaseProps) {
  const first = products[0];
  const [activeProductId, setActiveProductId] = useState<string>(first?.id ?? "");
  const [mediaMode, setMediaMode] = useState<MediaMode>("pitch");
  const [enter, setEnter] = useState<"none" | "product" | "mode">("none");
  const readDeepLink = useRef(false);

  useEffect(() => {
    if (readDeepLink.current) return;
    readDeepLink.current = true;
    const requested = parseProductParam(new URLSearchParams(window.location.search).get("product"), products);
    // One-time sync from the URL on mount (an external system); the static HTML shows the default.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (requested) setActiveProductId(requested);
  }, [products]);

  const selectProduct = useCallback(
    (id: string) => {
      if (id === activeProductId) return;
      setActiveProductId(id);
      setMediaMode("pitch");
      setEnter("product");
      const url = `${productHref(id)}${window.location.hash}`;
      window.history.replaceState(window.history.state, "", url);
    },
    [activeProductId],
  );

  const changeMode = useCallback(
    (mode: MediaMode) => {
      if (mode === mediaMode) return;
      setMediaMode(mode);
      setEnter("mode");
    },
    [mediaMode],
  );

  const product = products.find((p) => p.id === activeProductId) ?? first;
  if (!product) return null;

  return (
    <div className="pf-showcase">
      <div
        id={PANEL_ID}
        className="pf-feature"
        role="tabpanel"
        aria-labelledby={tabId(product.id)}
        data-active-product={product.id}
        data-media-mode={mediaMode}
        data-enter={enter}
      >
        <MainMediaStage key={`${product.id}:${mediaMode}`} product={product} mode={mediaMode} enter={enter} id={STAGE_ID} />
        <ProductInfoPanel
          key={product.id}
          product={product}
          mode={mediaMode}
          onModeChange={changeMode}
          stageId={STAGE_ID}
          headingId={NAME_ID}
        />
      </div>
      <ProductCarousel products={products} activeId={product.id} onSelect={selectProduct} panelId={PANEL_ID} tabId={tabId} />
    </div>
  );
}
