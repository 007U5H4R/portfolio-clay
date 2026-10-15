"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics/track";
import {
  detailHref,
  listHref,
  NO_FILTER,
  parseListFilter,
  parseProductParam,
  productHref,
  type ListFilter,
  type MediaMode,
  type PortfolioProduct,
} from "@/lib/portfolio";
import { MainMediaStage } from "./MainMediaStage";
import { PhoneDetailBar } from "./PhoneDetail";
import { PhoneProjectList } from "./PhoneProjectList";
import { ProductCarousel } from "./ProductCarousel";
import { ProductInfoPanel } from "./ProductInfoPanel";

export interface IndependentProductsShowcaseProps {
  products: readonly PortfolioProduct[];
  /** The page intro (server-rendered), placed in the same spread as the stage and sheet (TASK-127). */
  intro?: ReactNode;
}

const PANEL_ID = "pf-panel";
const STAGE_ID = "pf-stage-screen";
const NAME_ID = "pf-product-name";
const tabId = (id: string) => `pf-tab-${id}`;

/**
 * On a phone the hero is the video the primary action plays: the demo when there is one, else the pitch. Above the phone
 * tier the default stays the pitch (the desktop showcase is unchanged).
 */
const entryMode = (product: PortfolioProduct): MediaMode =>
  window.matchMedia("(max-width: 639px)").matches && product.demoVideo ? "demo" : "pitch";

/**
 * Section 1's interactive core (TASK-116, spec §3, §6, §8–§10, §18, §50): media stage (left, ~62 %),
 * product panel (right, ~38 %), carousel (full width below). TASK-197: the DOM order is intro →
 * carousel → panel; on a phone CSS lays the panel out as details → media → actions (`.pf-info` is `display: contents`).
 *
 * TASK-127 (fidelity spec §2): at ≥ 1024 the intro, stage, sheet and carousel share one grid
 * (`.pf-showcase`, the tabpanel is a subgrid), so the sheet rises beside the intro and the whole top
 * composes as one spread; the intro stays outside the tabpanel.
 *
 * State is explicit React state (spec §9) — never DOM hacks:
 *   activeProductId  the selected product; changing it ALWAYS resets `mediaMode` to "pitch",
 *   mediaMode        "pitch" | "demo", switched only by the panel's Pitch / Demo buttons,
 *   enter            which change produced the current stage (drives the §20 enter transition).
 * The stage is keyed by `product:mode:nonce` (the nonce bumps when the current product is chosen
 * again), so a change unmounts the old player (stopping it) and the new
 * stage starts at its poster — two videos can never play at once (spec §10).
 *
 * Deep link (spec §50): `/projects?product=<id>` is read once on mount (the page stays statically
 * prerendered — no `useSearchParams` suspense) and each selection REPLACES the URL
 * (`history.replaceState`, which Next's App Router integrates with) — no history spam and no
 * RSC refetch per click.
 *
 * TASK-210 (phone, < 640 px): the same page is a list ↔ detail pair, switched by the URL alone (`view` follows
 * `?product=`): `/projects[?filter=…&video=1]` is the listing (`PhoneProjectList`, the carousel is hidden), and
 * `/projects?product=<id>[&filter=…]` is that product's detail (the panel, restyled, with a back bar). Opening a card
 * PUSHES one history entry, so the browser's Back (and the bar's) returns to the listing with its filter; a fresh load of
 * a detail URL has nothing to go back to, so the bar's Back replaces the URL with the listing instead. Desktop never
 * reads `view`, so ≥ 640 px is untouched. The static HTML is always the list + the default product.
 */
export function IndependentProductsShowcase({ products, intro }: IndependentProductsShowcaseProps) {
  const first = products[0];
  const [activeProductId, setActiveProductId] = useState<string>(first?.id ?? "");
  const [mediaMode, setMediaMode] = useState<MediaMode>("pitch");
  const [enter, setEnter] = useState<"none" | "product" | "mode">("none");
  const [stageNonce, setStageNonce] = useState(0);
  const readDeepLink = useRef(false);
  const [view, setView] = useState<"list" | "detail">("list");
  const [filter, setFilter] = useState<ListFilter>(NO_FILTER);
  const [lastOpened, setLastOpened] = useState<string | null>(null);
  const [autoStart, setAutoStart] = useState(false);
  /** True once this page itself pushed the detail entry — only then does `history.back()` land on the listing. */
  const pushed = useRef(false);

  useEffect(() => {
    if (readDeepLink.current) return;
    readDeepLink.current = true;
    const params = new URLSearchParams(window.location.search);
    const requested = parseProductParam(params.get("product"), products);
    // One-time sync from the URL on mount (an external system); the static HTML shows the default.
    /* eslint-disable react-hooks/set-state-in-effect */
    setFilter(parseListFilter(params, products));
    if (requested) {
      setActiveProductId(requested);
      setView("detail");
      const requestedProduct = products.find((p) => p.id === requested);
      if (requestedProduct) setMediaMode(entryMode(requestedProduct));
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [products]);

  // The browser's Back / Forward between the listing and a detail: the URL is the truth, so re-read it.
  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      const requested = parseProductParam(params.get("product"), products);
      setFilter(parseListFilter(params, products));
      setAutoStart(false);
      if (requested) {
        const requestedProduct = products.find((p) => p.id === requested);
        setActiveProductId(requested);
        if (requestedProduct) setMediaMode(entryMode(requestedProduct));
        setStageNonce((n) => n + 1);
        setView("detail");
      } else {
        if (view === "detail") setLastOpened(activeProductId);
        setView("list");
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [products, view, activeProductId]);

  // Entering a detail starts at its top (the listing may have been scrolled).
  useEffect(() => {
    // phone only: a desktop deep link keeps the browser's own scroll (e.g. a #enterprise hash)
    if (view === "detail" && window.matchMedia("(max-width: 639px)").matches) window.scrollTo(0, 0);
  }, [view]);

  const changeFilter = useCallback((next: ListFilter) => {
    setFilter(next);
    window.history.replaceState(window.history.state, "", `${listHref(next)}${window.location.hash}`);
  }, []);

  const openProduct = useCallback(
    (id: string) => {
      const target = products.find((p) => p.id === id);
      if (!target) return;
      if (id !== activeProductId) track("project_selected", { project_id: id, selection_method: "direct_selection" });
      setActiveProductId(id);
      setMediaMode(entryMode(target));
      setStageNonce((n) => n + 1);
      setEnter("product");
      setAutoStart(false);
      setLastOpened(id);
      setView("detail");
      pushed.current = true;
      window.history.pushState(window.history.state, "", `${detailHref(id, filter)}${window.location.hash}`);
    },
    [products, activeProductId, filter],
  );

  const backToList = useCallback(() => {
    if (pushed.current) {
      window.history.back(); // the popstate handler shows the listing
      return;
    }
    setLastOpened(activeProductId);
    setView("list");
    window.history.replaceState(window.history.state, "", `${listHref(filter)}${window.location.hash}`);
  }, [activeProductId, filter]);

  // "Watch demo / pitch" on a phone: the press is the play gesture, so the stage restarts on that video and starts it.
  const watchVideo = useCallback(
    (mode: MediaMode) => {
      track("project_asset_opened", { project_id: activeProductId, asset_type: mode === "pitch" ? "pitch_video" : "demo_video" });
      setMediaMode(mode);
      setEnter("mode");
      setStageNonce((n) => n + 1);
      setAutoStart(true);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById(STAGE_ID)?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    },
    [activeProductId],
  );

  const selectProduct = useCallback(
    (id: string, source: "click" | "keyboard" | "arrow" = "click") => {
      // TASK-194: only a real change of product counts (re-choosing the active one just restarts its stage).
      if (id !== activeProductId) track("project_selected", { project_id: id, selection_method: source === "click" ? "direct_selection" : source });
      // Re-choosing the current product still does what spec §18 asks of a thumbnail click: back to
      // its pitch poster (a fresh stage — any playing video stops), never a silent no-op.
      if (id === activeProductId) setStageNonce((n) => n + 1);
      setActiveProductId(id);
      setMediaMode("pitch");
      setEnter("product");
      setAutoStart(false);
      const url = `${productHref(id)}${window.location.hash}`;
      window.history.replaceState(window.history.state, "", url);
    },
    [activeProductId],
  );

  const changeMode = useCallback(
    (mode: MediaMode) => {
      if (mode === mediaMode) return;
      track("project_asset_opened", { project_id: activeProductId, asset_type: mode === "pitch" ? "pitch_video" : "demo_video" });
      setMediaMode(mode);
      setEnter("mode");
      setAutoStart(false);
    },
    [mediaMode, activeProductId],
  );

  const product = products.find((p) => p.id === activeProductId) ?? first;
  if (!product) return null;

  return (
    <div className="pf-showcase" data-view={view}>
      {intro}
      {view === "detail" ? <PhoneDetailBar name={product.name} onBack={backToList} /> : null}
      <PhoneProjectList visible={view === "list"} products={products} filter={filter} onFilterChange={changeFilter} onOpen={openProduct} lastOpenedId={lastOpened} />
      <div
        id={PANEL_ID}
        className="pf-feature"
        role="tabpanel"
        aria-labelledby={tabId(product.id)}
        data-active-product={product.id}
        data-media-mode={mediaMode}
        data-enter={enter}
      >
        <MainMediaStage key={`${product.id}:${mediaMode}:${stageNonce}`} product={product} mode={mediaMode} enter={enter} id={STAGE_ID} autoStart={autoStart} />
        <ProductInfoPanel
          key={product.id}
          product={product}
          mode={mediaMode}
          onModeChange={changeMode}
          stageId={STAGE_ID}
          headingId={NAME_ID}
          total={products.length}
          onWatch={watchVideo}
        />
      </div>
      {/* TASK-217: the picker sits beneath the window it drives (DOM order = visual order). The phone hides it (TASK-210). */}
      <ProductCarousel products={products} activeId={product.id} onSelect={selectProduct} panelId={PANEL_ID} tabId={tabId} />
    </div>
  );
}
