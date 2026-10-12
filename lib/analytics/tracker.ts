/**
 * The tracker core (TASK-194): validate → add nothing but the schema's own keys → hand to a sink. Pure and
 * SDK-free so it is unit-tested with a fake sink. It never throws into the UI in production; in tests it
 * can be told to throw so a bad call fails loudly.
 */
import { EVENTS, isEventName, type EventName, type EventProps } from "./events";
import { validateProps, type Schema } from "./schema";

export type SinkProps = Record<string, string | number | boolean>;

/** What the tracker needs from a destination. The Mixpanel client (client.ts) and test fakes implement it. */
export interface Sink {
  track(name: string, props: SinkProps): void;
}

export type FailureMode = "throw" | "warn" | "silent";

export interface TrackerOptions {
  sink: Sink;
  /** `throw` in tests, `warn` in development, `silent` in production. */
  onInvalid?: FailureMode;
}

export interface Tracker {
  track<N extends EventName>(name: N, props: EventProps<N>): boolean;
  /** Like `track`, but a second call with the same `key` is dropped (once per page view / run / session). */
  trackOnce<N extends EventName>(key: string, name: N, props: EventProps<N>): boolean;
  /** Forget the once-keys that start with `prefix` (a new page view or a new run). */
  resetOnce(prefix?: string): void;
}

export function createTracker({ sink, onInvalid = "silent" }: TrackerOptions): Tracker {
  const seen = new Set<string>();

  const fail = (message: string): false => {
    if (onInvalid === "throw") throw new Error(`analytics: ${message}`);
    if (onInvalid === "warn" && typeof console !== "undefined") console.warn(`[analytics] ${message}`);
    return false;
  };

  const track = <N extends EventName>(name: N, props: EventProps<N>): boolean => {
    if (!isEventName(name)) return fail(`unknown event "${String(name)}"`);
    const result = validateProps(EVENTS[name].props as Schema, props as Readonly<Record<string, unknown>>);
    if (!result.ok) return fail(`${name}: ${result.errors.join("; ")}`);
    try {
      sink.track(name, result.props);
      return true;
    } catch {
      return false; // analytics must never break the page
    }
  };

  return {
    track,
    trackOnce(key, name, props) {
      if (seen.has(key)) return false;
      seen.add(key);
      return track(name, props);
    },
    resetOnce(prefix = "") {
      for (const key of [...seen]) if (key.startsWith(prefix)) seen.delete(key);
    },
  };
}
