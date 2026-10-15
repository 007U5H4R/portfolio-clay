"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { detailHref, filterProducts, hasVideo, statusOptions, type ListFilter, type PortfolioProduct } from "@/lib/portfolio";

export interface PhoneProjectListProps {
  /** True while the listing is the screen (the showcase's `view`); false while a detail is open. */
  visible: boolean;
  products: readonly PortfolioProduct[];
  filter: ListFilter;
  onFilterChange: (next: ListFilter) => void;
  /** Open a product's detail (the showcase pushes `/projects?product=<id>` so Back returns here). */
  onOpen: (id: string) => void;
  /** The product last opened — marked on return so the viewer finds their place. */
  lastOpenedId: string | null;
}

/**
 * The phone Portfolio listing (TASK-210; < 640 px only — `.pf-m-list` is `display: none` above). One compact row per
 * product, in `data/projects.ts` order: its painted cover cropped square on the left; name, the one-line cover line and
 * up to two of the project's own tags on the right; a chevron. Each row is a real link to the product's detail view
 * (`/projects?product=<id>`, which also works as a deep link with JS off or on a fresh load); a plain click is handled
 * in place so the history gets one entry and Back lands on this list with the filter intact.
 *
 * Filters read the project records, never a made-up taxonomy: one chip per status that some product has (single choice,
 * "All" clears it) plus a "Has video" toggle. Chips are `aria-pressed` buttons in a labelled group; the result count is
 * a polite live region; a combination with no match shows an empty state with a clear action.
 */
export function PhoneProjectList({ visible, products, filter, onFilterChange, onOpen, lastOpenedId }: PhoneProjectListProps) {
  const statuses = statusOptions(products);
  const shown = filterProducts(products, filter);
  const filtered = filter.status !== null || filter.video;
  const listRef = useRef<HTMLUListElement | null>(null);

  // Back from a detail: put the viewer's place (focus + scroll) back on the card they opened, once per return.
  const placed = useRef(false);
  useEffect(() => {
    if (!visible) {
      placed.current = false;
      return;
    }
    if (placed.current || !lastOpenedId) return;
    const link = listRef.current?.querySelector<HTMLElement>(`[data-product="${lastOpenedId}"]`);
    if (!link || link.offsetParent === null) return; // the list is hidden (desktop) or the card is filtered out
    placed.current = true;
    link.focus({ preventScroll: true });
    link.scrollIntoView({ block: "center" });
  }, [visible, lastOpenedId]);

  const open = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    // let modified clicks (new tab / window) take the real href
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    onOpen(id);
  };

  const chip = (label: string, pressed: boolean, onClick: () => void, key: string) => (
    <button key={key} type="button" className="pf-m-chip focus-ring" aria-pressed={pressed} onClick={onClick}>
      {label}
    </button>
  );

  return (
    <div className="pf-m-list" data-testid="pf-m-list">
      <div className="pf-m-filters" role="group" aria-label="Filter projects">
        {chip("All", filter.status === null, () => onFilterChange({ ...filter, status: null }), "all")}
        {statuses.map((option) => chip(option.label, filter.status === option.value, () => onFilterChange({ ...filter, status: option.value }), option.value))}
        <span className="pf-m-chip-sep" aria-hidden="true" />
        {chip("Has video", filter.video, () => onFilterChange({ ...filter, video: !filter.video }), "video")}
      </div>
      <p className="pf-m-count" role="status" data-testid="pf-m-count">
        {filtered ? `${shown.length} of ${products.length} projects` : `${products.length} projects`}
      </p>
      {shown.length > 0 ? (
        <ul ref={listRef} className="pf-m-cards" aria-label="Projects" key={`${filter.status ?? "all"}:${filter.video ? "v" : ""}`}>
          {shown.map((product) => (
            <li key={product.id}>
              <a
                className="pf-m-card m-float focus-ring"
                href={detailHref(product.id, filter)}
                data-product={product.id}
                data-has-video={hasVideo(product) ? "" : undefined}
                aria-current={lastOpenedId === product.id ? "true" : undefined}
                onClick={(event) => open(event, product.id)}
              >
                <span className="pf-m-art" aria-hidden="true">
                  <Image src={product.art.src} alt="" fill sizes="88px" unoptimized={product.art.src.endsWith(".svg")} className="pf-m-art-img" />
                </span>
                <span className="pf-m-body">
                  <span className="pf-m-name">{product.name}</span>
                  <span className="pf-m-line">{product.tagline}</span>
                  {product.tags && product.tags.length > 0 ? (
                    <span className="pf-m-tags" aria-label="Tags">
                      {product.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="pf-m-tag">
                          {tag}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
                <ChevronRight className="pf-m-chev" aria-hidden="true" focusable="false" strokeWidth={2} />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="pf-m-empty m-solid" data-testid="pf-m-empty">
          <p className="pf-m-empty-title">No project matches these filters.</p>
          <p className="pf-m-empty-hint">Try a different status, or clear the filters to see all {products.length}.</p>
          <button type="button" className="pf-m-clear focus-ring" onClick={() => onFilterChange({ status: null, video: false })}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
