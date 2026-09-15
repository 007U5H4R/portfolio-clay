---
id: TASK-9
title: 'TKT-09: Ask knowledge data + AnswerProvider + LocalKnowledgeProvider + tests'
status: To Do
assignee: []
created_date: '2026-09-15 13:22'
labels:
  - P0
  - 'sp:5'
  - ask
milestone: m-2
dependencies:
  - TASK-3
  - TASK-7
priority: high
type: feature
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
`data/knowledge.ts` (KnowledgeEntry[]: prompt, aliases/synonyms, answer <=3 sentences, evidence[] >=2 {label, href}, sources[]), `lib/ask/adapter.ts` (`AnswerProvider`, `Answer`), `lib/ask/local-provider.ts` (normalise -> intent match via synonym table -> score -> top entry; empty when below threshold; never fabricates), `lib/ask/rag-provider.ts` stub (not wired), and Vitest coverage: every suggested prompt (11) -> `kind:'answer'` with >=2 evidence links; 5 off-topic queries -> `kind:'empty'`; 0 answers containing text absent from `knowledge.ts`.

**Objective.** Honest, deterministic "Ask my portfolio" backend behind an adapter so RAG is a later drop-in (S7).
**Product requirement.** Solution-PRD §4 S7, §5 Ask spec, §8 criterion 6; COMPONENT_ARCHITECTURE §4 AnswerProvider contract; CONTENT_INVENTORY §9 + §1.3; evaluation-plan EVAL-012.
**Definition of Done.** Base DoD + Truth.
**Notes.** No AI evals (EV1). The provider is pure and server/client agnostic; UI copy (TKT-10) must say answers come from portfolio content. Off-topic PII probes ("phone number") must return empty, never a value. Feeds TKT-10, TKT-11.
**Related EVAL.** EVAL-012 (primary), EVAL-013. **Blockers.** Tushar - sign-off on 8 + 3 answers (non-blocking; ships `draft:true`).
**Target sequence.** Phase 3 · **Owner.** Claude.
Source: tickets.md § TKT-09.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 8 entries transcribed verbatim from CONTENT_INVENTORY §9 (answers, evidence hrefs, sources), status `draft:true` until Tushar signs off; "Ten years" replaced by "7+ years" per the §9 note.
- [ ] #2 3 additional entries authored only from VERIFIED rows - topics approved by Tushar (PB3): "What did you learn when an assumption failed?", "How do you evaluate an AI product?", "What is your research background?" - each with sources listed, `draft:true`; EVAL-012 threshold stays at 11.
- [ ] #3 Every entry passes the zod `KnowledgeEntry` schema (evidence >=2, sources >=1).
- [ ] #4 `LocalKnowledgeProvider.ask()` resolves in <20 ms; matching handles case, punctuation, common synonyms ("projects/products/built", "AI/GenAI/LLM", "enterprise/corporate/AmEx"); ties broken deterministically.
- [ ] #5 Vitest: 11/11 answered with >=2 evidence links; 5/5 off-topic empty ("weather in Paris", "write me a poem", "what is your salary", "phone number", "lorem ipsum"); a "no fabrication" test asserts every answer string is byte-identical to a `knowledge.ts` answer.
- [ ] #6 `Answer.text` for empty state = CONTENT_INVENTORY §1.3 fallback copy; `matched[]` exposes the entry id for evidence rendering.
- [ ] #7 Runs under `pnpm eval --only EVAL-012`.
<!-- AC:END -->
