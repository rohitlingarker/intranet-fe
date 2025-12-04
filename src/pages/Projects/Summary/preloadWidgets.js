// Summary/preloadWidgets.js
export function preloadAllWidgets() {
  if (typeof window === "undefined") return;
  const imports = [
    () => import("./widgets/ScopeAndProgress"),
    () => import("./widgets/StatusOverview"),
    () => import("./widgets/PriorityDistribution"),
    () => import("./widgets/TypesOfWork"),
    () => import("./widgets/TeamWorkload"),
    () => import("./widgets/EpicProgress"),
  ];
  const runner = () => {
    imports.forEach(fn => fn().catch(() => {}));
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(runner, { timeout: 2000 });
  } else {
    setTimeout(runner, 1500);
  }
}
