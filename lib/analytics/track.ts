/**
 * `track()` — the ONLY analytics call components make (TASK-194). It is part of the first-load bundle, so
 * it is deliberately tiny and holds no SDK: until the lazy runtime (runtime.ts) attaches, calls wait in a
 * short queue; with no token configured it is a plain no-op (the token is inlined at build time, so the
 * whole queue branch is dead code and is not shipped).
 */
import type { EventName, EventProps } from "./events";

type Handler = <N extends EventName>(name: N, props: EventProps<N>) => void;

const ENABLED = Boolean(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN);
const QUEUE_LIMIT = 40;

let handler: Handler | null = null;
// The loader registers this so the first event that has to wait (a click that happens before the idle
// load) asks for the runtime NOW instead of at idle — otherwise a five-click Lab entry or a quick
// outbound click could leave the page before the SDK arrived. Still after `load`, still never the LCP.
let wake: (() => void) | null = null;
let queue: Array<[EventName, unknown]> | null = ENABLED ? [] : null;

export function track<N extends EventName>(name: N, props: EventProps<N>): void {
  if (!ENABLED) return;
  try {
    if (handler) handler(name, props);
    else if (queue && queue.length < QUEUE_LIMIT) {
      queue.push([name, props]);
      wake?.();
    }
  } catch {
    /* analytics must never break the page */
  }
}

/** Registered by the loader; see `wake` above. */
export function setWake(fn: (() => void) | null): void {
  wake = fn;
}

/** Called by the runtime once gated and ready: flush what waited, then deliver live. */
export function attachHandler(next: Handler): void {
  handler = next;
  const waiting = queue ?? [];
  queue = null;
  for (const [name, props] of waiting) track(name, props as never);
}

/** Called by the runtime when analytics is switched off for this visitor: drop everything, forever. */
export function detachHandler(): void {
  handler = null;
  queue = null;
}

/** Test seam. */
export function resetTrackFacade(): void {
  handler = null;
  queue = ENABLED ? [] : null;
  currentRoute = null;
  routeListener = null;
  wake = null;
}

// ---- route seam -----------------------------------------------------------------------------------
// The loader component (which can read Next's pathname) publishes each route here; the lazy runtime
// subscribes. Keeping it a plain value + callback means the runtime needs no Next import.
let currentRoute: string | null = null;
let routeListener: ((path: string) => void) | null = null;

export function publishRoute(path: string): void {
  if (!ENABLED || path === currentRoute) return;
  currentRoute = path;
  try {
    routeListener?.(path);
  } catch {
    /* analytics must never break the page */
  }
}

/** Subscribe to route changes; the current route is delivered immediately. Returns an unsubscribe. */
export function subscribeRoute(listener: (path: string) => void): () => void {
  routeListener = listener;
  if (currentRoute !== null) listener(currentRoute);
  return () => {
    if (routeListener === listener) routeListener = null;
  };
}
