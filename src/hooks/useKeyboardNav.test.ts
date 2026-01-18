import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardNav } from "./useKeyboardNav";

describe("useKeyboardNav", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() => useKeyboardNav(5));

    expect(result.current.selectedIndex).toBe(0);
    expect(result.current.expandedIndex).toBeNull();
  });

  it("should update selectedIndex", () => {
    const { result } = renderHook(() => useKeyboardNav(5));

    act(() => {
      result.current.setSelectedIndex(3);
    });

    expect(result.current.selectedIndex).toBe(3);
  });

  it("should update expandedIndex", () => {
    const { result } = renderHook(() => useKeyboardNav(5));

    act(() => {
      result.current.setExpandedIndex(2);
    });

    expect(result.current.expandedIndex).toBe(2);
  });

  it("should handle item count changes", () => {
    const { result, rerender } = renderHook(({ count }) => useKeyboardNav(count), {
      initialProps: { count: 10 },
    });

    act(() => {
      result.current.setSelectedIndex(8);
    });

    expect(result.current.selectedIndex).toBe(8);

    rerender({ count: 5 });

    expect(result.current.selectedIndex).toBe(4);
  });
});
