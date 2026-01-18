import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSearchHistory } from "./useSearchHistory";

describe("useSearchHistory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should start with empty history", () => {
    const { result } = renderHook(() => useSearchHistory());
    expect(result.current.history).toEqual([]);
  });

  it("should add items to history", () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addToHistory("react");
    });

    expect(result.current.history).toEqual(["react"]);
  });

  it("should not add duplicates", () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addToHistory("react");
      result.current.addToHistory("REACT");
    });

    expect(result.current.history).toEqual(["REACT"]);
  });

  it("should limit history to 10 items", () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      for (let i = 0; i < 15; i++) {
        result.current.addToHistory(`query${i}`);
      }
    });

    expect(result.current.history.length).toBe(10);
    expect(result.current.history[0]).toBe("query14");
  });

  it("should clear history", () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addToHistory("react");
      result.current.addToHistory("vue");
      result.current.clearHistory();
    });

    expect(result.current.history).toEqual([]);
  });

  it("should filter history", () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => {
      result.current.addToHistory("react");
      result.current.addToHistory("vue");
      result.current.addToHistory("reactnative");
    });

    const filtered = result.current.getFilteredHistory("react");
    expect(filtered).toEqual(["reactnative", "react"]);
  });
});
