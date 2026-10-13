# TASK-204 — Enterprise Field Journal (`/projects` Enterprise & Client Work)

Branch `m013/enterprise-work` (from main 026da48b). Decisions: `decisions.md` EXE-80 (EXE-73 is taken by another lane's branch). Design: `Design.md` Dev-280…283. Not pushed, merged or deployed. The Campfire ticket TASK-204 is not in this worktree's local backlog copy, so its status was not moved.

## What was built
- `components/portfolio/EnterpriseClientWork.tsx` (now a client component): dossier cover (category tab, h2 "Enterprise & Client Work", lede, existing description, paper still life from 900 px) and six paper-craft cards (number tab, 4:3 stage with the miniature, client h3, program, scope line, one action).
- `data/enterprise-art.ts`: presentation-only art config (layer rects, travel, delays, connector paths, outlines). No facts.
- CSS: one delimited block at the end of `app/globals.css` (`TASK-204`), all `.ee-*`.
- Signature per card (activation, once, ~1.5 s, ends at rest): Pear — cloud rises, warehouse follows, two connectors draw; Mojix — source, three pipeline blocks and destination ride in sequence along a drawn connector; Google Cloud — first sheet lifts, second slides into alignment, its chart panel is outlined; Telus Health / LifeWorks — destination sheet slides in, checklist lifts, validation seal rises, sheet outlined; LifePoint — record folders and data-transfer stack rise, two connectors draw; IU Health — four source blocks rise in sequence, chart line draws.
- States: resting; hover and keyboard focus (same twin: −4 px lift, crossfaded shade, one layer answers, arrow nudge, no scale); signature; active (terracotta outline, paper pin, "Close case file", `aria-expanded`); open case file.
- State E: no enterprise case-study route exists (`/work/[slug]` is personal builds only), so the open case file is an in-card dossier beside the art (role, dates, overview, workstreams with details, technical scope, conceptual-model note). Not a modal, no new route, no links, one open at a time.
- Reduced motion: no rides, draws, outlines or lift; pin, outline and label remain. Touch: tap = activation, 1 px `:active` press, no sticky hover.

## Data-backed facts used
Per card face: `client`, `program`, first three `tags`, number (list position). Dossier: `role`, `period` (via `formatRange`), `summary`, all `workstreams` (name + detail), all `tags`. Art alt text describes only the paper scene. Unit tests map every shown field to `data/enterprise.ts`.

## Mockup items dropped (not backed by the data)
Mockup tech lines ("AWS → GCP · Snowflake → BigQuery", "Streaming · GCP · Analytics", "ML · Research · Cost analysis", "Automation · Data quality · GCP", "FHIR · Data engineering · Governance", "Looker · Forecasting · Data integration") are replaced by each record's own first three tags; the key-highlights list, "Offshore Project Manager · Feb 2024 – Jul 2024" styling, case-study tabs (Overview / Challenge / My Role / Architecture / Tech Stack / Outcomes), the 1.6 s timeline and all client logos. "The challenge", "Outcomes" and a separate "My contribution" are not shown: the records have none of that text and the schema forbids metrics and impact claims.

Client logos: none used. `public/media/logos/google-cloud.svg` exists but belongs to the Experience page content and would give one card of six a logo; names are text. Nothing was downloaded or redrawn.

## Conflicts between spec and repo (repo won; see EXE-80)
Hover scale 1.01–1.02 dropped (EXE-59/63: no card scale); Dev-118 "sub-project names only" relaxed inside the open dossier only; old h2 "Projects built inside larger systems." replaced per the spec (test updated); optional pointer tilt not built.

## Art
- Higgsfield `gpt_image_2_5` 4:3. Pear master approved first, five siblings generated with it as style reference, six dark twins generated from the light twins, Higgsfield background removal on all 12 (plus the header still life, light and dark, and one Mojix recomposition because the first Mojix was a thin strip that left the card mostly empty).
- Credits: 20.5 (balance 410.15 to 389.65, matches the transaction log: 18 generations × 0.25 = 4.5, 16 background removals × 1 = 16). Budget 60.
- Assets (`public/media/enterprise-work/<scene>/{light,dark}.webp`, 760 px wide, q80): pear 62/63 KB, mojix 34/35, google 46/45, telus 55/56, lifepoint 39/42, iu 61/59, header 46/53 (dark/light) — 708 KB total, only the active theme's file is fetched (asserted by request log). Raw PNGs and scripts live in `/Volumes/E Drive/Dev/.scratch/enterprise-work/`.
- No text, logos or numbers in the art. No animation frames or video were generated: motion is CSS `translate` on clipped copies of the same cutout plus SVG `stroke-dashoffset` and `opacity`.
- Known limit: connector overlays are traced by eye over connectors baked into the art and fade after drawing; they follow the baked strips closely, not pixel-exactly. Dark twins differ from light by a few percent in object position, so layer rects carry a margin.

## Tests added or changed
- `tests/unit/enterprise-journal.test.tsx` (6): face and dossier fields map to data, disclosure behaviour, art files exist per theme within 90 KB, rects in bounds, one hover part per card.
- `tests/e2e/enterprise-journal.spec.ts` (all four widths): layout 3/2/1 + no overflow + 14 px floor + images load; hover/focus parity and no shadow/filter transitions (≥ 1024); signature plays, settles, restarts (every card); active state, record in plain text, no link, no navigation, keyboard Enter/Space; touch tap (390); reduced motion; light and dark (matching cutouts only, axe clean).
- `tests/e2e/enterprise-shots.spec.ts`: opt-in screenshots (`ENTERPRISE_SHOTS=1`).
- `eval-040.spec.ts`: enterprise card added to the L1 surface list (new optional `focus` target and the scope regex).
- `projects.spec.ts` (@EVAL-013): h2 text, and the sub-project assertions open the case file first.

## Gate (branch head, production build, ALLOW_DEV_ROUTES=1, through the heavy gate)
- typecheck pass, lint pass, tokens pass (73/73 contrast pairs), build pass, unit pass (full `pnpm test`).
- Full e2e, one run: 2083 passed, 2297 skipped (viewport-gated), 8 failed. Failures and what happened:
  - `enterprise-journal` signature × 3 (w768/1024/1440): my test sampled a single instant and had a 30 s budget; fixed (samples through the ride, 180 s). Passes after the fix.
  - `ask-voice` @EVAL-010 reduced motion (w768), `eval-041` object motion (w1440), `perf-smoothness` @EVAL-039 (w1440), `eval-030` pinball intro→results and leak cycles (w1440): none touch this section; all five pass when re-run alone on this build (batch of 80 and 2). Load-sensitive on a shared 8 GB machine; the EVAL-030 pair is the known reduced-motion-helper/pinball flake class. Not re-verified on main.
  - Known-failing set from the brief (EVAL-008 /dev routes, EVAL-033 real-site tilt, EVAL-030 helper race) did not reproduce as separate failures in this run except the EVAL-030 items above.
- Re-run after the fix: `enterprise-journal`, `ask-voice`, `eval-041`, `perf-smoothness` all four widths: 80 passed, 60 skipped. `eval-030` two tests w1440: 2 passed.

## Screenshots
`docs/screenshots/m-013/task-204/`: section light and dark at 1440 and 390; each card mid-signature (light, dark, 1440 and 390); open case file for Pear and IU Health (light, dark, 1440 and 390).

## Not done / limitations
Campfire ticket status not updated (ticket absent from this worktree). Old `.pf-case*` CSS rules in the TASK-116 block are now dead (left untouched to keep the diff scoped; safe to delete in a cleanup). Pointer tilt not built. Full e2e not re-run end to end after the test-only signature fix (the affected specs were re-run).
