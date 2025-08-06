import toast from "react-hot-toast";
import api from "../api/api";

const API = new api();

export const ERROR = "[APP] ERROR",
  LOGOUT = "[APP] LOGOUT",
  RECONNECT = "[APP] RECONNECT",
  RESET_LAST_CONNECTION = "[APP] RESET_LAST_CONNECTION",
  SIGN_IN = "[APP] SIGN_IN",
  SIGN_UP = "[APP] SIGN_UP",
  SET_PROFILE_PRIVACY = "[APP] SET_PROFILE_PRIVACY",
  SET_SETTINGS_LOADING = "[APP] SET_SETTINGS_LOADING",
  SET_LOGIN_LOADING = "[APP] SET_LOGIN_LOADING",
  SET_PROFILE_PICTURE = "[APP] SET_PROFILE_PICTURE",
  SET_PROFILE_DESCRIPTION = "[APP] SET_PROFILE_DESCRIPTION",
  TOGGLE_NAVBAR = "[APP] TOGGLE_NAVBAR",
  TOGGLE_POST_MODAL = "[APP] TOGGLE_POST_MODAL",
  TOGGLE_PROFILE_PICTURE_MODAL = "[APP] TOGGLE_PROFILE_PICTURE_MODAL",
  TOGGLE_SETTINGS_MODAL = "[APP] TOGGLE_SETTINGS_MODAL",
  TOGGLE_DARK_MODE = "[APP] TOGGLE_DARK_MODE",
  SET_DARK_MODE = "[APP] SET_DARK_MODE",
  RESET_THEME_TO_SYSTEM = "[APP] RESET_THEME_TO_SYSTEM";

export const setLoginLoad = (value) => {
  return (dispatch) =>
    dispatch({
      type: SET_LOGIN_LOADING,
      payload: {
        value,
      },
    });
};

export const setSettingsLoad = (value) => {
  return (dispatch) =>
    dispatch({
      type: SET_SETTINGS_LOADING,
      payload: {
        value,
      },
    });
};

export const resetLastConnection = () => {
  return (dispatch) =>
    dispatch({
      type: RESET_LAST_CONNECTION,
    });
};

export const togglePostModal = () => {
  return (dispatch) =>
    dispatch({
      type: TOGGLE_POST_MODAL,
    });
};

export const toggleSettingsModal = () => {
  return (dispatch) =>
    dispatch({
      type: TOGGLE_SETTINGS_MODAL,
    });
};

export const toggleProfilePictureModal = () => {
  return (dispatch) =>
    dispatch({
      type: TOGGLE_PROFILE_PICTURE_MODAL,
    });
};

export const toggleProfilePrivacy = () => {
  return (dispatch) => {
    dispatch(setSettingsLoad(true));

    API.patch("user/settings/privacy")
      .then((res) => {
        dispatch({
          type: SET_PROFILE_PRIVACY,
          payload: res.response,
        });
      })
      .catch((e) => console.log(e))
      .then(() => {
        dispatch(resetLastConnection());
        dispatch(setSettingsLoad(false));
      });
  };
};

export const reconnect = (last_session) => {
  return (dispatch) => {
    dispatch(setLoginLoad(true));

    dispatch({
      type: RECONNECT,
      payload: {
        last_session,
      },
    });
  };
};

export const logout = () => {
  return (dispatch) => {
    localStorage.removeItem("last_session");
    dispatch(setLoginLoad(true));
    dispatch({
      type: LOGOUT,
    });
    window.location.href = "/";
  };
};

export const signUp = ({ username, password }) => {
  return (dispatch) => {
    dispatch(setLoginLoad(true));

    API.post("auth/sign-up", { username, password })
      .then((res) => {
        if (res.code == 200) {
          toast.success(`Welcome, @${res.response.username}!`);
          dispatch({
            type: SIGN_UP,
            payload: {
              ...res.response,
            },
          });
        }
      })
      .catch((e) => console.log("ERROR ERROR ERROR", e))
      .then(() => dispatch(setLoginLoad(false)));
  };
};

export const signIn = ({ username, password }) => {
  return (dispatch) => {
    dispatch(setLoginLoad(true));
    API.post("auth/sign-in", { username, password })
      .then((res) => {
        if (res.code == 200) {
          toast.success(`Welcome back @${res.response.username}!`);
          dispatch({
            type: SIGN_IN,
            payload: {
              ...res.response,
            },
          });
        }
      })
      .catch((e) => {
        console.log(e);
        dispatch(setLoginLoad(false));
      });
  };
};

export const setProfilePic = (url) => {
  return (dispatch) => {
    toast.success("Profile photo updated!");
    dispatch({
      type: SET_PROFILE_PICTURE,
      payload: { url },
    });

    dispatch(resetLastConnection());
  };
};

export const toggleNavbar = (value) => {
  return (dispatch) =>
    dispatch({
      type: TOGGLE_NAVBAR,
      payload: {
        value,
      },
    });
};

export const setDescription = (description) => {
  return (dispatch) => {
    toast.success("Description updated!");
    dispatch({
      type: SET_PROFILE_DESCRIPTION,
      payload: { description },
    });
    dispatch(resetLastConnection());
  };
};

export const toggleDarkMode = () => {
  return (dispatch, getState) => {
    const currentIsDark = getState().app.theme.isDark;
    const newTheme = currentIsDark ? "light" : "dark";
    
    // Save user's manual preference
    localStorage.setItem("theme", newTheme);
    document.body.classList.toggle("dark-theme", newTheme === "dark");
    
    dispatch({
      type: TOGGLE_DARK_MODE,
    });
  };
};

export const setDarkMode = (isDark) => {
  return (dispatch) => {
    const theme = isDark ? "dark" : "light";
    localStorage.setItem("theme", theme);
    document.body.classList.toggle("dark-theme", isDark);
    
    dispatch({
      type: SET_DARK_MODE,
      payload: { isDark },
    });
  };
};

export const resetThemeToSystem = () => {
  return (dispatch) => {
    // Remove user's manual preference
    localStorage.removeItem("theme");
    
    // Use OS preference or fallback to dark mode
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDarkMode = prefersDark !== undefined ? prefersDark : true; // Fallback to dark mode
    
    document.body.classList.toggle("dark-theme", isDarkMode);
    
    dispatch({
      type: RESET_THEME_TO_SYSTEM,
      payload: { isDark: isDarkMode },
    });
  };
};
