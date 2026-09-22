import { existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";

/**
 * Scratch root for test temp trees (CR-004, Stage 9).
 *
 * Locally this MUST stay on the E Drive (machine constraint — the internal disk once hit ENOSPC
 * mid-test-run and surfaced as a different flaky test every time), but the previously hard-coded
 * `/Volumes/E Drive/...` path fails with EACCES at module load on any Linux CI runner — one reason
 * CI has never produced a green run. Resolution order:
 *   1. an explicit `TMPDIR` (`.env.tooling` points it at the E Drive for `pnpm eval` / `test:e2e`),
 *   2. the E Drive scratch dir when that volume is mounted (this machine, plain `pnpm test`),
 *   3. the OS temp dir (CI / any other machine).
 */
export function scratchDir(): string {
  const eDrive = "/Volumes/E Drive/Dev/.scratch";
  const dir = process.env.TMPDIR?.trim() || (existsSync("/Volumes/E Drive") ? eDrive : tmpdir());
  mkdirSync(dir, { recursive: true });
  return dir;
}
