"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics/track";
import {
  detailHref,
  hasVideo,
  listHref,
  NO_FILTER,
  parseListFilter,
  parseProductParam,
  productHref,
  stepIndex,
  type ListFilter,
  type MediaMode,
  type PortfolioProduct,
} from "@/lib/portfolio";
import { MainMediaStage } from "./MainMediaStage";
import { PhoneDetailBar } from "./PhoneDetail";
import { PhoneProjectList } from "./PhoneProjectList";
import { ProductCarousel } from "./ProductCarousel";
import { ProductInfoPanel } from "./ProductInfoPanel";
import { useDetailNav } from "./use-detail-nav";
import { useDesktop } from "./use-desktop";
import { VERTICAL_CAROUSEL_ENABLED } from "./vertical-carousel-flag";
import { PAPER_PLAYER_ENABLED } from "./paper-player-flag";
import { PAPER_SELECTOR_ENABLED } from "./paper-selector-flag";
import { getLenis, scrollToTarget } from "@/lib/smooth-scroll";

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
 * TASK-253 (Tushar 2026-10-18): choosing a product starts its video at once — the pitch, else the demo, else nothing
 * (a product with no video keeps the pitch stage and its "coming" tag).
 */
const pickMode = (product: PortfolioProduct): MediaMode => (product.pitchVideo ? "pitch" : product.demoVideo ? "demo" : "pitch");

/**
 * TASK-274 (Tushar 2026-10-19): after a deliberate pick in the carousel, bring the video + card into view once. Skipped when the
 * video is already comfortably on screen below the sticky header. Uses the site's smooth-scroll helper (Lenis, which already
 * clears the header and is absent under reduced motion / on touch); otherwise a native scroll — instant when motion is reduced.
 * It never touches playback.
 */
function revealVideo(): void {
  const target = document.getElementById(PANEL_ID);
  const stage = document.getElementById(STAGE_ID);
  if (!target || !stage) return;
  const header = document.querySelector<HTMLElement>("header[data-site-header]")?.getBoundingClientRect().height ?? 0;
  const seen = stage.getBoundingClientRect();
  if (seen.top >= header && seen.bottom <= window.innerHeight) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && getLenis() && scrollToTarget(target)) return;
  window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - header - 8), behavior: reduce ? "auto" : "smooth" });
}

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
 *   activeProductId  the selected product; changing it ALWAYS resets `mediaMode` to the pitch (the demo when there is no pitch) and,
 *                    TASK-253, starts it (`autoStart`); a page load or deep link does not,
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
  /** TASK-253: the current auto-start came from choosing the product (not from a "Watch …" press) — muted on touch devices. */
  const [autoMute, setAutoMute] = useState(false);
  /** True once this page itself pushed the detail entry — only then does `history.back()` land on the listing. */
  const pushed = useRef(false);
  const desktop = useDesktop();
  /** TASK-274: bumped by a deliberate carousel pick; the effect below scrolls once the new product has committed. */
  const [revealTick, setRevealTick] = useState(0);
  /** TASK-274: the detail-card control that was used, so focus returns to it when the card remounts for the next product. */
  const navFocus = useRef<string | null>(null);

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
      // TASK-253: tapping a product in the phone list is the request to watch it — its pitch (else demo) starts in the detail
      setMediaMode(pickMode(target));
      setStageNonce((n) => n + 1);
      setEnter("product");
      setAutoStart(hasVideo(target));
      setAutoMute(true);
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
      setAutoMute(false);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Stage 8 DES-015 (TASK-312): land the stage below the fixed header, not under it (a third of the video was hidden at 375).
      // Stage 9 CR-013: Lenis, when mounted (fine pointer), owns the jump via the shared helper; otherwise the native scroll —
      // measured through the offset chain, because the stage's entrance animation transforms it and a bounding rect read
      // mid-animation lands wrong.
      const stage = document.getElementById(STAGE_ID);
      if (!stage) {
        if (process.env.NODE_ENV !== "production") console.warn(`watchVideo: #${STAGE_ID} is not in the DOM; the page was not scrolled`);
        return;
      }
      if (!reduce && scrollToTarget(stage)) return;
      const header = document.querySelector<HTMLElement>("header[data-site-header]")?.getBoundingClientRect().height ?? 0;
      let top = 0;
      for (let el: HTMLElement | null = stage; el; el = el.offsetParent as HTMLElement | null) top += el.offsetTop;
      window.scrollTo({ top: Math.max(0, top - header - 8), behavior: reduce ? "auto" : "smooth" });
    },
    [activeProductId],
  );

  const selectProduct = useCallback(
    (id: string, source: "click" | "keyboard" | "arrow" = "click") => {
      // TASK-194: only a real change of product counts (re-choosing the active one just restarts its stage).
      if (id !== activeProductId) track("project_selected", { project_id: id, selection_method: source === "click" ? "direct_selection" : source });
      // Re-choosing the current product still does what spec §18 asks of a thumbnail click: a fresh stage (any playing
      // video stops and its pitch starts over), never a silent no-op.
      if (id === activeProductId) setStageNonce((n) => n + 1);
      const target = products.find((p) => p.id === id);
      setActiveProductId(id);
      // TASK-253: choosing a product (click, keyboard or arrows) starts its pitch (else demo) with no extra Play tap
      setMediaMode(target ? pickMode(target) : "pitch");
      setEnter("product");
      setAutoStart(target ? hasVideo(target) : false);
      setAutoMute(true);
      const url = `${productHref(id)}${window.location.hash}`;
      window.history.replaceState(window.history.state, "", url);
      if (source === "click") setRevealTick((n) => n + 1);
    },
    [activeProductId, products],
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

  useEffect(() => {
    if (revealTick > 0) revealVideo();
  }, [revealTick]);

  // keep focus on the card control that was used (the card remounts per product)
  useEffect(() => {
    const key = navFocus.current;
    navFocus.current = null;
    if (key) document.getElementById(PANEL_ID)?.querySelector<HTMLElement>(`[data-nav-key="${key}"]`)?.focus({ preventScroll: true });
  }, [activeProductId]);

  const navigateCard = useCallback(
    (id: string, key: string) => {
      navFocus.current = key;
      selectProduct(id, "arrow");
    },
    [selectProduct],
  );
  const stepCard = useCallback(
    (delta: number) => {
      const at = products.findIndex((p) => p.id === activeProductId);
      const next = products[stepIndex(Math.max(0, at), delta, products.length)];
      if (next) navigateCard(next.id, delta > 0 ? "next" : "prev");
    },
    [products, activeProductId, navigateCard],
  );
  const cardGestures = useDetailNav(desktop, stepCard);

  if (!product) return null;

  // TASK-334 (DES-024): where the paper selector is on screen it is the one navigation control — the card drops its own arrows, "01 / 10" and pager dots
  const selectorPresent = VERTICAL_CAROUSEL_ENABLED && PAPER_SELECTOR_ENABLED && desktop;

  return (
    <div className={VERTICAL_CAROUSEL_ENABLED ? (PAPER_SELECTOR_ENABLED && desktop ? "pf-showcase pf-vcar pf-psel" : "pf-showcase pf-vcar") : "pf-showcase"} data-view={view}>
      {intro}
      {view === "detail" ? <PhoneDetailBar name={product.name} logo={product.logo} onBack={backToList} /> : null}
      <PhoneProjectList visible={view === "list"} products={products} filter={filter} onFilterChange={changeFilter} onOpen={openProduct} lastOpenedId={lastOpened} />
      <div
        id={PANEL_ID}
        className="pf-feature"
        role="tabpanel"
        aria-labelledby={tabId(product.id)}
        data-active-product={product.id}
        data-media-mode={mediaMode}
        data-enter={enter}
        tabIndex={desktop ? -1 : undefined}
        {...cardGestures}
      >
        <MainMediaStage key={`${product.id}:${mediaMode}:${stageNonce}`} product={product} mode={mediaMode} enter={enter} id={STAGE_ID} autoStart={autoStart} autoMute={autoMute} paper={PAPER_PLAYER_ENABLED && VERTICAL_CAROUSEL_ENABLED && desktop} />
        <ProductInfoPanel
          key={product.id}
          product={product}
          mode={mediaMode}
          onModeChange={changeMode}
          stageId={STAGE_ID}
          headingId={NAME_ID}
          total={products.length}
          onWatch={watchVideo}
          nav={desktop && !selectorPresent ? { products, onNavigate: navigateCard } : undefined}
          selectorNav={selectorPresent}
          poster={VERTICAL_CAROUSEL_ENABLED && desktop ? product.art : undefined}
        />
      </div>
      {/* TASK-217: the picker sits beneath the window it drives (DOM order = visual order). The phone hides it (TASK-210). */}
      <ProductCarousel products={products} activeId={product.id} onSelect={selectProduct} panelId={PANEL_ID} tabId={tabId} />
    </div>
  );
}
