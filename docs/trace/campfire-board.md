# Trace — Campfire Board (TASK-124, M-009)

Every field in the Campfire Board `Project` record (`data/projects.ts`, slug `campfire-board`) and its
Portfolio entry (`data/portfolio.ts`) traces to a source below. Sources are the `SourceRef.id`s declared
in `campfireBoard.sources[]`; every source resolves to CONTENT_INVENTORY §8.12. `CF` =
`PM Tools/backlog-md-fork/` (read-only; nothing was written there).

**Depth decision.** Campfire Board is a **card, not a case study** (`overview.deepDive: false`,
`chapters: EMPTY_CHAPTERS`, `thinking: []`), like the thin five. Its `/work/campfire-board` page is the
shared thin template (generated for every personal build — the Portfolio's "Read the case study" link
points there), showing the two `overview.thirtySecond` paragraphs and the "Deep dive coming" tag. No
chapter copy was written: the README/docs record no problem statement, users, evaluation of outcomes or
learnings to fill one honestly.

## Source IDs → provenance

| Source id | Label (rendered) | ref (traceability only) | Inventory |
|---|---|---|---|
| `CF-README` | Campfire Board README | `CF/README.md` (intro, Highlights, How it works, Credits & license) | §8.12 |
| `CF-PILOT` | Campfire Board pilot checklist | `CF/docs/pilot-checklist.md` (2026-09-06) | §8.12 |

## Fields → source

| Field | Value | Source line |
|---|---|---|
| `name` | "Campfire Board" | `CF/README.md` wordmark alt + intro: "**Campfire Board** is a personal fork of Backlog.md…" |
| `tagline` | "A local-first, multi-project management dashboard for the AI build workflow — a personal fork of Backlog.md." | README header line: "A local-first, multi-project management dashboard for the AI build workflow."; intro: "a personal fork of Backlog.md" |
| `tags` | Kanban · Gantt · Local-first | README header: "Kanban · hours-axis Execution Gantt · …"; "A local-first … dashboard" |
| `status` / `statusLabel` | `prototype` / "Built · local tool" | README: "all served from a single local binary"; "one dashboard you launch locally in Chrome"; "The dashboard is served at http://127.0.0.1:6480" |
| `role` | "Personal fork" | README intro: "a personal fork of Backlog.md" |
| `dates` / `duration` | 2026-09 / "Sep 2026" | `CF/docs/pilot-checklist.md`: "This checklist run (2026-09-06, T9)"; `CF/docs/BUILD.md`: "recorded 2026-09-06" |
| `links` | no `live`; `github` = `https://github.com/007U5H4R/pm-dashboard`, `repoPublic: true` | Local tool (above), so no product link; the repo was made public at Tushar's request (coordinator, 2026-09-28) |
| `overview.thirtySecond[0]` | fork, Markdown folders, one local dashboard, 10-stage workflow | README intro paragraph ("reshaped into a cross-project command centre… every project stays a self-contained folder of Markdown files… one dashboard you launch locally in Chrome… the operational home for the 10-stage build workflow — from Product Discovery through Deployment") |
| `overview.thirtySecond[1]` | features, single Bun binary, nothing to deploy, Backlog.md credit | README Highlights (switcher, Kanban + Execution/Workflow toggle, Execution Gantt with dependency arrows, Statistics, Artifacts); How it works ("Bun-compiled CLI… the web UI is embedded in the binary, so there's nothing to deploy"); Credits & license ("a fork of Backlog.md by Alex Gavrilescu and contributors, and inherits its Markdown-native, agent-first philosophy. Licensed under the MIT License.") |
| portfolio `coverLine` | "One dashboard, every project" | README intro: "renders them all through one dashboard… across every project at once" |
| portfolio `meta` | "Built · local tool" | shortening of `statusLabel` (identical) |
| portfolio `pitchVideo` | YouTube `K_-510L6e7g` | Tushar 2026-09-28: oEmbed title "Campfire Board launch", channel "The Purposeful PM", public + embeddable |
| portfolio `demoVideo` | YouTube `DkxDQji3dz8` | Tushar 2026-09-28: oEmbed title "Campfire Board demo", public + embeddable |

## Honesty / hedges preserved

- **Backlog.md credit** is in the tagline (shown on the Portfolio info sheet) and in the overview, with
  its authors named — the site never implies Tushar wrote Backlog.md.
- **No product link**: a local tool (it runs on the owner's machine). The Portfolio renders the Pitch /
  Demo strips, the GitHub action (public repo since 2026-09-28) and the case-study link.
- **No metrics, users or outcomes** (`metrics: []`, `learnings: []`): none are recorded in the README or
  docs. The pilot checklist's scripted checks ran on throwaway scratch projects and are not presented
  as usage.
- **Cover**: the designed CSS `campfire` scene with a `Flame` glyph (no painted art yet; no image
  generated).
