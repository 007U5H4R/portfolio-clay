# TSK-33 report: counted decorations and draw-ins

**Ticket:** TSK-33 (`TASK-65.1`) · parent TKT-70 (`TASK-65`) · M-009 · branch `m-009-redesign` · steps S70.01–S70.04
**Implementer:** Opus 5.5 (standard tier) · **Commit:** see `git log --grep "(TSK-33)"` (the SHA is also in the orchestrator hand-back)

## 1. Files

| File | Change |
|---|---|
| `components/paper/TornEdge.tsx` | new: S70.01 |
| `components/paper/Sticky.tsx`, `Annotation.tsx`, `Note.tsx`, `Tape.tsx` | new: S70.02 (`Tape` is the free-standing variant only; TSK-34 adds the fastener variant) |
| `components/paper/Sketch.tsx`, `components/paper/sketch-paths.ts` | new: S70.03 (7 variants; every path lifted from the mockups) |
| `components/paper/rotation.ts` | new: shared `rotationStyle()` clamp (`Math.max(-cap, Math.min(cap, rotate))` → inline `--rot`) and the §3.1 caps |
| `components/paper/index.ts` | new: barrel (TSK-34 extends it) |
| `tests/unit/paper.test.tsx` + `tests/unit/__snapshots__/paper.test.tsx.snap` | new: S70.04 (41 tests, 11 snapshots) |
| `app/globals.css` | `.reveal` start offset changed from `translateY(20px)` to `12px` (TC-128). New `/* TSK-33 · paper decorations */` block in `@layer components`: primitive styles, `.sketch[data-drawin]`, `@keyframes drawin`, reduced-motion override |
| `components/interactions/Reveal.tsx` | Doc comment only: now points to Design.md §8 (opacity + 12 px, no scale). The API and consumers are unchanged; the motion lives in `.reveal` CSS |

Out of scope and not touched: `Sheet`, fasteners, `Illustration`, `FlatZone`, `Hand`, `DraftTag` (TSK-34), the eval-018 spec and board (TSK-35), and `components/clay/*`.

## 2. Attributes each primitive actually renders (from the jsdom tests)

| Primitive | Root element | `data-*` / `aria-*` rendered | Rotation (default → cap) |
|---|---|---|---|
| `TornEdge fill=paper\|paper-2\|navy\|terracotta` | `<svg viewBox="0 0 1440 46" preserveAspectRatio="none">` | exactly `{data-decor:"torn", aria-hidden:"true"}`. Height is 44 px, or 46 px for terracotta | — |
| `Sticky tone=note\|kraft` | `<p class="paper-sticky font-hand">` | `data-decor="sticky"` · `aria-hidden="true"` · `data-tone` | 4° → ±5° |
| `Annotation arrow? size? as=p\|figcaption` | `<p>` / `<figcaption>` `.paper-annotation.font-hand` | `data-decor="annotation"` · `aria-hidden="true"` · `data-size`. The arrow `<svg class="annotation-arrow" data-arrow>` sits inside it and has no `data-decor` | 0° → ±4° |
| `Sketch variant=underline\|spark\|path\|chain\|tools\|arrow` | `<svg class="sketch">` | `data-decor="sketch"` · `aria-hidden="true"` · `data-sketch`. `data-drawin` appears on `underline` only (see §5.2) | — |
| `Sketch variant=flow` | `<div class="sketch sketch-flow font-hand">` | `data-decor="sketch"` · `aria-hidden="true"` · `data-sketch="flow"`. Box labels are Caveat | — |
| `Note tone=paper-2\|note\|kraft stamp?` | `<span class="paper-note font-hand">` | `data-decor="note"` · `aria-hidden="true"` · `data-tone` · `data-stamp` (when set) | 6° → ±6° |
| `Tape free` | `<span class="paper-tape">` | exactly `{data-decor:"tape", aria-hidden:"true"}`, with no `data-fastener` | −3° → ±12° |

The barrel check covers two things. First, every function the barrel exports must have a default-render fixture. Second, each fixture must render exactly one `[data-decor]`: the root element, with a value from `{torn, sticky, annotation, sketch, note, tape}`, `aria-hidden="true"`, and no `data-fastener`, `data-paper`, `data-flat` or `data-hand` anywhere in its output. `--rot` is always set inline, so a decoration never picks up a rotated host's value by inheritance. A non-finite `rotate` falls back to the primitive's default.

## 3. Where each SVG path comes from (`docs/redesign-mockups/m-009/`)

| Constant | Mockup file · selector |
|---|---|
| `TORN_PATHS.paper` | `home.html`, first `.torn-top` (featured section). **Edit:** the closing edge moves from y=44 to y=46 to fit the shared 46-unit viewBox (S70.01) |
| `TORN_PATHS.band` (terracotta) | `home.html` `.band-torn` (already 1440×46), verbatim |
| `Sketch underline` | `home.html` `.hero h1 .ul svg` (the same path is used in the work/thinking/playground h1 `.ul`) |
| `Sketch spark` | `home.html` `.featured-head h2 .spark svg` |
| `Sketch path` | `about.html` `.jgrid .path` (product journey) |
| `Sketch chain` | `case-study.html` `.chain .path` |
| `Sketch tools` | `playground.html` `.board .tools svg` |
| `Sketch arrow` | `contact.html` `.details .arrow` |
| `Sketch flow` (default rows) | `home.html` `.work-card .sketch` (TeachSpark boxes and `→` / `↳`) |
| `Annotation arrow=down` | `work.html` `.tabs-note .arrow` |
| `Annotation arrow=left` | `thinking.html` `.margin-arrow svg` |
| `Annotation arrow=right` | `playground.html` `.opener .aside svg` |
| `Annotation arrow=dashed` | `home.html` `.quote-card .arrow` |
| `Annotation arrow=up` | No mockup arrow points up. This is the `down` drawing mirrored with `matrix(1 0 0 -1 0 64)`, not a new drawing |

Stroke styles are also lifted from the mockups. Underline: rust, 5. Spark: rust, 3. Path and chain: navy-2, 1.8, dashes 6 7, opacity .7; chain adds `vector-effect: non-scaling-stroke`. Tools: 1.5, opacity .55. Arrows: 1.6 with a 5 6 dashed shaft and a solid head. All colours are `var(--color-*)` or derived vars, with no literals.

## 4. Gates (run on the final tree)

| Gate | Result |
|---|---|
| `pnpm test -- paper` / `vitest run paper` | **41/41 passed**, 11 snapshots written (4 `TornEdge` fills + 7 `Sketch` variants) |
| `pnpm typecheck` | exit 0. The five `@ts-expect-error` lines are consumed |
| `pnpm lint` | exit 0 |
| `pnpm tokens:check` | `13/13 tokens round-trip OK` |
| `pnpm test` (includes EVAL-020) | **45 files passed, 1 skipped · 363 tests passed, 2 skipped** · `eval-020.test.ts` 6/6 |
| `pnpm build` | exit 0 · `all routes static (13)`. The built CSS contains `.paper-sticky`, `@keyframes drawin`, `.sketch[data-drawin]`, `fill-paper-2`, `fill-terracotta`, `h-[46px]` and `translateY(12px)` |
| Real-browser check (one-off Playwright script in scratch, run against the built CSS; not committed) | Default motion: underline `strokeDashoffset` is `400px` at t=0 and `0px` at t=2 s, with `animationName: drawin`. `reducedMotion: "reduce"`: `0px` and `none` at t=0. Sticky `rotate: 5deg`, and a `w-[200px]` utility overrides the layered width |
| `pnpm test:e2e` (full run, fresh server) | **691 passed · 19 failed · 802 skipped**. The 19 failures are exactly the pre-existing set in `docs/reports/TSK-30.md` §4a: overflow ×10 (`ask-panel:140/149`, `eval-008:46`, `home:195`, `how-i-think:158`, `tracer:32`), `featured.spec` ×5, `tracer.spec:65` ×4. Every Reveal consumer spec passes, including `layout.spec` reveal and `about.spec` @EVAL-010. Churned `docs/screenshots/**` were restored, and the :3000 server was killed afterwards |
| TC-128 Playwright reduced-motion check on `/dev/primitives` | **Pending**: it lands with the board in TSK-35, as the brief specifies |

## 5. Deviations and points for the orchestrator's judgement

1. **TC-126 step 5 can't be written as specified.** TypeScript never checks a hyphenated JSX attribute (`aria-hidden`, `data-*`) against a component's props type. So `<Sticky aria-hidden={false}>` compiles whatever the props say, and an `@ts-expect-error` on that line is itself an error (TS2578, reproduced). What the test proves instead: (a) a type-level check that `"aria-hidden"` is not a key of any props type, (b) `@ts-expect-error` on object-literal props (`const a: StickyProps = { …, "aria-hidden": false }`), where the excess-property check does fire, and (c) at runtime, a smuggled `aria-hidden={false}` spread is ignored, because no primitive spreads rest props. TC-126's wording should be updated to match.
2. **`data-drawin` is on `underline` only.** S70.03's contract shows `data-drawin` on every sketch `<svg>`, but Design.md §8 (normative) lists only the headline-underline draw-in. A `stroke-dasharray: 400` would also overwrite the mockups' dashed patterns on `path`, `chain` and `arrow`. TC-128 still has a draw-in to measure. If every variant should draw in, the dashed variants need a different technique.
3. **`Sketch path` is taken from `about.html`, not `home.html`.** The home "how I think" journey path (`viewBox 0 0 1200 320`) is a different curve. Only one `path` variant exists, per the plan. If TKT-79 needs the home curve, it is either a second variant or a `path` prop.
4. **Annotation arrows follow their mockup sources.** All five enum values have a dashed shaft, because every mockup annotation arrow does. That includes `dashed`, so it differs from `right` only in shape. `up` is the mirrored `down` arrow. The case-study `.mstrip-note` arrow is solid and points down-right; it has no enum value yet and belongs to TKT-81's decision.
5. **`Note` has a `stamp` prop and `Tape` requires `free: true`.** `stamp` gives the about.html patent "TP" dashed-kraft look at Caveat 17 px (Design §2.2 sets 17 px as the minimum; the mockup used 16). TSK-34 widens `TapeProps` for the fastener variant.
