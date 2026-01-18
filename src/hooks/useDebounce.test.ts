import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedFn } from "./useDebounce";

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
