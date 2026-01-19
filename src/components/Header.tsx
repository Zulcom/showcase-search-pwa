import { css } from "../../styled-system/css";
import { ThemeToggle } from "./ThemeToggle";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export function Header() {
  const isOnline = useOnlineStatus();

  return (
    <header
      className={css({
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: "4",
        borderBottom: "1px solid",
        borderColor: "border.default",
      })}
    >
      <h1
        className={css({
          fontSize: "xl",
          fontWeight: "bold",
        })}
      >
        GitHub User Search
      </h1>
      <div className={css({ display: "flex", gap: "2", alignItems: "center" })}>
        {!isOnline && (
          <span
            className={css({
              px: "2",
              py: "1",
              bg: "yellow.500",
              color: "black",
              borderRadius: "md",
              fontSize: "sm",
            })}
            role="status"
            aria-live="polite"
          >
            Offline
          </span>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
