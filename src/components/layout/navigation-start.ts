export const navigationStartScript = `
(() => {
  const navigation = performance.getEntriesByType("navigation")[0];
  // Keep our entry identity alongside Next's state, including native URL replacements.
  const entry = () => ({ id: globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36) });
  const push = history.pushState.bind(history);
  const replace = history.replaceState.bind(history);
  replace({ ...history.state, sunfordReturn: entry() }, "");
  let lastState = history.state;
  let lastPath = location.pathname + location.search;
  let lastHref = lastPath + location.hash;
  const track = () => {
    lastState = history.state;
    lastPath = location.pathname + location.search;
    lastHref = lastPath + location.hash;
  };
  history.pushState = (state, unused, url) => {
    const parent = { id: history.state?.sunfordReturn?.id, href: location.pathname + location.search + location.hash, steps: 1 };
    window.dispatchEvent(new Event("sunford:leaving"));
    push({ ...state, sunfordReturn: { ...entry(), parent } }, unused, url);
    track();
    window.dispatchEvent(new Event("sunford:entry"));
  };
  history.replaceState = (state, unused, url) => {
    replace({ ...state, sunfordReturn: history.state?.sunfordReturn ?? entry() }, unused, url);
    track();
    window.dispatchEvent(new Event("sunford:replace"));
  };
  window.addEventListener("popstate", () => {
    // Native fragment anchors create entries without calling pushState.
    if (!history.state?.sunfordReturn && location.pathname + location.search === lastPath) {
      const from = lastState?.sunfordReturn?.id;
      const origin = lastState?.sunfordReturn?.parent;
      const next = { ...entry(), parent: origin ? { ...origin, steps: (origin.steps ?? 1) + 1 } : undefined };
      replace({ ...lastState, ...history.state, sunfordReturn: next }, "");
      window.dispatchEvent(new CustomEvent("sunford:fragment", { detail: { from, to: next.id } }));
    }
    track();
  });
  if (navigation?.type !== "reload") return;
  const restoration = history.scrollRestoration;
  history.scrollRestoration = "manual";
  if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
  const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  resetScroll();
  window.addEventListener("pageshow", () => {
    resetScroll();
    requestAnimationFrame(() => {
      resetScroll();
      history.scrollRestoration = restoration;
    });
  }, { once: true });
})();
`;
