"use client";

/* eslint-disable @next/next/no-img-element -- These fixed source images are decoded and measured directly for shared-element transitions. */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import styles from "./products-index-carousel.module.css";

export type CarouselProduct = {
  id: string;
  model: string;
  categoryId: string;
  categoryLabel: string;
  subtitle: string;
  capacity: string;
  readability: string;
  connection: string;
  image: string;
  fallbackImage?: string;
  href?: string;
};
type CarouselProps = { products: CarouselProduct[]; categories: { id: string; label: string }[] };
type PosePoint = [number, number, number];
const desktop: PosePoint[] = [
  [330, 1000, 40],
  [388, 724, 96],
  [531, 475.75, 210],
  [780, 253, 360],
  [1049, 164, 208],
  [1295, 174, 96],
  [1530, 300, 40],
];
function pose(relative: number, w: number, h: number) {
  const mobile = w < 760,
    compact = h < 630,
    scale = mobile ? 1 : Math.min(w / 1440, h / 848);
  const points: PosePoint[] = mobile
    ? [
        [-w * 0.5, h * 1.13, 35],
        [-w * 0.13, h * 0.92, w * 0.18],
        [w * (compact ? -0.03 : 0.09), h * (compact ? 0.68 : 0.74), w * (compact ? 0.28 : 0.38)],
        [w * 0.53, h * 0.51 + Math.max(0, 650 - h) * 0.1, Math.min(w * 0.8, 330, h * 0.56)],
        [w * 0.96, h * 0.29, w * 0.36],
        [w * 1.29, h * 0.16, w * 0.16],
        [w * 1.65, h * 0.2, 35],
      ]
    : desktop;
  const t = Math.max(0, Math.min(6, relative + 3)),
    i = Math.min(5, Math.floor(t)),
    u = t - i;
  const sample = (axis: number) => {
    const a = points[Math.max(i - 1, 0)][axis],
      b = points[i][axis],
      c = points[i + 1][axis],
      d = points[Math.min(i + 2, 6)][axis];
    return (
      0.5 *
      (2 * b +
        (-a + c) * u +
        (2 * a - 5 * b + 4 * c - d) * u * u +
        (-a + 3 * b - 3 * c + d) * u * u * u) *
      scale
    );
  };
  return {
    x: sample(0) + (mobile ? 0 : (w - 1440 * scale) / 2),
    y: sample(1) + (mobile ? 0 : (h - 848 * scale) / 2),
    size: sample(2),
  };
}
function paintedBox(image: HTMLImageElement) {
  const box = image.getBoundingClientRect();
  const ratio = Math.min(box.width / image.naturalWidth, box.height / image.naturalHeight);
  const width = image.naturalWidth * ratio,
    height = image.naturalHeight * ratio;
  return {
    left: box.left + (box.width - width) / 2,
    top: box.top + (box.height - height) / 2,
    width,
    height,
  };
}
type Transition =
  | { source: ReturnType<typeof paintedBox> }
  | { previous: number; direction: number; speed: number };
const ease = "cubic-bezier(.2,.8,.2,1)";
function fallbackPhoto(image: HTMLImageElement, product: CarouselProduct) {
  if (product.fallbackImage && image.getAttribute("src") !== product.fallbackImage)
    image.src = product.fallbackImage;
}
export function ProductsIndexCarousel(props: CarouselProps) {
  if (!props.products.length) return <p role="status">ยังไม่มีสินค้าที่พร้อมแสดงในขณะนี้</p>;
  return <CarouselScene key={props.products.map((product) => product.id).join("|")} {...props} />;
}

function CarouselScene({ products, categories }: CarouselProps) {
  const count = products.length;
  const wrap = useCallback((n: number) => ((n % count) + count) % count, [count]);
  const counter = (index: number) => String(index + 1).padStart(2, "0") + " / " + count;
  const scene = useRef<HTMLElement>(null),
    models = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    hero = useRef<HTMLImageElement>(null),
    categoryDropdown = useRef<HTMLDivElement>(null),
    categoryTrigger = useRef<HTMLButtonElement>(null);
  const categoryOptions = useRef<Array<HTMLButtonElement | null>>([]);
  const categoryOpenRef = useRef(false);
  const images = useRef<Array<HTMLImageElement | null>>([]);
  const engine = useRef<{
    move: (steps: number) => void;
    select: (index: number, immediate?: boolean) => void;
  } | null>(null);
  const transition = useRef<Transition | null>(null),
    lastSwitch = useRef(0);
  const [size, setSize] = useState({ w: 1440, h: 740 });
  const [frame, setFrame] = useState({ position: 0, energy: 0, time: 0 });
  const [detail, setDetail] = useState<number | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryCursor, setCategoryCursor] = useState(0);
  const active = wrap(Math.round(frame.position)),
    index = detail ?? active,
    product = products[index];
  const activeCategoryIndex = Math.max(
    0,
    categories.findIndex((category) => category.id === products[active].categoryId),
  );
  const activeCategory = categories[activeCategoryIndex];
  const group = products.filter((p) => p.categoryId === product.categoryId);

  useLayoutEffect(() => {
    const row = models.current;
    const selected = row?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!row || !selected) return;
    if (
      selected.offsetLeft < row.scrollLeft ||
      selected.offsetLeft + selected.offsetWidth > row.scrollLeft + row.clientWidth
    ) {
      row.scrollLeft = selected.offsetLeft - (row.clientWidth - selected.offsetWidth) / 2;
    }
  }, [active, size.w]);

  useEffect(() => {
    categoryOpenRef.current = categoryOpen;
    if (!categoryOpen) return;
    function closeOnOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !categoryDropdown.current?.contains(event.target)) {
        categoryOpenRef.current = false;
        setCategoryOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [categoryOpen]);

  useEffect(() => {
    const element = scene.current!;
    element.dataset.interactive = "true";
    for (const image of images.current) {
      if (image?.complete && image.naturalWidth)
        void image
          .decode()
          .then(() => {
            image.dataset.ready = "true";
          })
          .catch(() => {});
    }
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0,
      target = 0,
      raf = 0,
      last = 0,
      energy = 0,
      timer = 0;
    function stop() {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      raf = 0;
      last = 0;
    }
    function jump(value: number) {
      stop();
      current = target = wrap(value);
      energy = 0;
      setFrame({ position: current, energy, time: 0 });
    }
    function animate(time: number) {
      const dt = Math.min(0.05, last ? (time - last) / 1000 : 1 / 60);
      last = time;
      const before = current;
      current += (target - current) * (1 - Math.exp(-13 * dt));
      energy +=
        (Math.min(1, Math.abs(current - before) / Math.max(0.001, dt) / 10) - energy) *
        (1 - Math.exp(-12 * dt));
      if (Math.abs(target - current) < 0.0002 && energy < 0.006) {
        jump(Math.round(target));
        return;
      }
      setFrame({ position: current, energy, time });
      raf = requestAnimationFrame(animate);
    }
    function start() {
      if (media.matches) jump(Math.round(target));
      else if (!raf) raf = requestAnimationFrame(animate);
    }
    function move(steps: number) {
      clearTimeout(timer);
      target = Math.round(target) + steps;
      start();
    }
    function select(next: number, immediate = false) {
      clearTimeout(timer);
      if (immediate) {
        jump(next);
        return;
      }
      target = Math.round(target) + wrap(next - Math.round(target) + count / 2) - count / 2;
      start();
    }
    function wheel(event: WheelEvent) {
      if (
        event.ctrlKey ||
        dialog.current?.open ||
        categoryOpenRef.current ||
        (event.target instanceof Element &&
          event.target.closest("[data-category-dropdown], [data-products-models]"))
      )
        return;
      event.preventDefault();
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      const pixels =
        delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
      if (media.matches) {
        move(Math.sign(pixels));
        return;
      }
      target += Math.max(-360, Math.min(360, pixels)) / 200;
      start();
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        target = Math.round(target);
        start();
      }, 140);
    }
    let swipeStart: Touch | undefined;
    function cancelSwipe() {
      swipeStart = undefined;
    }
    function beginSwipe(event: TouchEvent) {
      cancelSwipe();
      if (event.touches.length !== 1 || dialog.current?.open || categoryOpenRef.current) return;
      if (
        event.target instanceof Element &&
        event.target.closest(
          "button:not([data-product-photo]), a, [data-category-dropdown], [data-products-models]",
        )
      )
        return;
      swipeStart = event.touches[0];
    }
    function trackSwipe(event: TouchEvent) {
      if (!swipeStart) return;
      const finger = event.touches[0];
      if (event.touches.length !== 1 || finger.identifier !== swipeStart.identifier) {
        cancelSwipe();
        return;
      }
      const dx = Math.abs(finger.clientX - swipeStart.clientX);
      const dy = Math.abs(finger.clientY - swipeStart.clientY);
      if (dy >= 10 && dy >= dx) cancelSwipe();
    }
    function finishSwipe(event: TouchEvent) {
      const start = swipeStart;
      cancelSwipe();
      const end = event.changedTouches[0];
      if (
        !start ||
        event.touches.length ||
        end.identifier !== start.identifier ||
        dialog.current?.open
      )
        return;
      const dx = end.clientX - start.clientX;
      const dy = end.clientY - start.clientY;
      if (Math.abs(dx) >= 40 && Math.abs(dx) > 1.25 * Math.abs(dy)) {
        // A swipe ending on a photo button must not also activate its detail view.
        if (event.cancelable) event.preventDefault();
        move(dx < 0 ? 1 : -1);
      }
    }
    element.addEventListener("touchstart", beginSwipe, { passive: true });
    element.addEventListener("touchmove", trackSwipe, { passive: true });
    element.addEventListener("touchend", finishSwipe, { passive: false });
    element.addEventListener("touchcancel", cancelSwipe, { passive: true });
    const resize = new ResizeObserver(() =>
      setSize({ w: element.clientWidth, h: element.clientHeight }),
    );
    const settle = () => jump(Math.round(target));
    resize.observe(element);
    element.addEventListener("wheel", wheel, { passive: false });
    media.addEventListener("change", settle);
    engine.current = { move, select };
    return () => {
      engine.current = null;
      stop();
      resize.disconnect();
      media.removeEventListener("change", settle);
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("touchstart", beginSwipe);
      element.removeEventListener("touchmove", trackSwipe);
      element.removeEventListener("touchend", finishSwipe);
      element.removeEventListener("touchcancel", cancelSwipe);
    };
  }, [count, wrap]);

  useLayoutEffect(() => {
    if (detail === null) return;
    const modal = dialog.current!,
      image = hero.current!,
      effect = transition.current;
    if (!modal.open) modal.showModal();
    modal.scrollTop = 0;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || !effect) return;
    let cancelled = false,
      ghost: HTMLImageElement | undefined;
    const animations: Animation[] = [];
    function clean() {
      cancelled = true;
      for (const a of animations) a.cancel();
      ghost?.remove();
      image.style.opacity = "";
    }
    async function run() {
      try {
        await image.decode();
      } catch {
        return;
      }
      if (cancelled) return;
      if (!effect) return;
      const timing = { duration: 340, easing: ease };
      ghost = document.createElement("img");
      ghost.alt = "";
      ghost.setAttribute("aria-hidden", "true");
      if ("source" in effect) {
        const end = paintedBox(image),
          from = effect.source;
        if (!end.width || !from.width) return;
        ghost.src = image.src;
        ghost.className = styles.zoom;
        Object.assign(ghost.style, {
          left: end.left + "px",
          top: end.top + "px",
          width: end.width + "px",
          height: end.height + "px",
        });
        modal.append(ghost);
        image.style.opacity = "0";
        animations.push(
          ghost.animate(
            [
              {
                transform: `translate(${from.left - end.left}px,${from.top - end.top}px) scale(${from.width / end.width})`,
              },
              { transform: "none" },
            ],
            { duration: 560, easing: ease },
          ),
        );
      } else {
        const { previous, direction, speed } = effect;
        ghost.src = products[previous].image;
        ghost.className = styles.trail;
        image.parentElement!.append(ghost);
        const blur = "blur(" + Math.min(24, 14 * speed) + "px)";
        animations.push(
          ghost.animate(
            [
              { opacity: 0.8 },
              {
                opacity: 0,
                transform: `translateX(${-direction * 90 * speed}px) scaleX(1.18)`,
                filter: blur,
              },
            ],
            { ...timing, duration: 238, fill: "forwards" },
          ),
        );
        animations.push(
          image.animate(
            [
              {
                opacity: 0.25,
                transform: `translateX(${direction * 64 * speed}px) scaleX(1.08)`,
                filter: blur,
              },
              { opacity: 1, transform: "none", filter: "none" },
            ],
            timing,
          ),
        );
      }
      animations[animations.length - 1].onfinish = clean;
    }
    void run();
    media.addEventListener("change", clean);
    window.addEventListener("resize", clean);
    return () => {
      clean();
      media.removeEventListener("change", clean);
      window.removeEventListener("resize", clean);
    };
  }, [detail, products]);

  function open(next: number) {
    categoryOpenRef.current = false;
    setCategoryOpen(false);
    const image = images.current[next];
    transition.current = image?.naturalWidth ? { source: paintedBox(image) } : null;
    lastSwitch.current = 0;
    engine.current?.select(next, true);
    setDetail(next);
  }
  function switchDetail(next: number, direction: number, now: number) {
    if (detail === null || detail === next) return;
    transition.current = {
      previous: detail,
      direction,
      speed: Math.min(1.8, Math.max(1, 260 / Math.max(80, now - lastSwitch.current))),
    };
    lastSwitch.current = now;
    engine.current?.select(next, true);
    setDetail(next);
  }
  function categoryStep(step: number, now: number) {
    const groupIndex = categories.findIndex((c) => c.id === product.categoryId);
    const next = categories[(groupIndex + step + categories.length) % categories.length];
    switchDetail(
      products.findIndex((p) => p.categoryId === next.id),
      step,
      now,
    );
  }
  function close() {
    dialog.current?.close();
    setDetail(null);
    images.current[index]?.parentElement?.focus({ preventScroll: true });
  }
  function setCategoryExpanded(open: boolean) {
    categoryOpenRef.current = open;
    setCategoryOpen(open);
  }
  function focusCategoryOption(next: number) {
    const wrapped = (next + categories.length) % categories.length;
    setCategoryCursor(wrapped);
    requestAnimationFrame(() => categoryOptions.current[wrapped]?.focus());
  }
  function openCategoryMenu(next = activeCategoryIndex) {
    setCategoryExpanded(true);
    focusCategoryOption(next);
  }
  function closeCategoryMenu(returnFocus = false) {
    setCategoryExpanded(false);
    if (returnFocus) requestAnimationFrame(() => categoryTrigger.current?.focus());
  }
  function selectCategory(next: number) {
    const firstProduct = products.findIndex((item) => item.categoryId === categories[next].id);
    if (firstProduct < 0) return;
    setCategoryCursor(next);
    engine.current?.select(firstProduct);
    closeCategoryMenu(true);
  }
  function handleCategoryTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openCategoryMenu(activeCategoryIndex);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      openCategoryMenu(event.key === "Home" ? 0 : categories.length - 1);
    } else if (event.key === "Escape" && categoryOpen) {
      event.preventDefault();
      closeCategoryMenu(true);
    }
  }
  function handleCategoryOptionKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusCategoryOption(categoryCursor + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      focusCategoryOption(event.key === "Home" ? 0 : categories.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectCategory(categoryCursor);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeCategoryMenu(true);
    } else if (event.key === "Tab") {
      setCategoryExpanded(false);
    }
  }
  return (
    <section
      ref={scene}
      className={styles.scene}
      data-products-index-carousel
      aria-label="เลือกดูสินค้า"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== scene.current) return;
        if (["ArrowRight", "ArrowLeft"].includes(e.key)) {
          e.preventDefault();
          engine.current?.move(e.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div className={styles.copy} data-products-carousel-copy>
        <div
          ref={categoryDropdown}
          className={styles.categoryDropdown}
          data-category-dropdown
          data-open={categoryOpen}
        >
          <button
            ref={categoryTrigger}
            type="button"
            className={styles.categoryTrigger}
            aria-label={`หมวดสินค้า: ${activeCategory.label}`}
            aria-haspopup="listbox"
            aria-expanded={categoryOpen}
            aria-controls="products-carousel-category-options"
            onClick={() =>
              categoryOpen ? closeCategoryMenu(false) : openCategoryMenu(activeCategoryIndex)
            }
            onKeyDown={handleCategoryTriggerKeyDown}
          >
            <span>{activeCategory.label}</span>
            <i className={styles.categoryChevron} aria-hidden="true" />
          </button>
          <div
            id="products-carousel-category-options"
            className={styles.categoryPanel}
            role="listbox"
            aria-label="หมวดสินค้า"
            aria-hidden={!categoryOpen}
          >
            {categories.map((category, categoryIndex) => (
              <button
                key={category.id}
                ref={(node) => {
                  categoryOptions.current[categoryIndex] = node;
                }}
                type="button"
                role="option"
                className={styles.categoryOption}
                aria-selected={category.id === activeCategory.id}
                tabIndex={categoryOpen && categoryIndex === categoryCursor ? 0 : -1}
                onFocus={() => setCategoryCursor(categoryIndex)}
                onKeyDown={handleCategoryOptionKeyDown}
                onClick={() => selectCategory(categoryIndex)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        <h2>{products[active].model}</h2>
      </div>
      {products.map((p, i) => {
        const relative = wrap(i - frame.position + count / 2) - count / 2;
        const visible = Math.abs(relative) <= 3.4;
        const point = visible ? pose(relative, size.w, size.h) : null;
        return (
          <button
            key={p.id}
            type="button"
            hidden={!visible}
            className={styles.photo}
            data-product-photo={p.id}
            aria-label={"ดูรายละเอียด " + p.model}
            aria-current={i === active}
            tabIndex={Math.abs(relative) < 2.4 ? 0 : -1}
            onClick={() => open(i)}
            style={
              point
                ? {
                    transform: `translate3d(${point.x - 200}px,${point.y - 160}px,0) scale(${point.size / 400})`,
                    zIndex: Math.round(10 - Math.abs(relative)),
                    opacity: Math.min(1, (3.4 - Math.abs(relative)) / 0.7),
                  }
                : undefined
            }
          >
            <img
              ref={(node) => {
                images.current[i] = node;
              }}
              src={p.image || undefined}
              onError={(event) => fallbackPhoto(event.currentTarget, p)}
              alt={p.image ? p.model : ""}
              decoding="async"
              onLoad={(e) => {
                const img = e.currentTarget;
                void img
                  .decode()
                  .then(() => {
                    img.dataset.ready = "true";
                  })
                  .catch(() => {
                    if (img.naturalWidth) img.dataset.ready = "true";
                  });
              }}
            />
          </button>
        );
      })}
      <div
        ref={models}
        className={styles.models}
        data-products-models
        role="group"
        aria-label="เลือกรุ่นในหมวดสินค้า"
      >
        {products
          .filter((p) => p.categoryId === products[active].categoryId)
          .map((p) => (
            <button
              key={p.id}
              aria-current={p.id === products[active].id}
              onClick={() => engine.current?.select(products.indexOf(p))}
            >
              {p.model}
            </button>
          ))}
      </div>
      <div className={styles.progress} data-equalizer>
        <div>
          <button aria-label="สินค้ารุ่นก่อนหน้า" onClick={() => engine.current?.move(-1)}>
            ‹
          </button>
          <span className={styles.ticks} aria-hidden="true">
            {products.map((p, i) => {
              const distance = Math.abs(wrap(i - frame.position + count / 2) - count / 2);
              const focus = Math.exp((-distance * distance) / 5);
              return (
                <i
                  key={p.id}
                  style={{
                    transform: `scaleY(${0.2 + 0.5 * focus + 0.4 * frame.energy * (0.5 + 0.5 * Math.sin(i * 0.95 - frame.time * 0.018))})`,
                    opacity: 0.22 + 0.65 * focus + 0.13 * frame.energy,
                  }}
                />
              );
            })}
          </span>
          <button aria-label="สินค้ารุ่นถัดไป" onClick={() => engine.current?.move(1)}>
            ›
          </button>
        </div>
        <small>{counter(active)}</small>
        <small>
          <span className={styles.mouseHint}>เลื่อนลูกกลิ้งเมาส์เพื่อเปลี่ยนรุ่น</span>
          <span className={styles.touchHint}>
            ปัดซ้ายหรือขวาเพื่อเปลี่ยนรุ่น · แตะรูปเพื่อดูรายละเอียด
          </span>
        </small>
      </div>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="carousel-detail-title"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
      >
        {detail !== null && (
          <div className={styles.detail}>
            <button className={styles.back} onClick={close}>
              ‹　กลับไปเลือกสินค้า
            </button>
            <div className={styles.hero}>
              <img
                key={product.id}
                ref={hero}
                src={product.image || undefined}
                onError={(event) => fallbackPhoto(event.currentTarget, product)}
                alt={product.image ? product.model : ""}
              />
            </div>
            <article>
              <h2 id="carousel-detail-title">{product.model}</h2>
              <p>{product.subtitle}</p>
              <dl>
                {[
                  ["พิกัดสูงสุด", product.capacity],
                  ["ความละเอียด", product.readability],
                  ["การเชื่อมต่อ", product.connection],
                ].map(([label, value]) =>
                  value ? (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
              <a
                className={styles.contact}
                href="https://line.me/R/ti/p/@sunford"
                target="_blank"
                rel="noopener noreferrer"
              >
                สอบถามสินค้า
              </a>
              {product.href && <Link href={product.href}>ดูรายละเอียดทั้งหมด</Link>}
            </article>
            <div className={styles.thumbs}>
              {group.map((p) => (
                <button
                  key={p.id}
                  aria-label={"ดูรายละเอียด " + p.model}
                  aria-current={p.id === product.id}
                  onClick={(event) =>
                    switchDetail(
                      products.indexOf(p),
                      Math.sign(products.indexOf(p) - index),
                      event.timeStamp,
                    )
                  }
                >
                  <img
                    src={p.image || undefined}
                    onError={(event) => fallbackPhoto(event.currentTarget, p)}
                    alt=""
                  />
                </button>
              ))}
            </div>
            <nav className={styles.categories} aria-label="เปลี่ยนหมวดสินค้า">
              <small>{counter(index)}</small>
              <button onClick={(event) => categoryStep(-1, event.timeStamp)}>
                ‹　หมวดหมู่ก่อนหน้า
              </button>
              <button onClick={(event) => categoryStep(1, event.timeStamp)}>
                หมวดหมู่ถัดไป　›
              </button>
            </nav>
          </div>
        )}
      </dialog>
    </section>
  );
}
