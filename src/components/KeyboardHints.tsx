import { css } from "../../styled-system/css";

const shortcuts = [
  { key: "/", description: "Focus search" },
  { key: "↑↓", description: "Navigate" },
  { key: "Enter", description: "Expand" },
  { key: "Esc", description: "Close" },
];

export function KeyboardHints() {
  return (
    <div
      className={css({
        display: "flex",
        gap: "4",
        flexWrap: "wrap",
        fontSize: "xs",
        color: "text.muted",
      })}
      aria-label="Keyboard shortcuts"
    >
      {shortcuts.map(({ key, description }) => (
        <span key={key} className={css({ display: "flex", alignItems: "center", gap: "1" })}>
          <kbd
            className={css({
              px: "1.5",
              py: "0.5",
              bg: "bg.subtle",
              border: "1px solid",
              borderColor: "border.default",
              borderRadius: "sm",
              fontFamily: "mono",
              fontSize: "xs",
            })}
          >
            {key}
          </kbd>
          <span>{description}</span>
        </span>
      ))}
    </div>
  );
}
