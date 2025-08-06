import toast from "react-hot-toast";
import api from "../api/api";

const API = new api();

export const DELETE_POST = "[POST] DELETE_POST",
  DISCOVER_POSTS = "[POST] DISCOVER_POSTS",
  EDIT_POST = "EDIT_POST",
  FETCH_USER_POSTS = "[POST] FETCH_USER_POSTS",
  LIKE_POST = "[POST] LIKE_POST",
  NEW_POST = "[POST] NEW_POST",
  RESTART_STATE = "[POST] RESTART_STATE",
  SET_LOADING = "[POST] SET_LOADING",
  TOGGLE_EDITING_POST = "[POST] TOGGLE_EDITING_POST",
  UPDATE_PROFILE_PICTURE = "[POST] UPDATE_PROFILE_PICTURE",
  UNLIKE_POST = "[POST] UNLIKE_POST";

export const toggleEditingPost = (postId) => {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_EDITING_POST,
      payload: postId,
    });
  };
};

export const editPost = (data) => {
  return (dispatch) => {
    const { postId, message } = data;
    API.patch(`post/${postId}`, { message })
      .then((res) => {
        if (res.code == 200) {
          toast.success("Post updated! 🙌");

          dispatch({
            type: EDIT_POST,
            payload: { message, postId },
          });
        }
      })
      .catch((e) => {
        console.log(e);
        toast.error("There were an error editing your post 😢");
      });
  };
};

export const fetchUserPosts = (usernamePosts) => {
  return (dispatch, getState) => {
    const state = getState();
    const { offset, quantity, isThereMore, loading } = state.posts;
    const { username } = state.app.logged;
    if (isThereMore && !loading) {
      dispatch(setLoading(true));

      API.get(
        `user/${usernamePosts}/posts?offset=${offset}&quantity=${quantity}`
      )
        .then((res) => {
          if (res.code == 200)
            dispatch({
              type: FETCH_USER_POSTS,
              payload: res.response,
            });
        })
        .catch((e) => console.log(e))
        .then(() => dispatch(setLoading(false)));
    } else if (!loading) {
      toast("You have reached the bottom 😱!");
    }
  };
};

export const discoverPosts = (username) => {
  return (dispatch, getState) => {
    const state = getState();
    const { isThereMore, loading } = state.posts;
    const { id } = state.app.logged;

    if (isThereMore && !loading) {
      dispatch(setLoading(true));
      API.get("discover/posts")
        .then((res) => {
          if (res.code == 200)
            dispatch({
              type: DISCOVER_POSTS,
              payload: res.response,
            });
        })
        .catch((e) => console.log(e))
        .then(() => dispatch(setLoading(false)));
    } else {
      toast("You have reached the end 😵");
    }
  };
};

export const newPost = (data) => {
  return (dispatch, getState) => {
    const state = getState();
    const { username: profile } = state.profile;
    const { username, message } = data;

    API.post(`user/${username}/new/post`, { ...data })
      .then((res) => {
        if (res.code == 200) {
          toast.success("Post submitted");

          if (username == profile) {
            dispatch({
              type: NEW_POST,
              payload: {
                newPost: res.response,
              },
            });
          }
        }
      })
      .catch((e) => {
        toast.error("There were an error submitting your post 😬");
      });
  };
};

export const likePost = (postId) => {
  return (dispatch, getState) => {
    const state = getState();

    API.post(`post/${postId}/like`)
      .then((res) => {
        if (res.code == 200)
          dispatch({
            type: LIKE_POST,
            payload: {
              likedPost: res.response,
            },
          });
      })
      .catch((e) => console.log(e));
  };
};

export const unlikePost = (postId) => {
  return (dispatch, getState) => {
    const state = getState();

    API.post(`post/${postId}/unlike`)
      .then((res) => {
        if (res.code == 200)
          dispatch({
            type: UNLIKE_POST,
            payload: {
              unlikedPost: res.response,
            },
          });
      })
      .catch((e) => console.log(e));
  };
};

export const deletePost = (data) => {
  return (dispatch) => {
    const { postId } = data;
    API.delete(`post/${postId}`)
      .then((res) => {
        toast.error("Post deleted 🗑");
        dispatch({
          type: DELETE_POST,
          payload: {
            ...res,
          },
        });
      })
      .catch((e) => console.log(e));
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

export const updatePostsPicture = (url) => {
  return (dispatch, getState) => {
    const state = getState();
    const username = state.app.logged.username;

    dispatch({
      type: UPDATE_PROFILE_PICTURE,
      payload: {
        url,
        username,
      },
    });
  };
};

export const restartState = (data) => {
  return (dispatch) =>
    dispatch({
      type: RESTART_STATE,
    });
};
