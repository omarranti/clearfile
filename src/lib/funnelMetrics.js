const STORAGE_KEY = "taxed_funnel_metrics_v1";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function readMetrics() {
  if (typeof window === "undefined") return {};
  const parsed = safeParse(window.localStorage.getItem(STORAGE_KEY), {});
  return (parsed && typeof parsed === "object" && !Array.isArray(parsed)) ? parsed : {};
}

function writeMetrics(metrics) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
}

export function markFunnelStep(step, metadata = {}) {
  try {
    if (typeof window === "undefined") return;
    const now = Date.now();
    const metrics = readMetrics() ?? {};
    const current = metrics[step] || { count: 0 };
    metrics[step] = {
      count: Number(current.count || 0) + 1,
      lastSeenAt: now,
      metadata: { ...(current.metadata || {}), ...metadata },
    };
    writeMetrics(metrics);
  } catch {
    // Funnel metrics are non-critical; avoid crashing the app
  }
}

export function startFunnelTimer(name) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`taxed_funnel_timer_${name}`, String(Date.now()));
}

export function stopFunnelTimer(name, step) {
  if (typeof window === "undefined") return;
  const key = `taxed_funnel_timer_${name}`;
  const started = Number(window.localStorage.getItem(key));
  if (!started) return;
  const elapsedMs = Date.now() - started;
  markFunnelStep(step, { elapsedMs });
  window.localStorage.removeItem(key);
}
