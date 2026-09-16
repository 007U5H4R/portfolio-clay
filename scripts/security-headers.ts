/**
 * security-headers.ts (technical-plan.md §B S12.01, §A11 TP9, EVAL-016) — verify the TP9 security
 * header set is present on responses from a deployed origin.
 *
 * The headers are configured in `next.config.ts` `headers()` at TKT-50 and only exist on a real
 * deployment (or `next start` once that config lands), so this check is meaningful only with an
 * explicit origin: `scripts/eval.ts` runs it as part of EVAL-016 ONLY when `--base-url` is given,
 * and marks the header sub-check SKIP otherwise (never a silent pass).
 *
 * Usage: tsx scripts/security-headers.ts --base-url https://preview.example
 *   exit 0 = all present · 1 = one or more missing · 2 = fetch error / no --base-url
 */
export const REQUIRED_HEADERS = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "x-frame-options",
] as const;

export interface HeaderCheck {
  ok: boolean;
  present: string[];
  missing: string[];
  status: number | null;
  error?: string;
}

/** Fetch the origin and report which TP9 headers are present. Pure enough to unit-test with a mock. */
export async function checkHeaders(
  baseUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<HeaderCheck> {
  try {
    const res = await fetchImpl(baseUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    const present: string[] = [];
    const missing: string[] = [];
    for (const h of REQUIRED_HEADERS) {
      if (res.headers.get(h)) present.push(h);
      else missing.push(h);
    }
    return { ok: missing.length === 0, present, missing, status: res.status };
  } catch (err) {
    return { ok: false, present: [], missing: [...REQUIRED_HEADERS], status: null, error: (err as Error).message };
  }
}

function flag(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}

async function main(): Promise<void> {
  const baseUrl = flag("--base-url");
  if (!baseUrl) {
    console.log("[security-headers] SKIP — no --base-url given (headers exist only on a deployment, TKT-50)");
    process.exit(2);
  }
  const r = await checkHeaders(baseUrl);
  if (r.error) {
    console.error(`[security-headers] fetch error: ${r.error}`);
    process.exit(2);
  }
  console.log(`[security-headers] ${baseUrl} (HTTP ${r.status}) — present: ${r.present.join(", ") || "none"}`);
  if (r.missing.length) console.error(`[security-headers] MISSING: ${r.missing.join(", ")}`);
  process.exit(r.ok ? 0 : 1);
}

import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const invokedDirectly = !!process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) void main();
