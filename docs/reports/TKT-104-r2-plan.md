# TKT-104 round 2 — Ask Tushky drawer: plan (spec §32)

Spec: `docs/redesign-mockups/m-009/tushar-2026-09-26/ask-tushky-drawer-spec.md`. Reference:
`ask-tushky-drawer-target.png`. Campfire TASK-101 (reopened). Tushar pre-approved the spec, so
implementation starts right after this plan is committed.

## What exists today (inspection)

| question (§32) | finding |
|---|---|
| Ask component | `components/ai/AskPanel.tsx` (round 1 torn-notebook panel) + `AskPanelDecor.tsx` (doodles, `PanelIntro`, card icons). It reuses the shared `AnswerView` / `SuggestedPrompts` / `EvidenceLinks`, which the home inline notebook (`AskPortfolio`) also uses. |
| Trigger(s) | `components/navigation/AskAIButton.tsx`: the header icon ghost (≥ 1024) and the MobileMenu row. Each one sets `triggerRef.current = event.currentTarget` and then calls `openPanel()` from `useAskContext()`. TKT-108's hero "Ask Tushky" CTA will use the same pair. **That contract does not change.** |
| Mount / lazy | `AskProvider` mounts `AskPanelLazy` (`next/dynamic`, `ssr:false`) only after the first `openPanel()`, so the panel is outside `/` first-load JS (EVAL-005). This stays. |
| Current geometry / side | A native `<dialog class="ask-panel">` opened with `showModal()`. At ≥ 768 it is a **right** drawer inset 16 px (400 px wide; 480 px at ≥ 1440). Below 768 it is a **bottom sheet** (90vh, slides up). Motion is CSS off a `data-open` attribute (320 ms `--ease-panel`), and the scrim is `::backdrop` at 20% navy. |
| z-index | `showModal()` puts the dialog and its `::backdrop` in the browser **top layer**, above every z-index (header, Lenis, the parallax layers). So spec §4's 0/40/50 stack comes for free (page < backdrop < drawer), and nothing else can cover the drawer. No z-index values are added. |
| Breakpoints | Tailwind defaults plus `--breakpoint-2xl: 1440px`: md 768, lg 1024 (nav collapse), 2xl 1440. |
| Typography tokens | `--font-display` Fraunces (serif/editorial), `--font-body` Inter, `--font-hand` Caveat. Colours come only from the 13 paper tokens (`pnpm tokens:check`). |
| Framer Motion | `motion` 13.3 (`motion/react`) is installed and used elsewhere. |
| Chat state | `useAsk(surface)` is a **single-turn** state machine (`idle → loading → answer/empty/error`). There is no conversation state, and the panel resets on close. The provider is the deterministic retrieval-only `LocalKnowledgeProvider` (EVAL-012). |
| Focus / scroll | The native dialog traps focus. Esc goes to `cancel`, which calls `closePanel()`. The native `close` event returns focus to `triggerRef`. `lockBackground()` sets `overflow:hidden` + `inert` on the page and pauses Lenis. The scroll region carries `data-lenis-prevent`. |

## Plan

1. **Drawer shell (`AskPanel.tsx`, rewritten as the `AskTushkyDrawer` composition).** Keep the native
   `<dialog class="ask-panel">`, `showModal()`, `lockBackground`, the lazy chunk and the
   open/close/focus-return paths, because they are proven and the tests key on them.
   - Geometry: `position:fixed; top:0; right:0; height:100dvh`, and `width: clamp(400px, 32vw, 480px)`, which gives 460 at 1440. It is 400 at 768–1249 (§22 tablet 380–430). Below 768 it is `100vw` full-screen (§22).
   - Motion: CSS, not `motion/react`. The native top-layer dialog already needs imperative close sequencing (it stays `open` until the slide-out ends), and CSS keeps EVAL-010's computed-transform checks and the global reduced-motion collapse valid. Open is a keyframe `translateX(100%) → -4px → 0` over 420 ms with `cubic-bezier(.22,1,.36,1)`, which is the paper settle. Close is a transition to `translateX(100%)` over 280 ms with no bounce. The backdrop is `rgba(10,15,28,.38)` expressed as `color-mix(navy …)`, with `blur(2px)`, fading in.
   - Torn LEFT edge: an SVG-mask / `clip-path` irregular edge on the drawer's left side. The soft left shadow is a `drop-shadow` on the dialog, so it follows the tear.
   - Backdrop click closes (the click lands on the `<dialog>` element outside the paper). Esc closes. Focus returns to whichever trigger opened the drawer.
2. **Components (§25), all in the lazy chunk:** `TushkyHeader` (title id `ask-tushky-title`, "Ask **Tushky** 🐾", Caveat subtitle with a hand underline, and a 44 px round paper close button), `TushkyEmptyState` (mascot, the one sticky note, the hand annotation, the intro card, and `SuggestedQuestions`, which is data-driven `{label, query, category, icon}`, single column, six rows), `ChatConversation` (user bubble on the right; Tushky bubble on the left with a 32 px avatar, "Sources from portfolio:" chips and 2–3 follow-up chips), and `ChatComposer` (the pinned pill input plus a navy paper-plane send button).
3. **Multi-turn state:** a new `useAskChat()` hook next to `useAsk` in `AskProvider.tsx` holds `messages[]` and `isGenerating`. It keeps the same provider, the 150 ms skeleton floor, supersession safety and error logging. `useAsk` and the home inline notebook are untouched. Every answer is still the provider's verbatim text (the no-fabrication invariant). The user's own words render as a React text node, never as HTML. The conversation resets when the drawer closes, as today.
4. **Grounding (EVAL-012 unchanged):** I probed each of Tushar's six questions against the index. Four resolve to the right entry as worded. "Show me his product thinking process." matched `built`, which is wrong, so it submits the `discovery` prompt. "Walk me through a specific project." matched `built` as a list, so it submits `most-technical` (the RailCite walkthrough). The visible wording stays his. "AI / cloud" matches `ai-products` at 0.67; the index has no cloud entry, so this goes in the report. Follow-ups are **derived from the answer's sources**: other entries are ranked by shared evidence pages, and the chips use each entry's exact prompt, so every chip is answerable. "Compare his experience" returns the empty fallback, so it is not offered. A unit test pins all of this.
5. **Attachment button: omitted.** The assistant can't read attachments, and a control that does nothing is worse than no control. The slot renders nothing.
6. **Mascot v2:** Higgsfield `gpt_image_2_5`, job `20288256-…` (0.5 cr, within the 2-cr cap). "Tushky" is spelled correctly on a navy bandana. It ships as `tushky-bandana.webp` (231×280, alpha, about 25.7 kB) and `tushky-avatar.webp` (64 px). Both are lazy and load only inside the drawer chunk. It needs a manifest entry, a README provenance row and updates to EVAL-021 / `paper.test`. The round-1 `tushky.webp` is retired.
7. **Removed (panel-only round-1 furniture):** `AskPanelDecor` doodles, the paperclip, the "Browse my projects" / quick chips (Dev-49), and the `idleIntro` / `cardStyle` slots on `AnswerView` / `SuggestedPrompts`. The home notebook never used those slots.
8. **CSS:** the `/* TKT-104 */` block in `app/globals.css` is replaced in place, and the base `.ask-panel` geometry/motion rules near the top are edited in place. Colours are paper tokens plus `color-mix()` only; the six pastel category tints are mixes of rust / steel / note / steel+ivory / green-2 / forest with ivory. Text is ≥ 14 px except `data-micro-label`.
9. **Design.md §11:** Dev-60 (right drawer + chat mode), Dev-61 (attachment omitted), Dev-62 (mascot v2 + avatar), Dev-63 (suggestion list and follow-ups).
10. **Tests:** rewrite `ask-panel.spec.ts` to the §33 list (right-side open/close, backdrop + Esc, focus trap + return, width 420–480 at 1440 / full-screen at 390, empty state fits 1440×900 and 1366×768 with no body scroll, pinned composer, chat mode collapses the empty state, follow-ups, reduced motion). Update the panel lines in eval-007 / eval-010 / tracer. Replace `ask-panel-quick.test.ts` with a suggestions/follow-ups grounding test.

**Risks:** the 1366×768 fit. The empty state is about 690 px of content inside a 768 px drawer, so vertical rhythm is tight. If it does not fit, the mascot shrinks at `max-height: 800px` before anything else is cut.
