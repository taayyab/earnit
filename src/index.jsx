import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "@/store";
import "@/index.css";
import App from "@/App";
import { initializeAccessibilityTesting } from "@/utils/accessibility-testing";

if (process.env.NODE_ENV === 'development') {
  initializeAccessibilityTesting();
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
