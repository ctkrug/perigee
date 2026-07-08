import { describe, expect, it, vi } from "vitest";
import { attachAimInput } from "../src/game/input.js";

// input.js only touches a canvas through addEventListener/removeEventListener,
// getBoundingClientRect, and setPointerCapture — a tiny fake standing in for
// those (rather than a real DOM/jsdom canvas) is enough to exercise its real
// event-handling logic, matching the project's existing pattern of stubbing
// ambient browser surfaces instead of pulling in a DOM environment.
function createFakeCanvas() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    removeEventListener(type) {
      listeners.delete(type);
    },
    getBoundingClientRect() {
      return { left: 0, top: 0 };
    },
    setPointerCapture() {},
    dispatch(type, event) {
      listeners.get(type)?.(event);
    },
  };
}

function keyEvent(key) {
  return { key, preventDefault: vi.fn() };
}

function pointerEvent(x, y) {
  return { clientX: x, clientY: y, pointerId: 1 };
}

describe("attachAimInput — keyboard aim", () => {
  it("suppresses the native Space/Enter behavior even before aiming starts", () => {
    const canvas = createFakeCanvas();
    const onLaunch = vi.fn();
    attachAimInput(canvas, { onAimStart: vi.fn(), onAimMove: vi.fn(), onLaunch, onAimCancel: vi.fn() });

    const event = keyEvent(" ");
    canvas.dispatch("keydown", event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(onLaunch).not.toHaveBeenCalled();
  });

  it("starts aiming on the first arrow key and reports a velocity via onAimMove", () => {
    const canvas = createFakeCanvas();
    const onAimStart = vi.fn();
    const onAimMove = vi.fn();
    attachAimInput(canvas, {
      onAimStart,
      onAimMove,
      onLaunch: vi.fn(),
      onAimCancel: vi.fn(),
      getInitialAim: () => ({ angle: 0, power: 150 }),
    });

    canvas.dispatch("keydown", keyEvent("ArrowRight"));

    expect(onAimStart).toHaveBeenCalledWith(null, { fromKeyboard: true });
    expect(onAimMove).toHaveBeenCalledTimes(1);
    const [velocity, meta] = onAimMove.mock.calls[0];
    expect(meta).toEqual({ fromKeyboard: true });
    expect(velocity.x).toBeGreaterThan(0); // rotated right from angle 0
  });

  it("launches with the accumulated aim velocity on Enter", () => {
    const canvas = createFakeCanvas();
    const onLaunch = vi.fn();
    attachAimInput(canvas, {
      onAimStart: vi.fn(),
      onAimMove: vi.fn(),
      onLaunch,
      onAimCancel: vi.fn(),
      getInitialAim: () => ({ angle: 0, power: 150 }),
    });

    canvas.dispatch("keydown", keyEvent("ArrowUp"));
    canvas.dispatch("keydown", keyEvent("Enter"));

    expect(onLaunch).toHaveBeenCalledTimes(1);
    const [velocity, meta] = onLaunch.mock.calls[0];
    expect(meta).toEqual({ fromKeyboard: true });
    expect(velocity.x).toBeCloseTo(158); // power stepped up once from 150
  });

  it("cancels the in-progress aim on Escape without launching", () => {
    const canvas = createFakeCanvas();
    const onAimCancel = vi.fn();
    const onLaunch = vi.fn();
    attachAimInput(canvas, {
      onAimStart: vi.fn(),
      onAimMove: vi.fn(),
      onLaunch,
      onAimCancel,
      getInitialAim: () => ({ angle: 0, power: 150 }),
    });

    canvas.dispatch("keydown", keyEvent("ArrowLeft"));
    canvas.dispatch("keydown", keyEvent("Escape"));

    expect(onAimCancel).toHaveBeenCalledTimes(1);
    expect(onLaunch).not.toHaveBeenCalled();
  });

  it("ignores Escape when no keyboard aim is in progress", () => {
    const canvas = createFakeCanvas();
    const onAimCancel = vi.fn();
    attachAimInput(canvas, { onAimStart: vi.fn(), onAimMove: vi.fn(), onLaunch: vi.fn(), onAimCancel });

    canvas.dispatch("keydown", keyEvent("Escape"));

    expect(onAimCancel).not.toHaveBeenCalled();
  });

  it("ignores keydown entirely while a pointer drag is active", () => {
    const canvas = createFakeCanvas();
    const onAimStart = vi.fn();
    attachAimInput(canvas, { onAimStart, onAimMove: vi.fn(), onLaunch: vi.fn(), onAimCancel: vi.fn() });

    canvas.dispatch("pointerdown", pointerEvent(10, 10));
    canvas.dispatch("keydown", keyEvent("ArrowRight"));

    // Only the pointer-driven onAimStart call should have happened.
    expect(onAimStart).toHaveBeenCalledTimes(1);
    expect(onAimStart).toHaveBeenCalledWith({ x: 10, y: 10 });
  });

  it("falls back to a default aim state when no getInitialAim is supplied", () => {
    const canvas = createFakeCanvas();
    const onAimMove = vi.fn();
    attachAimInput(canvas, { onAimStart: vi.fn(), onAimMove, onLaunch: vi.fn(), onAimCancel: vi.fn() });

    canvas.dispatch("keydown", keyEvent("ArrowRight"));

    // Default state is angle 0 (pure +x) rotated one step right, at power 150.
    const [velocity] = onAimMove.mock.calls[0];
    expect(velocity.y).toBeGreaterThan(0);
    expect(Math.hypot(velocity.x, velocity.y)).toBeCloseTo(150);
  });

  it("ignores unrecognized keys without calling any callback", () => {
    const canvas = createFakeCanvas();
    const onAimStart = vi.fn();
    attachAimInput(canvas, { onAimStart, onAimMove: vi.fn(), onLaunch: vi.fn(), onAimCancel: vi.fn() });

    canvas.dispatch("keydown", keyEvent("a"));

    expect(onAimStart).not.toHaveBeenCalled();
  });
});

describe("attachAimInput — pointer drag", () => {
  it("reports drag start/move/launch as screen-space points with no meta", () => {
    const canvas = createFakeCanvas();
    const onAimStart = vi.fn();
    const onAimMove = vi.fn();
    const onLaunch = vi.fn();
    attachAimInput(canvas, { onAimStart, onAimMove, onLaunch, onAimCancel: vi.fn() });

    canvas.dispatch("pointerdown", pointerEvent(5, 5));
    canvas.dispatch("pointermove", pointerEvent(20, 30));
    canvas.dispatch("pointerup", pointerEvent(20, 30));

    expect(onAimStart).toHaveBeenCalledWith({ x: 5, y: 5 });
    expect(onAimMove).toHaveBeenCalledWith({ x: 20, y: 30 });
    expect(onLaunch).toHaveBeenCalledWith({ x: 20, y: 30 });
  });

  it("calls onAimCancel on pointercancel and ignores a subsequent move", () => {
    const canvas = createFakeCanvas();
    const onAimMove = vi.fn();
    const onAimCancel = vi.fn();
    attachAimInput(canvas, { onAimStart: vi.fn(), onAimMove, onLaunch: vi.fn(), onAimCancel });

    canvas.dispatch("pointerdown", pointerEvent(5, 5));
    canvas.dispatch("pointercancel", {});
    canvas.dispatch("pointermove", pointerEvent(99, 99));

    expect(onAimCancel).toHaveBeenCalledTimes(1);
    expect(onAimMove).not.toHaveBeenCalled();
  });

  it("ignores a pointerup with no prior pointerdown", () => {
    const canvas = createFakeCanvas();
    const onLaunch = vi.fn();
    attachAimInput(canvas, { onAimStart: vi.fn(), onAimMove: vi.fn(), onLaunch, onAimCancel: vi.fn() });

    canvas.dispatch("pointerup", pointerEvent(1, 1));

    expect(onLaunch).not.toHaveBeenCalled();
  });

  it("ignores a pointercancel with no prior pointerdown", () => {
    const canvas = createFakeCanvas();
    const onAimCancel = vi.fn();
    attachAimInput(canvas, { onAimStart: vi.fn(), onAimMove: vi.fn(), onLaunch: vi.fn(), onAimCancel });

    canvas.dispatch("pointercancel", {});

    expect(onAimCancel).not.toHaveBeenCalled();
  });
});

describe("attachAimInput — detach", () => {
  it("registers exactly the five listeners it uses", () => {
    const canvas = createFakeCanvas();
    attachAimInput(canvas, { onAimStart: vi.fn(), onAimMove: vi.fn(), onLaunch: vi.fn(), onAimCancel: vi.fn() });

    expect(new Set(canvas.listeners.keys())).toEqual(
      new Set(["pointerdown", "pointermove", "pointerup", "pointercancel", "keydown"]),
    );
  });

  it("removes every listener it registered", () => {
    const canvas = createFakeCanvas();
    const detach = attachAimInput(canvas, {
      onAimStart: vi.fn(),
      onAimMove: vi.fn(),
      onLaunch: vi.fn(),
      onAimCancel: vi.fn(),
    });

    detach();

    expect(canvas.listeners.size).toBe(0);
  });
});
