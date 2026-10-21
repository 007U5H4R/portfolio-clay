"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { stepIndex, type PortfolioProduct } from "@/lib/portfolio";
import { useDesktop } from "./use-desktop";
import { VERTICAL_CAROUSEL_ENABLED } from "./vertical-carousel-flag";
import { PAPER_SELECTOR_ENABLED } from "./paper-selector-flag";
import { OrigamiArrow } from "./OrigamiArrow";
import "./paper-selector-origami.css";

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
 * TASK-287 (Tushar 2026-10-20): at desktop the strip is a loop — see `vpos` / `settle` below.
 *
 * TASK-274 (Tushar 2026-10-19), desktop (≥ 1024 px) only: the tray is a centred stage — the selected card is centred, raised and
 * ringed, its neighbours step back (`data-rel`, CSS), the edge cards fade out — with the index shown as "04 / 10" and a short
 * pagination row (`.pf-pager`, one dash per product, `aria-current` on the selected). The pager is only rendered at desktop
 * width (never a hidden-but-focusable control on a phone). Below 1024 px nothing changes.
 */
export function ProductCarousel({ products, activeId, onSelect, panelId, tabId }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const desktop = useDesktop();
  // TASK-301: the experiment — a vertical tray at desktop width (same loop, on the y axis)
  const vertical = VERTICAL_CAROUSEL_ENABLED && desktop;
  // TASK-305: the origami paper selector skin of the vertical tray (desktop only)
  const paper = vertical && PAPER_SELECTOR_ENABLED;
  const activeIndex = Math.max(
    0,
    products.findIndex((product) => product.id === activeId),
  );

  // TASK-287: at desktop the track holds three copies of the products (clones, real, clones) and loops. `vpos` is the slot of the
  // selected cover in that strip: a step moves it by the shortest way round, so the last -> first step lands on a clone beside
  // the last cover; once the scroll settles the strip silently re-centres on the middle (real) copy.
  const count = products.length;
  const home = count + activeIndex;
  const [vpos, setVpos] = useState(home);
  const [prevIndex, setPrevIndex] = useState(activeIndex);
  const [snap, setSnap] = useState(false);
  if (prevIndex !== activeIndex) {
    let delta = (((activeIndex - prevIndex) % count) + count) % count;
    if (delta > count / 2) delta -= count;
    const moved = vpos + delta;
    setPrevIndex(activeIndex);
    setVpos(moved >= 0 && moved < count * 3 ? moved : home);
  }
  const latest = useRef({ vpos, home, count });
  useEffect(() => {
    latest.current = { vpos, home, count };
  });
  const placed = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /** Once scrolling is idle (a step's smooth scroll, or a swipe): land on the real copy and keep the view inside the middle copy. */
  const settle = useCallback(() => {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const track = trackRef.current;
      const { vpos: at, home: to, count: n } = latest.current;
      const cards = track?.children;
      if (!track || !cards || cards.length !== n * 3) return;
      const left = (i: number) => (vertical ? (cards[i] as HTMLElement).offsetTop - track.offsetTop : (cards[i] as HTMLElement).offsetLeft - track.offsetLeft);
      const current = vertical ? track.scrollTop : track.scrollLeft;
      let scrollLeft = current + (left(to) - left(at));
      const period = left(n * 2) - left(n);
      const middle = scrollLeft + (vertical ? track.clientHeight : track.clientWidth) / 2;
      if (middle < left(n)) scrollLeft += period;
      else if (middle >= left(n * 2)) scrollLeft -= period;
      if (scrollLeft === current && at === to) return;
      setSnap(true);
      track.scrollTo(vertical ? { top: scrollLeft, behavior: "instant" } : { left: scrollLeft, behavior: "instant" });
      setVpos(to);
      requestAnimationFrame(() => requestAnimationFrame(() => setSnap(false)));
    }, 140);
  }, [vertical]);
  useEffect(() => () => clearTimeout(settleTimer.current), []);

  // Keep the selected cover inside the track's visible window (horizontal only).
  useEffect(() => {
    const track = trackRef.current;
    const tab = desktop
      ? (track?.children[vpos] as HTMLElement | undefined)
      : track?.querySelector<HTMLElement>(`[data-product="${activeId}"]`);
    if (!track || !tab) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (desktop) {
      // TASK-274: the selected card sits in the middle of the tray (the track's own scrollLeft only, never the page)
      // layout offsets, not rects: the selected card is mid-way through its scale-up when this runs
      if (vertical) {
        const offsetY = tab.offsetTop - track.offsetTop;
        // the first placement (hydration) jumps straight to the selected cover; later steps glide
        track.scrollTo({ top: Math.max(0, offsetY - (track.clientHeight - tab.offsetHeight) / 2), behavior: reduce || !placed.current ? "instant" : "smooth" });
        placed.current = true;
      } else {
        const offset = tab.offsetLeft - track.offsetLeft;
        track.scrollTo({ left: Math.max(0, offset - (track.clientWidth - tab.offsetWidth) / 2), behavior: reduce ? "auto" : "smooth" });
      }
      settle();
      return;
    }
    const left = tab.offsetLeft - track.offsetLeft;
    const right = left + tab.offsetWidth;
    if (left < track.scrollLeft || right > track.scrollLeft + track.clientWidth) {
      track.scrollTo({ left: Math.max(0, left - 8), behavior: reduce ? "auto" : "smooth" });
    }
  }, [activeId, desktop, vertical, vpos, settle]);

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
      case "ArrowDown":
        if (!vertical) return;
        target = products[stepIndex(activeIndex, 1, products.length)];
        break;
      case "ArrowUp":
        if (!vertical) return;
        target = products[stepIndex(activeIndex, -1, products.length)];
        break;
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

  // Stage 9 CR-019: one padding rule for the counter (the paper selector only adds a span around it)
  const current = desktop ? String(activeIndex + 1).padStart(2, "0") : activeIndex + 1;
  return (
    <div className="pf-carousel" data-vertical={vertical ? "" : undefined} data-paper-selector={paper ? "" : undefined}>
      <div className="pf-carousel-tag">
        <p id="pf-select" className="pf-select">
          Select a product
        </p>
        <p className="pf-count">
          {paper ? <span className="ps-cur">{current}</span> : current} / {desktop ? String(products.length).padStart(2, "0") : products.length}
        </p>
      </div>
      {/* the announced position (TASK-197): "Railcite, 2 of 13" is read out whenever the selection changes */}
      <p className="sr-only" role="status" data-testid="pf-announce">
        {products[activeIndex]?.name}, {activeIndex + 1} of {products.length}
      </p>
      <button type="button" className="pf-arrow focus-ring" data-dir="prev" aria-label="Previous product" onClick={() => step(-1, "arrow")}>
        {paper ? <OrigamiArrow direction="up" /> : vertical ? <ChevronUp aria-hidden="true" focusable="false" strokeWidth={2} /> : <ChevronLeft aria-hidden="true" focusable="false" strokeWidth={2} />}
      </button>
      <div
        ref={trackRef}
        className="pf-track"
        role="tablist"
        aria-labelledby="pf-select"
        aria-orientation={vertical ? "vertical" : "horizontal"}
        data-snap={snap ? "" : undefined}
        onKeyDown={onKeyDown}
        onScroll={desktop ? settle : undefined}
      >
        {(desktop ? [...products, ...products, ...products] : products).map((product, slot) => {
          const real = !desktop || (slot >= count && slot < count * 2);
          const selected = real && product.id === activeId;
          const rel = slot - vpos;
          return (
            <button
              key={`${product.id}-${Math.floor(slot / count)}`}
              id={real ? tabId(product.id) : undefined}
              type="button"
              role="tab"
              className="pf-thumb focus-ring"
              data-product={real ? product.id : undefined}
              data-clone={real ? undefined : product.id}
              data-accent={product.accent}
              data-rel={desktop ? Math.min(Math.abs(rel), 3) * Math.sign(rel) : undefined}
              data-current={desktop && rel === 0 ? "true" : undefined}
              aria-selected={real ? selected : undefined}
              aria-hidden={real ? undefined : true}
              aria-controls={real ? panelId : undefined}
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
        {paper ? <OrigamiArrow direction="down" /> : vertical ? <ChevronDown aria-hidden="true" focusable="false" strokeWidth={2} /> : <ChevronRight aria-hidden="true" focusable="false" strokeWidth={2} />}
      </button>
      {/* TASK-301: a small pointer from the selected (always centred) card toward the video */}
      {vertical ? (
        <span className="pf-vcar-pointer" aria-hidden="true">
          {paper ? <OrigamiArrow direction="right" /> : null}
        </span>
      ) : null}
      {desktop && !vertical ? (
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
