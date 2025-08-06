import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

import Store from "./store";
import { reconnect, setDarkMode } from "./actions/app";
import AppRouter from "./routes/AppRouter";
import "./styles/Main.scss";

const store = Store;

const last_session = localStorage.getItem("last_session");
const savedTheme = localStorage.getItem("theme");

if (last_session) store.dispatch(reconnect(JSON.parse(last_session)));

// Initialize theme
const isDarkMode = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
store.dispatch(setDarkMode(isDarkMode));
document.body.classList.toggle("dark-theme", isDarkMode);

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <AppRouter />
    <Toaster position="bottom-right" />
  </Provider>
);
