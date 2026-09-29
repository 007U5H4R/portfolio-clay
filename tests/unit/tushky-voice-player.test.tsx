import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TushkyAudioManager, type ListenRequest } from "@/components/ai/voice/audio-manager";
import { TushkyVoicePlayer, TushkyVoiceProvider } from "@/components/ai/voice/TushkyVoicePlayer";
import { hashText } from "@/lib/tushky-voice/hash";

vi.mock("next/navigation", () => ({ usePathname: () => mockPath.current }));
vi.mock("@vercel/analytics", () => ({ track: (...args: unknown[]) => tracked.push(args) }));
const mockPath = { current: "/" };
const tracked: unknown[][] = [];

/**
 * TASK-134 — the drawer's voice playback, in jsdom with a fake <audio> and a mocked fetch (no network,
 * no Google). Covers the audio manager (one at a time, pause/resume position, Replay with no second
 * request, drawer close and route change, Blob URL revocation, error and quota states) and the
 * TushkyVoicePlayer's labels and states.
 */
class FakeAudio extends EventTarget {
  static all: FakeAudio[] = [];
  src = "";
  preload = "";
  currentTime = 0;
  duration = NaN;
  paused = true;
  playCalls = 0;
  constructor() {
    super();
    FakeAudio.all.push(this);
  }
  getAttribute(name: string) {
    return name === "src" ? this.src || null : null;
  }
  removeAttribute() {
    this.src = "";
  }
  load() {}
  play() {
    this.playCalls++;
    this.paused = false;
    if (!this.src.startsWith("blob:silent")) queueMicrotask(() => this.dispatchEvent(new Event("playing")));
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  /** Test helper: the clip's metadata arrives. */
  meta(duration: number) {
    this.duration = duration;
    this.dispatchEvent(new Event("loadedmetadata"));
  }
  tick(seconds: number) {
    this.currentTime = seconds;
    this.dispatchEvent(new Event("timeupdate"));
  }
  end() {
    this.currentTime = this.duration;
    this.dispatchEvent(new Event("ended"));
  }
}

let blobCount = 0;
const revoked: string[] = [];
beforeEach(() => {
  FakeAudio.all = [];
  blobCount = 0;
  revoked.length = 0;
  tracked.length = 0;
  mockPath.current = "/";
  vi.stubGlobal("Audio", FakeAudio);
  // The first object URL is the silent unlock clip.
  URL.createObjectURL = vi.fn(() => (blobCount++ === 0 ? "blob:silent" : `blob:speech-${blobCount}`));
  URL.revokeObjectURL = vi.fn((url: string) => void revoked.push(url));
});
afterEach(() => vi.unstubAllGlobals());

const wavResponse = (source = "gemini") =>
  new Response(new Uint8Array(64), { status: 200, headers: { "content-type": "audio/wav", "x-tushky-audio-source": source } });

const request = (answer: string, question = "Who is Tushar?", cachedUrl?: string): ListenRequest => ({
  body: { question, messageId: "1", answerHash: hashText(answer) },
  cachedUrl,
  analytics: { message_type: cachedUrl ? "faq" : "generated", answer_length_bucket: "50-99" },
});

const flush = () => act(async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
});

function manager(fetchImpl = vi.fn(async () => wavResponse())) {
  const events: string[] = [];
  const m = new TushkyAudioManager({ fetch: fetchImpl as unknown as typeof fetch, onEvent: (name) => events.push(name) });
  return { m, fetchImpl, events, audio: () => FakeAudio.all[0]! };
}

describe("audio manager", () => {
  it("idle → loading → playing → paused → resumed → ended → replay, with ONE request", async () => {
    const { m, fetchImpl, events, audio } = manager();
    m.listen("1", request("answer one"));
    expect(m.get("1").status).toBe("loading");
    await flush();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body))).toEqual({
      question: "Who is Tushar?",
      messageId: "1",
      answerHash: hashText("answer one"),
    });
    expect(m.get("1").status).toBe("playing");
    audio().meta(18);
    audio().tick(8);
    expect(m.get("1")).toMatchObject({ position: 8, duration: 18 });
    m.pause("1");
    expect(m.get("1")).toMatchObject({ status: "paused", position: 8 });
    m.resume("1");
    await flush();
    expect(audio().currentTime).toBe(8); // resumes, never restarts
    expect(m.get("1").status).toBe("playing");
    audio().end();
    expect(m.get("1").status).toBe("ended");
    m.replay("1");
    await flush();
    expect(audio().currentTime).toBe(0);
    expect(m.get("1").status).toBe("playing");
    expect(fetchImpl).toHaveBeenCalledTimes(1); // Replay reuses the Blob (spec §33, UI §10)
    // "Started" carries the click-to-audio latency, so it is sent once per Listen click (§61).
    expect(events).toEqual(["Listen Clicked", "Started", "Paused", "Completed", "Replayed"]);
  });

  it("the same answer asked again in another message reuses the Blob: no second request", async () => {
    const { m, fetchImpl } = manager();
    m.listen("1", request("same answer"));
    await flush();
    m.listen("2", { ...request("same answer"), body: { ...request("same answer").body, messageId: "2" } });
    await flush();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(m.get("2").status).toBe("playing");
  });

  it("only one answer plays: starting a second pauses the first where it was", async () => {
    const { m, audio } = manager();
    m.listen("1", request("answer one"));
    await flush();
    audio().tick(5);
    m.listen("2", request("answer two", "What products has Tushar built?"));
    expect(m.get("1")).toMatchObject({ status: "paused", position: 5 });
    await flush();
    expect(m.get("2").status).toBe("playing");
    expect(m.active).toBe("2");
    // Resuming the first pauses the second.
    m.resume("1");
    await flush();
    expect(m.get("2").status).toBe("paused");
    expect(m.get("1").status).toBe("playing");
    expect(audio().currentTime).toBe(5);
  });

  it("a fresh pre-generated FAQ clip plays straight from its static URL, with no request", async () => {
    const { m, fetchImpl, audio } = manager();
    m.listen("1", request("faq answer", "Who is Tushar?", "/tushky/audio/faq/who-is-tushar-tushky-v1-abcd1234.mp3"));
    await flush();
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(audio().src).toBe("/tushky/audio/faq/who-is-tushar-tushky-v1-abcd1234.mp3");
    expect(m.get("1")).toMatchObject({ status: "playing", slow: false });
  });

  it("loading copy only appears after 150 ms (cached audio goes straight to Playing)", async () => {
    vi.useFakeTimers();
    let resolveFetch: (r: Response) => void = () => {};
    const { m } = manager(vi.fn(() => new Promise<Response>((r) => (resolveFetch = r))));
    m.listen("1", request("slow answer"));
    expect(m.get("1")).toMatchObject({ status: "loading", slow: false, loadingLine: "Finding my voice…" });
    vi.advanceTimersByTime(160);
    expect(m.get("1").slow).toBe(true);
    resolveFetch(wavResponse());
    vi.useRealTimers();
    await flush();
    expect(m.get("1").status).toBe("playing");
  });

  it("drawer close stops audio, forgets messages and revokes every Blob URL (§50, §52)", async () => {
    const { m, audio } = manager();
    m.listen("1", request("answer one"));
    await flush();
    m.listen("2", request("answer two", "q2"));
    await flush();
    m.releaseAll();
    expect(audio().paused).toBe(true);
    expect(m.get("1").status).toBe("idle");
    expect(m.get("2").status).toBe("idle");
    expect(revoked.sort()).toEqual(["blob:speech-2", "blob:speech-3"]);
  });

  it("route change pauses; nothing resumes on its own (§51)", async () => {
    const { m, audio } = manager();
    m.listen("1", request("answer one"));
    await flush();
    m.pauseActive();
    expect(m.get("1").status).toBe("paused");
    expect(audio().paused).toBe(true);
  });

  it("a server error → error state with a retry; the retry is a fresh request", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ code: "voice-unavailable" }), { status: 502 }));
    const { m, events } = manager(fetchImpl);
    m.listen("1", request("answer"));
    await flush();
    expect(m.get("1").status).toBe("error");
    expect(events).toContain("Failed");
    fetchImpl.mockImplementationOnce(async () => wavResponse());
    m.retry("1");
    await flush();
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(m.get("1").status).toBe("playing");
  });

  it("quota → resting, and pressing Listen again never retries (§58)", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ code: "voice-resting" }), { status: 503 }));
    const { m } = manager(fetchImpl);
    m.listen("1", request("answer"));
    await flush();
    expect(m.get("1").status).toBe("resting");
    m.listen("1", request("answer"));
    m.retry("1");
    await flush();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("a network failure is an error, not a crash", async () => {
    const { m } = manager(vi.fn(async () => Promise.reject(new TypeError("offline"))));
    m.listen("1", request("answer"));
    await flush();
    expect(m.get("1").status).toBe("error");
  });
});

describe("TushkyVoicePlayer", () => {
  const answer = "Tushar Pathak is a Senior Product Manager. Woof woof 🐾";
  function renderPlayer(fetchImpl = vi.fn(async () => wavResponse())) {
    vi.stubGlobal("fetch", fetchImpl);
    const ui = (open: boolean) => (
      <TushkyVoiceProvider open={open}>
        <TushkyVoicePlayer messageId="7" question="Who is Tushar?" answerText={answer} faqId="who-is-tushar" />
      </TushkyVoiceProvider>
    );
    const view = render(ui(true));
    return { ...view, fetchImpl, rerenderOpen: (open: boolean) => view.rerender(ui(open)) };
  }

  it("idle: a native button named 'Listen to Tushky's answer', no <audio controls> in the DOM", () => {
    const { container } = renderPlayer();
    const listen = screen.getByRole("button", { name: "Listen to Tushky's answer" });
    expect(listen.tagName).toBe("BUTTON");
    expect(screen.getByText("Listen to this answer")).toBeInTheDocument();
    expect(container.querySelector("audio")).toBeNull();
    expect(container.querySelector(".tk-voice")).toHaveAttribute("data-state", "idle");
    // The waveform and the clock are hidden from assistive tech (no progress announcements).
    expect(container.querySelector(".tk-voice-wave")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".tk-voice-time")).toHaveAttribute("aria-hidden", "true");
  });

  it("Listen → Pause Tushky + Replay → Resume Tushky → Replay; the main control keeps focus", async () => {
    const { fetchImpl, container } = renderPlayer();
    const main = screen.getByRole("button", { name: "Listen to Tushky's answer" });
    main.focus();
    fireEvent.click(main);
    await flush();
    expect(screen.getByRole("button", { name: "Pause Tushky" })).toBe(main);
    expect(document.activeElement).toBe(main);
    expect(screen.getByRole("button", { name: "Replay Tushky's answer" })).toBeInTheDocument();
    fireEvent.click(main);
    expect(screen.getByRole("button", { name: "Resume Tushky" })).toBe(main);
    fireEvent.click(screen.getByRole("button", { name: "Replay Tushky's answer" }));
    await flush();
    expect(container.querySelector(".tk-voice")).toHaveAttribute("data-state", "playing");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(tracked.map((t) => t[0])).toContain("Tushky Voice Replayed");
    // Analytics never carry the answer text (§60).
    expect(JSON.stringify(tracked)).not.toContain("Senior Product Manager");
  });

  it("error: 'Couldn't find my voice this time 🐾' + Try again, and focus moves to Try again", async () => {
    renderPlayer(vi.fn(async () => new Response(JSON.stringify({ code: "voice-unavailable" }), { status: 502 })));
    const main = screen.getByRole("button", { name: "Listen to Tushky's answer" });
    main.focus();
    fireEvent.click(main);
    await flush();
    expect(screen.getByText(/Couldn’t find my voice this time/)).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: /Try again/ }));
  });

  it("never steals focus: after the visitor moves on, a later state change leaves focus alone", async () => {
    let fail: (r: Response) => void = () => {};
    renderPlayer(vi.fn(() => new Promise<Response>((r) => (fail = r))));
    const main = screen.getByRole("button", { name: "Listen to Tushky's answer" });
    main.focus();
    fireEvent.click(main);
    main.blur(); // e.g. a click on the answer text: focus goes to <body>
    await act(async () => {
      await new Promise((r) => setTimeout(r, 5));
    });
    fail(new Response(JSON.stringify({ code: "voice-unavailable" }), { status: 502 }));
    await flush();
    expect(screen.getByRole("button", { name: /Try again/ })).toBeInTheDocument();
    expect(document.activeElement).toBe(document.body);
  });

  it("resting: the quota copy and no retry button", async () => {
    renderPlayer(vi.fn(async () => new Response(JSON.stringify({ code: "voice-resting" }), { status: 503 })));
    fireEvent.click(screen.getByRole("button", { name: "Listen to Tushky's answer" }));
    await flush();
    expect(screen.getByText("Voice is resting for a bit. The text answer is still here.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("closing the drawer (open=false) stops playback and returns the strip to idle", async () => {
    const { rerenderOpen, container } = renderPlayer();
    fireEvent.click(screen.getByRole("button", { name: "Listen to Tushky's answer" }));
    await flush();
    expect(container.querySelector(".tk-voice")).toHaveAttribute("data-state", "playing");
    rerenderOpen(false);
    await flush();
    expect(container.querySelector(".tk-voice")).toHaveAttribute("data-state", "idle");
    expect(FakeAudio.all[0]!.paused).toBe(true);
  });

  it("a long answer is labelled 'Listen to summary' (UI §30)", () => {
    vi.stubGlobal("fetch", vi.fn());
    const long = Array.from({ length: 60 }, () => "RailCite validates every citation before it shows an answer.").join(" ");
    render(
      <TushkyVoiceProvider open>
        <TushkyVoicePlayer messageId="9" question="q" answerText={long} />
      </TushkyVoiceProvider>,
    );
    expect(screen.getByRole("button", { name: "Listen to a summary of Tushky's answer" })).toBeInTheDocument();
    expect(screen.getByText("Listen to summary")).toBeInTheDocument();
  });
});
