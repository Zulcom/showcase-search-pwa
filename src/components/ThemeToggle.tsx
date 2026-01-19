import { useState, useEffect, useCallback } from "react";
import { css } from "../../styled-system/css";
import { SunIcon, MoonIcon, MonitorIcon } from "./icons";

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
  if (typeof localStorage === "undefined") return "system";
  return (localStorage.getItem("theme") as Theme) || "system";
}

function applyTheme(theme: Theme) {
  const effectiveTheme = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(effectiveTheme);
  document.documentElement.setAttribute("data-color-mode", effectiveTheme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      if (current === "light") return "dark";
      if (current === "dark") return "system";
      return "light";
    });
  }, []);

  const getIcon = () => {
    if (theme === "light") return <SunIcon />;
    if (theme === "dark") return <MoonIcon />;
    return <MonitorIcon />;
  };

  const getLabel = () => {
    if (theme === "light") return "Switch to dark theme";
    if (theme === "dark") return "Switch to system theme";
    return "Switch to light theme";
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={getLabel()}
      title={`Current: ${theme}`}
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
