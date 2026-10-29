import assert from "node:assert/strict";
import test from "node:test";
import {
  createOrbitFrames,
  rotateModelOrder,
  type OrbitPose,
} from "../../src/features/home/components/hero-orbit";

const seats = [
  { x: 1020, y: 500 },
  { x: 720, y: 200 },
  { x: 1320, y: 230 },
];
function pose(slot: number): OrbitPose {
  const center = seats[slot];
  const width = slot === 0 ? 800 : 190;
  const height = slot === 0 ? 600 : 170;
  return {
    slot,
    box: { x: center.x - width / 2, y: center.y - height / 2, width, height },
    opacity: slot === 0 ? 1 : 0.5,
  };
}
function position(frame: Keyframe, after: OrbitPose) {
  const match = String(frame.transform).match(
    /translate3d\(([^p]+)px, ([^p]+)px, 0\) scale\(([^)]+)\)/,
  )!;
  const scale = Number(match[3]);
  return {
    x: after.box.x + Number(match[1]) + (after.box.width * scale) / 2,
    y: after.box.y + Number(match[2]) + (after.box.height * scale) / 2,
    scale,
  };
}

test("every advance rotates all three seats left -> front -> right -> left", () => {
  const initial = ["acs", "feh", "wps"];
  const first = rotateModelOrder(initial, "feh", true);
  assert.deepEqual(first, { order: ["feh", "wps", "acs"], steps: 1 });
  const second = rotateModelOrder(first.order, "wps", true);
  assert.deepEqual(second.order, ["wps", "acs", "feh"]);
  assert.deepEqual(rotateModelOrder(second.order, "acs", true).order, initial);
  assert.equal(rotateModelOrder(initial, "wps").steps, -1);
});

test("orbit paths keep exact centers at both ends and use a single proportional scale", () => {
  for (const steps of [1, -1])
    for (const slot of [0, 1, 2]) {
      const nextSlot = (slot - steps + 3) % 3;
      const after = pose(nextSlot);
      const frames = createOrbitFrames(pose(slot), after, seats, steps);
      const start = position(frames.layout[0], after);
      const end = position(frames.layout.at(-1)!, after);
      assert.ok(Math.abs(start.x - seats[slot].x) < 0.001);
      assert.ok(Math.abs(start.y - seats[slot].y) < 0.001);
      assert.ok(Math.abs(end.x - seats[nextSlot].x) < 0.001);
      assert.ok(Math.abs(end.y - seats[nextSlot].y) < 0.001);
      assert.ok(Math.abs(end.scale - 1) < 0.001);
      assert.ok(Math.abs(Number(frames.surface[0].opacity) - pose(slot).opacity) < 0.000001);
      assert.ok(Math.abs(Number(frames.surface.at(-1)!.opacity) - after.opacity) < 0.000001);
    }
});

test("the rear product travels behind the circle, shrinking and fading instead of crossing straight through", () => {
  const after = pose(1);
  const frames = createOrbitFrames(pose(2), after, seats, 1);
  const middle = position(frames.layout[18], after);
  assert.ok(middle.y < Math.min(seats[1].y, seats[2].y) - 30);
  assert.ok(middle.scale < 0.85);
  assert.ok(Number(frames.surface[18].opacity) < 0.3);
  assert.equal(frames.layout[18].zIndex, "0");
});

test("the outgoing model can keep its full-resolution surface until the orbit ends", () => {
  const before = pose(0);
  const after = pose(2);
  const rendered = {
    ...after,
    box: { ...after.box, width: before.box.width, height: before.box.height },
  };
  const frames = createOrbitFrames(before, after, seats, 1, rendered.box);
  const first = position(frames.layout[0], rendered);
  const last = position(frames.layout.at(-1)!, rendered);
  assert.equal(first.scale, 1);
  assert.ok(last.scale < 0.3);
  assert.ok(Math.abs(first.x - seats[0].x) < 0.001);
  assert.ok(Math.abs(last.x - seats[2].x) < 0.001);
  assert.ok(Math.abs(last.y - seats[2].y) < 0.001);
});
