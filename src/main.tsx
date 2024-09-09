import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import { App } from "./App.tsx";

import "./index.css";
import "@radix-ui/themes/styles.css";
import "modern-normalize/modern-normalize.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <Theme accentColor="indigo" hasBackground={false}>
      <App />
    </Theme>
  </StrictMode>
);
