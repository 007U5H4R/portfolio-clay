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

/**
 * TKT-113 (Home "Ask Tushky" launcher, spec §11 / §24): a question handed to the drawer as it opens.
 * The drawer asks it once as its first turn — `label` is the user bubble, `query` goes to the index.
 * `id` is unique per open, so the drawer consumes each hand-off exactly once.
 */
export interface PendingAsk {
  id: number;
  label: string;
  query: string;
}

export interface OpenPanelOptions {
  /** Ask this as the drawer's first turn (the Home launcher's typed text or a suggestion card). */
  query?: string | undefined;
  /** What the user bubble shows; defaults to `query`. */
  label?: string | undefined;
  /** Where focus returns when the drawer closes. Omit to keep whatever `triggerRef` already holds. */
  trigger?: HTMLElement | null | undefined;
}

interface AskContextValue {
  provider: AnswerProvider;
  panelOpen: boolean;
  /** Open the drawer; with `query`, it is submitted as soon as the drawer opens (TKT-113). */
  openPanel: (options?: OpenPanelOptions) => void;
  closePanel: () => void;
  /** Whichever control opened the panel (header ghost, Home launcher), so focus can
   *  return to it when the panel closes (EVAL-007). */
  triggerRef: RefObject<HTMLElement | null>;
  /** The question waiting for the drawer to ask it, or `null`. Read and cleared by `AskPanel`. */
  pendingAsk: PendingAsk | null;
  clearPendingAsk: (id: number) => void;
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
  /**
   * TASK-123: ids of the FAQ-cache entries whose answers still match the current data, computed at
   * build time in app/layout.tsx (`lib/ask/faq-versions.ts`) and forwarded to the lazy drawer. Omitted
   * (the `/dev/ask` harness) means no cached answer is served — the cache fails closed.
   */
  faqFreshIds?: readonly string[] | undefined;
}

const NO_FRESH_FAQ: readonly string[] = [];

export function AskProvider({ children, provider, panelPrompts = [], faqFreshIds = NO_FRESH_FAQ }: AskProviderProps) {
  const resolvedProvider = useMemo(() => provider ?? createDefaultProvider(), [provider]);
  const [panelOpen, setPanelOpen] = useState(false);
  // Once the panel has been opened, keep it mounted (state + a warm chunk) so re-opening is instant.
  // Gating the mount on this flag is what keeps the AskPanel chunk out of `/` first-load (EVAL-005).
  const [everOpened, setEverOpened] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [pendingAsk, setPendingAsk] = useState<PendingAsk | null>(null);
  const pendingId = useRef(0);

  const openPanel = useCallback((options?: OpenPanelOptions) => {
    if (options?.trigger !== undefined) triggerRef.current = options.trigger;
    const query = options?.query?.trim() ?? "";
    if (query) {
      const label = options?.label?.trim() || query;
      setPendingAsk({ id: ++pendingId.current, label, query });
    }
    setEverOpened(true);
    setPanelOpen(true);
  }, []);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const clearPendingAsk = useCallback(
    (id: number) => setPendingAsk((current) => (current?.id === id ? null : current)),
    [],
  );

  const value = useMemo<AskContextValue>(
    () => ({ provider: resolvedProvider, panelOpen, openPanel, closePanel, triggerRef, pendingAsk, clearPendingAsk }),
    [resolvedProvider, panelOpen, openPanel, closePanel, pendingAsk, clearPendingAsk],
  );

  return (
    <AskContext.Provider value={value}>
      {children}
      {everOpened ? <AskPanelLazy panelPrompts={panelPrompts} faqFreshIds={faqFreshIds} /> : null}
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
      } catch (err) {
        // The local provider never throws (it degrades to `empty`); a network-backed provider can.
        // The visible error state IS the user-facing signal (A13) — the query is never echoed — but
        // a failed provider call must never be *silent* to operators either (SF-6 / A12): log it
        // before the supersession check so a superseded-but-failed call still leaves a trace.
        console.error("[ask] provider failed", err);
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

/**
 * TKT-104 r2 (Ask Tushky drawer, spec §16 / §25, Design.md §11 Dev-60): a multi-turn conversation
 * over the SAME provider and rules as `useAsk`. The retrieval-only local index answers every turn.
 * Answers are the provider's verbatim text, there is a ≥ 150 ms skeleton floor, a provider failure
 * is logged and becomes an `error` turn with a retry, and `reset()` invalidates every in-flight
 * turn. The user's words are kept as plain strings and render as React text nodes, never as HTML.
 */
export type ChatTurn =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "tushky"; status: "loading" | "answer" | "empty" | "error"; query: string; answer: Answer | null };

export interface UseAskChat {
  messages: ChatTurn[];
  isGenerating: boolean;
  /** Ask `query` (defaults to `label`); the user bubble shows `label`. */
  ask: (label: string, query?: string) => void;
  /** Re-run a failed Tushky turn in place. */
  retry: (turnId: number) => void;
  reset: () => void;
}

/**
 * TASK-123 (FAQ-cache spec §57): a curated FAQ answer renders at once — no skeleton floor, no fake
 * typing. Every other answer keeps the ≥ 150 ms floor so a fast local resolve never flashes.
 */
const isCacheHit = (answer: Answer): boolean => answer.kind === "answer" && answer.sourceType === "faq-cache";

/**
 * `provider` overrides the context's provider: the drawer passes the FAQ cache, which wraps it. Each
 * turn is asked with the conversation's earlier questions (`history`, §55–56).
 */
export function useAskChat(providerOverride?: AnswerProvider): UseAskChat {
  const { provider: contextProvider } = useAskContext();
  const provider = providerOverride ?? contextProvider;
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const nextId = useRef(0);
  // Bumped by reset(): a turn started in an older conversation never writes into the new one.
  const epoch = useRef(0);
  // Every question asked in this conversation, oldest first (the history each new turn is asked with).
  const asked = useRef<string[]>([]);

  const resolve = useCallback(
    async (turnId: number, query: string, history: readonly string[]) => {
      const started = epoch.current;
      const update = (patch: Partial<Extract<ChatTurn, { role: "tushky" }>>) => {
        if (started !== epoch.current) return;
        setMessages((all) => all.map((m) => (m.id === turnId && m.role === "tushky" ? { ...m, ...patch } : m)));
      };
      update({ status: "loading", answer: null });
      try {
        const floor = delay(SKELETON_FLOOR_MS);
        const answer = await provider.ask(query, { surface: "panel", history });
        if (!isCacheHit(answer)) await floor;
        update({ status: answer.kind === "answer" ? "answer" : "empty", answer });
      } catch (err) {
        console.error("[ask] provider failed", err); // never silent (SF-6 / A12)
        update({ status: "error", answer: null });
      }
    },
    [provider],
  );

  const ask = useCallback(
    (label: string, query?: string) => {
      const text = label.trim();
      const q = (query ?? label).trim();
      if (!text || !q) return;
      const userId = ++nextId.current;
      const turnId = ++nextId.current;
      const history = [...asked.current];
      asked.current.push(q);
      setMessages((all) => [
        ...all,
        { id: userId, role: "user", text },
        { id: turnId, role: "tushky", status: "loading", query: q, answer: null },
      ]);
      void resolve(turnId, q, history);
    },
    [resolve],
  );

  const retry = useCallback(
    (turnId: number) => {
      const turn = messages.find((m) => m.id === turnId);
      if (turn?.role !== "tushky") return;
      // The questions asked before this turn, in order.
      const history = messages.flatMap((m) => (m.role === "tushky" && m.id < turnId ? [m.query] : []));
      void resolve(turnId, turn.query, history);
    },
    [messages, resolve],
  );

  const reset = useCallback(() => {
    epoch.current++;
    asked.current = [];
    setMessages([]);
  }, []);

  const isGenerating = messages.some((m) => m.role === "tushky" && m.status === "loading");
  return { messages, isGenerating, ask, retry, reset };
}
