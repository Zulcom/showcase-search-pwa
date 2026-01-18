import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewTransition } from "./useViewTransition";

describe("useViewTransition", () => {
  it("should detect view transition support", () => {
    const { result } = renderHook(() => useViewTransition());
    expect(typeof result.current.isSupported).toBe("boolean");
  });

  it("should call callback directly when not supported", () => {
    const { result } = renderHook(() => useViewTransition());
    const callback = vi.fn();

    act(() => {
      result.current.startTransition(callback);
    });

    expect(callback).toHaveBeenCalled();
  });

  it("should handle async callbacks", async () => {
    const { result } = renderHook(() => useViewTransition());
    const callback = vi.fn().mockResolvedValue(undefined);

    await act(async () => {
      result.current.startTransition(callback);
    });

    expect(callback).toHaveBeenCalled();
  });
});
