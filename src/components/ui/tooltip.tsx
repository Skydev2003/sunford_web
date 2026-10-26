"use client";

import {
  type HTMLAttributes,
  type ReactElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type TooltipTriggerProps = HTMLAttributes<HTMLElement> & { disabled?: boolean };

export function Tooltip({
  children,
  content = children.props["aria-label"],
}: {
  children: ReactElement<TooltipTriggerProps>;
  content?: string;
}) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const dismiss = useCallback(() => {
    clearTimer();
    setAnchor(null);
  }, [clearTimer]);
  const scheduleClose = () => {
    clearTimer();
    timer.current = setTimeout(() => setAnchor(null), 120);
  };

  useEffect(() => clearTimer, [clearTimer]);
  useLayoutEffect(() => {
    if (!anchor) return;
    const updatePosition = () => {
      const tooltip = tooltipRef.current;
      if (!tooltip || !anchor.isConnected) return dismiss();
      const trigger = anchor.getBoundingClientRect();
      if (trigger.bottom <= 0 || trigger.top >= window.innerHeight) return dismiss();
      const bounds = tooltip.getBoundingClientRect();
      const above = trigger.top - bounds.height - 8;
      const top = above >= 8 ? above : trigger.bottom + 8;
      setPosition({
        top: Math.max(8, Math.min(top, window.innerHeight - bounds.height - 8)),
        left: Math.max(
          8,
          Math.min(
            trigger.left + (trigger.width - bounds.width) / 2,
            document.documentElement.clientWidth - bounds.width - 8,
          ),
        ),
      });
    };
    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(anchor);
    if (tooltipRef.current) observer.observe(tooltipRef.current);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      dismiss();
    };
    document.addEventListener("keydown", onEscape, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("keydown", onEscape, true);
    };
  }, [anchor, content, dismiss]);

  if (!content) return children;
  const Trigger = children.type;

  return (
    <>
      <Trigger
        key={children.key}
        {...children.props}
        aria-label={children.props["aria-label"] ?? content}
        aria-describedby={
          [children.props["aria-describedby"], anchor ? id : undefined].filter(Boolean).join(" ") ||
          undefined
        }
        onPointerEnter={(event: React.PointerEvent<HTMLElement>) => {
          children.props.onPointerEnter?.(event);
          if (event.pointerType === "touch" || children.props.disabled) return;
          clearTimer();
          const element = event.currentTarget;
          timer.current = setTimeout(() => setAnchor(element), 300);
        }}
        onPointerLeave={(event: React.PointerEvent<HTMLElement>) => {
          children.props.onPointerLeave?.(event);
          if (!event.currentTarget.matches(":focus-visible")) scheduleClose();
        }}
        onFocus={(event: React.FocusEvent<HTMLElement>) => {
          children.props.onFocus?.(event);
          if (!event.currentTarget.matches(":focus-visible") || children.props.disabled) return;
          clearTimer();
          setAnchor(event.currentTarget);
        }}
        onBlur={(event: React.FocusEvent<HTMLElement>) => {
          children.props.onBlur?.(event);
          scheduleClose();
        }}
        onClick={(event: React.MouseEvent<HTMLElement>) => {
          dismiss();
          children.props.onClick?.(event);
        }}
      />
      {anchor &&
        createPortal(
          <div
            ref={tooltipRef}
            id={id}
            role="tooltip"
            className="ui-tooltip"
            style={position}
            onPointerEnter={clearTimer}
            onPointerLeave={scheduleClose}
          >
            {content}
          </div>,
          anchor.closest("dialog[open]") ?? document.body,
        )}
    </>
  );
}
