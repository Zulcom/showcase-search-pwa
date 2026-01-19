import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if (typeof window.requestIdleCallback === "function") {
  requestIdleCallback(() => import("./lib/sentry").then((m) => m.initSentry()));
} else {
  setTimeout(() => import("./lib/sentry").then((m) => m.initSentry()), 1);
}
