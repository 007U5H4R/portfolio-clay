/**
 * Per-client token bucket for the speech route (TASK-134, voice spec §53; brief §3.4).
 *
 * Each client key (the caller's IP) holds up to `burst` tokens and regains `refillPerMinute` per
 * minute; one listen costs one token. When the map would exceed `maxTrackedClients`, the
 * least-recently-seen keys are dropped, so memory stays bounded under a spray of addresses.
 *
 * LIMITATION, stated plainly: this lives in the memory of ONE server instance. On Vercel each function
 * instance has its own buckets and a cold start empties them, so the effective limit is per instance,
 * not global. It stops a single client hammering a warm instance; it is not a global quota. The
 * upgrade is a shared store (Upstash Redis / Vercel KV) or Vercel Firewall rate-limit rules, proposed
 * in docs/reports/TASK-134.md and not added here (no new infrastructure is approved).
 */
export interface RateLimitOptions {
  burst: number;
  refillPerMinute: number;
  maxTrackedClients: number;
}

export interface RateDecision {
  ok: boolean;
  /** Milliseconds until the next token, when refused. */
  retryAfterMs: number;
  remaining: number;
}

interface Bucket {
  tokens: number;
  updated: number;
}

export class TokenBucketLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly perMs: number;

  constructor(private readonly options: RateLimitOptions) {
    this.perMs = options.refillPerMinute / 60_000;
  }

  take(key: string, now: number = Date.now()): RateDecision {
    const { burst, maxTrackedClients } = this.options;
    const existing = this.buckets.get(key);
    const bucket = existing ?? { tokens: burst, updated: now };
    bucket.tokens = Math.min(burst, bucket.tokens + Math.max(0, now - bucket.updated) * this.perMs);
    bucket.updated = now;
    // Re-insert so Map order is least-recently-seen first.
    this.buckets.delete(key);
    this.buckets.set(key, bucket);
    while (this.buckets.size > maxTrackedClients) {
      const oldest = this.buckets.keys().next().value;
      if (oldest === undefined) break;
      this.buckets.delete(oldest);
    }
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return { ok: true, retryAfterMs: 0, remaining: Math.floor(bucket.tokens) };
    }
    return { ok: false, retryAfterMs: Math.ceil((1 - bucket.tokens) / this.perMs), remaining: 0 };
  }

  get size(): number {
    return this.buckets.size;
  }
}

/**
 * The caller's address for rate limiting. On Vercel, `x-real-ip` / the first `x-forwarded-for` hop is
 * set by the platform's edge. Used only as a map key: never logged, never stored elsewhere.
 */
export function clientKey(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded ? forwarded.slice(0, 64) : "unknown";
}
