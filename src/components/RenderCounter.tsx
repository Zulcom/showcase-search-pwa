import { useRef, useEffect } from "react";
import { css } from "../../styled-system/css";

interface RenderCounterProps {
  name: string;
  enabled?: boolean;
}

export function RenderCounter({ name, enabled = false }: RenderCounterProps) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    if (enabled) console.log(`[RenderCounter] ${name}: render #${renderCount.current}`);
  });

  if (!enabled || import.meta.env.PROD) return null;

  return (
    <span
      className={css({
        position: "absolute",
        top: "0",
        right: "0",
        bg: "red.500",
        color: "white",
        fontSize: "xs",
        px: "1",
        borderRadius: "sm",
        zIndex: 1000,
      })}
    >
      {name}: {renderCount.current}
    </span>
  );
}
