import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppProvider } from "./core/store";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);



