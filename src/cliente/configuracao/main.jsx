import React from "react";
import { createRoot } from "react-dom/client";
import ConfigApp from "./ConfigApp.jsx";
import "./styles.css";

export function mountConfigApp(options = {}) {
  const rootElement = options.root ?? document.getElementById("config-react-root");
  if (!rootElement) {
    throw new Error("Container da Config React nao encontrado.");
  }

  const root = createRoot(rootElement);
  root.render(<ConfigApp onError={options.onError} />);

  return () => {
    root.unmount();
  };
}
