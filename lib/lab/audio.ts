/**
 * Gummy Lab sound (gummy-bear.md §26): soft, rubbery, candy-like — all synthesised with the Web Audio
 * API (no audio files shipped). Muted by default; the AudioContext is only ever created after the
 * visitor turns sound on (a user gesture), so autoplay policy is never fought and a muted visit makes
 * no audio object at all. Quiet by design: master gain ≈ 0.16, short envelopes, no harsh waveforms.
 */
export type SoundName = "squish" | "bounce" | "ring" | "star" | "powerup" | "danger" | "gameover" | "secret";

type Ctx = AudioContext;

export class AudioManager {
  private ctx: Ctx | null = null;
  private master: GainNode | null = null;
  private _muted = true;
  private lastAt = new Map<SoundName, number>();

  get muted(): boolean {
    return this._muted;
  }

  /** Returns the new muted state. Unmuting creates the context (call from a click/keypress). */
  setMuted(muted: boolean): boolean {
    this._muted = muted;
    if (!muted) this.ensure();
    if (this.master) this.master.gain.value = muted ? 0 : 0.16;
    if (muted && this.ctx?.state === "running") void this.ctx.suspend();
    if (!muted && this.ctx?.state === "suspended") void this.ctx.resume();
    return this._muted;
  }

  private ensure(): boolean {
    if (this.ctx) return true;
    const Ctor = (globalThis as unknown as { AudioContext?: new () => Ctx; webkitAudioContext?: new () => Ctx }).AudioContext ??
      (globalThis as unknown as { webkitAudioContext?: new () => Ctx }).webkitAudioContext;
    if (!Ctor) return false;
    try {
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this._muted ? 0 : 0.16;
      this.master.connect(this.ctx.destination);
      return true;
    } catch {
      this.ctx = null;
      return false;
    }
  }

  private tone(freq: number, to: number | null, start: number, dur: number, type: OscillatorType, gain: number) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.02, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  play(name: SoundName) {
    if (this._muted || !this.ctx || this.ctx.state === "closed") return;
    // Rate-limit identical sounds so a flurry of impacts never turns harsh.
    const now = this.ctx.currentTime;
    const last = this.lastAt.get(name) ?? -1;
    if (now - last < 0.06) return;
    this.lastAt.set(name, now);
    switch (name) {
      case "squish":
        this.tone(240, 110, 0, 0.14, "sine", 0.9);
        this.tone(120, 70, 0, 0.12, "triangle", 0.4);
        break;
      case "bounce":
        this.tone(170, 440, 0, 0.2, "sine", 0.8);
        this.tone(340, 880, 0.02, 0.14, "triangle", 0.25);
        break;
      case "ring":
        this.tone(784, null, 0, 0.18, "triangle", 0.5);
        this.tone(1175, null, 0.07, 0.24, "sine", 0.45);
        break;
      case "star":
        [659, 784, 988].forEach((f, i) => this.tone(f, null, i * 0.06, 0.2, "triangle", 0.45));
        break;
      case "powerup":
        [392, 494, 587, 784].forEach((f, i) => this.tone(f, null, i * 0.07, 0.22, "sine", 0.5));
        break;
      case "danger":
        this.tone(140, 120, 0, 0.18, "sine", 0.7);
        break;
      case "gameover":
        this.tone(330, 110, 0, 0.6, "sine", 0.7);
        this.tone(165, 70, 0.05, 0.6, "triangle", 0.3);
        break;
      case "secret":
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, null, i * 0.08, 0.3, "sine", 0.4));
        break;
    }
  }

  dispose() {
    this.lastAt.clear();
    const ctx = this.ctx;
    this.ctx = null;
    this.master = null;
    if (ctx && ctx.state !== "closed") void ctx.close().catch(() => undefined);
  }
}
