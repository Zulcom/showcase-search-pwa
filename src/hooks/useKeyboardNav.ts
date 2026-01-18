import { useState, useCallback, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface UseKeyboardNavResult {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  expandedIndex: number | null;
  setExpandedIndex: (index: number | null) => void;
}

export function useKeyboardNav(itemCount: number): UseKeyboardNavResult {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedIndex >= itemCount && itemCount > 0) {
      setSelectedIndex(itemCount - 1);
    }
  }, [itemCount, selectedIndex]);

  const moveUp = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const moveDown = useCallback(() => {
    setSelectedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : prev));
  }, [itemCount]);

  const toggleExpand = useCallback(() => {
    setExpandedIndex((prev) => (prev === selectedIndex ? null : selectedIndex));
  }, [selectedIndex]);

  const collapse = useCallback(() => {
    if (expandedIndex !== null) {
      setExpandedIndex(null);
    }
  }, [expandedIndex]);

  useHotkeys("up", moveUp, { preventDefault: true }, [moveUp]);
  useHotkeys("down", moveDown, { preventDefault: true }, [moveDown]);
  useHotkeys("enter", toggleExpand, { preventDefault: true }, [toggleExpand]);
  useHotkeys("escape", collapse, { preventDefault: true }, [collapse]);

  return {
    selectedIndex,
    setSelectedIndex,
    expandedIndex,
    setExpandedIndex,
  };
}
