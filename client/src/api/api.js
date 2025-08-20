import axios from "axios";
import toast from "react-hot-toast";

import store from "../store";
import { logout } from "../actions/app";

class Api {
  constructor() {
    const base = import.meta.env.VITE_API_BASE || window.location.origin;
    this.baseUrl = `${base}/api`;
  }

  /**
   * Takes a path string as input and attempts a
   * GET request. Returns a 401 error on rejection
   * @param {string} url the URL path for a specific GET request.
   */
  get(url) {
    const state = store.getState();
    const config = {
      headers: {},
    };

    if (state.app.logged.token)
      config.headers["Authorization"] = `Bearer ${state.app.logged.token}`;

    return new Promise((res, rej) => {
      axios
        .get(`${this.baseUrl}/${url}`, config)
        .then((response) => res(response.data))
        .catch((e) => {
          if (e.response) {
            const { status, data } = e.response;
            switch (status) {
              case 401:
                store.dispatch(logout());
                break;
            }
            toast.error(`${status}: ${data.message}`);
          } else {
            toast.error("Network error: Unable to connect to server");
          }
          rej(e);
        });
    });
  }

  /**
   * Takes a path string and optional data as input and
   * attempts a POST request. Returns a 401 error on rejection
   * @param {string} url 		the URL path for a specific POST request.
   * @param {object} [params] an object that contains the data that will be sent
   */
  post(url, params) {
    const state = store.getState();
    const config = {
      headers: {},
    };

    if (state.app.logged.token)
      config.headers["Authorization"] = `Bearer ${state.app.logged.token}`;

    return new Promise((res, rej) => {
      axios
        .post(`${this.baseUrl}/${url}`, params, config)
        .then((response) => res(response.data))
        .catch((e) => {
          if (e.response) {
            const { status, data } = e.response;
            switch (status) {
              case 401:
                store.dispatch(logout());
                break;
            }
            toast.error(`${status}: ${data.message}`);
          } else {
            toast.error("Network error: Unable to connect to server");
          }
          rej(e);
        });
    });
  }

  /**
   * Takes a path string and optional data as input and
   * attempts a PATCH request. Returns a 401 error on rejection
   * @param {string} url 		the URL path for a specific PATCH request.
   * @param {object} [params] an object that contains the data that will be sent, headers
   */
  patch(url, params) {
    const state = store.getState();
    if (!state.app.logged.token) return;

    const config = {
      headers: {
        Authorization: `Bearer ${state.app.logged.token}`,
      },
    };

    return new Promise((res, rej) => {
      axios
        .patch(`${this.baseUrl}/${url}`, params, config)
        .then((response) => res(response.data))
        .catch((e) => {
          if (e.response) {
            const { status, data } = e.response;
            switch (status) {
              case 401:
                store.dispatch(logout());
                break;
            }
            toast.error(`${status}: ${data.message}`);
          } else {
            toast.error("Network error: Unable to connect to server");
          }
          rej(e);
        });
    });
  }

  /**
   * Takes a path string and optional data as input and
   * attempts a PATCH request. Returns a 401 error on rejection
   * @param {string} url 		the URL path for a specific DELETE request.
   * @param {object} [params] an object that contains additional data & headers
   */
  delete(url, params) {
    const state = store.getState();
    if (!state.app.logged.token) return;

    const config = {
      headers: {
        Authorization: `Bearer ${state.app.logged.token}`,
      },
      data: params,
    };

    return new Promise((res, rej) => {
      axios
        .delete(`${this.baseUrl}/${url}`, config)
        .then((response) => res(response.data))
        .catch((e) => {
          if (e.response) {
            const { status, data } = e.response;
            switch (status) {
              case 401:
                store.dispatch(logout());
                break;
            }
            toast.error(`${status}: ${data.message}`);
          } else {
            toast.error("Network error: Unable to connect to server");
          }
          rej(e);
        });
    });
  }
}

export default Api;
