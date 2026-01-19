import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@sentry/react", () => ({
  init: vi.fn(),
  metrics: {
    distribution: vi.fn(),
  },
}));

vi.mock("web-vitals", () => ({
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}));

import * as Sentry from "@sentry/react";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import { initSentry } from "./sentry";

describe("sentry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initSentry", () => {
    it("should initialize Sentry with correct config", () => {
      initSentry();

      expect(Sentry.init).toHaveBeenCalledWith({
        dsn: expect.any(String),
        sendDefaultPii: true,
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
      });
    });

    it("should register web vitals callbacks", () => {
      initSentry();

      expect(onCLS).toHaveBeenCalledWith(expect.any(Function));
      expect(onFCP).toHaveBeenCalledWith(expect.any(Function));
      expect(onINP).toHaveBeenCalledWith(expect.any(Function));
      expect(onLCP).toHaveBeenCalledWith(expect.any(Function));
      expect(onTTFB).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should send CLS metric without unit", () => {
      initSentry();

      const clsCallback = vi.mocked(onCLS).mock.calls[0][0];
      clsCallback({ name: "CLS", value: 0.1, rating: "good" } as never);

      expect(Sentry.metrics.distribution).toHaveBeenCalledWith("web_vitals.CLS", 0.1, { unit: "" });
    });

    it("should send LCP metric with millisecond unit", () => {
      initSentry();

      const lcpCallback = vi.mocked(onLCP).mock.calls[0][0];
      lcpCallback({ name: "LCP", value: 2500, rating: "good" } as never);

      expect(Sentry.metrics.distribution).toHaveBeenCalledWith("web_vitals.LCP", 2500, {
        unit: "millisecond",
      });
    });

    it("should send FCP metric with millisecond unit", () => {
      initSentry();

      const fcpCallback = vi.mocked(onFCP).mock.calls[0][0];
      fcpCallback({ name: "FCP", value: 1800, rating: "good" } as never);

      expect(Sentry.metrics.distribution).toHaveBeenCalledWith("web_vitals.FCP", 1800, {
        unit: "millisecond",
      });
    });
  });
});
