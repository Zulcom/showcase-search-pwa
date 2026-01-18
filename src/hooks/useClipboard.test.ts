import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useClipboard } from "./useClipboard";

describe("useClipboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should detect clipboard support", () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.isSupported).toBe(true);
  });

  it("should paste text from clipboard", async () => {
    vi.mocked(navigator.clipboard.readText).mockResolvedValue("  pasted text  ");

    const { result } = renderHook(() => useClipboard());

    let pastedText: string | null = null;
    await act(async () => {
      pastedText = await result.current.paste();
    });

    expect(pastedText).toBe("pasted text");
    expect(navigator.clipboard.readText).toHaveBeenCalled();
  });

  it("should handle paste error", async () => {
    vi.mocked(navigator.clipboard.readText).mockRejectedValue(new Error("Permission denied"));

    const { result } = renderHook(() => useClipboard());

    let pastedText: string | null = null;
    await act(async () => {
      pastedText = await result.current.paste();
    });

    expect(pastedText).toBeNull();
    expect(result.current.error).toBe("Permission denied");
  });

  it("should copy text to clipboard", async () => {
    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);

    const { result } = renderHook(() => useClipboard());

    let success = false;
    await act(async () => {
      success = await result.current.copy("text to copy");
    });

    expect(success).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("text to copy");
  });

  it("should handle copy error", async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValue(new Error("Copy failed"));

    const { result } = renderHook(() => useClipboard());

    let success = false;
    await act(async () => {
      success = await result.current.copy("text");
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Copy failed");
  });
});
