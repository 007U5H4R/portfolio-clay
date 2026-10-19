"use client";

import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { stepIndex, type PortfolioProduct } from "@/lib/portfolio";
import { useDesktop } from "./use-desktop";

export interface ProductCarouselProps {
  products: readonly PortfolioProduct[];
  activeId: string;
  onSelect: (id: string, source: "click" | "keyboard" | "arrow") => void;
  panelId: string;
  tabId: (id: string) => string;
}

/**
 * The project tray (TASK-116 / TASK-197; TASK-217 paper-craft restyle): a native horizontal scroller (scroll-snap — touch
 * swipe and trackpad scrolling come free, no carousel library) holding one `role="tab"` card per product (thumbnail art, a
 * two-digit index, the name, a compact category), plus previous / next buttons. It hangs directly beneath the window it drives.
 *
 * Tabs pattern: roving `tabIndex` + `aria-selected` on the tabs; ←/→ move AND select (wrapping, so
 * the carousel loops), Home/End jump; the selected tab is scrolled into view inside the track only
 * (its own `scrollLeft`, never the page). The arrow buttons also wrap, so they are never dead. A
 * click selects in place — the page never navigates (spec §18).
 *
 * TASK-274 (Tushar 2026-10-19), desktop (≥ 1024 px) only: the tray is a centred stage — the selected card is centred, raised and
 * ringed, its neighbours step back (`data-rel`, CSS), the edge cards fade out — with the index shown as "04 / 10" and a short
 * pagination row (`.pf-pager`, one dash per product, `aria-current` on the selected). The pager is only rendered at desktop
 * width (never a hidden-but-focusable control on a phone). Below 1024 px nothing changes.
 */
export function ProductCarousel({ products, activeId, onSelect, panelId, tabId }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const desktop = useDesktop();
  const activeIndex = Math.max(
    0,
    products.findIndex((product) => product.id === activeId),
  );

  // Keep the selected cover inside the track's visible window (horizontal only).
  useEffect(() => {
    const track = trackRef.current;
    const tab = track?.querySelector<HTMLElement>(`[data-product="${activeId}"]`);
    if (!track || !tab) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (desktop) {
      // TASK-274: the selected card sits in the middle of the tray (the track's own scrollLeft only, never the page)
      // layout offsets, not rects: the selected card is mid-way through its scale-up when this runs
      const offset = tab.offsetLeft - track.offsetLeft;
      track.scrollTo({ left: Math.max(0, offset - (track.clientWidth - tab.offsetWidth) / 2), behavior: reduce ? "auto" : "smooth" });
      return;
    }
    const left = tab.offsetLeft - track.offsetLeft;
    const right = left + tab.offsetWidth;
    if (left < track.scrollLeft || right > track.scrollLeft + track.clientWidth) {
      track.scrollTo({ left: Math.max(0, left - 8), behavior: reduce ? "auto" : "smooth" });
    }
  }, [activeId, desktop]);

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
      <div className="pf-carousel-tag">
        <p id="pf-select" className="pf-select">
          Select a product
        </p>
        <p className="pf-count">
          {desktop ? String(activeIndex + 1).padStart(2, "0") : activeIndex + 1} / {desktop ? String(products.length).padStart(2, "0") : products.length}
        </p>
      </div>
      {/* the announced position (TASK-197): "Railcite, 2 of 13" is read out whenever the selection changes */}
      <p className="sr-only" role="status" data-testid="pf-announce">
        {products[activeIndex]?.name}, {activeIndex + 1} of {products.length}
      </p>
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
        {products.map((product, index) => {
          const selected = product.id === activeId;
          return (
            <button
              key={product.id}
              id={tabId(product.id)}
              type="button"
              role="tab"
              className="pf-thumb focus-ring"
              data-product={product.id}
              data-accent={product.accent}
              data-rel={desktop ? Math.min(Math.abs(index - activeIndex), 3) * Math.sign(index - activeIndex) : undefined}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(product.id, "click")}
            >
              <span className="pf-thumb-art">
                <Image
                  src={product.art.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 200px, 45vw"
                  unoptimized={product.art.src.endsWith(".svg")}
                  className="pf-thumb-img"
                />
              </span>
              <span className="pf-thumb-meta" aria-hidden="true">
                <span className="pf-thumb-num">{String(product.position).padStart(2, "0")}</span>
                <span className="pf-thumb-name">{product.name}</span>
                <span className="pf-thumb-cat" data-micro-label="">{(product.tags ?? []).slice(0, 2).join(" · ") || product.meta}</span>
              </span>
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
      {desktop ? (
        <div className="pf-pager" role="group" aria-label="Choose a product">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              className="pf-pager-dot focus-ring"
              aria-label={`Select ${product.name}, ${index + 1} of ${products.length}`}
              aria-current={product.id === activeId ? "true" : undefined}
              onClick={() => onSelect(product.id, "click")}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
