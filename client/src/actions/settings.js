import {
  setProfilePic,
  setDescription,
  toggleProfilePictureModal,
} from "../actions/app";
import { updatePostsPicture } from "../actions/posts";
import { updateProfilePicture } from "../actions/profile";
import api from "../api/api";
import axios from "axios";
import store from "../store";

const API = new api();

export const CHANGE_IMAGE = "CHANGE_IMAGE",
  CHANGE_DESCRIPTION = "CHANGE_DESCRIPTION";

export const changeImage = (binary, crop) => {
  return (dispatch) => {
    // Use browser's native FormData instead of node form-data
    const payload = new FormData();
    payload.append("crop", JSON.stringify(crop));
    payload.append("newImage", binary);

    // Use axios directly for multipart uploads since the API class patch method doesn't handle custom headers properly
    const state = store.getState();
    const config = {
      headers: {
        Authorization: `Bearer ${state.app.logged.token}`,
        // Don't set Content-Type - let browser set it with proper boundary
      },
    };

    axios
      .patch(`${API.baseUrl}/user/settings/profilePicture`, payload, config)
      .then((response) => {
        const res = response.data;
        dispatch(toggleProfilePictureModal());
        dispatch(updatePostsPicture(res.response.path));
        dispatch(updateProfilePicture(res.response.path));
        dispatch(setProfilePic(res.response.path));
      })
      .catch((e) => {
        console.error("Profile picture upload error:", e);
        if (e.response) {
          console.error("Error response:", e.response.data);
        }
      });
  };
};

export const changeDescription = (description) => {
  return (dispatch) => {
    API.patch(`user/settings/description`, { description })
      .then((res) => {
        if (res.code == 200)
          dispatch(setDescription(res.response.newDescription));
      })
      .catch((e) => console.log(e));
  };
};
