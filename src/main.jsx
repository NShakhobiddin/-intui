import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { initTelegram } from "./telegram.js";
import App from "./App.jsx";

initTelegram();
createRoot(document.getElementById("root")).render(<App />);
