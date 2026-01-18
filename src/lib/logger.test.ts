import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
  const originalConsole = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  beforeEach(() => {
    console.debug = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  it("should log debug messages", () => {
    logger.debug("debug message", { data: "test" });
    expect(console.debug).toHaveBeenCalled();
  });

  it("should log info messages", () => {
    logger.info("info message");
    expect(console.info).toHaveBeenCalled();
  });

  it("should log warn messages", () => {
    logger.warn("warn message");
    expect(console.warn).toHaveBeenCalled();
  });

  it("should log error messages", () => {
    logger.error("error message");
    expect(console.error).toHaveBeenCalled();
  });

  it("should include timestamp in log message", () => {
    logger.info("test");
    const call = vi.mocked(console.info).mock.calls[0][0];
    expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(call).toContain("[INFO]");
  });
});
