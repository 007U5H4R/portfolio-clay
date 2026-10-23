"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { track } from "@/lib/analytics/track";
import { scrollToOffset } from "@/lib/smooth-scroll";
import {
  TOUR_CHANGE_EVENT,
  TOUR_OPEN_ATTR,
  TOUR_PHONE_MAX,
  TOUR_START_EVENT,
  TOUR_STEPS,
  clampStep,
  phoneScrollY,
  placeNote,
  readInvite,
  setPendingStart,
  shouldInvite,
  takePendingStart,
  writeInvite,
  type TourSource,
  type TourStartDetail,
  type TourStep,
} from "@/lib/tour";

/**
 * TASK-170 — the replayable guided tour (home page only). Six frosted-glass notes (TASK-361), each anchored to a real
 * element: beside it on desktop, a bottom sheet on phones (< 640) with the page scrolled so the target sits under the
 * header. A blurred, dimmed scrim covers the page with a rounded hole over the target, so only that stays crisp.
 * Non-modal dialog: the page stays usable, focus moves into the note and back to the opener on close, and a polite
 * live region announces "Step n of N". While open `<html data-tour-open>` is set and `tour:change` fires, which
 * MobileCarousel's autoplay check reads. Started by `requestTour()` (header button, phone menu row) or the one-time
 * invite; a start from another page navigates home first. The last stop hints at the hidden Lab egg and never links
 * to it (S30, EXE-82).
 */

declare global {
  interface Window {
    /** e2e opt-in: show the one-time invite even in an automated browser. */
    __tourInvite?: boolean;
  }
}

const INVITE_DELAY_MS = 1500;
/** Frames to wait for the home targets after a cross-page navigation (stop rule, ~2 s at 60 fps). */
const MAX_WAIT_FRAMES = 120;

function visible(el: Element | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

function resolveTarget(step: TourStep): HTMLElement | null {
  for (const sel of step.targets) {
    const el = document.querySelector(sel);
    if (visible(el)) return el;
  }
  return null;
}

function headerBottom(): number {
  const h = document.querySelector<HTMLElement>("header[data-site-header]");
  return h ? Math.max(0, h.getBoundingClientRect().bottom) : 0;
}

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isPhone(): boolean {
  return window.matchMedia(`(max-width: ${TOUR_PHONE_MAX}px)`).matches;
}

/** The scrim's clip: the whole viewport minus a rounded hole over the target (evenodd). */
function holePath(vw: number, vh: number, x: number, y: number, w: number, h: number, radius: number): string {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  return (
    `path(evenodd, "M0 0H${vw}V${vh}H0Z` +
    `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}` +
    `H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z")`
  );
}

function scrollToY(y: number): void {
  const immediate = reducedMotion();
  if (scrollToOffset(y, { immediate })) return;
  window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
}

/** Bring a stop's target into view: on phones always just under the header; on desktop only when it is off-screen. */
function bringIntoView(step: TourStep, el: HTMLElement): void {
  if (step.inHeader) return;
  const r = el.getBoundingClientRect();
  const hb = headerBottom();
  if (isPhone()) {
    scrollToY(phoneScrollY(r.top + window.scrollY, hb, 12));
    return;
  }
  if (r.top >= hb + 8 && r.top <= window.innerHeight * 0.45) return;
  scrollToY(phoneScrollY(r.top + window.scrollY, hb, 32));
}

export function GuidedTour() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<readonly TourStep[]>(TOUR_STEPS);
  const [index, setIndex] = useState(0);
  const [invite, setInvite] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  /** True once the ring/note have a position this run, so later steps glide from it (the first never flies in from 0,0). */
  const placed = useRef(false);
  const titleId = useId();
  const bodyId = useId();

  const start = useCallback(
    (source: TourSource, opener?: HTMLElement | null) => {
      if (open) return;
      const available = TOUR_STEPS.filter((s) => resolveTarget(s));
      if (available.length === 0) return;
      writeInvite("accepted");
      setInvite(false);
      returnTo.current = opener ?? null;
      placed.current = false;
      setSteps(available);
      setIndex(0);
      setOpen(true);
      track("tour_started", { source });
    },
    [open],
  );

  const close = useCallback(
    (how: "completed" | "skipped") => {
      if (!open) return;
      const step = steps[index];
      if (how === "completed") track("tour_completed", { step_count: steps.length });
      else if (step) track("tour_skipped", { step_id: step.id, step_index: index });
      setOpen(false);
      const back = returnTo.current;
      returnTo.current = null;
      const target = back && back.isConnected && visible(back) ? back : document.querySelector<HTMLElement>("[data-site-header] .header-brand");
      target?.focus({ preventScroll: true });
    },
    [open, steps, index],
  );

  const go = useCallback(
    (delta: 1 | -1) => {
      if (delta === 1 && index >= steps.length - 1) return close("completed");
      setIndex((i) => clampStep(i + delta, steps.length));
    },
    [index, steps.length, close],
  );

  // Starts requested from the header button / phone menu. Off the home page: remember it, go home, start there.
  useEffect(() => {
    const onStart = (e: Event) => {
      const detail = (e as CustomEvent<TourStartDetail>).detail;
      if (!detail) return;
      if (pathname !== "/") {
        setPendingStart(detail.source);
        router.push("/");
        return;
      }
      start(detail.source, detail.returnTo);
    };
    window.addEventListener(TOUR_START_EVENT, onStart);
    return () => window.removeEventListener(TOUR_START_EVENT, onStart);
  }, [pathname, router, start]);

  // Arrived home with a pending start: wait (bounded) for the targets, then open.
  useEffect(() => {
    if (pathname !== "/") return;
    const source = takePendingStart();
    if (!source) return;
    let frame = 0;
    let raf = 0;
    const tick = () => {
      if (resolveTarget(TOUR_STEPS[0]!) || frame >= MAX_WAIT_FRAMES) return start(source);
      frame += 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pathname, start]);

  // Leaving the home page closes the tour; the invite never follows the visitor either.
  useEffect(() => {
    if (pathname === "/") return;
    // Synchronizing with router navigation away from home, not a derived-state anti-pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInvite(false);
    if (open) close("skipped");
  }, [pathname, open, close]);

  // The one-time invite.
  useEffect(() => {
    if (pathname !== "/" || open) return;
    const ok = shouldInvite({
      webdriver: Boolean(navigator.webdriver),
      optIn: window.__tourInvite === true,
      stored: readInvite(),
      pathname,
    });
    if (!ok) return;
    const t = setTimeout(() => setInvite(true), INVITE_DELAY_MS);
    return () => clearTimeout(t);
  }, [pathname, open]);

  // `<html data-tour-open>` + `tour:change` for MobileCarousel (autoplay holds while the tour is open).
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.setAttribute(TOUR_OPEN_ATTR, "");
    document.dispatchEvent(new Event(TOUR_CHANGE_EVENT));
    return () => {
      root.removeAttribute(TOUR_OPEN_ATTR);
      document.dispatchEvent(new Event(TOUR_CHANGE_EVENT));
    };
  }, [open]);

  const step = open ? steps[index] : undefined;

  // Per step: bring the target into view, announce it, move focus into the note (first step only, so Next keeps focus).
  useEffect(() => {
    if (!step) return;
    track("tour_step_viewed", { step_id: step.id, step_index: index });
    const el = resolveTarget(step);
    if (el) bringIntoView(step, el);
    const note = noteRef.current;
    if (note && !note.contains(document.activeElement)) note.focus({ preventScroll: true });
  }, [step, index]);

  // Follow the target every frame while open (scrolling, resizing, layout shifts). Stops when the tour closes.
  useEffect(() => {
    if (!step) return;
    let raf = 0;
    let target: HTMLElement | null = null;
    let last = "";
    let glideTimer = 0;
    let glided: HTMLElement[] = [];
    const unglide = () => {
      for (const el of glided) delete el.dataset.glide;
      glided = [];
    };
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!target || !target.isConnected) target = resolveTarget(step);
      const note = noteRef.current;
      const ring = ringRef.current;
      const scrim = scrimRef.current;
      if (!note || !ring || !scrim) return;
      if (!target) {
        ring.hidden = true;
        scrim.hidden = true;
        return;
      }
      const r = target.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const phone = isPhone();
      const key = `${r.top}|${r.left}|${r.width}|${r.height}|${vw}|${vh}|${note.offsetHeight}`;
      if (key === last) return;
      // First move of a step after an earlier one: glide there; every later move (scroll, resize) is instant.
      if (!last && placed.current && !reducedMotion()) {
        ring.dataset.glide = "";
        scrim.dataset.glide = "";
        note.dataset.glide = "";
        glided = [ring, scrim, note];
        glideTimer = window.setTimeout(unglide, 320);
      }
      placed.current = true;
      last = key;
      const pad = 6;
      ring.hidden = false;
      ring.style.top = `${r.top - pad}px`;
      ring.style.left = `${r.left - pad}px`;
      ring.style.width = `${r.width + pad * 2}px`;
      ring.style.height = `${r.height + pad * 2}px`;
      scrim.hidden = false;
      scrim.style.clipPath = holePath(vw, vh, r.left - pad, r.top - pad, r.width + pad * 2, r.height + pad * 2, 14);
      if (phone) {
        note.dataset.side = "sheet";
        note.style.removeProperty("top");
        note.style.removeProperty("left");
        return;
      }
      const p = placeNote(
        { top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 },
        { width: note.offsetWidth, height: note.offsetHeight },
        { width: vw, height: vh },
        step.inHeader ? 0 : headerBottom(),
      );
      note.dataset.side = p.side;
      note.style.top = `${p.top}px`;
      note.style.left = `${p.left}px`;
      note.style.setProperty("--tour-arrow", `${p.arrow}px`);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(glideTimer);
      unglide();
    };
  }, [step]);

  // Arrow keys and Escape, anywhere on the page while open (never while typing).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable=''], [contenteditable='true'], dialog[open]")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        close("skipped");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, go, close]);

  const dismissInvite = () => {
    writeInvite("dismissed");
    setInvite(false);
  };

  const total = steps.length;
  const last = index === total - 1;

  return (
    <>
      {invite && !open ? (
        <section className="tour-invite" aria-label="Guided tour" data-tour-invite="">
          <p className="tour-invite-text">Want a 30-second tour?</p>
          <div className="tour-invite-actions">
            <button type="button" className="tour-btn tour-btn-primary focus-ring" onClick={() => start("invite")}>
              Show me
            </button>
            <button type="button" className="tour-btn tour-btn-ghost focus-ring" onClick={dismissInvite}>
              No thanks
            </button>
          </div>
        </section>
      ) : null}

      {step ? (
        <>
          <div ref={scrimRef} className="tour-scrim" aria-hidden="true" hidden />
          <div ref={ringRef} className="tour-ring" aria-hidden="true" hidden />
          <div
            ref={noteRef}
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            tabIndex={-1}
            className="tour-note"
            data-guided-tour=""
            data-tour-step={step.id}
            data-side="pinned"
          >
            <div className="tour-bar">
              <p className="tour-count" aria-hidden="true">
                {index + 1} / {total}
              </p>
              <button type="button" className="tour-close focus-ring" aria-label="Close tour" onClick={() => close("skipped")}>
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {/* Keyed copy so each stop's text fades in; the buttons keep their identity, so focus stays on Next. */}
            <div className="tour-copy" key={step.id}>
              <h2 id={titleId} className="tour-title">
                {step.title}
              </h2>
              <p id={bodyId} className="tour-body">
                {step.body}
              </p>
            </div>
            <div className="tour-actions">
              <span className="tour-dots" aria-hidden="true">
                {steps.map((s, i) => (
                  <span key={s.id} className="tour-dot" data-on={i === index ? "" : undefined} />
                ))}
              </span>
              <span className="tour-nav">
                {index > 0 ? (
                  <button type="button" className="tour-btn tour-btn-ghost focus-ring" onClick={() => go(-1)}>
                    Back
                  </button>
                ) : null}
                <button type="button" className="tour-btn tour-btn-primary focus-ring" data-tour-next="" onClick={() => go(1)}>
                  {last ? "Done" : "Next"}
                </button>
              </span>
            </div>
          </div>
        </>
      ) : null}
      <p className="sr-only" aria-live="polite" data-tour-live="">
        {step ? `Step ${index + 1} of ${total}: ${step.title}` : ""}
      </p>
    </>
  );
}
