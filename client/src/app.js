import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

import Store from "./store";
import { reconnect } from "./actions/app";
import AppRouter from "./routes/AppRouter";
import "./styles/Main.scss";

const store = Store;

const last_session = localStorage.getItem("last_session");

if (last_session) store.dispatch(reconnect(JSON.parse(last_session)));

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <AppRouter />
    <Toaster position="bottom-right" />
  </Provider>
);
