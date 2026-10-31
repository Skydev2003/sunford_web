"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { TrendingUp } from "lucide-react";

type Position = {
  x: number;
  y: number;
  size: number;
  pinned: boolean;
  visible: boolean;
  flightPath?: string;
  flightDuration?: number;
  flightDelay?: number;
  returning?: boolean;
  interacted?: boolean;
};
type Drag = {
  index: number;
  id: number;
  x: number;
  y: number;
  origin: Position;
  target: HTMLButtonElement;
};

const bounded = (point: Position) => ({
  ...point,
  x: Math.max(8, Math.min(point.x, document.documentElement.clientWidth - point.size - 8)),
  y: Math.max(8, Math.min(point.y, innerHeight - point.size - 8)),
});

function ProfitBubble() {
  return (
    <span className="hero-feature-pop">
      <span className="hero-value-badge" aria-hidden="true">
        <TrendingUp size={28} strokeWidth={2} />
        <span>ตัวช่วย</span>
        <strong>เพิ่มกำไร</strong>
        <span>ให้ธุรกิจคุณ</span>
      </span>
    </span>
  );
}

export function HeroBubbles({
  highlights = [],
  name,
  paused,
  opening = false,
  sceneRunning,
  sceneRef,
  onInteract,
}: {
  highlights?: readonly string[];
  name: string;
  paused: boolean;
  opening?: boolean;
  sceneRunning: boolean;
  sceneRef: RefObject<HTMLElement | null>;
  onInteract: () => void;
}) {
  const anchors = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const homes = useRef<Position[]>([]);
  const sceneVisibleRef = useRef(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [menuCovered, setMenuCovered] = useState(false);
  const [sceneVisible, setSceneVisible] = useState(false);
  const [entrance, setEntrance] = useState(0);

  const returnHome = useCallback((index: number, animate = true) => {
    if (!sceneVisibleRef.current) return;
    const home = homes.current[index];
    if (!home) return;
    setPositions((current) =>
      current.map((point, item) =>
        item === index ? { ...home, interacted: true, returning: animate } : point,
      ),
    );
  }, []);

  const finish = useCallback(
    (cancel = false) => {
      const gesture = drag.current;
      if (!gesture) return;
      drag.current = null;
      returnHome(gesture.index, !cancel);
      setDragging(null);
      if (gesture.target.hasPointerCapture(gesture.id))
        gesture.target.releasePointerCapture(gesture.id);
    },
    [returnHome],
  );

  useEffect(() => {
    const menu = document.querySelector<HTMLElement>("#desktop-submenu");
    const backdrop = document.querySelector<HTMLElement>(".nav-backdrop");
    if (!menu || !backdrop) return;
    const surfaces = [menu, backdrop];
    const desktop = matchMedia("(min-width: 1101px)");
    let covered = false;
    let revision = 0;
    let frame = 0;
    const isOpen = () =>
      desktop.matches && surfaces.some((surface) => surface.classList.contains("is-open"));
    const reveal = () => {
      covered = false;
      setPositions((current) => current.map((point) => ({ ...point, interacted: false })));
      setMenuCovered(false);
    };
    const waitForClose = () => {
      const currentRevision = revision;
      frame = requestAnimationFrame(async () => {
        // Include delayed visibility transitions, not only the menu's shrinking height.
        await Promise.allSettled(
          surfaces
            .flatMap((surface) => surface.getAnimations())
            .map((animation) => animation.finished),
        );
        if (currentRevision !== revision || isOpen()) return;
        if (surfaces.some((surface) => getComputedStyle(surface).visibility !== "hidden")) {
          waitForClose();
          return;
        }
        reveal();
      });
    };
    const syncMenu = () => {
      revision++;
      cancelAnimationFrame(frame);
      if (isOpen()) {
        covered = true;
        finish(true);
        setMenuCovered(true);
      } else if (
        covered ||
        (desktop.matches &&
          surfaces.some((surface) => getComputedStyle(surface).visibility !== "hidden"))
      ) {
        if (desktop.matches) {
          covered = true;
          setMenuCovered(true);
          waitForClose();
        } else reveal();
      }
    };
    const observer = new MutationObserver(syncMenu);
    surfaces.forEach((surface) =>
      observer.observe(surface, { attributes: true, attributeFilter: ["class"] }),
    );
    desktop.addEventListener("change", syncMenu);
    syncMenu();
    return () => {
      revision++;
      cancelAnimationFrame(frame);
      observer.disconnect();
      desktop.removeEventListener("change", syncMenu);
    };
  }, [finish]);

  useEffect(() => {
    const root = anchors.current;
    const scene = sceneRef.current;
    if (!root || !scene) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-bubble-anchor]"));
    const headerInner = document.querySelector<HTMLElement>(".site-header .header-inner");
    // Generate only after hydration; offsets remain stable until the product is selected again.
    const offsets = nodes.map((_, index) => ({
      x: (Math.random() - 0.5) * 18,
      y: (Math.random() - 0.5) * 16,
      sourceX: 0.4 + Math.random() * 0.2,
      sourceY: 0.4 + Math.random() * 0.2,
      curve: (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.5),
      duration: 2500 + Math.random() * 400,
      delay: 120 + index * 90 + Math.random() * 30,
    }));
    let frame = 0;
    const measure = () => {
      frame = 0;
      const sceneBox = scene.getBoundingClientRect();
      if (layer.current && headerInner) {
        layer.current.style.setProperty(
          "--bubble-header-bottom",
          `${Math.max(0, headerInner.getBoundingClientRect().bottom)}px`,
        );
      }
      const visibleHeight = Math.max(
        0,
        Math.min(sceneBox.bottom, innerHeight) - Math.max(sceneBox.top, 0),
      );
      const visible = visibleHeight >= Math.min(sceneBox.height, innerHeight) * 0.35;
      const wasVisible = sceneVisibleRef.current;
      sceneVisibleRef.current = visible;
      if (visible !== wasVisible) {
        setSceneVisible(visible);
        if (visible) setEntrance((current) => current + 1);
        else {
          // Capture the rendered position, including an interrupted return transition.
          const frozen = new Map(
            Array.from(
              layer.current?.querySelectorAll<HTMLElement>(".hero-floating-bubble") ?? [],
            ).map(
              (element) =>
                [Number(element.dataset.bubbleIndex), element.getBoundingClientRect()] as const,
            ),
          );
          finish(true);
          setPositions((current) =>
            current.map((point, index) => {
              const box = frozen.get(index);
              return {
                ...point,
                x: box?.x ?? point.x,
                y: box?.y ?? point.y,
                pinned: false,
                returning: false,
              };
            }),
          );
        }
      }
      const model = scene.querySelector(".hero-model-stage")?.getBoundingClientRect();
      homes.current = nodes.map((node, index) => {
        const box = node.getBoundingClientRect();
        const x = Math.max(
          sceneBox.left + 8,
          Math.min(box.x + offsets[index].x, sceneBox.right - box.width - 8),
        );
        const y = Math.max(
          sceneBox.top + 16,
          Math.min(box.y + offsets[index].y, sceneBox.bottom - box.height - 16),
        );
        const originX = model
          ? model.x + model.width * offsets[index].sourceX - x - box.width / 2
          : 0;
        const originY = model
          ? model.y + model.height * offsets[index].sourceY - y - box.height / 2
          : 46;
        const distance = Math.hypot(originX, originY) || 1;
        const curve = offsets[index].curve * Math.min(90, distance * 0.22);
        const bendX = (-originY / distance) * curve;
        const bendY = (originX / distance) * curve;
        return {
          x,
          y,
          flightPath: `path("M ${originX} ${originY} C ${originX * 0.72 + bendX} ${originY * 0.72 + bendY} ${originX * 0.12 + bendX * 0.4} ${originY * 0.12 + bendY * 0.4} 0 0")`,
          flightDuration: offsets[index].duration,
          flightDelay: offsets[index].delay,
          size: box.width,
          pinned: false,
          visible: box.width > 0,
        };
      });
      if (!visible) return;
      setPositions((current) =>
        homes.current.map((home, index) => {
          const previous = current[index];
          if (!wasVisible) return home;
          return previous?.pinned
            ? bounded({ ...previous, size: home.size || previous.size })
            : { ...home, returning: previous?.returning, interacted: previous?.interacted };
        }),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      const allowed = !preference.matches && !document.hidden && document.hasFocus();
      setMotionAllowed(allowed);
      if (!allowed) finish(true);
    };
    const resize = () => {
      finish(true);
      schedule();
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(scene);
    nodes.forEach((node) => observer.observe(node));
    measure();
    setPortal(document.body);
    syncMotion();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("focus", syncMotion);
    window.addEventListener("blur", syncMotion);
    document.addEventListener("visibilitychange", syncMotion);
    preference.addEventListener("change", syncMotion);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      window.removeEventListener("focus", syncMotion);
      window.removeEventListener("blur", syncMotion);
      document.removeEventListener("visibilitychange", syncMotion);
      preference.removeEventListener("change", syncMotion);
    };
  }, [finish, sceneRef]);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const index = Number(event.currentTarget.dataset.bubbleIndex);
    if (!event.isPrimary || event.button !== 0 || drag.current) return;
    event.preventDefault();
    onInteract();
    event.currentTarget.focus({ preventScroll: true });
    const box = event.currentTarget.getBoundingClientRect();
    const origin = {
      ...positions[index],
      x: box.x,
      y: box.y,
      pinned: true,
      interacted: true,
      returning: false,
    };
    drag.current = {
      index,
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      origin,
      target: event.currentTarget,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(index);
    setPositions((current) => current.map((point, item) => (item === index ? origin : point)));
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const point = bounded({
      ...gesture.origin,
      pinned: true,
      x: gesture.origin.x + event.clientX - gesture.x,
      y: gesture.origin.y + event.clientY - gesture.y,
    });
    setPositions((current) =>
      current.map((previous, item) => (item === gesture.index ? point : previous)),
    );
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const index = Number(event.currentTarget.dataset.bubbleIndex);
    if (event.key === "Escape") {
      finish(true);
      returnHome(index, false);
      return;
    }
    const direction = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[event.key];
    if (!direction) return;
    event.preventDefault();
    onInteract();
    const step = event.shiftKey ? 40 : 10;
    const box = event.currentTarget.getBoundingClientRect();
    setPositions((current) =>
      current.map((point, item) =>
        item === index
          ? bounded({
              ...point,
              pinned: true,
              interacted: true,
              returning: false,
              x: (point.returning ? box.x : point.x) + direction[0] * step,
              y: (point.returning ? box.y : point.y) + direction[1] * step,
            })
          : point,
      ),
    );
  };
  const controls = {
    type: "button" as const,
    className: "hero-bubble-handle",
    onPointerDown,
    onPointerMove,
    onPointerUp: (event: PointerEvent<HTMLButtonElement>) => {
      if (drag.current?.id === event.pointerId) finish();
    },
    onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => {
      if (drag.current?.id === event.pointerId) finish(true);
    },
    onLostPointerCapture: (event: PointerEvent<HTMLButtonElement>) => {
      if (drag.current?.id === event.pointerId) finish(true);
    },
    onKeyDown,
    onKeyUp: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key.startsWith("Arrow"))
        returnHome(Number(event.currentTarget.dataset.bubbleIndex));
    },
    onBlur: (event: React.FocusEvent<HTMLButtonElement>) => {
      if (!drag.current) returnHome(Number(event.currentTarget.dataset.bubbleIndex));
    },
  };
  const placement = (point: Position): CSSProperties =>
    ({
      "--bubble-flight-path": point.flightPath,
      "--bubble-flight-duration": `${point.flightDuration ?? 2700}ms`,
      "--bubble-flight-delay": `${point.flightDelay ?? 0}ms`,
      left: 0,
      top: 0,
      right: "auto",
      width: point.size,
      height: point.size,
      transform: `translate3d(${point.x}px, ${point.y}px, 0)`,
    }) as CSSProperties;
  const onReturnEnd = (event: React.TransitionEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
    const index = Number(event.currentTarget.dataset.bubbleIndex);
    setPositions((current) =>
      current.map((point, item) => (item === index ? { ...point, returning: false } : point)),
    );
  };
  const feature = (text: string) => (
    <span key={entrance} className="hero-feature-pop">
      <span className="hero-feature-bubble">
        <span className="hero-feature-text">{text}</span>
      </span>
    </span>
  );
  const profit = positions[highlights.length];

  return (
    <>
      <div
        ref={anchors}
        className="hero-bubble-anchors"
        aria-hidden={portal ? true : undefined}
        inert={portal ? true : undefined}
        style={portal ? { visibility: "hidden" } : undefined}
      >
        {highlights.length > 0 && (
          <div className="hero-product-highlights">
            <ul aria-label={portal ? undefined : `จุดเด่น ${name}`}>
              {highlights.map((text) => (
                <li
                  key={text}
                  data-bubble-anchor=""
                  style={{ "--feature-length": text.length } as CSSProperties}
                >
                  {!portal && feature(text)}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="hero-value-badge hero-value-anchor" data-bubble-anchor="">
          {!portal && (
            <>
              <TrendingUp size={28} strokeWidth={2} />
              <span>ตัวช่วย</span>
              <strong>เพิ่มกำไร</strong>
              <span>ให้ธุรกิจคุณ</span>
            </>
          )}
        </div>
      </div>
      {portal &&
        createPortal(
          <div
            ref={layer}
            className="hero-product-highlights hero-bubble-layer"
            aria-live="polite"
            aria-atomic="true"
            data-smooth={!paused && motionAllowed}
            data-menu-covered={menuCovered}
            data-opening={opening}
            data-in-view={sceneVisible}
            inert={opening || menuCovered || !sceneVisible}
            aria-hidden={opening || menuCovered || !sceneVisible ? true : undefined}
          >
            <ul
              aria-label={`จุดเด่น ${name}`}
              data-popup={!opening && !menuCovered && !paused && motionAllowed}
            >
              {highlights.map(
                (text, index) =>
                  positions[index]?.visible && (
                    <li
                      key={text}
                      className="hero-floating-bubble"
                      data-bubble-index={index}
                      onTransitionEnd={onReturnEnd}
                      style={placement(positions[index])}
                      data-bubble-pinned={positions[index].pinned}
                      data-returning={positions[index].returning ?? false}
                      data-interacted={positions[index].interacted ?? false}
                      data-dragging={dragging === index}
                      data-running={
                        sceneVisible &&
                        !menuCovered &&
                        !paused &&
                        motionAllowed &&
                        dragging !== index &&
                        (positions[index].pinned || sceneRunning)
                      }
                    >
                      <button
                        {...controls}
                        data-bubble-index={index}
                        aria-label={`ย้ายฟอง ${text} ใช้ปุ่มลูกศรเพื่อย้ายตำแหน่ง`}
                      >
                        {feature(text)}
                      </button>
                    </li>
                  ),
              )}
            </ul>
            {profit?.visible && (
              <div
                className="hero-floating-bubble hero-floating-value"
                data-bubble-index={highlights.length}
                onTransitionEnd={onReturnEnd}
                style={placement(profit)}
                data-bubble-pinned={profit.pinned}
                data-returning={profit.returning ?? false}
                data-interacted={profit.interacted ?? false}
                data-popup={!opening && !menuCovered && !paused && motionAllowed}
                data-dragging={dragging === highlights.length}
                data-running={
                  sceneVisible &&
                  !menuCovered &&
                  !paused &&
                  motionAllowed &&
                  dragging !== highlights.length &&
                  (profit.pinned || sceneRunning)
                }
              >
                <button
                  {...controls}
                  data-bubble-index={highlights.length}
                  aria-label="ย้ายฟอง ตัวช่วยเพิ่มกำไรให้ธุรกิจคุณ ใช้ปุ่มลูกศรเพื่อย้ายตำแหน่ง"
                >
                  <ProfitBubble key={entrance} />
                </button>
              </div>
            )}
          </div>,
          portal,
        )}
    </>
  );
}
