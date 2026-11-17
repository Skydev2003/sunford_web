import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { navigationStartScript } from "../../src/components/layout/navigation-start";

function documentHistory(type = "navigate", secure = true) {
  const location = { pathname: "/products", search: "?catalog=all", hash: "#item" };
  const events: string[] = [];
  const listeners = new Map<string, (() => void)[]>();
  const state = {
    __NA: true,
    __PRIVATE_NEXTJS_INTERNALS_TREE: { tree: "next" },
    custom: "keep",
    sunfordReturn: { id: "previous-document" },
  };
  const history = {
    state: state as Record<string, unknown>,
    scrollRestoration: "auto",
    pushState(data: Record<string, unknown>, _unused: string, url?: string) {
      this.state = data;
      if (url) {
        const next = new URL(url, "http://local");
        Object.assign(location, { pathname: next.pathname, search: next.search, hash: next.hash });
      }
    },
    replaceState(data: Record<string, unknown>, _unused: string, url?: string) {
      this.state = data;
      if (url) {
        const next = new URL(url, "http://local");
        Object.assign(location, { pathname: next.pathname, search: next.search, hash: next.hash });
      }
    },
  };
  let counter = 0;
  vm.runInNewContext(navigationStartScript, {
    history,
    location,
    crypto: secure ? { randomUUID: () => `entry-${++counter}` } : {},
    performance: { getEntriesByType: () => [{ type }] },
    document: { documentElement: { dataset: {} } },
    Event: class {
      constructor(public type: string) {}
    },
    CustomEvent: class {
      constructor(
        public type: string,
        public options: unknown,
      ) {}
    },
    window: {
      dispatchEvent: (event: { type: string }) => events.push(event.type),
      addEventListener: (name: string, listener: () => void) => {
        listeners.set(name, [...(listeners.get(name) ?? []), listener]);
      },
      scrollTo: () => {},
    },
  });
  return {
    history,
    events,
    location,
    pop: () => listeners.get("popstate")?.forEach((listener) => listener()),
  };
}

test("entry initialization preserves Next metadata and other history state", () => {
  const { history } = documentHistory();
  assert.equal(history.state.__NA, true);
  assert.equal(history.state.custom, "keep");
  assert.equal((history.state.__PRIVATE_NEXTJS_INTERNALS_TREE as { tree: string }).tree, "next");
  assert.equal((history.state.sunfordReturn as { id: string }).id, "entry-1");
});

test("push keeps distinct entry identities and the real source URL without replacing Next state", () => {
  const { history, events } = documentHistory();
  history.pushState({ __NA: true, router: "new-tree" }, "", "/products/item");
  const current = history.state.sunfordReturn as {
    id: string;
    parent: { id: string; href: string };
  };
  assert.equal(current.id, "entry-2");
  assert.equal(current.parent.id, "entry-1");
  assert.equal(current.parent.href, "/products?catalog=all#item");
  assert.equal(history.state.router, "new-tree");
  assert.deepEqual(events, ["sunford:leaving", "sunford:entry"]);
});

test("native replaceState(null) retains identity and origin for filters and hashes", () => {
  const { history } = documentHistory();
  const before = history.state.sunfordReturn;
  history.replaceState(null as unknown as Record<string, unknown>, "", "/products?category=scales");
  assert.equal(history.state.sunfordReturn, before);
});

test("reload starts a new document identity without a stale source or stored snapshots", () => {
  const { history } = documentHistory("reload");
  assert.equal((history.state.sunfordReturn as { id: string }).id, "entry-1");
  assert.equal((history.state.sunfordReturn as { parent?: unknown }).parent, undefined);
  assert.equal(history.scrollRestoration, "manual");
});

test("non-secure local previews still create distinct navigation identities", () => {
  const { history } = documentHistory("navigate", false);
  const initial = (history.state.sunfordReturn as { id: string }).id;
  assert.ok(initial);
  history.pushState({}, "", "/service");
  assert.notEqual((history.state.sunfordReturn as { id: string }).id, initial);
});

test("native fragment entries inherit Next metadata and preserve the genuine page origin distance", () => {
  const { history, location, pop, events } = documentHistory();
  history.pushState({ __NA: true, router: "detail" }, "", "/products/item");
  const detail = history.state;
  history.state = null as unknown as Record<string, unknown>;
  location.hash = "#main-content";
  pop();
  const fragment = history.state.sunfordReturn as {
    id: string;
    parent: { id: string; href: string; steps: number };
  };
  assert.notEqual(fragment.id, (detail.sunfordReturn as { id: string }).id);
  assert.equal(fragment.parent.href, "/products?catalog=all#item");
  assert.equal(fragment.parent.steps, 2);
  assert.equal(history.state.__NA, true);
  assert.equal(history.state.router, "detail");
  assert.equal(events.at(-1), "sunford:fragment");
});
