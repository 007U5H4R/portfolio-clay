# TKT-94 report — Lenis smooth scroll, site-wide, guarded (TASK-89 · EXE-16 · Design §11 Dev-22)

**Branch** `m-009-redesign` · **Implementer** Opus 5.5 (standard tier) · **Not pushed.**

## Summary
| Item | Result |
|---|---|
| Lenis version | **1.3.26** (`pnpm add lenis` → `"lenis": "^1.3.26"`) |
| Bundle `/` first-load JS | **159.9 kB gz** (budget 180): **+1.3 kB** vs TKT-95's 158.6. The Lenis runtime is loaded with a dynamic `import("lenis")` inside the mount effect. It is **not** in first-load JS, and it is never fetched on touch or reduced-motion visits. The +1.3 kB is the `SmoothScroll` leaf, `lib/smooth-scroll.ts` and the async-chunk loader |
| Unit | 469 pass · 2 skip (51 files). New `tests/unit/smooth-scroll.test.tsx`: 5/5 |
| E2E FULL (fresh `pnpm start` after the final build) | **820 passed · 0 failed · 916 skipped** (7.9 min). New `tests/e2e/lenis.spec.ts`: 7/7 |
| `pnpm eval --only EVAL-007,EVAL-010,EVAL-015 --skip-build` | **3 pass · 0 fail** (the 19 skips are evals outside `--only`) → `evals/results/eval-run-0.2.0-742cd73.json` |
| typecheck · lint · tokens:check · build | clean · clean · 13/13 · all 13 routes static |

## What changed
- **`components/interactions/SmoothScroll.tsx`** (new, `"use client"`, renders nothing) is mounted once in `app/layout.tsx`. One mount effect decides **once**, following the TP13/TP14 pattern, with no media-query listeners:
  - If `(pointer: fine)` matches **and** `(prefers-reduced-motion: reduce)` does not, it dynamic-imports Lenis and creates `new Lenis({ autoRaf: true })`.
  - Otherwise it does nothing.
  - It destroys the instance on unmount.
- **Hash navigation while Lenis is mounted.** One delegated click listener on `document` handles same-page hash links: the hero `#ask` link, the SkipLink `#main`, and the case-study chapter links. It ignores modified clicks, `_blank` links, `download` links and links to other paths. For a handled click it:
  1. calls `preventDefault`;
  2. calls `lenis.scrollTo(target, { offset: -headerHeight })`;
  3. pushes the hash with `history.pushState`;
  4. moves focus to the target with `preventScroll: true`, adding `tabindex="-1"` only if the target can't take focus.

  A hash present on page load is corrected with an immediate scroll plus focus. Without Lenis the listener isn't added, so native behaviour is unchanged.
- **`lib/smooth-scroll.ts`** (new) holds the module-level `getLenis`/`setLenis`, `scrollToTarget`, and a **ref-counted** `stopSmoothScroll()` that returns a release function. Ref-counting matters because surfaces nest: the Ask row inside the open menu opens the Ask panel, and Lenis restarts only when the last surface closes.
  - Targets that set their own `scroll-margin-top` (the chapters' `scroll-mt-[7rem]`, `#resume`'s `scroll-mt-32`) get no extra header offset, because Lenis already subtracts `scroll-margin-top`.
- **`MobileMenu`**: opening calls `stopSmoothScroll()` and closing releases it, next to the existing `<html>` overflow lock. The `<dialog>` gets `data-lenis-prevent`.
- **`lib/focus.ts`**: `lockBackground()` (used by `AskPanel`) now also stops and releases Lenis. This covers EXE-16's "`<dialog>` open → `lenis.stop()`" for the Ask panel. The panel's `overflow-y-auto` body gets `data-lenis-prevent`.
- **`app/globals.css`**: new `/* TKT-94 · lenis */` block with the installed version's `lenis.css` rules, minus the unused `autoToggle` rules. Version 1.3.26 uses `overflow: clip` for `.lenis-stopped`, not the brief's `hidden`. `html` had no `scroll-behavior: smooth` and none was added.
- No parallax, scroll-triggered effects or scroll-linked animation were added.

## Guard behaviour per mode (evidence: `lenis.spec.ts` and the unit test)
| Mode | Result |
|---|---|
| w1440 default (fine pointer) | `html.lenis` present ✓ |
| w1440 + `reducedMotion: "reduce"` | no `lenis` class after 500 ms ✓ (unit: the constructor is never called) |
| w390 (`isMobile` + `hasTouch`, so a coarse pointer) | no `lenis` class ✓ (unit: coarse pointer → the constructor is never called) |
| Unit: fine pointer, no reduced motion | exactly one instance with `autoRaf: true`; a re-render doesn't create another; no `addEventListener` calls on the media-query lists; the instance is destroyed on unmount |

## Anchor, skip link, keyboard and dialog results (w1440, Lenis mounted)
- Hero "Ask my portfolio": the URL ends in `#ask`, the top of `#ask` settles exactly at the bottom edge of the header (73 px), and focus is inside `#ask` ✓
- Tab reaches the skip link; Enter focuses `main#main` ✓
- `PageDown` and then `Space` each scroll the page more than 200 px ✓ (Lenis doesn't intercept keys; it syncs to the native scroll)
- At a 900 px-wide desktop viewport, opening the menu adds `html.lenis-stopped` and the mouse wheel doesn't scroll the page (scrollY stays 0). Esc removes the class and the wheel scrolls again ✓

## Defect found and fixed during the build
- **Symptom:** on the first run, the `#ask` test landed 737 px short.
- **Cause:** tracing Lenis showed that `scrollTo(element)` computes `rect.top + lenis.animatedScroll`. `animatedScroll` was still 0 because Lenis's `scroll` listener hadn't yet picked up a native scroll: Playwright scrolls the CTA into view before clicking. A keyboard scroll in the same frame could do the same thing.
- **Fix, in `scrollToTarget`:** if `|animatedScroll − scrollY| > 1`, call `lenis.scrollTo(scrollY, { immediate: true })` first. This moves nothing and re-syncs Lenis's state.
- **Regression guard:** the e2e test asserts the exact landing position.

## Notes for the orchestrator
- The pointer query is `(pointer: fine)`, as the brief says, not the `(hover: hover) and (pointer: fine)` that `lib/motion.ts` uses for parallax/tilt. A touch laptop with a trackpad therefore gets Lenis. Scrolling on its touchscreen is unaffected: Lenis `syncTouch` is off by default, so touch stays native.
- `/contact`, `SceneBanner` and `SceneOpener` are untouched (a decision on them is pending). Screenshots under `docs/screenshots/**` that the e2e run rewrote were restored.
