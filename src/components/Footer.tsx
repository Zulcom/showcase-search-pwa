import { Suspense, lazy } from "react";
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
      <Suspense fallback={null}>
        <WebVitals />
      </Suspense>
    </footer>
  );
}
