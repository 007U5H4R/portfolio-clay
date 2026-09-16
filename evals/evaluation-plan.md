# Evaluation plan — pointer

The authoritative evaluation plan for portfolio-clay lives at the repository root:
[`../evaluation-plan.md`](../evaluation-plan.md).

The machine-readable case list (ids, priorities, thresholds, automation flags) is
[`./eval-cases.json`](./eval-cases.json), read and validated by `scripts/eval-cases.ts` and
consumed by the `pnpm eval` runner (`scripts/eval.ts`). One fact, one place — do not duplicate the
plan's prose here.
