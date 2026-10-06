/**
 * Where the secret trigger fired and how the lab was entered (gummy-bear.md §10). sessionStorage
 * only, every access guarded: private windows and blocked storage fall back to "/" and a plain push.
 */
export const RETURN_KEY = "gummy-lab:return";
export const ENTERED_KEY = "gummy-lab:entered";
export const LAB_PATH = "/lab";

/** A same-origin, in-app path that is not the lab itself; anything else collapses to "/". */
export function safeReturnRoute(value: string | null | undefined): string {
  // Tab/CR/LF are stripped by URL parsing, so "/\t/evil.example" would resolve off-origin.
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\t\n\r]/.test(value)) return "/";
  const path = value.split(/[?#]/)[0] ?? "/";
  return path === LAB_PATH || path.startsWith(`${LAB_PATH}/`) ? "/" : value;
}

function store(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function rememberEntry(pathname: string) {
  const s = store();
  try {
    s?.setItem(RETURN_KEY, safeReturnRoute(pathname));
    s?.setItem(ENTERED_KEY, "1");
  } catch {
    /* blocked storage: the default fallback applies */
  }
}

export function readReturnRoute(): string {
  try {
    return safeReturnRoute(store()?.getItem(RETURN_KEY));
  } catch {
    return "/";
  }
}

export function enteredFromPortfolio(): boolean {
  try {
    return store()?.getItem(ENTERED_KEY) === "1";
  } catch {
    return false;
  }
}

/** The same-origin page that loaded this document (the trigger's hard navigation sets it), if it is not the lab. */
function portfolioReferrer(): boolean {
  try {
    if (!document.referrer) return false;
    const ref = new URL(document.referrer);
    return ref.origin === window.location.origin && ref.pathname !== LAB_PATH;
  } catch {
    return false;
  }
}

/**
 * Leaving by history (`back()`) is right only when this lab was entered from a portfolio page in this
 * tab — the previous entry is then that page, scroll position included. A direct visit, or a reload
 * after navigating elsewhere, has no such entry and returns to the stored route / home instead.
 */
export function canGoBackToPortfolio(): boolean {
  return enteredFromPortfolio() && window.history.length > 1 && portfolioReferrer();
}
