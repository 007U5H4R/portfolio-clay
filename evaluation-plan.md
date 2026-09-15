# Evaluation Plan — Clay Portfolio

Status: Stage 3 draft · 2026-09-15 · consumes `Solution-PRD.md` §8 (success criteria) and `DESIGN_DIRECTION.md` §9 (budgets). Companion: `~/dotfiles/claude/rules/eval-framework.md`.

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
| EVAL-009 | Design | Premium rubric per major page: not cluttered · whitespace ≥ 50 % · typography dominant · ≤ 1 accent colour/section · reads Senior PM not student · avatar resembles Tushar | Screenshot review (Stage 8 impeccable critique) scored 0–2 per item | ≥ 10/12, no item at 0 | High |
| EVAL-010 | Design | Reduced-motion: all animations collapse to opacity/instant | Playwright with `prefers-reduced-motion: reduce` | 0 transforms animated, page fully usable | High |
| EVAL-011 | Functional | Zero dead controls: every visible button/link resolves or performs its action | Automated crawl of interactive elements | 0 dead | Critical |
| EVAL-012 | Functional | Ask coverage: each suggested prompt (home 5 + panel 6) returns an answer with ≥ 2 evidence links; 5 off-topic queries return the honest empty state | Vitest over `LocalKnowledgeProvider` | 11/11 answered · 5/5 empty · 0 fabricated | Critical |
| EVAL-013 | Content integrity | Every metric has `source`, `asOf`, `kind`; every project has ≥1 source; forbidden strings absent (PMP, SAFe Agilist, DOB, phone, sandbox code, "AI Product Manager" as title) | zod build-time validation + grep test; deliberate failing fixture proves the gate | Build fails on violation | Critical |
| EVAL-014 | Functional | Video states: no-video → "Demo coming"; playing; error → live-link fallback; `preload="none"` | Playwright + network throttling | All 4 states render | Medium |
| EVAL-015 | Reliability | Graceful degradation: View Transitions unsupported, JS disabled (content readable), missing image | Playwright with feature flags off | Content and navigation still work | Medium |
| EVAL-016 | Security | No secrets/PII in repo or bundle; `pnpm audit` high/critical; security headers on Vercel | grep + audit + header check | 0 secrets · 0 high/critical · headers present | High |
| EVAL-017 | Product acceptance | Link previews: OG/Twitter tags absolute HTTPS, 1200×630 image per page family | LinkedIn Post Inspector + opengraph.xyz (human) + tag test | Renders correctly on both | High |

## 4. Critical failure conditions — "unacceptable to release"
Any of: EVAL-001 < 6/6 · EVAL-002 broken hop · EVAL-004 below any threshold on any listed route · EVAL-006 any critical/serious · EVAL-007 any unreachable control · EVAL-011 any dead control · EVAL-012 any fabricated answer · EVAL-013 gate not proven · avatar not recognisably Tushar · any invented metric/quote/technology found in review · any PII or secret published.

## 5. Strategy
- **Automated** (single command `pnpm eval` → Vitest + Playwright + axe + Lighthouse CI, results to `evals/results/eval-run-<version>.json` with commit/branch/timestamp): EVAL-002, 004–008, 010–016 (tag-level part of 017).
- **Manual / human review:** EVAL-001, 003, 009, 017 (inspectors). Tushar personally confirms avatar likeness and the 5-second read.
- **Baseline:** first full run on the tracer bullet (`baseline-v1.json`) so later clay/motion additions are measured against it, not eyeballed.
- **Regression:** `pnpm eval` on every behaviour-changing ticket (nav, filters, Ask, motion, data schema) and at every phase QA gate; failures never removed, only fixed or explicitly parked with reason.

## 6. Release gates (feed `QA-report.md`)
Design gate = EVAL-006/007/008/009/010 · Functional gate = EVAL-002/011/012/014 · Performance gate = EVAL-004/005 · Content-integrity gate = EVAL-013 + manual truth review · Security gate = EVAL-016 · Product gate = EVAL-001/003/017. Overall READY only when every Critical passes and no High is unaddressed. **Thresholds are never lowered to pass.**

## 7. Home of the package
`Portfolio-clay/evals/` — `evaluation-plan.md` (copy of this file), `eval-cases.json` (the table above as data, authored in Stage 6), `results/`, `reports/`. `scorers/` is not needed (no scored AI output).
