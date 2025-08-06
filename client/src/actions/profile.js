import toast from "react-hot-toast";
import api from "../api/api";
import { resetLastConnection } from "./app";

const API = new api();

export const FETCH_PROFILE = "[PROFILE] FETCH_PROFILE",
  NEW_POST = "[PROFILE] NEW_POST",
  RESTART_STATE = "[PROFILE] RESTART_STATE",
  SET_LOADING = "[PROFILE] SET_LOADING",
  TOGGLE_SIDENAV = "[PROFILE] TOGGLE_SIDENAV",
  UPDATE_PROFILE_PICTURE = "[PROFILE] UPDATE_PROFILE_PICTURE",
  TOGGLE_EDITING_DESCRIPTION = "[PROFILE] TOGGLE_EDITING_DESCRIPTION",
  SET_PROFILE_DESCRIPTION = "[APP] SET_PROFILE_DESCRIPTION";

export const toggleSidenav = () => {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_SIDENAV,
    });
  };
};

export const setDescription = (description) => {
  return (dispatch) => {
    toast.success("Description updated!");
    dispatch({
      type: SET_PROFILE_DESCRIPTION,
      payload: {
        description,
      },
    });

    dispatch(resetLastConnection());
  };
};

export const toggleEditingDescription = () => {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_EDITING_DESCRIPTION,
    });
  };
};

export const updateProfilePicture = (url) => {
  return (dispatch) => {
    dispatch({
      type: UPDATE_PROFILE_PICTURE,
      payload: {
        url,
      },
    });
  };
};

export const fetchProfile = (username) => {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(setLoading(true));

    API.get(`user/${username}`)
      .then((res) => {
        if (res.code == 200)
          dispatch({
            type: FETCH_PROFILE,
            payload: {
              ...res.response,
              ownProfile: state.app.logged.username == res.response.username,
            },
          });
      })
      .catch((e) => {
        switch (e.response.status) {
          case 404:
            toast.error("404: User not found");
            break;
          default:
            toast.error("Unexpected error");
            break;
        }
      })
      .then(() => {
        dispatch(setLoading(false));
      });
  };
};

export const setLoading = (loading) => {
  return (dispatch) =>
    dispatch({
      type: SET_LOADING,
      payload: {
        loading,
      },
    });
};

export const restartState = (data) => {
  return (dispatch) =>
    dispatch({
      type: RESTART_STATE,
    });
};
