import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce, useDebouncedFn } from "./useDebounce";

describe("useDebounce", () => {
  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("should debounce value changes", async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "first" },
    });

    expect(result.current).toBe("first");

    rerender({ value: "second" });
    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe("first");

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("second");

    vi.useRealTimers();
  });

  it("should cancel previous timer on new value", async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: "d" });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("d");

    vi.useRealTimers();
  });
});

describe("useDebouncedFn", () => {
  it("should debounce function calls", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();

    const { result } = renderHook(() => useDebouncedFn(fn, 300));

    act(() => {
      result.current("test1");
      result.current("test2");
      result.current("test3");
    });

    expect(fn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("test3");

    vi.useRealTimers();
  });
});
