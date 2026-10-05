"use client";

/**
 * AskPanel — the "Ask Tushky" drawer (TKT-104 r2, Tushar's spec 2026-09-26
 * `docs/redesign-mockups/m-009/tushar-2026-09-26/ask-tushky-drawer-spec.md`; Design.md §11 Dev-60–63).
 * The history: technical-plan.md §B S11 made it the global Ask slide-over, TKT-77 turned it into a
 * notebook sheet, and TKT-104 r1 gave it the torn notebook. This round rebuilds it as a compact
 * right-side drawer with a real multi-turn chat.
 *
 * Shell (unchanged contract): a native `<dialog class="ask-panel">` opened with `showModal()`. The
 * browser supplies the focus trap, Esc and the top layer, so the `::backdrop` scrim sits above the
 * page and the drawer sits above the scrim. That is spec §4's 0 / 40 / 50 stack without z-index
 * values. The chunk is lazy (`AskPanelLazy`, mounted by `AskProvider` only after the first
 * `openPanel()`, EVAL-005). `lockBackground()` sets inert, overflow:hidden and pauses Lenis. Focus
 * returns to `triggerRef`, which is whichever trigger opened the drawer: the header ghost (the
 * MobileMenu row went with the hamburger, TASK-112), or TKT-108's hero CTA through the same `triggerRef` + `openPanel()` pair.
 *
 * Geometry (spec §2 / §22): fixed top/right/0, 100dvh, `clamp(400px, 32vw, 460px)` wide (460 at 1440),
 * and full-screen 100vw below 768. Motion (spec §3 / §24) is CSS keyed off `data-open`, which is
 * flipped one frame after `showModal()`. Opening is a 420 ms keyframe slide with a 4 px paper settle.
 * Closing sets `data-closing`: a 280 ms keyframe slide back to the right with no bounce, and the dialog closes after it ends.
 * Reduced motion appears and disappears in place.
 *
 * Body (spec §14 / §16): the header (flex-shrink 0), one independently scrolling region
 * (`data-lenis-prevent`), then the pinned composer. Before the first question the region holds the
 * empty state (mascot, grounding note, intro, six suggestions). After it, it holds the conversation
 * (`useAskChat`), and the header gains the small avatar. Closing resets the conversation, as before.
 */
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { track } from "@vercel/analytics";
import { durations, useReducedMotionSafe } from "@/lib/motion";
import { lockBackground } from "@/lib/focus";
import type { FaqEntry, FaqLookupEvent } from "@/lib/ask/faq";
import { createTushkyPipeline } from "@/lib/ask/pipeline";
import { freshFaqAudio, type FaqAudioManifest } from "@/lib/tushky-voice/faq-audio";
import faqData from "@/data/tushky/faq.json";
import faqAudioData from "@/data/tushky/faq-audio.json";
import { useAskChat, useAskContext } from "./AskProvider";
import { ChatComposer, ChatConversation, TushkyEmptyState, TushkyHeader } from "./AskTushky";
import { TushkyVoiceProvider } from "./voice/TushkyVoicePlayer";

export interface AskPanelProps {
  /**
   * The 6 `surface:'panel'` prompts resolved in app/layout.tsx (A1). The drawer's own suggestion list
   * is `TUSHKY_SUGGESTIONS` (Dev-63); the index still serves these as its empty-state suggestions.
   * The prop stays so the provider/layout contract is unchanged.
   */
  panelPrompts: string[];
  /** TASK-123: FAQ-cache entries still current with the data (build-time, `lib/ask/faq-versions.ts`). */
  faqFreshIds: readonly string[];
}

/** The curated FAQ (TASK-123). Imported here, so it ships in the lazy drawer chunk only (EVAL-005). */
const FAQ = faqData as FaqEntry[];
/** TASK-134: pre-generated FAQ audio metadata (voice spec §29); only records still current are played. */
const FAQ_AUDIO = faqAudioData as FaqAudioManifest;

/**
 * §62: cache effectiveness through the site's existing Vercel Analytics custom events (the project has
 * no Mixpanel). Only the FAQ id, its category and the miss reason are sent — never the question text.
 * Misses go to the local index today; the event is named for that, not for a Gemini call that doesn't exist.
 */
function trackLookup({ lookup }: FaqLookupEvent): void {
  try {
    if (lookup.kind === "hit") {
      track("Ask Tushky Cache Hit", { faq_id: lookup.entry.id, question_category: lookup.entry.category, match: lookup.matchType });
    } else {
      track("Ask Tushky Cache Miss", { reason: lookup.reason, question_category: lookup.entry?.category ?? "unmatched" });
    }
  } catch {
    // Analytics must never block an answer.
  }
}
/** Close slide duration — mirrors `.ask-panel` `transition` in globals.css (spec §3: 250–320 ms). */
const CLOSE_MS = Math.min(durations.panel, 280);

export function AskPanel({ faqFreshIds }: AskPanelProps) {
  const { provider, panelOpen, closePanel, triggerRef, pendingAsk, clearPendingAsk } = useAskContext();
  // TASK-123: the FAQ cache answers first; a miss falls through to the context's provider (the index).
  // TASK-134: built by the same `createTushkyPipeline` the speech route uses to recompute an answer.
  const faqProvider = useMemo(
    () => createTushkyPipeline(FAQ, provider, { fresh: faqFreshIds, onLookup: trackLookup }),
    [provider, faqFreshIds],
  );
  const faqAudio = useMemo(() => freshFaqAudio(FAQ, FAQ_AUDIO, faqFreshIds), [faqFreshIds]);
  const { messages, isGenerating, ask, retry, reset } = useAskChat(faqProvider);
  const reduced = useReducedMotionSafe();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");

  // Open / close the native modal in step with `panelOpen`. `data-open` is set imperatively one frame
  // after showModal() so the slide runs from the shown state, never from display:none. React never
  // declares it in JSX, so a re-render leaves it alone. On close: drop `data-open` (slide out), then
  // close() once the slide has run; `close` returns focus below.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (panelOpen) {
      dialog.removeAttribute("data-closing");
      if (!dialog.open) dialog.showModal();
      const frame = requestAnimationFrame(() => {
        dialog.setAttribute("data-open", "");
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(frame);
    }

    dialog.removeAttribute("data-open");
    if (!dialog.open) return;
    if (reduced) {
      dialog.close();
      return;
    }
    // Slide out to the right on its own keyframe (`data-closing`), then close once it has run. Close
    // on the keyframe's own `animationend`, not a fixed timer: when the first frame is slow to paint
    // (a heavy page on a slow GPU) a CLOSE_MS timer fired before the slide had started and the
    // drawer vanished in place. The timer stays only as a fallback if the event never arrives.
    dialog.setAttribute("data-closing", "");
    const done = () => {
      dialog.removeEventListener("animationend", onEnd);
      dialog.removeAttribute("data-closing");
      if (dialog.open) dialog.close();
    };
    const onEnd = (event: AnimationEvent) => {
      if (event.target === dialog && event.animationName === "ask-drawer-out") done();
    };
    dialog.addEventListener("animationend", onEnd);
    const timer = setTimeout(done, CLOSE_MS * 3);
    return () => {
      clearTimeout(timer);
      dialog.removeEventListener("animationend", onEnd);
      dialog.removeAttribute("data-closing");
    };
  }, [panelOpen, reduced]);

  useEffect(() => {
    if (!panelOpen) return;
    return lockBackground();
  }, [panelOpen]);

  // A fresh open starts at the empty state.
  useEffect(() => {
    if (!panelOpen) reset();
  }, [panelOpen, reset]);

  // TKT-113: a question handed over by the Home launcher (typed text or a suggestion card) is asked
  // as soon as the drawer is open. The id guard makes it run once, even under a dev double effect.
  const consumedAsk = useRef(0);
  useEffect(() => {
    if (!panelOpen || !pendingAsk || consumedAsk.current === pendingAsk.id) return;
    consumedAsk.current = pendingAsk.id;
    ask(pendingAsk.label, pendingAsk.query);
    clearPendingAsk(pendingAsk.id);
  }, [panelOpen, pendingAsk, ask, clearPendingAsk]);

  // Keep the latest exchange in view: scroll so the newest question sits at the top of the region
  // (a long answer then reads from its start). Smooth unless reduced motion (spec §20 / §24).
  const lastUserId = [...messages].reverse().find((m) => m.role === "user")?.id;
  const lastStatus = messages.at(-1)?.role === "tushky" ? (messages.at(-1) as { status: string }).status : "";
  useEffect(() => {
    const region = scrollRef.current;
    if (!region || lastUserId === undefined) return;
    const frame = requestAnimationFrame(() => {
      const bubble = region.querySelector<HTMLElement>(`[data-turn-id="${lastUserId}"]`);
      const top = bubble ? bubble.offsetTop - 12 : region.scrollHeight;
      region.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [lastUserId, lastStatus, reduced]);

  const onAsk = (label: string, query: string) => {
    ask(label, query);
    // The clicked card / chip may unmount; keep focus in the drawer, on the composer.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // never navigate
    const text = value.trim();
    if (!text) return;
    ask(text);
    setValue("");
  };

  const chatting = messages.length > 0;

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby="ask-tushky-title"
      // No `display` on the <dialog> itself (the UA `dialog:not([open])` rule must keep it hidden);
      // the flex column lives on `.tk-paper`.
      className="ask-panel"
      data-no-trail=""
      data-mode={chatting ? "chat" : "empty"}
      onCancel={(event) => {
        event.preventDefault(); // Esc takes the same animated close path as the button / backdrop
        closePanel();
      }}
      // A click that lands on the <dialog> element itself (the backdrop area) closes the drawer.
      onClick={(event) => {
        if (event.target === dialogRef.current) closePanel();
      }}
      onClose={() => {
        closePanel();
        const trigger = triggerRef.current;
        if (trigger?.isConnected) trigger.focus();
      }}
    >
      {/* TASK-134: one audio manager per drawer; closing the drawer stops and forgets all audio. */}
      <TushkyVoiceProvider open={panelOpen}>
        <div className="tk-paper">
          <TushkyHeader compact={chatting} generating={isGenerating} onClose={closePanel} />
          <div ref={scrollRef} data-lenis-prevent="" className="tk-scroll">
            {chatting ? (
              <ChatConversation messages={messages} faqAudio={faqAudio} onAsk={onAsk} onRetry={retry} />
            ) : (
              <TushkyEmptyState onAsk={onAsk} />
            )}
          </div>
          <ChatComposer value={value} onChange={setValue} onSubmit={onSubmit} inputRef={inputRef} />
        </div>
      </TushkyVoiceProvider>
    </dialog>
  );
}
