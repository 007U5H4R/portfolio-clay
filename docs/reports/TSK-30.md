# Report — TSK-30 · Paper `@theme` + derived properties + grain + `AUTHORITATIVE` + token codemod

**Ticket:** TSK-30 (`TASK-64.1`) · parent TKT-69 (`TASK-64`) · M-009 · Branch `m-009-redesign` · Model: Claude Fable 5.1
**Commit:** the single commit on top of `1a3422f` that adds this report — `refactor(tokens): rename the 13 clay tokens to the paper palette (S12)` (SHA in the hand-back; a report cannot contain its own commit hash)
**Steps:** S69.01 → S69.04 (technical-plan.md §F3), one atomic commit.

## 1. Files changed

`git diff --stat` (task files only; `backlog/**`, `docs/ledger.md`, `docs/briefs/*` left to the orchestrator):

- **82 files** — 81 modified + 1 new (`scripts/codemod-tokens.ts`, temporary, deleted at TKT-89) + this report.
- Hand-edited: `scripts/tokens-check.ts` (S69.01), `app/globals.css` (S69.02, structural), `tests/unit/clay.test.tsx`, `tests/unit/ClayButton.test.tsx` (4 `\b`-bounded regex assertions), `tests/e2e/{fixtures,case-study.spec,contact.spec,work.spec}.ts` (focus-ring width `3px` → `2px`), plus comment-only `3px accent` → `2px rust` in `eval-007.spec.ts`, `smoke.spec.ts`, `ask-inline.spec.ts`.
- Codemod-edited: 77 files (list in §2), all under `app/`, `components/`, `lib/`, `tests/`.
- Nothing under `lib/og.tsx` hex tables, fonts, or `eval-020` (TSK-31/32/TKT-78 untouched). `data/`, `hooks/`, `content/`, `public/` carry no token classes (verified by grep before the run).

## 2. Codemod (S69.03/S69.04)

- `pnpm exec tsx scripts/codemod-tokens.ts --dry | wc -l` → **368** rewrites in **77** files (self-test 12/12 fixtures OK). Apply list == dry list (diffed); second run → `0 rewrites in 0 files` (idempotent).
- **vs. the plan's ≈ 428 ± 30 (F1-11):** the exact utility + `var()` regexes count 374 spans on the pre-change tree (355 utility, 19 `var()`); the codemod rewrote 368 of them (+1 `divide-ink`), the remaining 6 being the 4 `\b`-regex assertions (hand-edited) and 2 `@apply` lines I had already rewritten by hand in `globals.css`. The F1-11 figure of 428 evidently also counted the bare tone words (`tone="mint"` props ×29, `Tone`/`toneClass`/`stageTone` enum keys) which the plan itself says must stay. No retired name remains (§4), so the count gap is an inventory-method difference, not a missed rewrite.
- Distinct rewrite pairs (all prefixed token renames — no bare word can match): `text-ink→text-navy` 107 · `text-ink-2→text-navy-2` 63 · `text-ink-3→text-ink-soft` 53 · `bg-surface→bg-ivory` 21 · `border-ink→border-navy` 15 · `bg-lavender→bg-paper-2` 15 · `bg-bg→bg-paper` 14 · `text-accent→text-rust` 9 · `bg-ink→bg-navy` 9 · `var(--color-accent)→var(--color-rust)` 8 · `bg-ink-3→bg-ink-soft` 8 · `bg-accent→bg-rust` 7 · `bg-butter→bg-kraft` 5 · `text-bg→text-paper` 4 · `bg-accent-deep→bg-terracotta` 4 · `var(--color-lavender)→var(--color-paper-2)` 3 · `bg-blush→bg-steel` 3 · 2 each: `text-surface→text-ivory`, `stroke-ink-3`, `border-ink-3`, `border-butter→border-kraft`, `bg-mint→bg-forest`, `bg-ink-2→bg-navy-2` · 1 each: `var(--color-ink)`, `var(--color-ink-3)`, `ring-bg→ring-paper`, `divide-ink→divide-navy`, `decoration-ink-3`, `decoration-accent→decoration-rust`, `bg-sky→bg-green-2`, `bg-peach→bg-note`.
- Top files: `ProductScene.tsx` 16 · `DemoVideo.tsx` 15 · `clay/tiers.ts` 14 · `AskPanel.tsx` 12 · `HowIThink.tsx` 11 · `DecisionCard.tsx` 11 · `AnswerView.tsx` 11 · `ClayPill.tsx` 10 · `ChapterNav.tsx` 10 · `AboutHero.tsx` 10 · `app/dev/primitives/page.tsx` 10 · `globals.css` 9 (`var()` inside `.glass`, `.glow-halo`, `.hero-highlight`, `.ask-panel::backdrop`, `.thinking-node`, `.hero-scene-glow`, `.hero-tile`).
- **False-positive review:** every rewritten line was checked by context. 367/368 sit inside `className`/`cn()`/template-literal class strings, `@apply`, class maps (`toneClass`, `tierClass`), Playwright selectors (`[class*="bg-paper-2/30"]`) or `var(--color-*)`; the one non-string hit is a JSDoc comment in `ClayPill.tsx:37` (`bg-lavender` → `bg-paper-2`, correct). `bg-white`/`text-white`, `tone="…"` props, `stageTone` values, `Tone` type members, `bg-[image:var(--gradient-clay-volume)]` and English words were not touched (also covered by self-test decoys). Test-file rewrites (7): `var(--color-accent)` probes ×4, `home.spec.ts:93` selector, `ClayButton.test.tsx:30`, `clay.test.tsx:88`.
- **Reverted rewrites:** none.
- **Deviations from the S69.03 regex, both recorded in the script header:** (1) `divide` added to the prefix list — `md:divide-ink/10` (DecisionCard) is a colour utility and would otherwise have been left dangling (no colour resolves; not caught by the S69.04 gate grep either). (2) `;` added to the lookahead set — the self-test proved `@apply bg-bg text-ink;` was missed (the CSS terminator was not in the set). `\b`-bounded Vitest regex literals are unreachable by design (the `b` of `\b` trips the `(?<![\w-])` lookbehind) and were renamed by hand, never deleted.

## 3. `globals.css` (S69.02)

- 13 `--color-*` lines replaced by the Design.md §2.1 block (oklch regenerated by `tokens:check --write`, byte-identical on a second `--write`).
- `@theme` additions: `--radius-paper: 4px`, `--radius-paper-sheet: 3px 10px 10px 3px`, `--shadow-paper`, `--shadow-paper-hover`, `--shadow-sticky` (all `color-mix()` on `var(--color-navy)`). Clay radius/shadow/gradient tokens stay (TKT-89).
- `:root` derived block: `--line`, `--line-strong` (16%), `--line-sketch` (25%), `--tape`, `--tape-border`, `--rule-blue` (16%), `--rule-blue-notebook` (18%), `--rule-blue-card` (13%), `--margin-red`, `--grain-a`, `--grain-b`, `--header-bg`, `--band-hatch`, `--on-band`, `--on-band-muted` (80%). Every value is a `color-mix()` on a token; no literal. **Naming calls (the §2.1 table gives ranges/two values under one name):** the 25% line became `--line-sketch`; the notebook/index-card rule variants became `--rule-blue-notebook`/`--rule-blue-card`; `--on-band-muted` fixed at 80% of the 70–85% range. None has a consumer yet — rename freely in TKT-70/72 if a different name is preferred.
- `body::before` = paper grain: `position: fixed; inset: 0; z-index: -1; pointer-events: none; background-image: var(--grain-a), var(--grain-b); background-size: 7px 7px, 11px 11px; opacity: .9` — no animation, no filter. Aurora gradients + `@keyframes aurora-drift` deleted; `grep -c aurora` = 0.
- `html` → `@apply bg-paper text-navy`. Focus ring → `outline-width: 2px; outline-offset: 3px; @apply outline-rust`.
- Reduced-motion block: global 1 ms rule kept; `body::before` dropped from the `animation: none` rule (nothing to remove); `.glow-halo::before` and the hero lines kept because those classes stay (below).

### Classes left in `globals.css` because of live consumers (no component restyling)
| Class | Live consumer(s) | Removed by |
|---|---|---|
| `.glass` | `components/clay/tiers.ts` `headerGlassClass` → `Header` compact state; `tests/unit/tiers.test.ts` asserts `"glass"` | TKT-71 |
| `.glow-halo` (+ `glow-pulse`) | `components/hero/Hero.tsx:27` | TKT-73 |
| `.hero-highlight` (+ `wash`) | `components/hero/Hero.tsx:45`, `components/about/AboutHero.tsx:87` | TKT-73 / TKT-83 |
| `hero-scene-glow`, `hero-card`, `hero-avatar-*`, `hero-tile*`, `hero-enter-*`, `hero-breathe` | `components/hero/AvatarScene.tsx`, `FloatingTiles.tsx`, `tests/unit/Parallax.test.tsx` | TKT-73 / TKT-89 |

Their token references were renamed (`var(--color-rust)`, `var(--color-paper-2)`, `var(--color-paper)`), so they now paint in paper colours — see §6.

## 4. Gates (numbers)

| Gate | Result |
|---|---|
| `pnpm tokens:check` | `13/13 tokens round-trip OK` (S69.01 intermediate: `0/13`, exit 1 — check reads the new names) |
| `pnpm tokens:check --write` idempotent | byte-identical (`cmp`) |
| `grep -cE '^\s*--color-[a-z0-9-]+:' app/globals.css` | 13 |
| `grep -c aurora app/globals.css` | 0 |
| S69.04 utility grep (plan regex) over `app components lib tests` | 0 |
| S69.04 `var(--color-<old>)` grep over `app components lib` | 0 |
| Broader sweep (all prefixes incl. `divide/decoration/shadow/accent`, lookbehind-free, `\b`-bounded) | 0 |
| Built CSS (`.next/static/chunks/*.css`) | `--grain-a` ×3, `--shadow-paper` ×4, `--radius-paper` ×2, `--line-sketch` ×2, `--color-paper:` ×2, `--color-kraft:` ×2; `aurora` 0, `--color-lavender` 0, `--color-bg:` 0 |
| `pnpm typecheck` | exit 0 |
| `pnpm lint` | exit 0 (no output) |
| `pnpm test` | 43 files passed, 1 skipped · 316 tests passed, 2 skipped · exit 0 |
| `pnpm build` | exit 0 (`Compiled successfully`, 49/49 static pages, `assert-static` OK) |
| `pnpm test:e2e` (full, 4 projects, `workers: 1`, fresh `webServer`) | **690 passed · 19 failed · 799 skipped** (1508, 9.7 min), exit 1 — **all 19 pre-existing, proven** (see §4a) |
| Deleted spec files | 0 (`git diff --stat -- tests` shows renames of assertions only) |

### 4a. The 19 e2e failures — pre-existing, proven on the pre-change tree

**Proof (brief's method):** `git stash push -u -- app components lib tests scripts docs/reports/TSK-30.md` (only TSK-30's paths; tokens at HEAD `13/13` clay), `pnpm build`, then `pnpm test:e2e -- featured tracer eval-008 ask-panel home how-i-think` on HEAD `1a3422f` → **19 failed**; `comm` of the sorted failure titles (HEAD vs. this tree) is **empty in both directions** — the identical 19 tests. Stash popped, tree rebuilt, `13/13` re-verified. Logs: `proof-e2e-head.log`, `gate-e2e.log`, `head-fails.txt`, `cur-fails.txt`, `stash-proof.log` in scratch.

Three root causes, none touched by this ticket:

| # | Tests | Cause (diagnosed read-only against the running build) |
|---|---|---|
| 11 | `noOverflow` on `/` at w390/w768: `eval-008.spec:46`, `home.spec:195`, `tracer.spec:32`, `how-i-think.spec:158`, `ask-panel.spec:140`, `ask-panel.spec:149` (@TC-051 sheet width = viewport) | `scrollWidth` 401 > 390 (798 > 768). No real element extends past the viewport; injecting `.glow-halo::before { display:none }` → exactly 390. The hero halo's `inset: -12%` pseudo-element (commit `292e726`, aurora/WoW hero) creates the scrollable overflow. My diff changes only its two `var(--color-*)` names. Removing the paper grain (`body::before`) leaves 401 — not the grain. |
| 5 | `featured.spec:30` (rank order, every width), `featured.spec:94` (equal heights, w1440) | Spec drift: `featured.spec.ts` (last edited `a3972e9`, TKT-12) expects three `ProjectCard`s teachspark→railcite→velora; `FeaturedWork.tsx` (`04f9120`) now renders a `ProductScene` flagship first, whose anchor has no `h3` (heights `44, 373, 373`). My diff on `FeaturedWork`/`ProjectCard`/`ProductScene`/`DemoVideo` is colour classes only. |
| 4 | `tracer.spec:65` (hero avatar frame, every width) | Spec drift: `AVATAR_ALT = /Clay illustration of Tushar Pathak/` vs. rendered `alt="Claymorphic portrait of Tushar Pathak, arms crossed…"` (from `data/`, untouched) → `getByRole("img")` finds nothing → 10 s timeout. The image is visible at 200/301/475 px (within caps). |

All three surfaces are scheduled for replacement in M-009 (TKT-73 hero, TKT-77 featured/`WorkIndex`, TKT-89 deletes `AvatarScene`/`ProductScene`); the specs will need renaming/retargeting there — flagged for the orchestrator rather than patched here ("no spec deleted", no restyling). No spec was modified to make anything pass.

## 5. Bundle budget (`scripts/bundle-budget.ts --route / --json`)

| | before (preflight `.next`) | after |
|---|---|---|
| `firstLoadJsGzipKb` | 194.1 | 194.1 |
| `firstLoadJsRawKb` | 625.6 | 625.7 |
| chunks | 10 | 10 |

Unchanged (CSS-only change). Note: `overBudget: true` against the 180 kB budget on **both** sides — pre-existing, gated at TKT-74, not introduced here.

## 6. For the orchestrator's judgement

1. **Focus ring radius.** §10 / the mockups set `border-radius: 4px` on `:focus-visible`. I applied the 2 px rust outline + 3 px offset but did **not** add `border-radius` to `.focus-ring:focus-visible`: the outline follows each element's own radius, and forcing 4 px would square the clay pills/buttons on focus — a shape change on legacy components this ticket must not restyle. Paper controls (`--radius-paper: 4px`) get the 4 px ring naturally. If literal compliance is wanted now, it is a one-line addition.
2. **Focus ring width 3 → 2 px** changed four e2e assertions (`fixtures.ts` `keyboardOnly`, `case-study`, `contact`, `work`) from `"3px"` to `"2px"` in the same commit — renamed, none deleted. TC-125 "no spec deleted" holds.
3. **Visible colour changes that will look odd until their tickets land** (expected under "colours change, shapes don't", flagging so nobody reads them as bugs): the clay tone washes are now `forest/30`, `green-2/30`, `steel/30`, `note/30`, `kraft/30`, `paper-2/30` — the dark greens/steel at 30 % read as muddy mid-tones behind navy text (StatusBadge, StoryCard, HowIThink stages, ClayCard tones); the hero glow/halo/tile glows are rust/paper-2; `.hero-highlight` is rust text with a paper-2 sweep; the header glass is paper 80 %. All disappear with TKT-71/73/83/89.
4. **Count gap 368 vs ≈ 428** explained in §2 — please confirm you're satisfied it's an inventory-method difference (the 0-hit greps are the real gate).
5. **Stale server.** A `pnpm start` from this worktree (PID 96920, up 2 h 45 m — preflight) was still on :3000 with the *old* `.next` in memory; Playwright's `reuseExistingServer: true` would have tested it (first attempt showed 10 s timeouts from chunk-hash mismatches). I killed it and re-ran e2e on a fresh `webServer`. Worth a note in the orchestration playbook: rebuild ⇒ restart the server before e2e.
6. `codemod-tokens.ts` passes lint/typecheck and is included in the tree as the plan asks (deleted at TKT-89).
7. **19 pre-existing e2e failures (§4a)** need owners: the `.glow-halo::before` overflow (TKT-73, or a hotfix — `overflow: clip` on the hero section would do, but that is a restyle outside this ticket), `featured.spec.ts` drift (TKT-77), `tracer.spec.ts` `AVATAR_ALT` drift (TKT-73/89). No report on file shows a full-suite green since `04f9120`; the preflight at `1a3422f` did not run e2e.
8. The e2e runs rewrite 37 `docs/screenshots/**` PNGs (tracer/timeline specs, established behaviour per TKT-47). I restored them with `git checkout -- docs/screenshots` so they don't leak into this commit.

## 7. Artefacts (scratch, `/Volumes/E Drive/Dev/.scratch/m009/`)
`codemod-dry.txt` / `codemod-apply.txt` (368 lines, identical), `budget-before.json`, `budget-after.json`, `gate-{typecheck,lint,tokens,test,build,e2e}.log`.
