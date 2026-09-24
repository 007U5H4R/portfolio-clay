/**
 * eval-018-lib.ts (technical-plan.md §F2 "EVAL-018 implementation", S70.10) — the in-page collector
 * for the decoration contract (Design.md §3.2) plus the parked-list matching (decision TP12).
 *
 * `collectDecorations` runs inside `page.evaluate`, so it must be **self-contained**: no closure over
 * module scope (Playwright serialises the function source and ships it to the browser). Every
 * constant it needs (`RULE_LIMITS`) is passed in as its argument. The §3.4 word/digit rules are
 * duplicated from `components/paper/Hand.tsx` for the same reason — that file enforces them at
 * render in dev/test; this one re-measures them in the built page.
 *
 * Counting contract (Design.md §3.2, decision D6):
 *   units      = the page `<header>`, every `<section>`, the page `<footer>`
 *   ownership  = `el.closest("section, header, footer")` — nearest ancestor, so a nested chapter
 *                section owns its decorations and the enclosing section does not re-count them
 *   budget     = ≤ 4 `[data-decor]` per unit (rule 3)
 *   caveat     = every p/h1–h6/li/td/th/dt/dd whose computed font-family resolves to Caveat must be
 *                inside `[data-decor]` / `[aria-hidden="true"]`, or carry a valid `data-hand`
 *                exemption within its §3.4 limit (rule 5)
 *   flat       = `[data-flat] [data-decor]` is empty (rule 4)
 *   hidden     = sticky / annotation / note, and a sketch with text, are `aria-hidden="true"` (rule 6)
 */

export type Rule = "budget" | "caveat" | "flat" | "hidden";

export const RULES: readonly Rule[] = ["budget", "caveat", "flat", "hidden"];

/** Thresholds the collector applies (Design.md §3.2 rule 3, §3.4). Never lowered to make a run green. */
export const RULE_LIMITS = {
  maxDecorPerUnit: 4,
  quoteChars: 240,
  ctaWords: 6,
  labelWords: 3,
} as const;

export type RuleLimits = typeof RULE_LIMITS;

export interface Violation {
  rule: Rule;
  /** Stable unit label — `section#id`, `section[aria-labelledby="…"]`, `section:nth(n)`, `header`, `footer`. */
  unit: string;
  detail: string;
}

/** One row of the per-unit table pushed into the Playwright annotations (TC-127 step 5). */
export interface UnitRow {
  unit: string;
  count: number;
  /** The `data-decor` values counted in this unit, in DOM order. */
  decor: string[];
  caveatViolations: number;
  flatViolations: number;
  hiddenViolations: number;
}

export interface CollectResult {
  units: UnitRow[];
  violations: Violation[];
}

/**
 * The collector. Runs in the page. Self-contained on purpose — see the file comment.
 */
export function collectDecorations(limits: RuleLimits): CollectResult {
  const UNIT_SELECTOR = "section, header, footer";
  const TEXT_SELECTOR = "p, h1, h2, h3, h4, h5, h6, li, td, th, dt, dd";
  const HAND_KINDS = new Set(["quote", "cta", "label"]);

  // ---- units -----------------------------------------------------------------------------------
  const sections = Array.from(document.querySelectorAll("section"));
  const pageHeader = Array.from(document.querySelectorAll("header")).find((h) => !h.closest("section, footer, main")) ?? null;
  const pageFooter = Array.from(document.querySelectorAll("footer")).find((f) => !f.closest("section, header, main")) ?? null;

  const unitEls: Element[] = [];
  if (pageHeader) unitEls.push(pageHeader);
  unitEls.push(...sections);
  if (pageFooter) unitEls.push(pageFooter);
  const unitSet = new Set<Element>(unitEls);

  const labelOf = (el: Element | null): string => {
    if (!el) return "(none)";
    const tag = el.tagName.toLowerCase();
    if (el === pageHeader) return "header";
    if (el === pageFooter) return "footer";
    if (el.id) return `${tag}#${el.id}`;
    const labelled = el.getAttribute("aria-labelledby");
    if (labelled) return `${tag}[aria-labelledby="${labelled}"]`;
    const idx = sections.indexOf(el as HTMLElement);
    return idx >= 0 ? `${tag}:nth(${idx + 1})` : tag;
  };

  /** Nearest ancestor unit (rule 1). A `<header>`/`<footer>` nested in a section is not a unit: climb past it. */
  const ownerOf = (el: Element): Element | null => {
    let cur: Element | null = el.closest(UNIT_SELECTOR);
    while (cur && !unitSet.has(cur)) {
      cur = cur.parentElement ? cur.parentElement.closest(UNIT_SELECTOR) : null;
    }
    return cur;
  };

  const rows = new Map<string, UnitRow>();
  const rowFor = (el: Element | null): UnitRow => {
    const unit = labelOf(el);
    let row = rows.get(unit);
    if (!row) {
      row = { unit, count: 0, decor: [], caveatViolations: 0, flatViolations: 0, hiddenViolations: 0 };
      rows.set(unit, row);
    }
    return row;
  };
  for (const u of unitEls) rowFor(u);

  const violations: Violation[] = [];
  const describe = (el: Element): string => {
    const tag = el.tagName.toLowerCase();
    const decor = el.getAttribute("data-decor");
    const text = (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
    return `<${tag}${decor ? ` data-decor="${decor}"` : ""}>${text ? ` "${text}"` : ""}`;
  };

  // ---- rule 2/3 · count + budget -----------------------------------------------------------------
  const decorEls = Array.from(document.querySelectorAll("[data-decor]"));
  for (const el of decorEls) {
    const row = rowFor(ownerOf(el));
    row.count += 1;
    row.decor.push(el.getAttribute("data-decor") ?? "");
  }
  for (const row of rows.values()) {
    if (row.count > limits.maxDecorPerUnit) {
      violations.push({
        rule: "budget",
        unit: row.unit,
        detail: `${row.count} decorations (limit ${limits.maxDecorPerUnit}): ${row.decor.join(", ")}`,
      });
    }
  }

  // ---- rule 5 · Caveat -----------------------------------------------------------------------------
  const words = (text: string): string[] => text.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t));
  const hasCite = (hand: Element): boolean => {
    if (hand.querySelector("cite")) return true;
    const sib = hand.nextElementSibling;
    if (sib && (sib.tagName.toLowerCase() === "cite" || /^\s*Source:/.test(sib.textContent ?? ""))) return true;
    const scope = hand.closest("[data-paper], blockquote") ?? hand.parentElement;
    if (!scope) return false;
    if (scope.querySelector("cite")) return true;
    return Array.from(scope.children).some((c) => c !== hand && /^\s*Source:/.test(c.textContent ?? ""));
  };
  const handProblem = (hand: Element, kind: string): string | null => {
    const text = (hand.textContent ?? "").trim();
    if (kind === "quote") {
      if (text.length > limits.quoteChars) return `quote is ${text.length} chars (limit ${limits.quoteChars})`;
      if (!hasCite(hand)) return "quote has no cite / Source: sibling";
      return null;
    }
    const w = words(text);
    if (kind === "cta") return w.length > limits.ctaWords ? `cta is ${w.length} words (limit ${limits.ctaWords})` : null;
    if (w.length > limits.labelWords) return `label is ${w.length} words (limit ${limits.labelWords})`;
    const bad = w.filter((t) => /\d/.test(t) && !/^\d{2}$/.test(t));
    return bad.length > 0 ? `label has digits other than a 2-digit numeral: "${bad.join(" ")}"` : null;
  };

  for (const el of Array.from(document.querySelectorAll(TEXT_SELECTOR))) {
    if (!/Caveat/i.test(getComputedStyle(el).fontFamily)) continue;
    if (el.closest('[data-decor], [aria-hidden="true"]')) continue;
    const hand = el.closest("[data-hand]");
    const kind = hand?.getAttribute("data-hand") ?? "";
    let detail: string | null;
    if (!hand || !HAND_KINDS.has(kind)) {
      detail = `Caveat ${describe(el)} outside [data-decor]/aria-hidden with no valid data-hand${kind ? ` (data-hand="${kind}")` : ""}`;
    } else {
      const problem = handProblem(hand, kind);
      detail = problem ? `data-hand="${kind}" ${describe(el)}: ${problem}` : null;
    }
    if (detail) {
      const row = rowFor(ownerOf(el));
      row.caveatViolations += 1;
      violations.push({ rule: "caveat", unit: row.unit, detail });
    }
  }

  // ---- rule 4 · flat zones -------------------------------------------------------------------------
  for (const el of Array.from(document.querySelectorAll("[data-flat] [data-decor]"))) {
    const row = rowFor(ownerOf(el));
    row.flatViolations += 1;
    violations.push({ rule: "flat", unit: row.unit, detail: `${describe(el)} inside [data-flat]` });
  }

  // ---- rule 6 · hidden text decorations ------------------------------------------------------------
  for (const el of decorEls) {
    const kind = el.getAttribute("data-decor");
    const textBearing =
      kind === "sticky" || kind === "annotation" || kind === "note" || (kind === "sketch" && (el.textContent ?? "").trim() !== "");
    if (!textBearing) continue;
    if (el.getAttribute("aria-hidden") === "true") continue;
    const row = rowFor(ownerOf(el));
    row.hiddenViolations += 1;
    violations.push({ rule: "hidden", unit: row.unit, detail: `${describe(el)} is not aria-hidden="true"` });
  }

  return { units: Array.from(rows.values()), violations };
}

// ---------------------------------------------------------------------------- parked list (TP12)

export interface ParkedEntry {
  route: string;
  unit: string;
  rule: Rule;
  reason: string;
  ticket: string;
}

/** Routes that never carry a parked entry (TP12). */
export const NEVER_PARKED: readonly string[] = ["/", "/dev/primitives"];

export interface ParkedOutcome {
  /** Hits matched by a parked entry — the test passes with a `PARKED` annotation. */
  parked: { violation: Violation; entry: ParkedEntry }[];
  /** Hits no entry covers — the test fails. */
  unparked: Violation[];
  /** Entries for this route that matched nothing — stale, the test fails (stale-park guard). */
  stale: ParkedEntry[];
}

/** Split a route's violations against the parked list (route + unit + rule must all match). */
export function applyParked(route: string, violations: Violation[], parked: readonly ParkedEntry[]): ParkedOutcome {
  const forRoute = parked.filter((e) => e.route === route);
  const used = new Set<ParkedEntry>();
  const out: ParkedOutcome = { parked: [], unparked: [], stale: [] };
  for (const v of violations) {
    const entry = forRoute.find((e) => e.unit === v.unit && e.rule === v.rule);
    if (entry) {
      used.add(entry);
      out.parked.push({ violation: v, entry });
    } else {
      out.unparked.push(v);
    }
  }
  out.stale = forRoute.filter((e) => !used.has(e));
  return out;
}
