"use client";

import {
  useCallback,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useCatalogStore } from "@/stores/catalog-store";

// Document lifetime only: reloads and new tabs keep their existing initial behavior.
const values = new Map<string, unknown>();

export function useReturnState<T>(
  name: string,
  initial: T | (() => T),
  snapshot?: (value: T) => T,
): [T, Dispatch<SetStateAction<T>>] {
  const identity = useSyncExternalStore(
    subscribeReturnOrigin,
    () => entry()?.id ?? "initial",
    () => "initial",
  );
  const key = `${identity}:${name}`;
  const active = useRef(true);
  const ownerKey = useRef(key);
  useLayoutEffect(() => {
    active.current = true;
    ownerKey.current = key;
    return () => {
      active.current = false;
    };
  }, [key]);
  const read = () =>
    values.has(key)
      ? (values.get(key) as T)
      : typeof initial === "function"
        ? (initial as () => T)()
        : initial;
  const [state, setState] = useState(() => ({ key, value: read() }));
  if (state.key !== key) setState({ key, value: read() });
  useLayoutEffect(() => {
    values.set(key, snapshot ? snapshot(state.value) : state.value);
  }, [key, state.value, snapshot]);
  const update = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => {
      if (!active.current || ownerKey.current !== key) return;
      const targetKey = `${entry()?.id ?? identity}:${name}`;
      setState((previous) => {
        if (!active.current || ownerKey.current !== key) return previous;
        const base = values.has(targetKey) ? (values.get(targetKey) as T) : previous.value;
        const value = typeof next === "function" ? (next as (value: T) => T)(base) : next;
        values.set(targetKey, snapshot ? snapshot(value) : value);
        return previous.key === targetKey && Object.is(previous.value, value)
          ? previous
          : { key: targetKey, value };
      });
    },
    [key, snapshot, identity, name],
  );
  return [state.value, update];
}

type Entry = { id: string; parent?: { id: string; href: string; steps?: number } };
const entry = () => history.state?.sunfordReturn as Entry | undefined;
type Locator = { selector: string; index: number };
type Field = { target: Locator; value: string; checked?: boolean };
type Snapshot = {
  x: number;
  y: number;
  width: number;
  height: number;
  heading: string | null;
  scroll: { target: Locator; x: number; y: number }[];
  fields: Field[];
  details: { target: Locator; open: boolean }[];
  focus?: Locator;
  catalog: Pick<
    ReturnType<typeof useCatalogStore.getState>,
    | "category"
    | "query"
    | "searchOpen"
    | "compareOpen"
    | "compareMode"
    | "compareIds"
    | "overlayQuery"
  >;
};
const snapshots = new Map<string, Snapshot>();

function selector(element: Element): string {
  const scope = element.getAttribute("data-return-scope");
  if (scope) return `[data-return-scope="${CSS.escape(scope)}"]`;
  if (element.id) return `#${CSS.escape(element.id)}`;
  const label = element.getAttribute("aria-label");
  if (label) return `${element.tagName.toLowerCase()}[aria-label="${CSS.escape(label)}"]`;
  const own =
    element.tagName.toLowerCase() +
    [...element.classList].map((value) => `.${CSS.escape(value)}`).join("");
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    if (element.name) return `${element.tagName.toLowerCase()}[name="${CSS.escape(element.name)}"]`;
  }
  if (element instanceof HTMLAnchorElement)
    return `a[href="${CSS.escape(element.getAttribute("href") ?? "")}"]`;
  return element.parentElement && !element.classList.length
    ? `${selector(element.parentElement)} > ${own}:nth-of-type(${[...element.parentElement.children].filter((child) => child.tagName === element.tagName).indexOf(element) + 1})`
    : own;
}
const visible = (element: Element) => element.getClientRects().length > 0;
const find = (root: HTMLElement, target: Locator) =>
  [...root.querySelectorAll<HTMLElement>(target.selector)].filter(visible)[target.index];

export function getReturnOrigin() {
  const parent = entry()?.parent;
  return parent &&
    snapshots.has(parent.id) &&
    parent.href.startsWith("/") &&
    !parent.href.startsWith("//")
    ? parent.href
    : undefined;
}

export function returnToOrigin() {
  if (!getReturnOrigin()) return;
  const steps = entry()?.parent?.steps ?? 1;
  history.go(-steps);
}

export function subscribeReturnOrigin(notify: () => void) {
  const committed = () => queueMicrotask(notify);
  window.addEventListener("sunford:entry", committed);
  window.addEventListener("popstate", notify);
  return () => {
    window.removeEventListener("sunford:entry", committed);
    window.removeEventListener("popstate", notify);
  };
}

export function useHistoryRestoration(root: React.RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const surface = root.current;
    if (!surface) return;
    const locate = (element: Element): Locator => {
      const path = selector(element);
      return {
        selector: path,
        index: [...surface.querySelectorAll(path)].filter(visible).indexOf(element),
      };
    };
    let current = entry()?.id;
    let captured = false;
    let fragmentEntry = false;
    let cancelRestore = () => {};
    const capture = () => {
      if (!current || captured) return;
      const elements = [...surface.querySelectorAll<HTMLElement>("*")].filter(visible);
      const { category, query, searchOpen, compareOpen, compareMode, compareIds, overlayQuery } =
        useCatalogStore.getState();
      snapshots.set(current, {
        x: scrollX,
        y: scrollY,
        width: innerWidth,
        height: innerHeight,
        heading: [...surface.querySelectorAll("main h1")].find(visible)?.textContent ?? null,
        scroll: elements
          .filter(
            (el) =>
              el.scrollLeft ||
              el.scrollTop ||
              ((el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) &&
                /(auto|scroll)/.test(
                  getComputedStyle(el).overflow +
                    getComputedStyle(el).overflowX +
                    getComputedStyle(el).overflowY,
                )),
          )
          .map((el) => ({ target: locate(el), x: el.scrollLeft, y: el.scrollTop })),
        fields: elements
          .filter(
            (el): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
              (el instanceof HTMLInputElement &&
                !["password", "file", "hidden", "submit", "button"].includes(el.type)) ||
              el instanceof HTMLTextAreaElement ||
              el instanceof HTMLSelectElement,
          )
          .filter((el) => Boolean(el.name))
          .map((el) => ({
            target: locate(el),
            value: el.value,
            checked: el instanceof HTMLInputElement ? el.checked : undefined,
          })),
        details: elements
          .filter((el): el is HTMLDetailsElement => el instanceof HTMLDetailsElement)
          .map((el) => ({ target: locate(el), open: el.open })),
        focus:
          document.activeElement && surface.contains(document.activeElement)
            ? locate(document.activeElement)
            : undefined,
        catalog: {
          category,
          query,
          searchOpen,
          compareOpen,
          compareMode,
          compareIds: [...compareIds],
          overlayQuery,
        },
      });
    };
    const click = (event: MouseEvent) => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      captured = false;
      const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (anchor?.hasAttribute("data-back-to-top")) {
        event.preventDefault();
        const main = [...surface.querySelectorAll<HTMLElement>("#main-content")].find(visible);
        if (main) {
          if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
          main.focus({ preventScroll: true });
        }
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        return;
      }
      if (
        !anchor ||
        anchor.target ||
        anchor.hasAttribute("download") ||
        anchor.origin !== location.origin ||
        (anchor.pathname + anchor.search === location.pathname + location.search &&
          (!anchor.hash || anchor.hash === location.hash))
      )
        return;
      captured = false;
      capture();
      captured = true;
    };
    const leaving = () => capture();
    const pushed = () => {
      cancelRestore();
      current = entry()?.id;
      captured = false;
    };
    const replaced = () => {
      captured = false;
    };
    const fragment = (event: Event) => {
      capture();
      fragmentEntry = true;
      const { from, to } = (event as CustomEvent<{ from: string; to: string }>).detail;
      for (const [key, value] of values) {
        if (key.startsWith(`${from}:`)) values.set(`${to}:${key.slice(from.length + 1)}`, value);
      }
    };
    const pop = () => {
      cancelRestore();
      if (!fragmentEntry) captured = false;
      capture();
      fragmentEntry = false;
      captured = false;
      current = entry()?.id;
      const snapshot = current && snapshots.get(current);
      if (!snapshot) return;
      useCatalogStore.setState(snapshot.catalog);
      let frame = 0;
      let attempts = 0;
      let stable = 0;
      let focused = false;
      const stop = () => {
        cancelAnimationFrame(frame);
        for (const name of ["wheel", "touchstart", "pointerdown", "keydown"])
          window.removeEventListener(name, stop, true);
      };
      cancelRestore = stop;
      for (const name of ["wheel", "touchstart", "pointerdown", "keydown"])
        window.addEventListener(name, stop, { capture: true, once: true });
      const restore = () => {
        attempts++;
        const heading = [...surface.querySelectorAll("main h1")].find(visible)?.textContent ?? null;
        if (heading !== snapshot.heading) {
          if (attempts < 300) frame = requestAnimationFrame(restore);
          else stop();
          return;
        }
        for (const field of snapshot.fields) {
          const el = find(surface, field.target);
          if (
            el instanceof HTMLInputElement ||
            el instanceof HTMLTextAreaElement ||
            el instanceof HTMLSelectElement
          ) {
            el.value = field.value;
            if (el instanceof HTMLInputElement && field.checked !== undefined)
              el.checked = field.checked;
          }
        }
        for (const detail of snapshot.details) {
          const el = find(surface, detail.target);
          if (el instanceof HTMLDetailsElement) el.open = detail.open;
        }
        let matched = true;
        const resized = innerWidth !== snapshot.width || innerHeight !== snapshot.height;
        for (const position of snapshot.scroll) {
          const el = find(surface, position.target);
          if (!el) {
            matched = false;
            continue;
          }
          el.scrollTo({ left: position.x, top: position.y, behavior: "instant" });
          if (
            !resized &&
            (Math.abs(el.scrollTop - position.y) > 4 || Math.abs(el.scrollLeft - position.x) > 4)
          )
            matched = false;
        }
        window.scrollTo({ left: snapshot.x, top: snapshot.y, behavior: "instant" });
        if (!resized && Math.abs(scrollY - snapshot.y) > 4) matched = false;
        if (resized && snapshot.focus) {
          const anchor = find(surface, snapshot.focus);
          if (
            anchor &&
            (!document.querySelector("dialog[open]") || anchor.closest("dialog[open]"))
          ) {
            anchor.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
          } else matched = false;
        }
        if (!focused && snapshot.focus) {
          const el = find(surface, snapshot.focus);
          if (el && (!document.querySelector("dialog[open]") || el.closest("dialog[open]"))) {
            el.focus({ preventScroll: true });
            focused = true;
          }
        }
        stable = matched ? stable + 1 : 0;
        if (attempts < 120 && stable < 8) frame = requestAnimationFrame(restore);
        else stop();
      };
      frame = requestAnimationFrame(restore);
    };
    window.addEventListener("click", click, true);
    window.addEventListener("sunford:leaving", leaving);
    window.addEventListener("sunford:entry", pushed);
    window.addEventListener("sunford:replace", replaced);
    window.addEventListener("sunford:fragment", fragment);
    window.addEventListener("popstate", pop);
    return () => {
      cancelRestore();
      window.removeEventListener("click", click, true);
      window.removeEventListener("sunford:leaving", leaving);
      window.removeEventListener("sunford:entry", pushed);
      window.removeEventListener("sunford:replace", replaced);
      window.removeEventListener("sunford:fragment", fragment);
      window.removeEventListener("popstate", pop);
    };
  }, [root]);
}
