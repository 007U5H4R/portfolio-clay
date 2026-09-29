"use client";

/**
 * TushkyVoicePlayer + TushkyVoiceProvider (TASK-134, Tushar's voice UI spec §2–13, §21–27, §30–46;
 * voice spec §19–24, §50–52, §57–58, §60–67; mockup `tushky-voice-ui-reference.jpg`).
 *
 * The compact paper strip under each Tushky answer: a terracotta play disc, a label, a small bar
 * waveform that fills with playback progress, the time, and Replay. States: idle → loading →
 * playing ⇄ paused → ended, plus error ("Couldn't find my voice this time 🐾" + Try again) and
 * resting (the quota state: no retry button, spec §58). Listen is always a click (§23); the text
 * answer never waits for audio (§25).
 *
 * The strip is ONE set of native buttons whose accessible names say what they do ("Listen to
 * Tushky's answer", "Pause Tushky", "Resume Tushky", "Replay Tushky's answer"); the waveform and the
 * clock are `aria-hidden` so the conversation's live log never reads progress ticks (UI §35). The
 * main control stays the same element across states, so keyboard focus survives Listen → Pause →
 * Resume → Replay; when a state removes the focused control, focus moves to the new one.
 *
 * Imported only by the drawer (`AskPanel` → `AskTushky`), so it ships in the lazy drawer chunk and
 * never in `/` first-load JS (EVAL-005).
 */
import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type FocusEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Icon } from "@/components/common/Icon";
import { hashText } from "@/lib/tushky-voice/hash";
import { toSpeechText } from "@/lib/tushky-voice/speech-text";
import { TushkyAudioManager, type VoiceEntry, type VoiceEventSink } from "./audio-manager";

/* ------------------------------------------------------------------ provider */

const VoiceContext = createContext<TushkyAudioManager | null>(null);

/** Vercel Analytics, the site's analytics (no Mixpanel): event names + bucketed properties only (§60, UI §49). */
const trackVoice: VoiceEventSink = (name, props) => {
  try {
    track(`Tushky Voice ${name}`, props);
  } catch {
    // analytics never breaks playback
  }
};

export function TushkyVoiceProvider({ open, children }: { open: boolean; children: ReactNode }) {
  const [manager] = useState(() => new TushkyAudioManager({ onEvent: trackVoice }));
  const pathname = usePathname();

  // Drawer closed → stop and forget everything (§50, UI §26). Reopening never resumes.
  useEffect(() => {
    if (!open) manager.releaseAll();
  }, [open, manager]);

  // Route change → pause (§51, UI §27). The first run (mount) has nothing playing.
  useEffect(() => {
    manager.pauseActive();
  }, [pathname, manager]);

  useEffect(() => () => manager.dispose(), [manager]);

  return <VoiceContext.Provider value={manager}>{children}</VoiceContext.Provider>;
}

function useManager(): TushkyAudioManager | null {
  return useContext(VoiceContext);
}

const IDLE_SNAPSHOT: VoiceEntry = { status: "idle", slow: false, position: 0, duration: undefined, loadingLine: "" };
const noopSubscribe = () => () => {};

/** One message's playback state (for the player and the avatar's speaking cue). */
export function useVoiceEntry(messageId: string): VoiceEntry {
  const manager = useManager();
  return useSyncExternalStore(
    manager?.subscribe ?? noopSubscribe,
    () => manager?.get(messageId) ?? IDLE_SNAPSHOT,
    () => IDLE_SNAPSHOT,
  );
}

/* ------------------------------------------------------------------ pieces */

const clock = (seconds: number | undefined): string => {
  if (seconds === undefined || !Number.isFinite(seconds)) return "";
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const BARS = 26;

/** Deterministic bar heights (35–100 %) seeded by the answer, so each answer has its own quiet shape. */
function barHeights(seed: string): number[] {
  let x = parseInt(seed.slice(0, 8), 16) || 1;
  return Array.from({ length: BARS }, (_, i) => {
    x = (Math.imul(x, 1103515245) + 12345) >>> 0;
    const envelope = 0.55 + 0.45 * Math.sin((Math.PI * (i + 0.5)) / BARS);
    return Math.round(35 + 65 * envelope * (0.45 + 0.55 * ((x >>> 16) / 65535)));
  });
}

function Waveform({ seed, progress }: { seed: string; progress: number }) {
  const heights = useMemo(() => barHeights(seed), [seed]);
  const head = Math.floor(progress * BARS);
  return (
    <span aria-hidden="true" className="tk-voice-wave">
      {heights.map((h, i) => (
        <span
          key={i}
          className="tk-voice-bar"
          style={{ height: `${h}%` }}
          data-on={i < head ? "" : undefined}
          data-head={i === head - 1 ? "" : undefined}
        />
      ))}
    </span>
  );
}

function Spinner() {
  return (
    <span aria-hidden="true" className="tk-voice-spinner">
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} style={{ transform: `rotate(${i * 45}deg) translateY(-9px)` }} />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ the player */

export interface TushkyVoicePlayerProps {
  /** The drawer's turn id. */
  messageId: string;
  /** The question as sent to the answer pipeline — what the route recomputes from. */
  question: string;
  /** The answer text on screen (displayText). */
  answerText: string;
  /** Set when the answer came from the FAQ cache. */
  faqId?: string | undefined;
  /** A fresh pre-generated FAQ clip (lib/tushky-voice/faq-audio.ts). */
  cachedAudioUrl?: string | undefined;
  cachedDurationMs?: number | undefined;
}

const wordBucket = (words: number) => (words < 50 ? "<50" : words < 100 ? "50-99" : words < 150 ? "100-149" : "150+");

export function TushkyVoicePlayer({ messageId, question, answerText, faqId, cachedAudioUrl, cachedDurationMs }: TushkyVoicePlayerProps) {
  const manager = useManager();
  const entry = useVoiceEntry(messageId);
  const { isSummary, answerHash, words } = useMemo(
    () => ({
      isSummary: toSpeechText(answerText).isSummary,
      answerHash: hashText(answerText),
      words: answerText.split(/\s+/).filter(Boolean).length,
    }),
    [answerText],
  );
  const stripRef = useRef<HTMLDivElement>(null);
  const focusInside = useRef(false);

  const { status, slow, position, loadingLine } = entry;
  const duration = entry.duration ?? (cachedDurationMs ? cachedDurationMs / 1000 : undefined);
  // Loading shows the idle look (pressed) for its first 150 ms, so cached audio goes straight to Playing (UI §21).
  const view = status === "loading" && !slow ? "pending" : status;

  // Keep keyboard focus in the strip when a state swaps the focused control out (error / resting).
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !focusInside.current || strip.contains(document.activeElement)) return;
    const target = strip.querySelector<HTMLElement>("button:not([aria-disabled='true'])") ?? strip;
    target.focus();
  }, [view]);

  if (!manager) return null;

  const listen = () =>
    manager.listen(messageId, {
      body: { question, messageId, answerHash, ...(faqId ? { faqId } : {}) },
      cachedUrl: cachedAudioUrl,
      cachedDurationMs,
      analytics: { message_type: faqId ? "faq" : "generated", answer_length_bucket: wordBucket(words) },
    });

  const focusProps = {
    ref: stripRef,
    onFocus: () => {
      focusInside.current = true;
    },
    onBlur: (event: FocusEvent<HTMLDivElement>) => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) focusInside.current = false;
    },
  };

  if (status === "error") {
    return (
      <div {...focusProps} className="tk-voice" data-state="error" role="group" aria-label="Tushky's voice">
        <p className="tk-voice-msg">
          Couldn’t find my voice this time <span aria-hidden="true">🐾</span>
        </p>
        <button type="button" className="tk-voice-retry focus-ring" onClick={() => manager.retry(messageId)}>
          <Icon icon={RotateCcw} size={20} />
          Try again
        </button>
      </div>
    );
  }

  if (status === "resting") {
    return (
      <div {...focusProps} tabIndex={-1} className="tk-voice" data-state="resting" role="group" aria-label="Tushky's voice">
        <p className="tk-voice-msg" role="status">
          Voice is resting for a bit. The text answer is still here.
        </p>
      </div>
    );
  }

  const playing = status === "playing";
  const showLoading = view === "loading";
  const mainLabel =
    status === "playing"
      ? "Pause Tushky"
      : status === "paused"
        ? "Resume Tushky"
        : status === "ended"
          ? "Replay Tushky's answer"
          : isSummary
            ? "Listen to a summary of Tushky's answer"
            : "Listen to Tushky's answer";
  const [longText, shortText] =
    status === "playing"
      ? ["Pause", ""]
      : status === "paused"
        ? ["Resume", ""]
        : status === "ended"
          ? ["Replay", ""]
          : showLoading
            ? [loadingLine, loadingLine]
            : isSummary
              ? ["Listen to summary", "Summary"]
              : ["Listen to this answer", "Listen"];
  const progress = status === "ended" ? 1 : duration ? Math.min(1, position / duration) : 0;
  const started = status === "playing" || status === "paused";
  const time = started ? `${clock(position)} / ${clock(duration) || "–:––"}` : clock(duration);

  return (
    <div
      {...focusProps}
      className="tk-voice"
      data-state={view}
      data-summary={isSummary ? "" : undefined}
      role="group"
      aria-label="Tushky's voice"
    >
      <button
        type="button"
        className="tk-voice-main focus-ring"
        aria-label={mainLabel}
        aria-disabled={status === "loading" ? "true" : undefined}
        title={status === "idle" ? "Listen to Tushky" : undefined}
        onClick={() => {
          if (status === "loading") return;
          if (playing) manager.pause(messageId);
          else listen();
        }}
      >
        <span aria-hidden="true" className="tk-voice-disc">
          {showLoading ? <Spinner /> : <Icon icon={playing ? Pause : status === "ended" ? RotateCcw : Play} size={20} className="tk-voice-icon" />}
        </span>
        <span aria-hidden="true" className="tk-voice-label">
          <span className="tk-voice-label-long">{longText}</span>
          {shortText ? <span className="tk-voice-label-short">{shortText}</span> : null}
        </span>
      </button>
      {showLoading ? (
        <span role="status" className="sr-only">
          {loadingLine}
        </span>
      ) : null}
      <Waveform seed={answerHash} progress={progress} />
      <span aria-hidden="true" className="tk-voice-time">
        {time}
      </span>
      {started ? (
        <button type="button" className="tk-voice-replay focus-ring" aria-label="Replay Tushky's answer" onClick={() => manager.replay(messageId)}>
          <Icon icon={RotateCcw} size={20} />
          <span aria-hidden="true" className="tk-voice-replay-text">
            Replay
          </span>
        </button>
      ) : null}
    </div>
  );
}
