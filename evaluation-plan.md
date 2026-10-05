# Evaluation Plan — Clay Portfolio

Status: Stage 3 draft · 2026-09-15 · consumes `Solution-PRD.md` §8 (success criteria) and `DESIGN_DIRECTION.md` §9 (budgets). Companion: `~/dotfiles/claude/rules/eval-framework.md`. **M-009 addendum §8 (2026-09-24)** adds EVAL-018…022 and rewords the character gate (S14); every earlier threshold stands.

## 1. Project type & what "good" means
A **static, content-driven marketing/portfolio site** (Next.js, no backend, deterministic Ask feature). No AI/ML/LLM/RAG behaviour ships in v1 → **no AI evaluation layer** (revisit when a `RagProvider` is wired). "Good" = a recruiter and a product leader reach the conclusions in Solution-PRD §2 quickly, on any device, with every claim traceable, at premium visual quality and top-tier performance/accessibility.

## 2. Applicable categories (selected, with reason)
| Category | Applies? | Why |
|---|---|---|
| Functional | Yes | Navigation, filters, case-study routing, Ask matching, video states, downloads must behave exactly as specified |
| Product acceptance | Yes | The 5-second test, recruiter path and product-leader questions are the product |
| Performance | Yes | Clay shadows, motion, video and fonts threaten Lighthouse; budgets are explicit |
| Design | Yes | Premium-vs-toy is the central risk; accessibility is mandatory |
| Reliability | Light | Static site; only graceful degradation (View Transitions, video, reduced motion, missing assets) |
| Security | Light | No auth/backend; headers, dependency audit, no secrets/PII in the bundle or repo |
| AI | **No** | Ask is deterministic; nothing generated |
| Content integrity | Yes (project-specific) | "Do not invent" is a hard rule → enforced mechanically |

## 3. Evaluation cases (EVAL-###, stable IDs)
| ID | Category | What is measured | Method | Threshold | Priority |
|---|---|---|---|---|---|
| EVAL-001 | Product acceptance | 5-second test on `/` at 390 & 1440: name · Senior PM · builds AI products · user problems · actually builds · projects to explore, all in first viewport | Screenshot review against a 6-item checklist (human + Claude) | 6/6 at both widths | Critical |
| EVAL-002 | Product acceptance | Recruiter path home → work → case study → about → resume → contact | Playwright scripted journey | ≤ 6 clicks, every hop 200, resume 200 | Critical |
| EVAL-003 | Product acceptance | Product-leader questions (brief §43, 8 questions) each answered by ≥1 artifact in TeachSpark/RailCite/Velora case studies | Traceability table in `test-cases.md`, reviewed | 8/8 mapped | High |
| EVAL-004 | Performance | Lighthouse mobile + desktop on `/`, `/work`, `/work/teachspark`, `/about` | Lighthouse CI, 3 runs median | Perf ≥ 90 · A11y ≥ 95 · BP ≥ 95 · SEO ≥ 95 | Critical |
| EVAL-005 | Performance | Home JS payload, LCP, CLS | Lighthouse + `next build` output | JS ≤ 180 kB gz · LCP ≤ 2.5 s · CLS < 0.05 | High |
| EVAL-006 | Design / a11y | axe-core on every route at 390 & 1440 | Playwright + axe | 0 critical/serious | Critical |
| EVAL-007 | Design / a11y | Keyboard-only completion: nav, Ask panel open/answer/close, filters, timeline, Show-the-thinking | Playwright keyboard script + manual | 100 % operable, focus always visible | Critical |
| EVAL-008 | Design | Responsive: no horizontal scroll, ≥ 44 px targets, readable without zoom at 390/768/1024/1440 | Playwright viewport sweep + screenshots | 0 overflow, 0 sub-44 px controls | High |
| EVAL-009 | Design | Premium rubric per major page: not cluttered · whitespace ≥ 50 % · typography dominant · ≤ 1 accent colour/section · reads Senior PM not student · character matches the locked character sheet (Variant B, 2026-09-23) with no style drift *(item reworded for M-009 per S14/EV4; was "avatar resembles Tushar")* | Screenshot review (Stage 8 impeccable critique) scored 0–2 per item | ≥ 10/12, no item at 0 | High |
| EVAL-010 | Design | Reduced-motion: all animations collapse to opacity/instant | Playwright with `prefers-reduced-motion: reduce` | 0 transforms animated, page fully usable | High |
| EVAL-011 | Functional | Zero dead controls: every visible button/link resolves or performs its action | Automated crawl of interactive elements | 0 dead | Critical |
| EVAL-012 | Functional | Ask coverage: each suggested prompt (home 5 + panel 6) returns an answer with ≥ 2 evidence links; 5 off-topic queries return the honest empty state | Vitest over `LocalKnowledgeProvider` | 11/11 answered · 5/5 empty · 0 fabricated | Critical |
| EVAL-013 | Content integrity | Every metric has `source`, `asOf`, `kind`; every project has ≥1 source; forbidden strings absent (PMP, SAFe Agilist, DOB, phone, sandbox code, "AI Product Manager" as title) | zod build-time validation + grep test; deliberate failing fixture proves the gate | Build fails on violation | Critical |
| EVAL-014 | Functional | Video states: no-video → "Demo coming"; playing; error → live-link fallback; `preload="none"` | Playwright + network throttling | All 4 states render | Medium |
| EVAL-015 | Reliability | Graceful degradation: View Transitions unsupported, JS disabled (content readable), missing image | Playwright with feature flags off | Content and navigation still work | Medium |
| EVAL-016 | Security | No secrets/PII in repo or bundle; `pnpm audit` high/critical; security headers on Vercel | grep + audit + header check | 0 secrets · 0 high/critical · headers present | High |
| EVAL-017 | Product acceptance | Link previews: OG/Twitter tags absolute HTTPS, 1200×630 image per page family | LinkedIn Post Inspector + opengraph.xyz (human) + tag test | Renders correctly on both | High |

## 4. Critical failure conditions — "unacceptable to release"
Any of: EVAL-001 < 6/6 · EVAL-002 broken hop · EVAL-004 below any threshold on any listed route · EVAL-006 any critical/serious · EVAL-007 any unreachable control · EVAL-011 any dead control · EVAL-012 any fabricated answer · EVAL-013 gate not proven · the hero character does not match the locked character sheet, or the illustration style drifts between scenes *(M-009 wording per S14/EV4; was "avatar not recognisably Tushar")* · any invented metric/quote/technology found in review · any PII or secret published. **M-009 additions (§8.4):** the hero clip loops or restarts · a `<video>` rendered under reduced motion, touch or Save-Data · an illustration that depicts a metric, logo, product UI or claim · `tokens:check` ≠ 13/13 on the paper palette.

## 5. Strategy
- **Automated** (single command `pnpm eval` → Vitest + Playwright + axe + Lighthouse CI, results to `evals/results/eval-run-<version>.json` with commit/branch/timestamp): EVAL-002, 004–008, 010–016 (tag-level part of 017).
- **Manual / human review:** EVAL-001, 003, 009, 017 (inspectors), 022 (M-009). Tushar personally confirms the 5-second read and, for M-009, the hero on the Vercel preview (§8.3); the character-sheet match replaces the former avatar-likeness confirmation (S14/EV4).
- **Baseline:** first full run on the tracer bullet (`baseline-v1.json`) so later clay/motion additions are measured against it, not eyeballed.
- **Regression:** `pnpm eval` on every behaviour-changing ticket (nav, filters, Ask, motion, data schema) and at every phase QA gate; failures never removed, only fixed or explicitly parked with reason.

## 6. Release gates (feed `QA-report.md`)
Design gate = EVAL-006/007/008/009/010 (+ 018/020/022 from M-009) · Functional gate = EVAL-002/011/012/014 (+ 019) · Performance gate = EVAL-004/005 · Content-integrity gate = EVAL-013 + manual truth review (+ 021) · Security gate = EVAL-016 · Product gate = EVAL-001/003/017. Overall READY only when every Critical passes and no High is unaddressed. **Thresholds are never lowered to pass.**

## 7. Home of the package
`Portfolio-clay/evals/` — `evaluation-plan.md` (copy of this file), `eval-cases.json` (the table above as data, authored in Stage 6), `results/`, `reports/`. `scorers/` is not needed (no scored AI output).

---

## 8. M-009 addendum — Illustrated editorial redesign (Stage 3, 2026-09-24)

Consumes `Solution-PRD.md` §12 (approved 2026-09-24), `Discovery-PRD.md` §9 and `decisions.md` S11–S21. Decisions recorded here: EV3–EV6. **Rule of the addendum:** M-009 replaces the presentation only, so every row in §3 and every threshold in §4–§6 carries forward unchanged; this section *adds* rows, *rewords* the character gate, and makes one provisional acceptance binding again. Nothing is lowered.

### 8.1 What changes in what "good" means
The §1 definition stands (recruiter + product leader reach the §2 conclusions quickly, every claim traceable, premium quality, top-tier perf/a11y). Two things are new:
- The central design risk moves from **"clay tips into toy"** (D1, EVAL-009) to **"paper tips into scrapbook / children's book"** (S15). The mechanical guard is a *decoration budget* and a *Caveat-only-for-annotations* rule, measured by Playwright (EVAL-018), plus the Stage-8 critique against the mockups (EVAL-022).
- The hero is now a **generated illustration + a 2.5 s clip that plays once and holds** (S14). Its correctness surface (no loop, poster is LCP, poster-only fallbacks) is functional and measurable (EVAL-019), and the likeness gate becomes a *character-sheet match* (EV4).

Categories are unchanged (EV1): functional · product acceptance · performance · design · light reliability · light security · content integrity. **Still no AI evaluation layer** — the illustrations are generated *assets*, not generated *behaviour*; they are governed by the content-integrity rules (S20, EVAL-021), not by AI evals.

### 8.2 New evaluation cases (EVAL-018…022, stable IDs; data in `evals/eval-cases.json` v1.1.0)
| ID | Category | What is measured | Method | Threshold | Priority |
|---|---|---|---|---|---|
| EVAL-018 | Design | **Decoration budget (S15):** on every route at 390 & 1440, each `<section>`, the header and the band footer contain ≤ 4 decoration objects (`[data-decor]` — tape, sticky, postcard, sketch, note, torn edge, hand annotation each count one); no `p/h1–h6/li/td/th/dt/dd` renders in Caveat unless inside `[data-decor]` or `aria-hidden="true"`; `[data-flat]` zones (case-study chapter bodies, essays, tables) contain 0 decorations; every text-bearing decoration is `aria-hidden` | Playwright sweep counting the selector contract per section (tests/e2e/eval-018.spec.ts) | 0 sections > 4 · 0 Caveat body elements · 0 decorations in flat zones · 0 unhidden annotations | High |
| EVAL-019 | Functional | **Hero clip once-and-hold + fallbacks (S14):** on `/` at 390 & 1440 — default mode: `<video autoplay muted playsinline preload="metadata" poster>` with **no `loop`**, sources webm then mp4, reaches `ended` within 4 s and stays paused on its last frame (`currentTime` never decreases); reduced-motion, coarse-pointer/touch and Save-Data modes: **no `<video>` in the DOM**, poster `<img>` only; in every mode the poster is in the static HTML, `fetchpriority="high"`, not lazy, and is the LCP element on the preview; asset caps webm ≤ 200 kB · mp4 ≤ 350 kB · poster ≤ 120 kB | Playwright with `reducedMotion`, `hasTouch`, and a `navigator.connection.saveData` init-script stub (tests/e2e/eval-019.spec.ts) + file-size assertions; LCP element confirmed from the preview Lighthouse run (EVAL-004/005) | 4/4 modes correct · `loop` absent · ended ≤ 4 s · 0 restarts · caps met | High |
| EVAL-020 | Design | **Paper token gate (S12):** `pnpm tokens:check` = 13/13 on the paper names; `app/globals.css` declares exactly those 13 `--color-*`; 0 colour literals (hex/rgb/hsl/oklch) in `components/**` and `app/**` outside `globals.css` and one allow-listed shared module for the OG image routes; 0 references to the 13 retired clay token names (`bg, surface, ink, ink-2, ink-3, accent, accent-deep, lavender, sky, mint, blush, peach, butter`, utility classes included) | Vitest (tests/unit/eval-020.test.ts) wrapping `scripts/tokens-check.ts` + source greps | 13/13 · exactly 13 · 0 literals · 0 retired names | High |
| EVAL-021 | Content integrity | **Illustration provenance + decorative-only (S20):** every asset under `content/media/illustrations/` (and the hero clip/poster) has a manifest entry with alt text and a `README.md` provenance row (model, reference media ids, prompt summary, date, credits) and vice versa; every alt names the asset as an illustration; filenames and alt text pass `forbidden-strings`; **manual:** a per-asset checklist at Stage 8 confirms no illustration depicts a metric, logo, product UI or claim | Vitest over the manifest + README + forbidden-strings (tests/unit/eval-021.test.ts); manual checklist filed as `evals/results/eval-021-<sha>.md` | 100 % provenance both ways · 0 unlabelled · 0 forbidden hits · 0 assets carrying evidence | High |
| EVAL-022 | Design | **Mockup fidelity (S17):** each route family (`/`, `/work`, `/work/[slug]` ×1 rich + ×1 thin, `/about`, `/thinking`, `/thinking/[slug]`, `/playground`, `/contact`; 404 against the paper system only) compared side-by-side with its mockup in `docs/redesign-mockups/m-009/` at 1440 & 390 on a 5-item checklist: section order · copy verbatim from `data/*.ts` · type hierarchy · paper-primitive placement · band footer present and correct. Every deviation is recorded in `Design.md` "Deviations" with a reason and Tushar's disposition. **Sub-gate:** the home hero row is approved by Tushar on the Vercel preview at Phase 0 before Phase A starts (§12.6.7) | Screenshot pairs (Stage 8 critique), evidence `evals/results/eval-022-<sha>.md` | 9/9 routes reviewed · 0 unrecorded deviations · Phase-0 hero approved | High |

### 8.3 Amended rows (wording only; no threshold changes)
- **EVAL-001** failure condition "avatar not recognisably Tushar" → "hero character does not match the locked character sheet or the style drifts" (S14/EV4).
- **EVAL-005** — the ≤ 180 kB gz first-load budget is **binding again** for M-009 (EV6): the provisional B2 acceptance in EXE-11 (189.3 kB, keep the cursor spring) closes because the spring and the whole hero motion system are removed (S11/S14). `scripts/bundle-budget.ts` exit 1 is a Stage-9/10 blocker; the QA-report shows the measured number from `bundle-budget --json`. The local `informational` flag in `scripts/eval.ts` stays only for the swiftshader LCP caveat; LCP ≤ 2.5 s mobile is verified on the Vercel preview.
- **EVAL-009** rubric item 6 reworded (see §3); tags `clay-tiers`/`avatar` → `paper-primitives`/`character`.
- **EVAL-010** input now includes the hero video: under reduced motion the hero renders the poster only (EVAL-019 owns the full fallback matrix); a `<video>` rendered under reduced motion is a failure of both rows.
- **EVAL-013** accessibility note: the clay avatar alt is retired; every illustration alt names it as an illustration (EVAL-021), exact strings fixed in `Design.md`.
- **EVAL-017** must be **re-run** for M-009: all seven `opengraph-image.tsx` families are regenerated in the paper style; an og:image still rendering the clay identity is a failure; the manual inspector pass (LinkedIn Post Inspector + opengraph.xyz) is repeated on the M-009 preview.

### 8.4 "Unacceptable to release" — M-009 additions (merged into §4)
The hero clip loops or restarts · a `<video>` under reduced motion / touch / Save-Data · the hero character does not match the locked sheet or the style drifts across scenes · an illustration depicting a metric, logo, product UI or claim · `tokens:check` ≠ 13/13 · EVAL-005 JS > 180 kB gz at the release gate · any og:image still carrying the superseded identity. Everything in §4 remains.

### 8.5 Not new rows (covered elsewhere — recorded so nothing is lost)
- **S16 band footer:** links → EVAL-011; contrast/landmarks → EVAL-006; targets/overflow → EVAL-008; fidelity → EVAL-022; PII → EVAL-013/016 ("Bengaluru, India" is already public on the résumé/LinkedIn and is *not* a forbidden string; confirm with Tushar before rendering — HANDOFF §6).
- **S13 fonts:** transfer cost → EVAL-004/005 on the Phase-0 tracer; self-hosting is enforced by the existing TP9 CSP (a runtime Google Fonts request would be blocked and surface in EVAL-004 best-practices); Caveat usage → EVAL-018.
- **S18 extraction findings:** regression **tests** (TC- rows at Stage 6), not evals — double "Draft — pending sign-off:" prefix, About timeline lead wording, `learnings[]` rendered, `hero.tagline` rendered in the band © bar.
- **S21 AskPanel:** EVAL-007 and EVAL-012 unchanged; if Tushar drops the global panel, the EVAL-007 panel clause is retired by a recorded decision, never by omission.
- **S11 dead-code removal** (clay primitives, aurora, avatar system): EVAL-020's "0 retired token names" plus the Stage-9 review; no separate row.

### 8.6 Baseline and regression strategy for M-009 (EV6)
- `baseline-v1.json` stays the **pre-redesign reference** (EVAL-004/005 comparison in the eval-report: M-008 preview 191 kB → target ≤ 180).
- The **Phase-0 tracer run** (`pnpm eval --label baseline-m009-tracer`) is the first run containing EVAL-018/019/020 values and the post-removal JS number; every later M-009 run diffs against it via `--baseline baseline-m009-tracer.json`. The diff logic ignores ids absent from a baseline, so no runner change is needed.
- `pnpm eval` on every M-009 phase gate and on every ticket that touches tokens, fonts, the hero, decorations or OG images. Failures are fixed or explicitly parked with a reason; nothing is removed.

### 8.7 Runner wiring (what Stage 3 changed in code, what Stage 7 must build)
- `evals/eval-cases.json` → v1.1.0, 22 cases; `scripts/eval-cases.ts` invariant → 22 unique ids, EVAL-018/019 listed as **deferred specs** until their Stage-7 tickets land; `scripts/eval.ts` id lists extended (Playwright 018/019 · Vitest 020/021 · Manual 022) with a generic Vitest mapping by `eval-0xx` file name.
- Stage 7 builds: `tests/e2e/eval-018.spec.ts`, `tests/e2e/eval-019.spec.ts`, `tests/unit/eval-020.test.ts`, `tests/unit/eval-021.test.ts`, the `[data-decor]` / `[data-flat]` selector contract in the paper primitives (Design.md, Stage 4), the illustration manifest + `content/media/illustrations/README.md`.
