# TKT-14 — FinalCTA + CopyButton behaviour + home assembly + eval-001 pack (M-003 capstone)

**Milestone:** M-003 · **Branch:** `m-003-home` · **Date:** 2026-09-16

## What shipped
- `components/common/CopyButton.tsx` — behaviour implemented (was a static skeleton). `"use client"`;
  idle→copied→error state machine. Click writes `value` via `navigator.clipboard.writeText`, flips to
  `copied` for 2s (icon morphs Copy→Check, a `role="status"` region announces "Copied"), reverts.
  **Never fails silently (A12):** a missing/blocked Clipboard API flips to `error`, logs
  `console.warn('[copy]', err)`, and renders the value as selectable text in an `<output>` + "Select
  to copy" so the user is never stuck. Keeps the controlled `state` prop (the `/dev/primitives` board
  + `clay.test.tsx` pin fixed visuals) — controlled mode is inert on click. New `data-copy-button`
  hook (aria-label/data-state both change with state, so consumers/tests key off this stable marker).
- `components/home/FinalCTA.tsx` — new. Server component; centered hero-tier **lavender** `ClayCard`
  (the section's single accent, Design.md §3 ContactCard DNA) with the closing headline + the three
  plan-named actions: `CopyButton value={site.email}`, "Let's Talk" → `/contact`, and the resume
  control from `resumeAction()` (PB5 single source). Headline is DRAFT-labelled (editorial framing
  from technical-plan §B S14.01, not signed off — same convention as HowIThink; no fabrication).
- `app/page.tsx` — final home assembly: `<FinalCTA/>` appended after HowIThink, giving the fixed
  Design.md §3 order Hero → Ask → Featured work → How I think → Final CTA. Existing sections untouched.
- `tests/e2e/home.spec.ts` — new `@EVAL-006 @EVAL-008 @EVAL-011 @EVAL-017`: 5-section DOM order, the
  72/96/128 rhythm ladder, mobile monotonic order at 390, FinalCTA content + all three live controls,
  CopyButton copied path + blocked-clipboard fallback (+ `[copy]` warn), single lavender accent, axe +
  no-overflow, home OG tags.
- `tests/unit/copy-button.test.tsx` — new: clipboard resolved / rejected / absent + controlled-prop.
- `docs/screenshots/home/{390,768,1024,1440}.png` (+ `{390,1024,1440}-first-viewport.png`) — the
  5-second-test evidence, committed.
- `evals/results/eval-001-tkt14.md` — the EVAL-001 review pack, scored from the screenshots.

## REQUIRED fix — eval-017 stale sitemap count (folded in)
`tests/e2e/eval-017.spec.ts` hard-coded `expect(locs.length).toBe(4)` — stale since TKT-12 took
personal projects 1→3 (sitemap now 6). Made **dynamic**: exported `STATIC_ROUTES` from
`app/sitemap.ts`; the test now derives `EXPECTED_SITEMAP_COUNT = STATIC_ROUTES.length +
projects.filter(personal).length + collections.writing.length` — the exact three sources the sitemap
composes from, so adding a route / personal project / essay (TKT-43) updates both sides together. It
cannot go stale again. `@EVAL-017` green (incl. this assertion).

## Deviations / calls (documented)
1. **Reveal not wired into the home sections.** The existing sections never used `Reveal`, and its
   `.reveal` class hides content (`visibility:hidden`) until scrolled into view — wrapping them would
   blank below-fold content in the very 5-second-test screenshots this ticket must produce and risk
   EVAL-001/axe. The transition polish is carried by the section-rhythm ladder + clay card physics.
   (Aligns with the brief's "don't rewrite the existing sections".)
2. **CopyButton copied-path e2e uses a resolving `writeText` stub.** Real `navigator.clipboard.writeText`
   performs the write (OS clipboard receives the value) but its promise never settles in headless
   Chromium under Playwright — a known env limitation — so the native API can't drive the observable
   `copied` transition. The stub exercises the real component path deterministically; the error path
   runs against a genuinely rejecting API. (Unit test covers all branches in jsdom.)
3. **Mobile-order test omits the tiles checkpoint.** Asserts the authoritative Design.md §3 line-162
   order (avatar → headline → CTAs → Ask → projects → How-I-Think → final CTA). Tile placement inside
   the hero is TKT-09's concern, not this assembly ticket's.

## Gates
- `pnpm typecheck` · `pnpm lint` — PASS.
- `pnpm test` — **167 pass, 1 skip** (163 baseline + 4 new copy-button) — PASS.
- `pnpm build` — content gate green; all 6 routes static — PASS.
- `pnpm test:e2e --grep 'home|@EVAL-017'` — **29 pass / 47 skipped-by-width** (incl. the fixed dynamic
  sitemap assertion) — PASS. Full `home.spec.ts` + `eval-017.spec.ts` run: **22 pass** (all FinalCTA /
  CopyButton / accent tests included).
- `pnpm eval --only EVAL-001,EVAL-004,EVAL-005,EVAL-006,EVAL-008,EVAL-011,EVAL-017` (exit 0):
  **4 pass** (EVAL-006, 008, 011, 017) · **2 fail [informational]** (EVAL-004, 005) · **1 manual**
  (EVAL-001). EVAL-008 improved FAIL→PASS vs baseline.
  - **EVAL-005 (informational):** `/` first-load JS **239.9 kB gz** (budget 180; was 218.7, **+21.2 kB**
    from the new `CopyButton` client leaf on `/`), LCP(mobile) 3442 ms, CLS 0. Budget/LCP is the
    TKT-49/S14.05 perf-pass lever (first lever = confirm AskPanel chunk + LazyMotion, never remove a
    section) — not gated here.
  - **EVAL-004 (informational):** local Lighthouse depressed by SwiftShader software GPU; real numbers
    are measured on the Vercel preview at TKT-50. `/` mobile 96→87 (tracks the +21 kB + swiftshader).

## EVAL-001 5-second test (see `evals/results/eval-001-tkt14.md`)
Not 6/6 at either width — **1440 ≈ 5/6** (shipped-work tile only peeks at the fold), **390 = 3/6**
(CTAs + shipped-work tile below the fold). Failing items trace to **hero vertical budget** (avatar
larger than the Design 280×350 spec pushes the CTA row + tiles past the fold), i.e. the **EXE-6
hero-balance / TKT-09** call — TKT-14 must not change the hero ratio. Home assembly + FinalCTA are fully
correct and live; re-score after the hero-balance change.

## Hero + FeaturedWork read (EXE-6 input for the orchestrator)
- **1440:** hero 35/65 reads balanced — oversized headline dominant, avatar well-proportioned; the CTA
  row + Annotation clear the fold; `FloatingTiles` sit right at the fold (shipped-work naming clipped).
  FeaturedWork below reads **editorial, not three identical rectangles** — TeachSpark spans ~50%,
  RailCite / Nuptis→Velora ~25% each, equal-height row.
- **1024:** same 35/65 split, but the avatar reads **slightly small** against the 4-line oversized
  headline; still legible. FeaturedWork identical editorial read.
- Recommendation for EXE-6: consider a small avatar/headline rebalance at ≤1024 and a shorter hero at
  390 so ≥1 shipped-work tile + the CTAs clear the fold; no section removal.

## Blockers
None for TKT-14. Out-of-scope, flagged for the orchestrator: (a) EXE-6 hero-balance so EVAL-001 hits
6/6; (b) `/` JS budget (TKT-49). Both informational, neither blocks this ticket.
