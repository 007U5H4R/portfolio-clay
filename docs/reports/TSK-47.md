# TSK-47 · 404 in the paper system

Branch `m009/tkt-88c`, worktree `Portfolio-m009-tkt-88c`. Parent TKT-88 (`TASK-83`), TC-171, Design.md §4.3 / §3.3.

## AC checklist (TKT-88 AC3)

- [x] Renders at an unknown route (`/definitely-missing`) with HTTP 404 status — `not-found.spec.ts` step 1.
- [x] Three CTAs present and resolving 200: "Back home" → `/`, "See the work" → `/work`, "Get in touch" → `/contact`.
- [x] Band footer follows (inherited from `app/layout.tsx`; `footer` count = 1).
- [x] axe clean at 390 and 1440.
- [x] Decoration count = 1 (`[data-decor]` in `<main>` = 1, the reused `tools` sketch), matching Design.md §3.3's "404 → tools sketch (reused from playground) → 1".
- [x] No overflow at 390.
- [x] No `<img>` (no new illustration spend, §12.4).

## What changed

- `app/not-found.tsx` — rewritten from the legacy `ClayCard`/`ClayButton` M-006 page to the paper system: one `Section` (`aria-label="Page not found"`), eyebrow "Lost?" (plain label, not `Annotation` — §4.3 calls it "annotation-free"), h1 "This page wandered off." at `clamp(42px, 5.2vw, 76px)` (Design.md's exact clamp), the original lead line kept (no sourced 404 copy exists in `data/*.ts` or `CONTENT_INVENTORY.md`; same convention `WorkHero`/`PlaygroundHero` use for inline, non-invented copy), and the three CTAs as pill `Link`s (`data-hand="cta"`, ≤ 6 words each, Caveat via `font-hand`, ≥ 44px tall). The `tools` `Sketch` (already defined in `components/paper/sketch-paths.ts`, reused verbatim from the `/playground` bench board) sits at the right, hidden below `lg` (1024px) — mirroring the same sketch's own `display:none` breakpoint on the playground mockup, so nothing risks overflow at 390.
- `tests/e2e/not-found.spec.ts` — rewritten for TC-171: target path changed `/nope` → `/definitely-missing`; new decoration-count + footer-count assertion (`@EVAL-018`); new "no illustration `<img>`" assertion; kept the HTTP-404 + h1 + link-resolution, chrome-presence, axe (`@EVAL-006`), no-overflow (`@EVAL-008`) and screenshot-pack tests from the prior M-006 suite.

No other files touched. No `app/globals.css` edit needed — the `tools` sketch's stroke styling (`.sketch[data-sketch="tools"]`) and all layout primitives (`Section`, `Container`, tokens, `focus-ring`, `bg-rust`/`text-navy-2`/etc. utilities) already existed from earlier tickets.

## Gate output (`heavy.sh`, single locked run)

```
pnpm typecheck   → next typegen + tsc --noEmit: clean
pnpm lint        → eslint .: clean
predeploy/content→ predeploy OK; content OK (projects:14 experience:4 skills:4 writing:5 knowledge:11 thinking:6)
pnpm build       → Compiled successfully; all routes static (13); /_not-found present
tests/e2e/not-found.spec.ts (w1440 + w390) → 10 passed, 4 skipped (viewport-independent tests skip on the non-canonical width), 0 failed
```

## Screenshots

`docs/screenshots/not-found/1440.png`, `docs/screenshots/not-found/390.png` — read both: paper background, eyebrow/h1/lead/CTA row, tools sketch visible at 1440 and correctly hidden at 390, band footer below, no clay/overflow artifacts.

## Merge notes

- No shared files touched (no `globals.css` append needed).
- No files needed that I don't own.
- Dependency TSK-45 (tools sketch) was already satisfied pre-fanout — `Sketch variant="tools"` and its `sketch-paths.ts` entry already existed in this worktree, so no coordination needed with the parallel `/playground` implementer.
