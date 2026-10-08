/**
 * TASK-172 — the pinball controller: input (touch halves, mouse, keyboard) → flipper `pressed` state, and the per-step
 * flipper hit (impulse direction, cooldown, hooks). The controller steps once per FIXED physics step (EVAL-030), so its
 * effect depends on the number of steps, not on how rendered frames were split.
 */
import { PerspectiveCamera } from "three";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GummyController } from "@/components/lab/gummy-controller";
import { PHYSICS_DT } from "@/components/lab/physics-step";
import type { LabRuntime } from "@/components/lab/runtime";
import { buildArena } from "@/lib/lab/arena";
import { FLIP_COOLDOWN_S, FLIP_REST, flipperDir, flipperNormal, newFlipperState, stepFlipper } from "@/lib/lab/flippers";
import { MAX_CHARGE_MS, MAX_FORCE, MIN_FORCE, Plunger } from "@/lib/lab/plunger";

function makeRt() {
  const arena = buildArena(5);
  const hooks = { flip: vi.fn(), squish: vi.fn(), poke: vi.fn(), launch: vi.fn() };
  const rt = {
    arena,
    plunger: new Plunger(),
    touchPlunger: false,
    syncInput: () => {},
    sinceLaunch: Infinity,
    launched: false,
    flippers: arena.flippers.map((layout) => ({ layout, state: newFlipperState(), pressed: false, cooldown: 0, body: { current: null } })),
    bear: { x: 0, y: 0, sinceBounce: 9 },
    env: { windX: 0 },
    superSquish: false,
    jelly: { impact: vi.fn() },
    pointer: { x: 0, y: 0, active: false },
    poke: 0,
    hooks,
  } as unknown as LabRuntime;
  return { rt, hooks };
}

function fakeBody(x = 0, y = 0, vx = 0, vy = 0) {
  const body = { x, y, vx, vy };
  return {
    body,
    rb: {
      translation: () => ({ x: body.x, y: body.y, z: 0 }),
      linvel: () => ({ x: body.vx, y: body.vy, z: 0 }),
      setLinvel: (v: { x: number; y: number }) => {
        body.vx = v.x;
        body.vy = v.y;
      },
      mass: () => 2,
      applyImpulse: (i: { x: number; y: number }) => {
        body.vx += i.x / 2;
        body.vy += i.y / 2;
      },
    } as never,
  };
}

let el: HTMLElement;
let live = true;
let c: GummyController;
let rt: LabRuntime;
let hooks: ReturnType<typeof makeRt>["hooks"];

beforeEach(() => {
  live = true;
  ({ rt, hooks } = makeRt());
  el = document.createElement("div");
  el.getBoundingClientRect = () => ({ left: 100, top: 0, width: 400, height: 600, right: 500, bottom: 600, x: 100, y: 0, toJSON: () => ({}) });
  c = new GummyController(rt, el, () => new PerspectiveCamera(), () => live, () => false);
  c.attach();
});
afterEach(() => {
  c.detach();
});

const pointer = (type: string, id: number, clientX: number, extra: Record<string, unknown> = {}) => {
  const e = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(e, { pointerId: id, clientX, clientY: 300, pointerType: "touch", isPrimary: id === 1, button: 0, ...extra });
  el.dispatchEvent(e);
};
const key = (type: "keydown" | "keyup", k: string) => window.dispatchEvent(new KeyboardEvent(type, { key: k, cancelable: true }));
const pressed = () => rt.flippers.map((f) => f.pressed);

describe("pointer: halves of the play area", () => {
  it("the left half holds the left flipper, the right half the right one", () => {
    pointer("pointerdown", 1, 150);
    expect(pressed()).toEqual([true, false]);
    pointer("pointerup", 1, 150);
    expect(pressed()).toEqual([false, false]);
    pointer("pointerdown", 1, 450);
    expect(pressed()).toEqual([false, true]);
  });

  it("multi-touch holds both, and each release lets go of only its own flipper", () => {
    pointer("pointerdown", 1, 150);
    pointer("pointerdown", 2, 450);
    expect(pressed()).toEqual([true, true]);
    pointer("pointerup", 1, 150);
    expect(pressed()).toEqual([false, true]);
    pointer("pointercancel", 2, 450);
    expect(pressed()).toEqual([false, false]);
  });

  it("a finger that slides across the middle keeps the flipper it started on", () => {
    pointer("pointerdown", 1, 150);
    pointer("pointermove", 1, 480);
    expect(pressed()).toEqual([true, false]);
  });

  it("ignores a non-primary mouse button, and presses while the game is not live", () => {
    pointer("pointerdown", 1, 150, { pointerType: "mouse", button: 2 });
    expect(pressed()).toEqual([false, false]);
    live = false;
    pointer("pointerdown", 1, 150);
    expect(pressed()).toEqual([false, false]);
  });

  it("there is no grab, drag or flick any more: the controller exposes none", () => {
    for (const gone of ["dragVector", "gravityFactor", "keyBounce"]) expect(gone in c).toBe(false);
  });
});

describe("keyboard", () => {
  it("← A Z are the left flipper; → D M are the right flipper; Space is not a flipper any more", () => {
    for (const k of ["ArrowLeft", "a", "A", "z", "Z"]) {
      key("keydown", k);
      expect(pressed(), k).toEqual([true, false]);
      key("keyup", k);
      expect(pressed(), `${k} released`).toEqual([false, false]);
    }
    for (const k of ["ArrowRight", "d", "D", "m", "M"]) {
      key("keydown", k);
      expect(pressed(), k).toEqual([false, true]);
      key("keyup", k);
      expect(pressed(), `${k} released`).toEqual([false, false]);
    }
    key("keydown", " ");
    expect(pressed()).toEqual([false, false]);
    expect(rt.plunger.charging).toBe(true);
    key("keyup", " ");
  });

  it("keys and pointers combine: releasing the key keeps a held pointer's flipper up", () => {
    key("keydown", "ArrowLeft");
    pointer("pointerdown", 1, 150);
    key("keyup", "ArrowLeft");
    expect(pressed()).toEqual([true, false]);
  });

  it("the old nudge and bounce keys do nothing, and typing in a field never flips or charges", () => {
    for (const k of ["w", "s", "ArrowUp", "ArrowDown", "Enter"]) key("keydown", k);
    expect(pressed()).toEqual([false, false]);
    expect(rt.plunger.charging).toBe(false);
    const input = document.createElement("input");
    document.body.append(input);
    input.focus();
    key("keydown", "ArrowLeft");
    key("keydown", " ");
    expect(pressed()).toEqual([false, false]);
    expect(rt.plunger.charging).toBe(false);
    input.remove();
  });

  it("window blur lets every flipper go and abandons a charge without launching", () => {
    key("keydown", "a");
    key("keydown", " ");
    window.dispatchEvent(new Event("blur"));
    expect(pressed()).toEqual([false, false]);
    expect(rt.plunger.charging).toBe(false);
    expect(hooks.launch).not.toHaveBeenCalled();
  });

  it("prevents the page scroll for Space and the arrows while live, never while focus is on a button or link", () => {
    const fire = (k: string) => {
      const e = new KeyboardEvent("keydown", { key: k, cancelable: true, bubbles: true });
      window.dispatchEvent(e);
      return e.defaultPrevented;
    };
    for (const k of [" ", "ArrowLeft", "ArrowRight"]) expect(fire(k), k).toBe(true);
    key("keyup", " ");
    expect(fire("a")).toBe(false); // A and D don't scroll the page, so they are left alone
    for (const tag of ["button", "a"] as const) {
      const el = document.createElement(tag);
      if (tag === "a") el.setAttribute("href", "/x");
      document.body.append(el);
      el.focus();
      for (const k of [" ", "ArrowLeft", "ArrowRight"]) expect(fire(k), `${tag} ${k}`).toBe(false);
      expect(rt.plunger.charging, `${tag} focus keeps Space`).toBe(false);
      el.remove();
    }
    live = false;
    for (const k of [" ", "ArrowLeft", "ArrowRight"]) expect(fire(k), `not live ${k}`).toBe(false);
  });
});

describe("the plunger (Space and the touch control)", () => {
  /** A gummy resting on the plunger at the lane's rest height. */
  const inLane = () => fakeBody(rt.arena.lane.x, rt.arena.lane.restY + 0.02);

  it("holding Space charges, releasing fires an impulse into the body: the gummy leaves at the launch speed", () => {
    const { body, rb } = inLane();
    key("keydown", " ");
    for (let i = 0; i < 30; i += 1) c.update(PHYSICS_DT, rb);
    expect(rt.plunger.charging).toBe(true);
    expect(body.vy).toBe(0);
    key("keyup", " ");
    c.update(PHYSICS_DT, rb);
    expect(body.vy).toBeGreaterThan(MIN_FORCE);
    expect(body.vy).toBeLessThan(MAX_FORCE);
    expect(rt.launched).toBe(true);
    expect(rt.sinceLaunch).toBe(0);
    expect(hooks.launch).toHaveBeenCalledTimes(1);
  });

  it("a longer hold launches harder, up to the cap at MAX_CHARGE_MS", () => {
    const speed = (steps: number) => {
      const { body, rb } = inLane();
      rt.plunger.cancel();
      key("keydown", " ");
      for (let i = 0; i < steps; i += 1) c.update(PHYSICS_DT, rb);
      key("keyup", " ");
      c.update(PHYSICS_DT, rb);
      return body.vy;
    };
    const quick = speed(2);
    const half = speed(Math.round(MAX_CHARGE_MS / 2 / (PHYSICS_DT * 1000)));
    const full = speed(Math.round(MAX_CHARGE_MS / (PHYSICS_DT * 1000)));
    const over = speed(Math.round((MAX_CHARGE_MS * 2) / (PHYSICS_DT * 1000)));
    expect(quick).toBeGreaterThanOrEqual(MIN_FORCE);
    expect(half).toBeGreaterThan(quick);
    expect(full).toBeGreaterThan(half);
    expect(full).toBeCloseTo(MAX_FORCE, 1);
    expect(over).toBeCloseTo(full, 6);
  });

  it("the touch plunger charges and launches through the same path", () => {
    const { body, rb } = inLane();
    rt.touchPlunger = true;
    (c as unknown as { sync(): void }).sync();
    for (let i = 0; i < 20; i += 1) c.update(PHYSICS_DT, rb);
    expect(rt.plunger.charging).toBe(true);
    rt.touchPlunger = false;
    (c as unknown as { sync(): void }).sync();
    c.update(PHYSICS_DT, rb);
    expect(body.vy).toBeGreaterThan(MIN_FORCE);
  });

  it("a release with the gummy anywhere but the lane fires nothing", () => {
    const { body, rb } = fakeBody(0, 1);
    key("keydown", " ");
    c.update(PHYSICS_DT, rb);
    key("keyup", " ");
    c.update(PHYSICS_DT, rb);
    expect(body.vy).toBe(0);
    expect(hooks.launch).not.toHaveBeenCalled();
  });

  it("a gummy waiting on the plunger is never nudged by the anti-stall watch", () => {
    const { body, rb } = inLane();
    for (let i = 0; i < 400; i += 1) c.update(PHYSICS_DT, rb);
    expect(body.vx).toBe(0);
    expect(body.vy).toBe(0);
  });
});

describe("GummyController.update (fixed step)", () => {
  it("is a 60 Hz step", () => {
    expect(PHYSICS_DT).toBeCloseTo(1 / 60, 10);
  });

  /** A swinging left flipper with the gummy centre 0.55 above its middle. */
  function swingingHit() {
    const f = rt.flippers[0]!;
    f.state = { angle: FLIP_REST + 0.05, omega: 9 };
    const d = flipperDir("left", f.state.angle);
    const n = flipperNormal("left", f.state.angle);
    const along = f.layout.len * 0.6;
    const cx = f.layout.pivot.x + d.x * along + n.x * 0.55;
    const cy = f.layout.pivot.y + d.y * along + n.y * 0.55;
    return { f, n, ...fakeBody(cx, cy - 0.5, 0, -3) };
  }

  it("a swinging flipper hands the gummy an impulse along its normal, and tells the hooks", () => {
    const { n, body, rb } = swingingHit();
    c.update(PHYSICS_DT, rb);
    expect(body.vy).toBeGreaterThan(10);
    expect(Math.atan2(body.vy, body.vx)).toBeCloseTo(Math.atan2(n.y, n.x), 1);
    expect(hooks.flip).toHaveBeenCalledTimes(1);
    expect(hooks.flip.mock.calls[0]![0]).toBe("left");
    expect(rt.bear.sinceBounce).toBe(0);
  });

  it("cannot hit twice inside the cooldown, and can again after it", () => {
    const { f, body, rb } = swingingHit();
    c.update(PHYSICS_DT, rb);
    const first = body.vy;
    body.vx = 0;
    body.vy = -3;
    c.update(PHYSICS_DT, rb);
    expect(body.vy).toBe(-3);
    f.cooldown = 0;
    c.update(PHYSICS_DT, rb);
    expect(body.vy).toBeCloseTo(first, 6);
    expect(FLIP_COOLDOWN_S).toBeGreaterThan(PHYSICS_DT);
  });

  it("a resting or held flipper does not hit (the gummy just sits on it)", () => {
    const { f, rb, body } = swingingHit();
    f.state.omega = 0;
    c.update(PHYSICS_DT, rb);
    expect(body.vy).toBe(-3);
    expect(hooks.flip).not.toHaveBeenCalled();
  });

  it("wind adds speed in proportion to simulated time: 0.5 s = 30 steps", () => {
    rt.env.windX = 2;
    const { body, rb } = fakeBody(0, 4);
    for (let i = 0; i < 30; i += 1) c.update(PHYSICS_DT, rb);
    expect(body.vx).toBeCloseTo(1, 6);
  });

  it("a gummy stalled away from the flippers is nudged toward the middle; one cradled on a flipper is left alone", () => {
    const away = fakeBody(3.5, 1);
    for (let i = 0; i < 80; i += 1) c.update(PHYSICS_DT, away.rb);
    expect(away.body.vx).toBeLessThan(0);
    expect(away.body.vy).toBeGreaterThan(0);

    const f = rt.flippers[0]!;
    stepFlipper(f.state, true, 1);
    const d = flipperDir("left", f.state.angle);
    const n = flipperNormal("left", f.state.angle);
    const cradled = fakeBody(f.layout.pivot.x + d.x * 1.2 + n.x * 0.55, f.layout.pivot.y + d.y * 1.2 + n.y * 0.55 - 0.5);
    for (let i = 0; i < 200; i += 1) c.update(PHYSICS_DT, cradled.rb);
    expect(cradled.body.vx).toBe(0);
    expect(cradled.body.vy).toBe(0);
  });
});
