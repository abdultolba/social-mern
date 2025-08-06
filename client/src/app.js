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

// Initialize theme based on OS preference with dark mode as fallback
const initializeTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  
  if (savedTheme) {
    // User has manually set a theme preference
    const isDarkMode = savedTheme === "dark";
    store.dispatch(setDarkMode(isDarkMode));
    document.body.classList.toggle("dark-theme", isDarkMode);
  } else {
    // No saved preference, use OS preference or fallback to dark mode
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDarkMode = prefersDark !== undefined ? prefersDark : true; // Fallback to dark mode
    store.dispatch(setDarkMode(isDarkMode));
    document.body.classList.toggle("dark-theme", isDarkMode);
  }
};

// Initialize theme
initializeTheme();

// Listen for OS theme changes only if user hasn't manually set a theme
if (window.matchMedia && !localStorage.getItem("theme")) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  
  const handleThemeChange = (e) => {
    // Only update if user hasn't manually set a theme preference
    if (!localStorage.getItem("theme")) {
      const isDarkMode = e.matches;
      store.dispatch(setDarkMode(isDarkMode));
      document.body.classList.toggle("dark-theme", isDarkMode);
    }
  };
  
  // Add listener for theme changes
  if (mediaQuery.addListener) {
    mediaQuery.addListener(handleThemeChange);
  } else {
    mediaQuery.addEventListener("change", handleThemeChange);
  }
}

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <AppRouter />
    <Toaster position="bottom-right" />
  </Provider>
);
