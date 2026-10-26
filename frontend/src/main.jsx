import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/bebas-neue/latin-400.css";
import "@fontsource-variable/inter";
import App from "./App.jsx";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
