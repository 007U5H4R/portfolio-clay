/**
 * Per-page-view tracking (TASK-194): `page_viewed`, `case_study_viewed`, `section_viewed`,
 * `scroll_depth_reached`, `project_carousel_viewed`. Everything is observer-driven — there is NO scroll,
 * mousemove or animation-frame listener:
 *   - sections and the carousel use IntersectionObserver (the browser computes visibility off the main thread);
 *   - scroll depth uses four invisible "sentinel" blocks, each spanning from its depth line to the bottom
 *     of the document, observed by one IntersectionObserver. A sentinel is intersecting from the moment the
 *     viewport's bottom edge passes its line, even when a jump (End key, anchor link, Lenis) skips frames.
 *     A ResizeObserver on <body> repositions them when the page height changes.
 * "d % scrolled" means scrollY has covered d % of the scrollable range (page height − viewport height).
 * Each emission is keyed per page view, so a milestone / section / page view is sent at most once.
 */
import { caseStudySlug, pageNameFor } from "./pages";
import type { PageName } from "./events";
import type { Tracker } from "./tracker";

export interface PageContext {
  path: string;
  navigationType: "direct" | "client_navigation" | "back_forward" | "reload";
  isLanding: boolean;
  sessionType: "new" | "returning";
  theme: "light" | "dark" | undefined;
  /** The canonical path of the page the visitor came from on this site, if any. */
  previousPath: string | null;
}

const DEPTHS = [25, 50, 75, 90] as const;
const SECTION_MIN_VISIBLE = 0.4;
/** Pages that fit (almost) in one viewport have no meaningful scroll depth. */
const MIN_SCROLLABLE_RATIO = 1.15;
const SLUG = /^[a-z0-9][a-z0-9_-]*$/;

let viewCounter = 0;

function entryPointFor(previousPath: string | null): "portfolio_page" | "experience_page" | "home_page" | "other_internal" | "external_or_direct" {
  if (!previousPath) return "external_or_direct";
  const page = pageNameFor(previousPath);
  if (page === "portfolio") return "portfolio_page";
  if (page === "experience") return "experience_page";
  if (page === "home") return "home_page";
  return "other_internal";
}

export function startPage(tracker: Tracker, ctx: PageContext): () => void {
  const id = ++viewCounter;
  const key = (suffix: string) => `v${id}:${suffix}`;
  const pageName: PageName = pageNameFor(ctx.path);
  const cleanups: Array<() => void> = [];
  const timers: number[] = [];

  tracker.track("page_viewed", {
    page_name: pageName,
    page_path: ctx.path,
    navigation_type: ctx.navigationType,
    is_landing: ctx.isLanding,
    session_type: ctx.sessionType,
    ...(ctx.theme ? { theme: ctx.theme } : {}),
  });

  const slug = caseStudySlug(ctx.path);
  if (slug && SLUG.test(slug)) {
    tracker.trackOnce(key("case"), "case_study_viewed", { project_id: slug.slice(0, 40), entry_point: entryPointFor(ctx.previousPath) });
  }

  if (typeof IntersectionObserver === "undefined") return () => tracker.resetOnce(key(""));

  // ---- sections ------------------------------------------------------------------------------------
  const observed = new WeakSet<Element>();
  const sectionIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const visible = entry.intersectionRect.height;
        const needed = Math.min(entry.boundingClientRect.height * SECTION_MIN_VISIBLE, window.innerHeight * SECTION_MIN_VISIBLE);
        if (visible < needed) continue;
        const name = el.id.toLowerCase().slice(0, 40);
        if (!SLUG.test(name)) continue;
        const index = Number(el.dataset.analyticsIndex ?? 0);
        if (tracker.trackOnce(key(`section:${name}`), "section_viewed", { section_name: name, section_index: index, page_name: pageName })) sectionIO.unobserve(el);
      }
    },
    { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.75, 1] },
  );
  const scanSections = () => {
    const found = document.querySelectorAll<HTMLElement>("main section[id]");
    found.forEach((el, i) => {
      if (observed.has(el)) return;
      observed.add(el);
      el.dataset.analyticsIndex = String(Math.min(i, 60));
      sectionIO.observe(el);
    });
  };
  scanSections();
  // Lazy sections mount a little after the route commits; two cheap re-scans (not a MutationObserver).
  timers.push(window.setTimeout(scanSections, 800), window.setTimeout(scanSections, 3000));
  cleanups.push(() => sectionIO.disconnect());

  // ---- project carousel ----------------------------------------------------------------------------
  const carousel = document.querySelector(".pf-carousel");
  if (carousel) {
    const carouselIO = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.5)) return;
        const count = document.querySelectorAll(".pf-carousel [role=tab]").length;
        tracker.trackOnce(key("carousel"), "project_carousel_viewed", { project_count: Math.min(count, 50), page_name: pageName });
        carouselIO.disconnect();
      },
      { threshold: [0.5] },
    );
    carouselIO.observe(carousel);
    cleanups.push(() => carouselIO.disconnect());
  }

  // ---- scroll depth --------------------------------------------------------------------------------
  const scheduleDepth = () => {
    const root = document.documentElement;
    if (root.scrollHeight < window.innerHeight * MIN_SCROLLABLE_RATIO) return;
    const holder = document.createElement("div");
    holder.setAttribute("aria-hidden", "true");
    holder.dataset.analyticsSentinels = "";
    holder.style.cssText = "position:absolute;top:0;left:0;width:1px;height:0;overflow:visible;pointer-events:none;visibility:hidden";
    const blocks = DEPTHS.map((depth) => {
      const block = document.createElement("div");
      block.dataset.depth = String(depth);
      block.style.cssText = "position:absolute;left:0;width:1px";
      holder.appendChild(block);
      return block;
    });
    const place = () => {
      const height = document.documentElement.scrollHeight;
      const vh = window.innerHeight;
      blocks.forEach((block, i) => {
        // "d % scrolled" = scrollY ≥ d % of the scrollable range = the viewport's bottom edge past
        // vh + d % × (height − vh). At scroll 0 no line is in view, so nothing fires before a scroll.
        const top = Math.round(vh + (DEPTHS[i]! / 100) * (height - vh));
        block.style.top = `${top}px`;
        block.style.height = `${Math.max(1, height - top)}px`;
      });
    };
    document.body.appendChild(holder);
    place();
    const depthIO = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const depth = Number((entry.target as HTMLElement).dataset.depth);
        if (DEPTHS.includes(depth as (typeof DEPTHS)[number]) && tracker.trackOnce(key(`depth:${depth}`), "scroll_depth_reached", { depth_percent: depth, page_name: pageName })) {
          depthIO.unobserve(entry.target);
        }
      }
    });
    blocks.forEach((b) => depthIO.observe(b));
    const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    resize?.observe(document.body);
    cleanups.push(() => {
      depthIO.disconnect();
      resize?.disconnect();
      holder.remove();
    });
  };
  // After first layout settles: the page height is final enough, and the initial viewport is excluded.
  timers.push(window.setTimeout(scheduleDepth, 600));

  return () => {
    timers.forEach((t) => window.clearTimeout(t));
    cleanups.forEach((c) => c());
    tracker.resetOnce(key(""));
  };
}
