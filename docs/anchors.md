# Anchors (TP8 · decision E-3)

Chapter ids are **schema values** (`data/schema.ts` `CHAPTER_IDS`); the `NN-slug` anchors are a
**presentation** concern. Both live once in `lib/anchors.ts` and are mirrored here for humans. Any
internal link in content is validated against `routes()` at build time (EVAL-013) — a dangling link
fails the build.

## Case-study chapter anchors (`/work/<slug>#<anchor>`)

| Chapter id | Anchor | Title |
|---|---|---|
| `context` | `01-context` | Context |
| `problem` | `02-problem` | Problem |
| `discovery` | `03-discovery` | Discovery |
| `bet` | `04-product-bet` | Product bet |
| `built` | `05-what-i-built` | What I built |
| `evaluation` | `06-evaluation` | Evaluation |
| `outcome` | `07-outcome` | Outcome |
| `learned` | `08-what-i-learned` | What I learned |

## Page anchors

| Route | Anchors |
|---|---|
| `/about` | `experience`, `impact`, `capabilities`, `research` |
| `/contact` | `resume` |

## Query links (E-2)

Internal filter links use the single `?filter=` key only (parsed later by `lib/filters.ts`); any
other query key (e.g. a stray `?tab=`) does not resolve and fails validation.

| Route | Accepted query |
|---|---|
| `/work` | `?filter=ai` · `?filter=enterprise` · `?filter=cloud` · `?filter=experiments` |

## Static routes

`/` · `/work` · `/about` · `/thinking` · `/contact` · `/playground` · `/work/<slug>` · `/thinking/<essay-slug>`
