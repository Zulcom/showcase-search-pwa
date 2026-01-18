import { useEffect, useState } from "react";
import { onCLS, onFCP, onLCP, onTTFB, type Metric } from "web-vitals";
import { css } from "../../styled-system/css";

interface Vitals {
  CLS: number | null;
  FCP: number | null;
  LCP: number | null;
  TTFB: number | null;
}

function formatValue(name: string, value: number | null): string {
  if (value === null) return "-";
  if (name === "CLS") return value.toFixed(3);
  return `${Math.round(value)}ms`;
}

function getRating(
  name: string,
  value: number | null
): "good" | "needs-improvement" | "poor" | null {
  if (value === null) return null;

  const thresholds: Record<string, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
  };

  const t = thresholds[name];
  if (!t) return null;

  if (value <= t.good) return "good";
  if (value <= t.poor) return "needs-improvement";
  return "poor";
}

export function WebVitals() {
  const [vitals, setVitals] = useState<Vitals>({
    CLS: null,
    FCP: null,
    LCP: null,
    TTFB: null,
  });

  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      setVitals((prev) => ({
        ...prev,
        [metric.name]: metric.value,
      }));
    };

    onCLS(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  }, []);

  const metrics = [
    { name: "CLS", label: "CLS", value: vitals.CLS },
    { name: "FCP", label: "FCP", value: vitals.FCP },
    { name: "LCP", label: "LCP", value: vitals.LCP },
    { name: "TTFB", label: "TTFB", value: vitals.TTFB },
  ];

  return (
    <div
      className={css({
        display: "flex",
        gap: "4",
        fontSize: "xs",
        color: "text.muted",
      })}
      aria-label="Web Vitals metrics"
    >
      {metrics.map(({ name, label, value }) => {
        const rating = getRating(name, value);
        return (
          <span
            key={name}
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "1",
            })}
          >
            <span className={css({ fontWeight: "medium" })}>{label}:</span>
            <span
              className={css({
                color:
                  rating === "good"
                    ? "green.500"
                    : rating === "needs-improvement"
                      ? "yellow.500"
                      : rating === "poor"
                        ? "red.500"
                        : "text.muted",
              })}
            >
              {formatValue(name, value)}
            </span>
          </span>
        );
      })}
    </div>
  );
}
