import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import type { MapArea, MapView } from "../types";

type Point = { x: number; y: number };
const INITIAL_VIEW: MapView = { x: 0, y: 0, k: 1 };

function fit(area?: MapArea): MapView {
  if (!area) return INITIAL_VIEW;
  const [x0, y0, x1, y1] = area.bounds;
  const k = Math.min(4000, 620 / Math.max(x1 - x0, y1 - y0, 0.01));
  return { x: 400 - ((x0 + x1) * k) / 2, y: 400 - ((y0 + y1) * k) / 2, k };
}

function zoomAt(view: MapView, factor: number, point: Point = { x: 400, y: 400 }): MapView {
  const k = Math.max(1, Math.min(8000, view.k * factor));
  if (k === 1) return INITIAL_VIEW;
  return {
    k,
    x: point.x - ((point.x - view.x) * k) / view.k,
    y: point.y - ((point.y - view.y) * k) / view.k,
  };
}

export function useMapCamera(focus?: MapArea) {
  const svg = useRef<SVGSVGElement>(null);
  const [view, setView] = useState(INITIAL_VIEW);
  const [smooth, setSmooth] = useState(true);
  const [pixelScale, setPixelScale] = useState(1);
  const [viewport, setViewport] = useState({ width: 800, height: 800 });
  const current = useRef(view);
  const pointers = useRef(new Map<number, Point>());
  const start = useRef<Point | null>(null);
  const dragged = useRef(false);

  const update = useCallback((next: MapView, animate: boolean) => {
    current.current = next;
    setSmooth(animate);
    setView(next);
  }, []);

  // Starting a gesture during a fit animation uses its actual visible position.
  const visibleView = useCallback(() => {
    const group = svg.current?.querySelector(".customer-map-geography");
    const transform = group ? getComputedStyle(group).transform : "none";
    if (transform === "none") return current.current;
    const matrix = new DOMMatrix(transform);
    return { x: matrix.e, y: matrix.f, k: matrix.a };
  }, []);

  const svgPoint = useCallback((clientX: number, clientY: number): Point => {
    const matrix = svg.current?.getScreenCTM();
    return matrix
      ? new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse())
      : { x: 400, y: 400 };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => update(fit(focus), true));
    return () => cancelAnimationFrame(frame);
  }, [focus, update]);

  useEffect(() => {
    const element = svg.current!;
    const observer = new ResizeObserver(([entry]) => {
      const scale = Math.max(
        0.1,
        Math.min(entry.contentRect.width, entry.contentRect.height) / 800,
      );
      setPixelScale(scale);
      setViewport({
        width: entry.contentRect.width / scale,
        height: entry.contentRect.height / scale,
      });
    });
    observer.observe(element);
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 800 : 1);
      update(
        zoomAt(
          visibleView(),
          Math.exp(-Math.max(-100, Math.min(100, delta)) * 0.004),
          svgPoint(event.clientX, event.clientY),
        ),
        false,
      );
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      observer.disconnect();
      element.removeEventListener("wheel", wheel);
    };
  }, [svgPoint, update, visibleView]);

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const point = svgPoint(event.clientX, event.clientY);
    pointers.current.set(event.pointerId, point);
    if (pointers.current.size === 1) {
      start.current = point;
      dragged.current = false;
      update(visibleView(), false);
    } else dragged.current = true;
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const before = [...pointers.current.values()];
    const point = svgPoint(event.clientX, event.clientY);
    pointers.current.set(event.pointerId, point);
    if (start.current && Math.hypot(point.x - start.current.x, point.y - start.current.y) > 5)
      dragged.current = true;
    if (!dragged.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (before.length === 2) {
      const after = [...pointers.current.values()];
      const distance = (points: Point[]) =>
        Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const midpoint = (points: Point[]) => ({
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2,
      });
      const oldMid = midpoint(before),
        newMid = midpoint(after);
      const next = zoomAt(current.current, distance(after) / Math.max(distance(before), 1), oldMid);
      update({ ...next, x: next.x + newMid.x - oldMid.x, y: next.y + newMid.y - oldMid.y }, false);
    } else
      update(
        {
          ...current.current,
          x: current.current.x + point.x - previous.x,
          y: current.current.y + point.y - previous.y,
        },
        false,
      );
  }

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (
      !["+", "=", "-", "Home", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
        event.key,
      )
    )
      return;
    event.preventDefault();
    if (event.key === "+" || event.key === "=") update(zoomAt(current.current, 1.5), true);
    else if (event.key === "-") update(zoomAt(current.current, 1 / 1.5), true);
    else if (event.key === "Home") update(fit(focus), true);
    else
      update(
        {
          ...current.current,
          x:
            current.current.x +
            (event.key === "ArrowLeft" ? 45 : event.key === "ArrowRight" ? -45 : 0),
          y:
            current.current.y +
            (event.key === "ArrowUp" ? 45 : event.key === "ArrowDown" ? -45 : 0),
        },
        true,
      );
  }

  return {
    svg,
    view,
    pixelScale,
    viewport,
    smooth,
    canSelect: () => !dragged.current,
    isPointerActive: () => pointers.current.size > 0,
    zoom: (factor: number) => update(zoomAt(current.current, factor), true),
    reset: () => update(fit(focus), true),
    handlers: {
      onPointerDown,
      onPointerMove,
      onKeyDown,
      onPointerUp: (event: PointerEvent<SVGSVGElement>) => {
        pointers.current.delete(event.pointerId);
      },
      onPointerCancel: (event: PointerEvent<SVGSVGElement>) => {
        pointers.current.delete(event.pointerId);
        dragged.current = true;
      },
      onLostPointerCapture: (event: PointerEvent<SVGSVGElement>) => {
        pointers.current.delete(event.pointerId);
      },
    },
  };
}
