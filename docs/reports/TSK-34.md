# TSK-34 · Content paper, fasteners, hand exemptions, DraftTag — report

**Ticket:** TSK-34 (`TASK-65.2`) · parent TKT-70 (`TASK-65`) · M-009 · branch `m-009-redesign` · plan steps S70.05–S70.08 · TC-126 (steps 1, 3, 4, 6; step 5 extended to `Pin`).

## 1. Files

**New**
- `components/paper/Sheet.tsx`: `data-paper="card|index|postcard|notebook|photo|tag"`, rotation capped at ±0.9° (photo ±2.4°), notebook holes ×5, postcard `stamp` chrome (`aria-hidden`), fasteners counted at render.
- `components/paper/Pin.tsx`: `<span data-fastener="pin" aria-hidden>` with tone rust, forest or steel. Pins never rotate.
- `components/paper/FlatZone.tsx`: `<{as} data-flat>`.
- `components/paper/Hand.tsx`: `data-hand="quote|cta|label"` in `font-hand`, with the §3.4 limits. A quote's `cite` renders as the next sibling (a string becomes `<cite class="hand-cite">`; an element renders as given).
- `components/paper/DraftTag.tsx`: `<span data-paper="tag">` in Inter 12 px, uppercase, terracotta. Default text is "Draft — pending sign-off". Rotation is clamped to ±4°.
- `components/paper/Illustration.tsx`: `photo` placement gives `<figure data-illustration data-paper="photo">` with up to 2 fasteners, then the image, then the caption. `bleed` placement gives `<figure data-illustration class="illustration-bleed">`. Both render exactly one image. `hero` is left to `Hero` (TSK-37).
- `components/paper/IllustrationImg.tsx` (`"use client"`): wraps `next/image`. With no `src` (the stub), or on `onError`, it shows `<span class="illustration-fallback">{alt}</span>` instead.
- `components/paper/enforce.ts`: `paperViolation` / `paperWarning` / `enforcing` / `textOf`.
- `components/paper/fastener.ts`: `FASTENER` symbol, `isFastenerElement`, `hostFasteners` (the ≤ 2 count on direct children).
- `lib/illustrations.ts`: `illustration(id)` (throws on an unknown id in every env) and `ILLUSTRATION_IDS`.
- `content/media/illustrations/manifest.ts`: **stub**. The §6.1 types are verbatim. It has nine entries with the exact §6.3 alts and `file: ""`, and no `publicSrc`. Width and height come from the reference renditions in `docs/redesign-mockups/m-009/assets` (hero 1280×684, character sheet 0×0).

**Edited**
- `components/paper/Tape.tsx`: the props are now a union of `free` (`data-decor="tape"`, unchanged) and a default fastener (`data-fastener="tape"`, `side` l/c/r, ±12°). Adds `Tape.isFastener` and `displayName`.
- `components/paper/rotation.ts`: caps `sheet 0.9 · photo 2.4 · draftTag 4`.
- `components/paper/index.ts`: the barrel now also exports `Pin`, `Sheet`, `Illustration`, `FlatZone`, `Hand`, `DraftTag` and their types.
- `components/common/Prose.tsx`: `max-w-[68ch]` and `data-flat` (F1-7).
- `components/common/Tag.tsx`: Inter 12 px uppercase `green-2` on an ivory pill with a `--line` border. It no longer uses `ClayPill`.
- `components/projects/StatusBadge.tsx`: ivory pill with a steel border, a coloured 14 px icon and 12 px text. `onPaper` sets `data-paper="tag"`. The `clay/tiers` import is gone.
- `components/thinking/{EssayBody,ThinkingList}.tsx`: DraftTag swap (§3).
- `app/globals.css`: new `/* TSK-34 · content paper */` block inside `@layer components`. It uses paper tokens and derived vars only; the only new mixes are `color-mix()` over `var(--color-*)`.
- `tests/unit/paper.test.tsx`: fixtures split into decorations and content paper, plus the S70.05–S70.08 suites.
- `tests/unit/clay.test.tsx`: the Prose assertion changed from 60ch to 68ch (updated, not deleted).

## 2. How enforcement behaves in each environment

| Rule | test (`NODE_ENV=test`) | dev (`next dev`) | production (`next build`/`start`) |
|---|---|---|---|
| Host with more than 2 fasteners (`Sheet`, photo `Illustration`) | **throws** `[paper] <Sheet> has 3 fasteners…` | `console.error`, still renders | inert (no scan, no clone) |
| `Hand` limits (label ≤ 3 words, digits only as a 2-digit numeral · cta ≤ 6 words · quote ≤ 240 chars and has a `cite`) | **throws** | `console.error`, still renders | inert |
| Fastener outside a host (not a direct child of a `Sheet`) | `console.error` warning (does not throw — the gate asks for a warning) | `console.error` | inert |
| Unknown illustration id | throws | throws | throws: `next build` fails at prerender (call sites are static) |

All three environment rows are covered by tests (`vi.stubEnv`) in `dev-time enforcement per environment`. I did not exercise dev mode in a live `next dev` session.

## 3. DraftTag swaps (S70.08)

- `components/thinking/EssayBody.tsx:40`: `<Tag>Draft — pending sign-off</Tag>` → `<DraftTag />`
- `components/thinking/ThinkingList.tsx:56`: same swap.

Those are the only two `<Tag>Draft…` usages. The essay's double prefix (`EssayBody.tsx:65`) is left for TKT-84 / TC-164, as the brief says.

## 4. Gates

| Gate | Result |
|---|---|
| `pnpm exec vitest run tests/unit/paper.test.tsx` | **94 passed** (all S70.05–S70.07 assertions: 3 fasteners throw / 2 render / fastener outside a Sheet warns; unknown id throws; alt byte-equal to the manifest **and** to `Design.md` §6.3 parsed from the table; bleed renders exactly one `img`; Hand label 4 words, cta 7 words, quote 241 chars and quote with no cite all throw; `Prose` has `data-flat`; `DraftTag` default text) |
| Mutation check | Raising `MAX_FASTENERS` to 3 and `quoteChars` to 241 → 5 tests fail. Both reverted. |
| `grep -rn "<Tag>Draft" components app` | 0 |
| `grep -rn "ClayPill" components/common/Tag.tsx` | 0 |
| `pnpm typecheck` | clean, including the `@ts-expect-error` aria-hidden checks on the `Tape` union and on `PinProps` |
| `pnpm lint` | clean |
| `pnpm tokens:check` | `13/13 tokens round-trip OK` |
| `pnpm test` | **45 files passed, 1 skipped · 416 passed, 2 skipped** |
| `pnpm build` | OK, all 13 routes static |
| `pnpm test:e2e` for thinking, thinking-page, about, how-i-think, ask-inline, ask-panel, work and case-study (4 projects, fresh `webServer` after the build) | **162 passed · 4 failed · 266 skipped**. All 4 failures are on the TSK-30 §4a pre-existing list (the `.glow-halo` overflow on `/`): `how-i-think.spec:158` [w390], `ask-panel.spec:140` [w390, w768], `ask-panel.spec:149` @TC-051 [w390]. No other failures. No spec was edited: none asserted `ClayPill` markup. |

I restored the `docs/screenshots/**` files that the e2e run churned. The server was killed before and after the run.

## 5. For the orchestrator's judgement

1. **Illustration `src` until TSK-36.** The stub has no served files, so `Illustration` renders the alt-as-caption fallback, the same path as a load error. The unit tests mock one `publicSrc` to exercise the `<img>` path. TSK-36 has two options: fill `publicSrc`, or switch `IllustrationImg` to static imports (F2 says scenes are imported statically). The types are unchanged either way.
2. **`character-sheet-b` alt.** The §6.3 alt starts "Illustration reference sheet of…", but the §6.1 type comment and EVAL-021 require "Illustration of…". I copied it verbatim, so this is a design-doc inconsistency for TSK-36 / EVAL-021 to settle.
3. **Other draft markers are not swapped.** They are not literal `<Tag>Draft — pending sign-off</Tag>`: `AnswerView` `DraftBadge` ("Draft"), `HowIThink` `DraftBadge`, `FinalCTA`. They belong to their page tickets.
4. **Visible restyle on legacy pages.** `Tag` and `StatusBadge` are now uppercase Inter 12 px paper pills wherever they are used (work grid, project cards, case-study header, research). This follows the brief, but it shows before those pages are redesigned. The e2e text assertions still pass because they read `textContent`.
5. **Not visually verified.** No page uses the sheet, fastener or illustration CSS yet. The `/dev/primitives` board (TSK-35) is the first place to look at it.
6. **Plan deviation.** `Illustration` accepts `placement: "photo" | "bleed"` only. The plan lists `"hero"`, but also says `Hero` composes it (TSK-37), so a no-op variant was left out.

## 6. Commit
`feat(paper): content paper, fasteners, hand exemptions, DraftTag (TSK-34)`. The SHA is in the orchestrator reply (a report cannot contain its own commit hash).
