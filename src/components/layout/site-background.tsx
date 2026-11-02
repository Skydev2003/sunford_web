"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Pause, Play } from "lucide-react";
import styles from "./site-background.module.css";

const MotionContext = createContext<{ paused: boolean; toggle: () => void } | null>(null);
const palette = ["215, 25, 45", "231, 147, 167", "139, 151, 171"];
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  ring: boolean;
  color: string;
};

function ParticleField({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const syncRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    syncRef.current?.();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let previous = 0;
    let distance = 200;
    let clipTop = 0;
    let measureFrame = 0;

    const paint = () => {
      context.clearRect(0, 0, width, height);
      if (clipTop >= height) return;
      context.save();
      context.beginPath();
      context.rect(0, clipTop, width, height - clipTop);
      context.clip();
      context.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const gap = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (gap >= distance) continue;
          context.strokeStyle = `rgba(${particle.color}, ${(1 - gap / distance) * 0.13})`;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        if (particle.ring) {
          context.lineWidth = particle.radius > 12 ? 2 : 1.2;
          context.strokeStyle = `rgba(${particle.color}, 0.18)`;
          context.stroke();
          context.lineWidth = 0.8;
        } else {
          context.fillStyle = `rgba(${particle.color}, 0.16)`;
          context.fill();
        }
      }
      context.restore();
    };
    const canRun = () => !pausedRef.current && !document.hidden && height > 0 && clipTop < height;
    const animate = (now: number) => {
      const interval = reduced.matches ? 1000 / 15 : 1000 / 30;
      const elapsed = now - previous;
      if (elapsed >= interval) {
        const delta = Math.min(elapsed / 1000, 0.06) * (reduced.matches ? 0.2 : 1);
        for (const particle of particles) {
          particle.x += particle.vx * delta;
          particle.y += particle.vy * delta;
          if (particle.x < particle.radius || particle.x > width - particle.radius)
            particle.vx *= -1;
          if (particle.y < particle.radius || particle.y > height - particle.radius)
            particle.vy *= -1;
          particle.x = Math.max(particle.radius, Math.min(width - particle.radius, particle.x));
          particle.y = Math.max(particle.radius, Math.min(height - particle.radius, particle.y));
        }
        paint();
        previous = now;
      }
      frame = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      canvas.dataset.running = String(canRun());
      canvas.dataset.motion = reduced.matches ? "gentle" : "normal";
      if (canRun()) {
        previous = performance.now();
        frame = requestAnimationFrame(animate);
      }
    };
    const measureStart = () => {
      measureFrame = 0;
      const main = Array.from(document.querySelectorAll<HTMLElement>("#main-content")).find(
        (element) => element.getClientRects().length > 0,
      );
      const start = main?.dataset.backgroundStart;
      const surface =
        main?.dataset.pageSurface ??
        main?.querySelector<HTMLElement>("[data-page-surface]")?.dataset.pageSurface;
      canvas.parentElement!.dataset.siteSurface = surface ?? "white";
      const marker = start ? main?.querySelector<HTMLElement>(`#${start}`) : null;
      clipTop = !main
        ? height
        : start
          ? Math.max(0, Math.min(height, marker?.getBoundingClientRect().top ?? height))
          : 0;
      canvas.dataset.clipTop = String(clipTop);
      paint();
      sync();
    };
    const scheduleMeasure = () => {
      if (!measureFrame) measureFrame = requestAnimationFrame(measureStart);
    };
    const resize = () => {
      const oldWidth = width;
      const oldHeight = height;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      distance = Math.min(235, Math.max(155, width * 0.17));
      const count = Math.min(48, Math.max(12, Math.round((width * height) / 38000)));
      particles = Array.from({ length: count }, (_, index) => {
        const existing = particles[index];
        if (existing && oldWidth && oldHeight)
          return {
            ...existing,
            x: (existing.x / oldWidth) * width,
            y: (existing.y / oldHeight) * height,
          };
        const angle = Math.random() * Math.PI * 2;
        const speed = 7 + Math.random() * 7;
        return {
          x: 25 + Math.random() * Math.max(1, width - 50),
          y: 25 + Math.random() * Math.max(1, height - 50),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: index % 6 === 0 ? 11 + Math.random() * 11 : 2.5 + Math.random() * 3,
          ring: index % 4 === 0,
          color: palette[index % palette.length],
        };
      });
      measureStart();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const contentObserver = new MutationObserver(scheduleMeasure);
    contentObserver.observe(document.body, { childList: true, subtree: true });
    syncRef.current = sync;
    resize();
    sync();
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    reduced.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      observer.disconnect();
      contentObserver.disconnect();
      syncRef.current = null;
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("scroll", scheduleMeasure);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={styles.field}
      data-site-background=""
      data-running="false"
      aria-hidden="true"
    />
  );
}

export function SiteBackground({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const motion = useMemo(() => ({ paused, toggle: () => setPaused((value) => !value) }), [paused]);
  return (
    <MotionContext.Provider value={motion}>
      <div className={styles.surface}>
        <ParticleField paused={paused} />
        {children}
      </div>
    </MotionContext.Provider>
  );
}

export function BackgroundMotionToggle() {
  const motion = useContext(MotionContext);
  if (!motion) return null;
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={motion.toggle}
      aria-pressed={motion.paused}
      aria-label={motion.paused ? "เล่นพื้นหลังเคลื่อนไหว" : "หยุดพื้นหลังเคลื่อนไหว"}
    >
      {motion.paused ? (
        <Play size={12} aria-hidden="true" />
      ) : (
        <Pause size={12} aria-hidden="true" />
      )}
      {motion.paused ? "เล่นพื้นหลัง" : "หยุดพื้นหลัง"}
    </button>
  );
}
