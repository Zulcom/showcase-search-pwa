import * as Sentry from "@sentry/react";
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

function sendToSentry(metric: Metric) {
  Sentry.metrics.distribution(`web_vitals.${metric.name}`, metric.value, {
    unit: metric.name === "CLS" ? "" : "millisecond",
  });
}

export function initSentry() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });

  onCLS(sendToSentry);
  onFCP(sendToSentry);
  onINP(sendToSentry);
  onLCP(sendToSentry);
  onTTFB(sendToSentry);
}
