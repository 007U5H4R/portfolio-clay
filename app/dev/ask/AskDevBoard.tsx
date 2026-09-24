"use client";

/**
 * AskDevBoard (technical-plan.md §B S10.05) — the client half of the QA-only `/dev/ask` fixture. It
 * mounts `AskProvider` + `AskPortfolio` with a provider chosen by `?mode`, so every Ask state can be
 * captured deterministically for screenshots and driven by the e2e spec:
 *
 *   (default) → the real deterministic local provider, idle
 *   answer    → local provider, auto-submits a real matching prompt → an answer (with DRAFT badge)
 *   empty     → local provider, auto-submits an off-topic query → the graceful empty state
 *   slow      → local provider wrapped in a 2 s delay, auto-submits → the ≥150 ms loading skeleton
 *   error     → a provider that throws → the error state (colour never alone: icon + text + retry)
 *
 * This is dev/QA glue only (guarded by `devOnly()` in the server page); it is never part of the
 * production site. `answer`/`empty` use the real provider so the fixture shows real sourced content.
 */
import { useMemo, useSyncExternalStore } from "react";
import {
  AskError,
  createDefaultProvider,
  type Answer,
  type AnswerProvider,
  type AskContext,
} from "@/lib/ask";
import { AskProvider } from "@/components/ai/AskProvider";
import { AskPortfolio } from "@/components/ai/AskPortfolio";
import { knowledge } from "@/data/knowledge";

export type AskDevMode = "answer" | "empty" | "error" | "slow" | "default";

const MODES: AskDevMode[] = ["answer", "empty", "error", "slow", "default"];

/** Read `?mode=…` from the URL. No `change` events matter here, so the subscribe is a no-op. */
const NOOP_SUBSCRIBE = () => () => {};
function readMode(): AskDevMode {
  if (typeof window === "undefined") return "default";
  const raw = new URLSearchParams(window.location.search).get("mode");
  return raw && MODES.includes(raw as AskDevMode) ? (raw as AskDevMode) : "default";
}

class SlowProvider implements AnswerProvider {
  readonly name = "dev-slow";
  constructor(
    private readonly inner: AnswerProvider,
    private readonly ms = 2000,
  ) {}
  async ask(query: string, ctx?: AskContext): Promise<Answer> {
    await new Promise((resolve) => setTimeout(resolve, this.ms));
    return this.inner.ask(query, ctx);
  }
}

class ErrorProvider implements AnswerProvider {
  readonly name = "dev-error";
  async ask(): Promise<Answer> {
    throw new AskError("dev harness forced error");
  }
}

const HOME_PROMPTS = knowledge
  .filter((entry) => entry.surface.includes("home"))
  .map((entry) => entry.prompt);

const REAL_QUERY = "What products have you built?"; // exact match → an answer entry
const OFF_TOPIC_QUERY = "what is the weather in paris"; // zero canonical tokens → empty

export function AskDevBoard() {
  // Read `?mode=…` on the client (window, not `searchParams`) so the route stays static (TP1).
  // useSyncExternalStore renders "default" on the server, then the real mode once mounted — the
  // codebase's established no-hydration-mismatch pattern (cf. lib/motion.ts).
  const mode = useSyncExternalStore(NOOP_SUBSCRIBE, readMode, () => "default");

  const provider = useMemo<AnswerProvider>(() => {
    switch (mode) {
      case "error":
        return new ErrorProvider();
      case "slow":
        return new SlowProvider(createDefaultProvider());
      default:
        return createDefaultProvider();
    }
  }, [mode]);

  const autoSubmit =
    mode === "answer" || mode === "slow" || mode === "error"
      ? REAL_QUERY
      : mode === "empty"
        ? OFF_TOPIC_QUERY
        : undefined;

  return (
    <main className="min-h-screen bg-paper px-[var(--gutter-mobile)] py-[var(--space-9)] text-navy md:px-[var(--gutter-tablet)]">
      <header className="mb-[var(--space-8)]">
        <p className="text-caption uppercase tracking-[var(--tracking-eyebrow)] text-ink-soft">
          Dev board · QA only
        </p>
        <h1 className="text-h2">Ask states · mode={mode}</h1>
      </header>
      <AskProvider provider={provider}>
        <AskPortfolio prompts={HOME_PROMPTS} autoSubmit={autoSubmit} />
      </AskProvider>
    </main>
  );
}
