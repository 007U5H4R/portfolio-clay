import { describe, expect, it } from "vitest";
import { VideoProgress, readYouTubeSample, YT_STATE, type VideoSignal } from "@/lib/analytics/video-progress";

/** Drive a play session: `plays(seconds)` feeds samples every 0.5 s of "real" time. */
function session(duration = 100) {
  const v = new VideoProgress();
  let now = 0;
  let time = 0;
  const log: VideoSignal[] = [];
  const feed = (sample: Parameters<VideoProgress["update"]>[0]) => log.push(...v.update({ duration, ...sample }, now));
  return {
    log,
    play() { feed({ state: YT_STATE.PLAYING, currentTime: time }); },
    /** Watch `seconds` of normal playback. */
    watch(seconds: number) { for (let t = 0; t < seconds; t += 0.5) { now += 500; time += 0.5; feed({ currentTime: time }); } },
    /** Seek (the player jumps; wall clock barely moves). */
    seek(to: number) { now += 100; time = to; feed({ currentTime: time }); },
    pause() { feed({ state: YT_STATE.PAUSED, currentTime: time }); },
    idle(ms: number) { now += ms; },
    resume() { feed({ state: YT_STATE.PLAYING, currentTime: time }); },
    end() { now += 500; time = duration; feed({ state: YT_STATE.ENDED, currentTime: time }); },
    signals: () => log.map((s) => (s.type === "started" ? "started" : `p${s.percent}`)),
  };
}

describe("video play sessions (TASK-194)", () => {
  it("reports nothing until the player says PLAYING (no start from a click)", () => {
    const s = session();
    s.watch(10); // time-only samples with no PLAYING state
    expect(s.signals()).toEqual([]);
  });

  it("reports started once, then 25/50/75/100 once each as the viewer watches", () => {
    const s = session(100);
    s.play();
    s.watch(100);
    s.end();
    expect(s.signals()).toEqual(["started", "p25", "p50", "p75", "p100"]);
  });

  it("does not repeat a milestone on pause / resume inside the same session", () => {
    const s = session(100);
    s.play();
    s.watch(30);
    s.pause();
    s.idle(5000);
    s.resume();
    s.watch(30);
    expect(s.signals()).toEqual(["started", "p25", "p50"]);
  });

  it("does not credit a seek: jumping to 95 % reports no milestone", () => {
    const s = session(100);
    s.play();
    s.watch(2);
    s.seek(95);
    s.watch(2);
    expect(s.signals()).toEqual(["started"]);
  });

  it("an end-of-video seek followed by ENDED does not report completion", () => {
    const s = session(100);
    s.play();
    s.watch(3);
    s.seek(99);
    s.end();
    expect(s.signals()).toEqual(["started"]);
  });

  it("rewinding and rewatching does not duplicate milestones", () => {
    const s = session(100);
    s.play();
    s.watch(60);
    s.seek(10);
    s.watch(60);
    expect(s.signals().filter((x) => x === "p25")).toHaveLength(1);
    expect(s.signals().filter((x) => x === "started")).toHaveLength(1);
  });

  it("a replay after the end is a new session: started + milestones again", () => {
    const s = session(100);
    s.play();
    s.watch(100);
    s.end();
    s.seek(0);
    s.play();
    s.watch(30);
    expect(s.signals()).toEqual(["started", "p25", "p50", "p75", "p100", "started", "p25"]);
  });

  it("buffering and cued states report nothing and keep the session", () => {
    const s = session(100);
    s.play();
    s.watch(10);
    s.log.length = 0;
    const v = new VideoProgress();
    expect(v.update({ state: YT_STATE.BUFFERING, currentTime: 3, duration: 100 }, 0)).toEqual([]);
    expect(v.update({ state: YT_STATE.CUED, duration: 100 }, 0)).toEqual([]);
  });

  it("a failed or never-started player produces no completion", () => {
    const v = new VideoProgress();
    expect(v.update({ state: YT_STATE.ENDED, duration: 100, currentTime: 100 }, 0)).toEqual([]);
  });

  it("needs a duration to report milestones", () => {
    const v = new VideoProgress();
    expect(v.update({ state: YT_STATE.PLAYING, currentTime: 1 }, 0)).toEqual([{ type: "started" }]);
    expect(v.update({ currentTime: 50 }, 500)).toEqual([]);
  });
});

describe("YouTube message parsing (TASK-194)", () => {
  it("reads infoDelivery (string or object) and onStateChange", () => {
    expect(readYouTubeSample(JSON.stringify({ event: "infoDelivery", info: { playerState: 1, currentTime: 3.2, duration: 120 } }))).toEqual({ state: 1, currentTime: 3.2, duration: 120 });
    expect(readYouTubeSample({ event: "infoDelivery", info: { currentTime: 4 } })).toEqual({ currentTime: 4 });
    expect(readYouTubeSample({ event: "onStateChange", info: 2 })).toEqual({ state: 2 });
    expect(readYouTubeSample({ event: "initialDelivery", info: { playerState: -1, duration: 90 } })).toEqual({ state: -1, duration: 90 });
  });

  it("ignores everything else", () => {
    for (const data of ["not json", "{", 42, null, { event: "onReady" }, { event: "infoDelivery", info: {} }, { event: "infoDelivery", info: { volume: 3 } }, { event: "onStateChange", info: "1" }]) {
      expect(readYouTubeSample(data)).toBeNull();
    }
  });
});
