# M-009 release-candidate record run — `dbc047c` (2026-09-27)

Preview: https://portfolio-clay-git-m-009-redesign-tushar-49a6.vercel.app (branch `m-009-redesign` @ `dbc047c`).

## Gates
- Integration `db8f782`: typecheck · lint · tokens 13/13 · unit **625 passed** · build **15 routes static** · full e2e **1209 passed / 0 failed** (4 widths, 2 workers) · first-load JS `/` 160.1 · `/work` 153.4 · `/projects` 161.6 · `/about` 153.9 · `/certifications` 154.2 kB (budget 180).
- `pnpm eval --base-url <preview> --label m009-rc-dbc047c`: **16 pass · 0 fail · 2 skip · 4 manual** (`evals/results/m009-rc-dbc047c.json`); EVAL-008 FAIL → PASS.

## Preview Lighthouse (lhci, 3 runs each, this 8 GB host; run 2 on an idle host is the record)
| page | mobile perf (median, range) | mobile LCP | mobile TBT | desktop perf / LCP |
|---|---|---|---|---|
| `/` | **83** (81–90) | 2228 ms | ~600 ms | 100 / 564 ms |
| `/work/teachspark` | **89** (86–94) | **3471 ms** | ~90 ms | 100 / 475 ms |

Run 1 (discarded as host-starved: one sample had TBT 10.8 s): `/` 85 median, LCP 2586 ms; teachspark 94, LCP 2513 ms.

**Verdict:** TASK-88's bar (mobile perf ≥ 90 and LCP ≤ 2.5 s on `/` and `/work/teachspark`) is **not met**. Baseline at `2bd4949` was `/` 95 / 2338 ms, teachspark 98 / 2274 ms. `/` loses on TBT (one app chunk ≈ 490 ms scripting on mobile); teachspark on LCP (hero image load delay). Follow-up: TKT-92 round 4.
