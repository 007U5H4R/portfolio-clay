/** TASK-143.4 — audio is muted by default and creates no AudioContext until the visitor unmutes (gummy-bear.md §26). */
import { afterEach, describe, expect, it, vi } from "vitest";
import { AudioManager } from "@/lib/lab/audio";

function stubAudio() {
  const created: unknown[] = [];
  const param = () => ({ value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
  class FakeCtx {
    state = "running";
    currentTime = 0;
    destination = {};
    constructor() {
      created.push(this);
    }
    createGain() {
      return { gain: param(), connect: (n: unknown) => n };
    }
    createOscillator() {
      return { type: "sine", frequency: param(), connect: (n: unknown) => n, start: vi.fn(), stop: vi.fn() };
    }
    suspend = vi.fn(async () => {});
    resume = vi.fn(async () => {});
    close = vi.fn(async () => {});
  }
  vi.stubGlobal("AudioContext", FakeCtx);
  return created;
}

afterEach(() => vi.unstubAllGlobals());

describe("AudioManager", () => {
  it("is muted by default and never builds an AudioContext while muted", () => {
    const created = stubAudio();
    const a = new AudioManager();
    expect(a.muted).toBe(true);
    a.play("squish");
    a.play("secret");
    expect(created).toHaveLength(0);
  });

  it("unmuting (a user gesture) creates the context once and plays", () => {
    const created = stubAudio();
    const a = new AudioManager();
    a.setMuted(false);
    a.setMuted(true);
    a.setMuted(false);
    expect(created).toHaveLength(1);
    expect(() => (["squish", "bounce", "ring", "star", "powerup", "danger", "gameover", "secret"] as const).forEach((n) => a.play(n))).not.toThrow();
  });

  it("muting again silences it, and dispose closes the context", () => {
    const created = stubAudio();
    const a = new AudioManager();
    a.setMuted(false);
    a.setMuted(true);
    const ctx = created[0] as { close: ReturnType<typeof vi.fn> };
    a.play("ring"); // muted: no throw, no sound
    a.dispose();
    expect(ctx.close).toHaveBeenCalled();
  });

  it("without Web Audio support it stays silent instead of throwing", () => {
    vi.stubGlobal("AudioContext", undefined);
    const a = new AudioManager();
    expect(() => a.setMuted(false)).not.toThrow();
    expect(() => a.play("ring")).not.toThrow();
  });
});
