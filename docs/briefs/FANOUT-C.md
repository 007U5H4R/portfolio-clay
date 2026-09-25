# Phase C fan-out addendum (5 parallel implementers) — read `FANOUT-AB.md` first

Everything in `docs/briefs/FANOUT-AB.md` applies (own worktree + branch, never push/merge, the `heavy.sh` lock for every heavy command, decisions EXE-15…19 / Dev-19…24, append-only `app/globals.css` block, report + ≤ 10-line reply). This file only adds the Phase C ownership table and notes. Worktrees: `/Volumes/E Drive/Dev/Code/Claude/Portfolio-m009-tkt-<id>/` on branch `m009/tkt-<id>` with id ∈ {86, 87, 88a, 88b, 88c}. Other agents are finishing at the same time, so expect a queue on the lock.

## Ownership
| Agent | Ticket / task | Owns |
|---|---|---|
| 86 | TKT-86 (`TASK-81`) · `/about` part 1 | `components/about/{AboutHero,CapabilityClusters,Impact}.tsx`, `components/timeline/ProductJourney.tsx`, `tests/unit/about.test.tsx`, `tests/e2e/about.spec.ts`, **and** `tests/e2e/eval-018-parked.json` (see note) — in `app/about/page.tsx` only minimal, commented edits |
| 87 | TKT-87 (`TASK-82`) · `/about` part 2 + assembly | `components/timeline/{ExperienceTimeline,StoryCard,timeline-logic}.ts(x)`, `components/about/{Awards,Research,Education,AboutCta}.tsx`, `app/about/page.tsx` (structure/assembly — leave commented slots for TKT-86's sections in §7.4 order), `tests/unit/{experience-skills,timeline-logic}.test.ts`, `tests/e2e/timeline.spec.ts`; put any new `/about` e2e in a new `tests/e2e/about-part2.spec.ts` (TKT-86 owns `about.spec.ts`) |
| 88a | TSK-45 (`TASK-83.1`) · `/playground` | `components/playground/*`, `app/playground/page.tsx`, `tests/e2e/playground.spec.ts` |
| 88b | TSK-46 (`TASK-83.2`) · `/contact` | `components/contact/*`, `components/common/CopyButton.tsx`, `app/contact/page.tsx` (keep the `SceneOpener` line exactly: `id="scene-contact" focalX={0.5} focalY={0.1}`), `tests/unit/copy-button.test.tsx`, `tests/e2e/contact.spec.ts` |
| 88c | TSK-47 (`TASK-83.3`) · 404 | `app/not-found.tsx`, `tests/e2e/not-found.spec.ts` |

## Notes
- **Scene openers exist** on `/about`, `/playground`, `/contact` (TKT-95, Dev-24). Where the plan says "scene bleed" / "photo" for the page opener, it's done — build beneath it and don't add a second copy of the page scene. `AboutHero`'s two-column grid was already collapsed by TKT-95 (see `docs/reports/TKT-95.md`).
- **EVAL-018 parked entry (TKT-86 owns it):** the only parked hit is `/about` hero hand-sub (caveat rule). When TKT-86 fixes it (Dev-10: the subline becomes an `aria-hidden` annotation), the parked entry becomes stale and **must be removed** in the same commit, or the stale-park guard fails. `[]` is the target (TP12).
- **S18 regression (TKT-87):** TC-167 — the timeline lead reads "Four roles, oldest to newest — open any node for the context, scale, and what changed." and the rendered order equals `data/experience.ts` order. Mandatory. Dev-11: all four story cards render open.
- **D9 (TSK-45):** the playground "quiet close" section is dropped. Dev-07 applies.
- **`.hand-cite`** (shared quote cite) is 13 px in the base CSS; the orchestrator raises it to 14 px at merge — don't edit the base block; if your EVAL-008 run flags a `.hand-cite`, note it rather than overriding.
- Tushar is AFK with delegated authority to the orchestrator; any judgement call you'd normally ask him about → decide by the plan/Design precedence, record it in your report, and continue.
- Model: all five run on Opus 5.5 (Fable credits are exhausted), including TKT-86, which the plan tiered most-capable.
