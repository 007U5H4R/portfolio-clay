"use client";

import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { stepIndex, type PortfolioProduct } from "@/lib/portfolio";
import { ProductCover } from "./ProductCover";

export interface ProductCarouselProps {
  products: readonly PortfolioProduct[];
  activeId: string;
  onSelect: (id: string, source: "click" | "keyboard" | "arrow") => void;
  panelId: string;
  tabId: (id: string) => string;
}

/**
 * The 90s product carousel (TASK-116, spec §14–§18, §44–§46; TASK-121 rectify spec §7; TASK-127
 * fidelity spec §10–§15: 5:6 collectible covers sitting on one torn kraft band, hand-cut paper arrow
 * tabs at the band's two ends, a small "Select a product · n / N" paper tag): a native horizontal scroller
 * (scroll-snap — touch swipe and trackpad scrolling come free, no carousel library) holding one
 * `role="tab"` cover per product, plus previous / next buttons.
 *
 * Tabs pattern: roving `tabIndex` + `aria-selected` on the tabs; ←/→ move AND select (wrapping, so
 * the carousel loops), Home/End jump; the selected tab is scrolled into view inside the track only
 * (its own `scrollLeft`, never the page). The arrow buttons also wrap, so they are never dead. A
 * click selects in place — the page never navigates (spec §18).
 */
export function ProductCarousel({ products, activeId, onSelect, panelId, tabId }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const activeIndex = Math.max(
    0,
    products.findIndex((product) => product.id === activeId),
  );

  // Keep the selected cover inside the track's visible window (horizontal only).
  useEffect(() => {
    const track = trackRef.current;
    const tab = track?.querySelector<HTMLElement>(`[data-product="${activeId}"]`);
    if (!track || !tab) return;
    const left = tab.offsetLeft - track.offsetLeft;
    const right = left + tab.offsetWidth;
    if (left < track.scrollLeft || right > track.scrollLeft + track.clientWidth) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      track.scrollTo({ left: Math.max(0, left - 8), behavior: reduce ? "auto" : "smooth" });
    }
  }, [activeId]);

  const focusTab = useCallback((id: string) => {
    trackRef.current?.querySelector<HTMLElement>(`[data-product="${id}"]`)?.focus({ preventScroll: true });
  }, []);

  const step = (delta: number, source: "keyboard" | "arrow") => {
    const next = products[stepIndex(activeIndex, delta, products.length)];
    if (!next) return;
    onSelect(next.id, source);
    if (source === "keyboard") focusTab(next.id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let target: PortfolioProduct | undefined;
    switch (event.key) {
      case "ArrowRight":
        target = products[stepIndex(activeIndex, 1, products.length)];
        break;
      case "ArrowLeft":
        target = products[stepIndex(activeIndex, -1, products.length)];
        break;
      case "Home":
        target = products[0];
        break;
      case "End":
        target = products[products.length - 1];
        break;
      default:
        return;
    }
    event.preventDefault();
    if (!target) return;
    onSelect(target.id, "keyboard");
    focusTab(target.id);
  };

  return (
    <div className="pf-carousel">
      <span className="pf-band" aria-hidden="true" />
      <div className="pf-carousel-tag">
        <p id="pf-select" className="pf-select">
          Select a product
        </p>
        <p className="pf-count" aria-live="polite">
          {activeIndex + 1} / {products.length}
        </p>
      </div>
      <button type="button" className="pf-arrow focus-ring" data-dir="prev" aria-label="Previous product" onClick={() => step(-1, "arrow")}>
        <ChevronLeft aria-hidden="true" focusable="false" strokeWidth={2} />
      </button>
      <div
        ref={trackRef}
        className="pf-track"
        role="tablist"
        aria-labelledby="pf-select"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
      >
        {products.map((product) => {
          const selected = product.id === activeId;
          return (
            <button
              key={product.id}
              id={tabId(product.id)}
              type="button"
              role="tab"
              className="pf-thumb focus-ring"
              data-product={product.id}
              data-cursor="EXPLORE →"
              data-accent={product.accent}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(product.id, "click")}
            >
              <ProductCover product={product} size="thumb" />
              <span className="sr-only">
                {product.name}: {product.tagline}
              </span>
            </button>
          );
        })}
      </div>
      <button type="button" className="pf-arrow focus-ring" data-dir="next" aria-label="Next product" onClick={() => step(1, "arrow")}>
        <ChevronRight aria-hidden="true" focusable="false" strokeWidth={2} />
      </button>
    </div>
  );
}
