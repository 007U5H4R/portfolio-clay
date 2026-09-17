# EXE-9 — Hero rebalance for the 5-second test

**Stage 7 / M-003 · branch `m-003-home` · fix-wave (governed by decisions.md EXE-9, follow-up to EXE-6).**

## Problem (from EVAL-001 / TKT-14 review pack)
The home 5-second test (EVAL-001) scored **3/6 at 390** (primary "View My Work" CTA + first proof
tile below the ~844px mobile fold) and **5/6 at 1440** (the "AI PRODUCTS" tile only peeked at the
900px fold), and at **1024** the avatar read small (~252px) against an oversized 4-line headline.
Root cause: hero vertical length at 390 (`pt-32` = 128px + a 350px-tall avatar + a 4-line headline +
the lead paragraph pushed the CTAs and tiles far down), and the 35/65 grid whose text-column
min-content squeezed the avatar's 35fr track to ~252px at 1024.

## Fix (hero only — no section removal, FeaturedWork's 2:1:1 untouched)

**390 (shorten so the CTA + first tile clear the fold):**
- `components/hero/Hero.tsx` — hero padding/gaps reduced at mobile, restored at lg:
  `gap-16 pt-32 pb-24` → `gap-8 pt-8 pb-20 lg:gap-16 lg:pt-32 lg:pb-24`; inner content gap `gap-6` →
  `gap-5 md:gap-6`.
- `components/hero/AvatarStage.tsx` — avatar frame ladder trimmed: `max-w-[280px] md:max-w-[360px]`
  → `max-w-[200px] md:max-w-[300px]` (lg 480 / 2xl 520 unchanged); `AVATAR_SIZES` synced (200/300).
  Avatar height at 390: 350px → 250px.
- `app/globals.css` — `--text-hero` clamp min 2.75rem → 2.25rem (and max 5.5rem → 5rem) so the 390
  headline holds **3 lines**, not 4.
- `components/hero/Hero.tsx` — the lead paragraph is `hidden md:block`: on mobile the eyebrow +
  headline highlight carry the value prop and the tiles carry the proof, so hiding the supporting
  prose below md is what lets the primary CTA **and** the first proof tile clear the 844px fold. It
  returns from md up, where the vertical budget has room.

**1024 (give the avatar presence vs the headline):**
- `components/hero/Hero.tsx` — grid ratio `lg:grid-cols-[35fr_65fr]` → `lg:grid-cols-[42fr_58fr]`.
- `components/hero/Hero.tsx` / `components/hero/FloatingTiles.tsx` — the content column now gets
  `min-w-0` and the FloatingTiles row items get `lg:min-w-0` + `lg:!w-full` (the `size={180}` inline
  width previously forced a 580px min-content row that squeezed the avatar track). With those, the
  tile row reflows narrower and the avatar claims its 42fr share: **~349px at 1024, ~474px at 1440.**
- `app/globals.css` — a new lg-only headline ramp `--text-hero-lg`
  (`clamp(2.75rem, -2.788rem + 8.654vw, 5rem)` = 44px @1024 → 80px @1440) keeps the headline at
  3 lines in the now-narrower column so the CTAs + first tile still clear the short 768px-tall 1024
  fold; tablet (<1024) keeps the fluid `--text-hero`.

**Responsive / regression guards:**
- No horizontal overflow at **390 / 768 / 1024 / 1440** (verified `scrollWidth == clientWidth`); the
  F1 fixed-width-overflow failure mode is avoided (the tile row shrinks via `min-w-0`, it is not
  re-fixed to a px width). The overflow that briefly appeared mid-fix (tiles' inline `width:180`
  under a narrowed column) is what the `lg:!w-full` override resolves.
- Avatar stays a `next/image` `priority` + `fetchPriority="high"` LCP element (unchanged).
- Reduced-motion safe: no motion code touched; screenshots rendered under `prefers-reduced-motion`.

## Test contract update
`tests/e2e/tracer.spec.ts` — the "hero avatar frame is responsive and column-capped" check: cap
ladder updated to the new max-w rungs (200/300/480/520) and the substantial-focal-element floor
raised to the EXE-9 contract (**≥320 @1024, ≥420 @1440**, measured 349/474) — kept as a responsive
contract with margin, not a fixed-px pin, so it guards against a regression to the old squeezed 35fr
layout without being brittle to font-metric drift.

**Pre-existing issue fixed to unblock the gate (not caused by this fix-wave):** the same file's
"resume placeholder" test used `main a[href="/contact#resume"]`, which became ambiguous when TKT-14
added a second such link in the FinalCTA (`components/home/FinalCTA.tsx`). TKT-14's verification only
ran `--grep 'home|@EVAL-017'`, so the `tracer` grep never exercised it. Scoped the locator to the
hero's link (`.first()`, hero precedes FinalCTA in DOM).

## EVAL-001 5-second test — re-score (scored from pixel evidence, all six items in the first viewport)

| width | before | after |
|-------|--------|-------|
| 390   | 3/6    | **6/6** |
| 768   | (not scored in TKT-14 pack; 3/6 measured) | **6/6** |
| 1024  | (not scored in TKT-14 pack; 3/6 measured) | **6/6** |
| 1440  | 5/6    | **6/6** |

All six rubric items (name · role · value prop · proof tile naming shipped work · primary CTA ·
resume CTA) render inside the first viewport at every width. Evidence:
`docs/screenshots/home/{390,768,1024,1440}.png` + `{390,1024,1440}-first-viewport.png`.

## Verification
- `pnpm typecheck` · `pnpm lint` — PASS.
- `pnpm test` — **167 passed, 1 skipped** — PASS.
- `pnpm build` — content gate green, all 6 routes static — PASS.
- `pnpm test:e2e --grep 'home|tracer'` — **51 passed, 53 skipped-by-width, 0 failed** — PASS
  (incl. the updated avatar-frame contract, the tiles offset ladder at lg+, no-overflow at all four
  widths, and the disambiguated resume test).
