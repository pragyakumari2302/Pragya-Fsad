import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./assets/styles/variables.css";
import "./assets/styles/global.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
