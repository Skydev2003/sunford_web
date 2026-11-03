export const navigationStartScript = `
(() => {
  const navigation = performance.getEntriesByType("navigation")[0];
  const root = document.documentElement;
  const skipOpening = () => { root.dataset.homeOpening = "skip"; };
  root.dataset.homeOpening = location.pathname === "/" && navigation?.type !== "back_forward"
    ? "ready" : "skip";
  window.addEventListener("popstate", skipOpening);
  window.addEventListener("pagehide", skipOpening);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) skipOpening();
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
