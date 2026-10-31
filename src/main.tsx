import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

/* This is the entry point for the ApothecaryProjects React application.
  It imports the necessary dependencies, including React and the App component,
  and renders the App component into the root element of the HTML document. */
const root = document.getElementById("root");

if (!root) {
  throw new Error("Could not find the root element");
}

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
