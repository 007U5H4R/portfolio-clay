/**
 * Video play-session logic (TASK-194), pure and player-agnostic so it is unit-tested without a browser.
 *
 * Input is what the embedded YouTube player reports over postMessage (`infoDelivery`: playerState,
 * currentTime, duration). A "start" is only ever emitted when the player says it is PLAYING. Milestones
 * (25/50/75/100) follow WATCHING, not position: each sample while playing credits the time since the
 * previous sample only if that gap is plausible real playback; a jump (seek) credits nothing. A milestone
 * is emitted once per play session when the position is past it AND the viewer has been credited at least
 * half of the way there (so scrubbing to 95 % never reports a 25 / 50 / 75 / 100 % view). Pause and resume
 * stay in the same session; reaching the end (state ENDED) closes it, and the next PLAYING starts a new one.
 */
export const MILESTONES = [25, 50, 75, 100] as const;
export type Milestone = (typeof MILESTONES)[number];

export type VideoSignal =
  | { type: "started" }
  | { type: "progress"; percent: Milestone };

/** YouTube iframe `playerState` values. */
export const YT_STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 } as const;

export interface PlayerSample {
  state?: number | undefined;
  currentTime?: number | undefined;
  duration?: number | undefined;
}

/** The largest gap between two playing samples that still counts as continuous playback (seconds). */
const MAX_CONTINUOUS_GAP_S = 3;
/** Within this many seconds (or 3 %) of the end counts as having reached 100 %. */
const END_SLACK_S = 1.5;

export class VideoProgress {
  private started = false;
  private state: number = YT_STATE.UNSTARTED;
  private lastTime: number | null = null;
  private lastAt: number | null = null;
  private credited = 0;
  private duration = 0;
  private done = new Set<Milestone>();

  /** Feed one player report; returns the signals (0..n) it produces. `now` is a monotonic ms clock. */
  update(sample: PlayerSample, now: number): VideoSignal[] {
    const out: VideoSignal[] = [];
    if (typeof sample.duration === "number" && sample.duration > 0) this.duration = sample.duration;
    // The player sends the state only when it changes; time-only deliveries inherit the last state.
    if (sample.state !== undefined) this.state = sample.state;

    if (this.state === YT_STATE.ENDED) {
      if (this.started) this.reach(100, out);
      this.reset();
      return out;
    }
    if (this.state !== YT_STATE.PLAYING) {
      // Paused / buffering / cued: the session stays open, but the credit clock stops.
      this.lastAt = null;
      return out;
    }

    const time = sample.currentTime;
    if (!this.started) {
      this.started = true;
      out.push({ type: "started" });
    }
    if (typeof time !== "number" || this.duration <= 0) {
      this.lastAt = now;
      return out;
    }

    if (this.lastTime !== null && this.lastAt !== null) {
      const media = time - this.lastTime;
      const wall = (now - this.lastAt) / 1000;
      // Plausible playback: time moved forward by roughly the wall-clock gap. A seek breaks that.
      if (media > 0 && media <= MAX_CONTINUOUS_GAP_S && media <= wall * 2 + 0.5) this.credited += media;
    }
    this.lastTime = time;
    this.lastAt = now;

    const percent = (time / this.duration) * 100;
    for (const m of MILESTONES) {
      if (m !== 100 && percent >= m) this.reach(m, out);
    }
    if (this.duration - time <= Math.max(END_SLACK_S, this.duration * 0.01)) this.reach(100, out);
    return out;
  }

  private reach(m: Milestone, out: VideoSignal[]) {
    if (this.done.has(m)) return;
    // Watched at least half the span up to this milestone, so a seek does not report it.
    if (this.duration > 0 && this.credited < (m / 100) * this.duration * 0.5) return;
    this.done.add(m);
    out.push({ type: "progress", percent: m });
  }

  private reset() {
    this.started = false;
    this.state = YT_STATE.UNSTARTED;
    this.lastTime = null;
    this.lastAt = null;
    this.credited = 0;
    this.done.clear();
  }
}

/**
 * Reads one YouTube postMessage payload (string JSON or object) into a sample, or null if it carries no
 * playback information. `infoDelivery.info` holds partial fields; `onStateChange.info` is the bare state.
 */
export function readYouTubeSample(data: unknown): PlayerSample | null {
  let msg: unknown = data;
  if (typeof data === "string") {
    try {
      msg = JSON.parse(data);
    } catch {
      return null;
    }
  }
  if (!msg || typeof msg !== "object") return null;
  const { event, info } = msg as { event?: unknown; info?: unknown };
  if (event === "onStateChange" && typeof info === "number") return { state: info };
  if ((event === "infoDelivery" || event === "initialDelivery") && info && typeof info === "object") {
    const i = info as { playerState?: unknown; currentTime?: unknown; duration?: unknown };
    const sample: PlayerSample = {};
    if (typeof i.playerState === "number") sample.state = i.playerState;
    if (typeof i.currentTime === "number") sample.currentTime = i.currentTime;
    if (typeof i.duration === "number") sample.duration = i.duration;
    return sample.state === undefined && sample.currentTime === undefined && sample.duration === undefined ? null : sample;
  }
  return null;
}
