import { lazy, Suspense } from "react";
import { css } from "../../styled-system/css";
import { KeyboardHints } from "./KeyboardHints";

const WebVitals = lazy(() => import("./WebVitals"));

export function Footer() {
  return (
    <footer
      className={css({
        borderTop: "1px solid",
        borderColor: "border.default",
        p: "4",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "2",
      })}
    >
      <KeyboardHints />
      <a
        href="https://github.com/Zulcom/showcase-search-pwa"
        target="_blank"
        rel="noopener noreferrer"
        className={css({
          color: "fg.muted",
          fontSize: "sm",
        })}
      >
        Source code
      </a>
      <Suspense fallback={null}>
        <WebVitals />
      </Suspense>
    </footer>
  );
}
