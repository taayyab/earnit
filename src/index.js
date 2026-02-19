import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { initializeAccessibilityTesting } from "@/utils/accessibility-testing";

if (process.env.NODE_ENV === 'development') {
  initializeAccessibilityTesting();
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
