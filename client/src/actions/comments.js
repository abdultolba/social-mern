import toast from "react-hot-toast";
import api from "../api/api";

const API = new api();

// Action types
export const ADD_COMMENT = "[COMMENT] ADD_COMMENT";
export const DELETE_COMMENT = "[COMMENT] DELETE_COMMENT";
export const EDIT_COMMENT = "[COMMENT] EDIT_COMMENT";
export const LIKE_COMMENT = "[COMMENT] LIKE_COMMENT";
export const UNLIKE_COMMENT = "[COMMENT] UNLIKE_COMMENT";
export const TOGGLE_EDITING_COMMENT = "[COMMENT] TOGGLE_EDITING_COMMENT";
export const SET_COMMENT_LOADING = "[COMMENT] SET_COMMENT_LOADING";

// Toggle editing state for a comment
export const toggleEditingComment = (commentId) => {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_EDITING_COMMENT,
      payload: commentId,
    });
  };
};

// Add a new comment to a post
export const addComment = (data) => {
  return (dispatch) => {
    const { message, postId, parentCommentId, onSuccess } = data;

    API.post("comment", { message, postId, parentCommentId })
      .then((res) => {
        if (res.code === 201) {
          toast.success("Comment added! 💬");

          dispatch({
            type: ADD_COMMENT,
            payload: {
              comment: res.response,
              postId,
            },
          });

          // Call onSuccess callback if provided
          if (onSuccess && typeof onSuccess === "function") {
            onSuccess();
          }
        }
      })
      .catch((e) => {
        console.error("Error adding comment:", e);
        toast.error("Failed to add comment 😢");
      });
  };
};

// Edit an existing comment
export const editComment = (data) => {
  return (dispatch) => {
    const { commentId, message, postId } = data;

    API.patch(`comment/${commentId}`, { message })
      .then((res) => {
        if (res.code === 200) {
          toast.success("Comment updated! ✏️");

          dispatch({
            type: EDIT_COMMENT,
            payload: {
              comment: res.response,
              postId,
            },
          });
        }
      })
      .catch((e) => {
        console.error("Error editing comment:", e);
        toast.error("Failed to update comment 😢");
      });
  };
};

// Delete a comment
export const deleteComment = (data) => {
  return (dispatch) => {
    const { commentId, postId } = data;

    API.delete(`comment/${commentId}`)
      .then((res) => {
        if (res.code === 200) {
          toast.success("Comment deleted! 🗑️");

          dispatch({
            type: DELETE_COMMENT,
            payload: {
              commentId,
              postId,
            },
          });
        }
      })
      .catch((e) => {
        console.error("Error deleting comment:", e);
        toast.error("Failed to delete comment 😢");
      });
  };
};

// Like a comment
export const likeComment = (data) => {
  return (dispatch) => {
    const { commentId, postId } = data;

    API.post(`comment/${commentId}/like`)
      .then((res) => {
        if (res.code === 200) {
          dispatch({
            type: LIKE_COMMENT,
            payload: {
              comment: res.response,
              postId,
            },
          });
        }
      })
      .catch((e) => {
        console.error("Error liking comment:", e);
        toast.error("Failed to like comment 😢");
      });
  };
};

// Unlike a comment
export const unlikeComment = (data) => {
  return (dispatch) => {
    const { commentId, postId } = data;

    API.post(`comment/${commentId}/unlike`)
      .then((res) => {
        if (res.code === 200) {
          dispatch({
            type: UNLIKE_COMMENT,
            payload: {
              comment: res.response,
              postId,
            },
          });
        }
      })
      .catch((e) => {
        console.error("Error unliking comment:", e);
        toast.error("Failed to unlike comment 😢");
      });
  };
};

// Set loading state for comments
export const setCommentLoading = (loading) => {
  return (dispatch) =>
    dispatch({
      type: SET_COMMENT_LOADING,
      payload: {
        loading,
      },
    });
};
