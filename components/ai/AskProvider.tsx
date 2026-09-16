"use client";

/**
 * AskProvider + `useAsk` (technical-plan.md §A4 / §B S10.01, decision S7).
 *
 * `AskProvider` is the single place the app constructs the deterministic Ask provider (defaults to
 * `createDefaultProvider()`; tests inject a mock). It also carries the panel open-state seam
 * (`panelOpen` / `openPanel` / `closePanel` / `triggerRef`) that TKT-11's slide-over AskPanel will
 * consume — inert in TKT-10 (no panel is mounted yet), but declared here so the panel is a drop-in.
 *
 * `useAsk(surface)` is the shared idle → loading → answer | empty | error state machine driven by
 * the provider in context (Design.md §3 "both surfaces share useAsk"). A `Promise.all([ask, delay]`
 * skeleton floor guarantees the loading state is shown for ≥150 ms even though the local provider
 * resolves in well under a millisecond, so the UI never flashes. The provider is deterministic and
 * offline — no live LLM, no network (S7).
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createDefaultProvider, type Answer, type AnswerProvider } from "@/lib/ask";
import { AskPanelLazy } from "./AskPanelLazy";

export type AskSurface = "home" | "panel";
export type AskStatus = "idle" | "loading" | "answer" | "empty" | "error";

/** The skeleton is shown for at least this long so a sub-millisecond resolve never flashes (A4). */
export const SKELETON_FLOOR_MS = 150;

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export interface AskState {
  status: AskStatus;
  /** The last submitted query — never rendered as HTML (XSS: answers come from data only). */
  query: string;
  /** The resolved provider reply for the `answer` / `empty` states; `null` otherwise. */
  answer: Answer | null;
}

export interface UseAsk extends AskState {
  submit: (query: string) => void;
  retry: () => void;
  reset: () => void;
}

interface AskContextValue {
  provider: AnswerProvider;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  /** The header AskAIButton (TKT-11) so focus can return to it when the panel closes. */
  triggerRef: RefObject<HTMLButtonElement | null>;
}

const AskContext = createContext<AskContextValue | null>(null);

export interface AskProviderProps {
  children: ReactNode;
  /** Injected in tests / the dev harness; production uses the deterministic local provider. */
  provider?: AnswerProvider;
  /**
   * The 6 `surface:'panel'` prompts (PB3), resolved server-side in app/layout.tsx and forwarded to
   * the lazy `AskPanel`. Optional so the `/dev/ask` harness (which never opens the panel) can omit it.
   */
  panelPrompts?: string[] | undefined;
}

export function AskProvider({ children, provider, panelPrompts = [] }: AskProviderProps) {
  const resolvedProvider = useMemo(() => provider ?? createDefaultProvider(), [provider]);
  const [panelOpen, setPanelOpen] = useState(false);
  // Once the panel has been opened, keep it mounted (state + a warm chunk) so re-opening is instant.
  // Gating the mount on this flag is what keeps the AskPanel chunk out of `/` first-load (EVAL-005).
  const [everOpened, setEverOpened] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const openPanel = useCallback(() => {
    setEverOpened(true);
    setPanelOpen(true);
  }, []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  const value = useMemo<AskContextValue>(
    () => ({ provider: resolvedProvider, panelOpen, openPanel, closePanel, triggerRef }),
    [resolvedProvider, panelOpen, openPanel, closePanel],
  );

  return (
    <AskContext.Provider value={value}>
      {children}
      {everOpened ? <AskPanelLazy panelPrompts={panelPrompts} /> : null}
    </AskContext.Provider>
  );
}

export function useAskContext(): AskContextValue {
  const ctx = useContext(AskContext);
  if (!ctx) throw new Error("useAskContext must be used within <AskProvider>");
  return ctx;
}

const IDLE_STATE: AskState = { status: "idle", query: "", answer: null };

export function useAsk(surface: AskSurface): UseAsk {
  const { provider } = useAskContext();
  const [state, setState] = useState<AskState>(IDLE_STATE);

  // Monotonic run id so a superseded submit (or a reset) can never overwrite the visible state with
  // a stale resolution — last submit wins, and a reset invalidates any in-flight run.
  const runIdRef = useRef(0);
  // Latest submitted query, read by retry() without a stale closure.
  const lastQueryRef = useRef("");

  const run = useCallback(
    async (raw: string) => {
      const query = raw.trim();
      if (!query) return;
      lastQueryRef.current = query;
      const runId = ++runIdRef.current;
      setState({ status: "loading", query, answer: null });
      try {
        const [answer] = await Promise.all([
          provider.ask(query, { surface }),
          delay(SKELETON_FLOOR_MS),
        ]);
        if (runId !== runIdRef.current) return; // superseded by a newer submit / reset
        setState({ status: answer.kind === "answer" ? "answer" : "empty", query, answer });
      } catch {
        // The local provider never throws (it degrades to `empty`); a network-backed provider can.
        // The visible error state IS the observable signal (A13) — the query is never echoed.
        if (runId !== runIdRef.current) return;
        setState({ status: "error", query, answer: null });
      }
    },
    [provider, surface],
  );

  const submit = useCallback((query: string) => void run(query), [run]);
  const retry = useCallback(() => void run(lastQueryRef.current), [run]);
  const reset = useCallback(() => {
    runIdRef.current++; // invalidate any in-flight run
    lastQueryRef.current = "";
    setState(IDLE_STATE);
  }, []);

  return { ...state, submit, retry, reset };
}
