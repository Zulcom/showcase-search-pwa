import { useEffect } from "react";
import { useTernaryDarkMode } from "usehooks-ts";
import { css } from "../../styled-system/css";
import { SunIcon, MoonIcon, MonitorIcon } from "./icons";

export function ThemeToggle() {
  const { isDarkMode, ternaryDarkMode, toggleTernaryDarkMode } = useTernaryDarkMode();

  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute("data-color-mode", theme);
  }, [isDarkMode]);

  const getIcon = () => {
    if (ternaryDarkMode === "light") return <SunIcon />;
    if (ternaryDarkMode === "dark") return <MoonIcon />;
    return <MonitorIcon />;
  };

  const getLabel = () => {
    if (ternaryDarkMode === "light") return "Switch to dark theme";
    if (ternaryDarkMode === "dark") return "Switch to system theme";
    return "Switch to light theme";
  };

  return (
    <button
      type="button"
      onClick={toggleTernaryDarkMode}
      aria-label={getLabel()}
      title={`Current: ${ternaryDarkMode}`}
      className={css({
        p: "2",
        bg: "transparent",
        border: "1px solid",
        borderColor: "border.default",
        borderRadius: "lg",
        color: "text.muted",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        _hover: {
          borderColor: "blue.500",
          color: "text.default",
        },
      })}
    >
      {getIcon()}
    </button>
  );
}
