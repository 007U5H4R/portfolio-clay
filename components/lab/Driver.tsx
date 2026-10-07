"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ACHIEVEMENTS } from "@/lib/lab/storage";
import type { PowerUpType } from "@/lib/lab/engine";
import { createFxHooks } from "./fx";
import { useRuntime } from "./runtime";

/** The banner label for a power-up pickup. */
const POWER_LABEL: Record<PowerUpType, string> = {
  SUPER_SQUISH: "SUPER SQUISH",
  LOW_GRAVITY: "LOW GRAVITY",
  RAINBOW: "RAINBOW MODE",
  GOLDEN: "GOLDEN GUMMY",
  TIME_FREEZE: "TIME FREEZE",
};

/** First-session micro-instructions (§45): shown once per page session, never a modal. */
let hintsFinished = false;

/**
 * Binds the rules engine to the scene (gummy-bear.md §15–26, §45): every frame it feeds the engine
 * `{ inDanger }`, mirrors the difficulty/power-up environment into the runtime knobs the arena reads,
 * pushes a throttled HUD snapshot to the store, runs the game-over → results hand-off, and wires the
 * physics hooks (pads, bumpers, targets, pickups, squish…) to scoring, sound and particles.
 */
export function Driver() {
  const rt = useRuntime();
  const acc = useRef({ hud: 0, overFor: 0, hint: 0, hintAge: 0, lastHud: "", tickKey: "" });

  useEffect(() => {
    const { store, engine, audio, particles } = rt;
    const st = () => store.getState();
    const timers: number[] = [];
    let alive = true;
    const banner = (text: string, ms = 2200) => {
      st().patch({ banner: text });
      timers.push(
        window.setTimeout(() => {
          if (alive && st().banner === text) st().patch({ banner: null });
        }, ms),
      );
    };
    const burst = (x: number, y: number, kind: "sparkle" | "droplet" | "star" | "trail", n: number, color: number) => particles.emit({ x, y, kind, count: n, color });
    const fx = createFxHooks(rt);
    const hint = (stage: number, text: string | null) => {
      if (hintsFinished) return;
      acc.current.hint = stage;
      acc.current.hintAge = 0;
      st().patch({ hint: text });
    };

    engine.onEvent = (e) => {
      switch (e.type) {
        case "phase":
          if (e.phase === 4) banner("LAB UNSTABLE", 2600);
          break;
        case "danger":
          audio.play("danger");
          break;
        case "save":
          banner("SAVED!", 1100);
          burst(rt.bear.x, rt.bear.y + 0.5, "star", 8, 2);
          break;
        case "powerup":
          audio.play("powerup");
          banner(POWER_LABEL[e.power], 1800);
          rt.zoom = 0.7;
          burst(rt.bear.x, rt.bear.y + 0.5, "star", 10, 4);
          break;
        case "tp-mode":
          banner("TP MODE", 3200);
          audio.play("secret");
          rt.zoom = 1;
          burst(rt.bear.x, rt.bear.y + 0.5, "star", 14, 2);
          break;
        case "achievement": {
          const a = ACHIEVEMENTS[e.id];
          st().toast(a.title, a.body);
          audio.play("star");
          break;
        }
        case "game-over":
          audio.play("gameover");
          burst(rt.bear.x, rt.bear.y + 0.3, "droplet", 18, 0);
          rt.shake = 0.6;
          break;
        case "combo":
          if (e.combo === 5 || e.combo === 10) burst(rt.bear.x, rt.bear.y + 0.8, "star", 10, 2);
          break;
      }
    };

    rt.hooks = {
      ...fx,
      impact(speed, dx, dy, x, y) {
        fx.impact(speed, dx, dy, x, y);
        if (speed > 7) audio.play("squish");
      },
      pad(spec, x, y) {
        fx.pad(spec, x, y);
        engine.action("pad", spec.id);
        audio.play("bounce");
        if (acc.current.hint === 3) hint(4, null);
      },
      bumper(id, x, y) {
        fx.bumper(id, x, y);
        engine.action("bumper", id);
        audio.play("bounce");
      },
      target(id, x, y) {
        fx.target(id, x, y);
        engine.hitTarget(id);
        audio.play("star");
      },
      portal() {
        if (!store.getState().machine.running) return;
        engine.foundHiddenInteraction();
        rt.requestExit("portal");
      },
      pickup(id) {
        const item = rt.spawner.items.find((i) => i.id === id);
        if (!item || !store.getState().machine.running) return;
        rt.spawner.remove(id);
        st().patch({ pickupsVersion: st().pickupsVersion + 1 });
        if (item.kind === "ring") {
          engine.collect("ring", id);
          audio.play("ring");
          burst(item.x, item.y, "sparkle", 8, 2);
        } else if (item.kind === "star") {
          engine.collect("star", id);
          audio.play("star");
          burst(item.x, item.y, "star", 12, 2);
        } else if (item.kind === "droplet") {
          engine.collect("droplet", id);
          audio.play("ring");
          burst(item.x, item.y, "droplet", 10, 0);
        } else {
          engine.activate(item.kind);
          burst(item.x, item.y, "star", 10, 4);
        }
      },
      squish(charge, super_) {
        fx.squish(charge, super_);
        if (super_) engine.consumeSuperSquish();
        audio.play(charge > 0.5 ? "bounce" : "squish");
      },
      drag() {
        if (acc.current.hint <= 1) hint(2, "Now flick!");
      },
      flick() {
        if (acc.current.hint <= 2) hint(3, "Keep me off the floor.");
        audio.play("bounce");
      },
      tap() {
        fx.tap();
        audio.play("squish");
      },
    };

    // Auto-pause when the tab is hidden (§39: no wasted frames, no unfair loss).
    const onVis = () => {
      if (document.hidden && store.getState().machine.running) st().send("PAUSE");
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      timers.forEach((t) => window.clearTimeout(t));
      document.removeEventListener("visibilitychange", onVis);
      engine.onEvent = undefined;
      rt.hooks = fx;
    };
  }, [rt]);

  // A new run: first-session hint restarts only until the visitor has seen it through once.
  const runId = rt.store((s) => s.runId);
  useEffect(() => {
    if (runId === 0 || hintsFinished) return;
    acc.current.hint = 1;
    acc.current.hintAge = 0;
    rt.store.getState().patch({ hint: "Drag me." });
  }, [rt, runId]);

  useFrame((_, rawDt) => {
    const { store, engine } = rt;
    const machine = store.getState().machine;
    const A = acc.current;

    engine.update(rawDt, { inDanger: rt.bear.inDanger && machine.running });
    // The engine moves the machine (countdown → playing, danger, game over): mirror it into the store.
    if (store.getState().state !== machine.state) store.setState({ state: machine.state });

    const env = engine.env();
    const e = rt.env;
    e.phase = env.phase;
    e.motion = env.motion;
    e.gravityMul = env.gravityMul;
    e.windX = env.windX;
    e.dangerRise = env.dangerRise;
    e.vanish = env.vanish;
    e.padShift = env.padShift;
    e.rainbow = env.rainbow;
    e.gold = env.gold;
    e.lowGravity = env.lowGravity;
    e.tpGlow = env.tpGlow;
    rt.bounceMul = env.bounceMul * rt.tune.bounce;
    rt.superSquish = env.superSquish;

    if (machine.state === "GAME_OVER") {
      A.overFor += rawDt;
      if (A.overFor >= 1.3) {
        A.overFor = 0;
        const summary = engine.finish();
        store.setState({ summary, state: machine.state, hint: null });
        hintsFinished = true;
      }
    } else A.overFor = 0;

    // first-session hints fade by themselves
    if (A.hint > 0 && !hintsFinished && machine.running) {
      A.hintAge += rawDt;
      if ((A.hint === 3 || A.hint === 4) && A.hintAge > 3.5) {
        hintsFinished = true;
        store.getState().patch({ hint: null });
      } else if (A.hint <= 2 && A.hintAge > 9) {
        store.getState().patch({ hint: null });
        A.hint = 0;
      }
    }

    // HUD snapshot at ~10 Hz, only when something visible changed.
    A.hud += rawDt;
    if (A.hud >= 0.1) {
      A.hud = 0;
      const s = engine.snapshot();
      const key = [s.score, s.combo, Math.floor(s.timeS * 10), s.dangerLeft === null ? "-" : s.dangerLeft.toFixed(1), s.countdown, s.powers.map((p) => `${p.type}${Math.ceil(p.left)}`).join(","), s.tpMode].join("|");
      // A soft tick for each whole second of the danger countdown and each countdown step.
      const tickKey = s.dangerLeft !== null ? `d${Math.ceil(s.dangerLeft)}` : machine.state === "COUNTDOWN" ? `c${s.countdown}` : "";
      if (tickKey !== A.tickKey) {
        A.tickKey = tickKey;
        if (tickKey) rt.audio.play("tick");
      }
      if (key !== A.lastHud) {
        A.lastHud = key;
        store.getState().patch({
          score: s.score,
          combo: s.combo,
          timeS: Math.floor(s.timeS * 10) / 10,
          dangerLeft: s.dangerLeft === null ? null : Math.round(s.dangerLeft * 10) / 10,
          countdown: s.countdown,
          powers: s.powers.map((p) => ({ type: p.type, left: Math.ceil(p.left) })),
          tpMode: s.tpMode,
        });
      }
    }
  });

  return null;
}
