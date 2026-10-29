export type OrbitBox = { x: number; y: number; width: number; height: number };
export type OrbitPose = { box: OrbitBox; slot: number; opacity: number };
type Point = { x: number; y: number };

export function rotateModelOrder(order: string[], target: string, forwardOnly = false) {
  const shift = order.indexOf(target);
  if (shift <= 0) return { order, steps: 0 };
  return {
    order: [...order.slice(shift), ...order.slice(0, shift)],
    steps: !forwardOnly && shift > order.length / 2 ? shift - order.length : shift,
  };
}

export const orbitCenter = (box: OrbitBox): Point => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});

/** Fit a projected circle through front, rear-left and rear-right display positions. */
export function createOrbitFrames(
  before: OrbitPose,
  after: OrbitPose,
  seats: Point[],
  steps: number,
  renderBox: OrbitBox = after.box,
) {
  const [front, left, right] = seats;
  const center = { x: (front.x + left.x + right.x) / 3, y: (front.y + left.y + right.y) / 3 };
  const horizontal = { x: (right.x - left.x) / Math.sqrt(3), y: (right.y - left.y) / Math.sqrt(3) };
  const vertical = { x: front.x - center.x, y: front.y - center.y };
  const startAngle = Math.PI / 2 + (before.slot * Math.PI * 2) / 3;
  const endAngle = startAngle - (steps * Math.PI * 2) / 3;
  const point = (angle: number): Point => ({
    x: center.x + horizontal.x * Math.cos(angle) + vertical.x * Math.sin(angle),
    y: center.y + horizontal.y * Math.cos(angle) + vertical.y * Math.sin(angle),
  });
  const first = point(startAngle);
  const last = point(endAngle);
  const oldCenter = orbitCenter(before.box);
  const newCenter = orbitCenter(after.box);
  const startScale = Math.min(
    before.box.width / renderBox.width,
    before.box.height / renderBox.height,
  );
  const endScale = Math.min(after.box.width / renderBox.width, after.box.height / renderBox.height);
  const mainScale = before.slot === 0 ? startScale : endScale;
  const previewScale = before.slot === 0 ? endScale : startScale;
  const layout: Keyframe[] = [];
  const surface: Keyframe[] = [];
  for (let frame = 0; frame <= 36; frame++) {
    const t = frame / 36;
    const angle = startAngle + (endAngle - startAngle) * t;
    const position = point(angle);
    // Different models have slightly different main framing; keep both endpoints exact.
    position.x += (oldCenter.x - first.x) * (1 - t) + (newCenter.x - last.x) * t;
    position.y += (oldCenter.y - first.y) * (1 - t) + (newCenter.y - last.y) * t;
    const depth = (Math.sin(angle) + 0.5) / 1.5;
    const near = Math.pow(Math.max(0, Math.min(1, depth)), 1.65);
    let scale =
      before.slot === 0 || after.slot === 0
        ? previewScale + (mainScale - previewScale) * near
        : startScale + (endScale - startScale) * t;
    if (depth < 0) scale *= 1 + depth * 0.75;
    const dx = position.x - renderBox.x - (renderBox.width * scale) / 2;
    const dy = position.y - renderBox.y - (renderBox.height * scale) / 2;
    layout.push({
      offset: t,
      transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`,
      zIndex: depth > 0.66 ? "3" : depth < -0.05 ? "0" : "2",
    });
    const opacity = depth >= 0 ? 0.5 + Math.min(1, depth) * 0.5 : 0.5 + depth * 0.8;
    const startOpacity = before.slot === 0 ? 1 : 0.5;
    const endOpacity = after.slot === 0 ? 1 : 0.5;
    surface.push({
      offset: t,
      opacity: Math.max(
        0,
        Math.min(
          1,
          opacity +
            (before.opacity - startOpacity) * Math.pow(1 - t, 4) +
            (after.opacity - endOpacity) * Math.pow(t, 4),
        ),
      ),
    });
  }
  return { layout, surface };
}
