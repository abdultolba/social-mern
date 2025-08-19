import {
  DELETE_POST,
  DISCOVER_POSTS,
  EDIT_POST,
  FETCH_USER_POSTS,
  LIKE_POST,
  LOAD_SINGLE_POST,
  NEW_POST,
  RESTART_STATE,
  SET_LOADING,
  TOGGLE_EDITING_POST,
  UPDATE_PROFILE_PICTURE,
  UNLIKE_POST,
} from "../actions/posts";

import {
  ADD_COMMENT,
  DELETE_COMMENT,
  EDIT_COMMENT,
  LIKE_COMMENT,
  UNLIKE_COMMENT,
  TOGGLE_EDITING_COMMENT,
  SET_COMMENT_LOADING,
} from "../actions/comments";

const defaultState = {
  loading: false,
  items: [],
  editedPostId: "",
  editingCommentId: "",
  commentLoading: false,
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case TOGGLE_EDITING_POST:
      return {
        ...state,
        editedPostId: action.payload,
      };
    case EDIT_POST:
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id == action.payload.postId) {
            return { ...item, message: action.payload.message };
          }
          return item;
        }),
      };
    case FETCH_USER_POSTS:
      const fetchedPosts = action.payload.map((post) => ({
        ...post,
        author: {
          ...post.author,
          profilePic: post.author.profilePic,
        },
      }));

      // Replace all posts with fetched posts (no more pagination)
      const sortedPosts = fetchedPosts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      return {
        ...state,
        items: sortedPosts,
      };
    case DISCOVER_POSTS:
      const discoveredPosts = action.payload.map((post) => ({
        ...post,
        author: {
          ...post.author,
          profilePic: post.author.profilePic,
        },
      }));

      // Replace all posts with discovered posts (no more pagination)
      const sortedDiscoverPosts = discoveredPosts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      return {
        ...state,
        items: sortedDiscoverPosts,
      };

    case NEW_POST:
      return {
        ...state,
        items: [
          {
            ...action.payload.newPost,
            author: {
              ...action.payload.newPost.author,
              profilePic: action.payload.newPost.author.profilePic,
            },
          },
          ...state.items,
        ],
      };
    case LOAD_SINGLE_POST:
      // Add single post to store if it doesn't already exist
      const postExists = state.items.some(
        (post) => post.id === action.payload.id
      );
      if (postExists) {
        return state;
      }

      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case LIKE_POST:
      const { likedPost } = action.payload;

      // If post exists in items, update it
      const existsInItems = state.items.some(
        (post) => post.id === likedPost.id
      );

      if (existsInItems) {
        return {
          ...state,
          items: state.items.map((post) =>
            post.id == likedPost.id
              ? {
                  ...post,
                  likes: likedPost.likes,
                  likedByUsers: likedPost.likedByUsers,
                  liked: true,
                }
              : post
          ),
        };
      } else {
        // If post doesn't exist in items, add it to the store
        return {
          ...state,
          items: [...state.items, { ...likedPost, liked: true }],
        };
      }
    case UNLIKE_POST:
      const { unlikedPost } = action.payload;

      // If post exists in items, update it
      const existsInItemsUnlike = state.items.some(
        (post) => post.id === unlikedPost.id
      );

      if (existsInItemsUnlike) {
        return {
          ...state,
          items: state.items.map((post) =>
            post.id == unlikedPost.id
              ? {
                  ...post,
                  likes: unlikedPost.likes,
                  likedByUsers: unlikedPost.likedByUsers,
                  liked: false,
                }
              : post
          ),
        };
      } else {
        // If post doesn't exist in items, add it to the store
        return {
          ...state,
          items: [...state.items, { ...unlikedPost, liked: false }],
        };
      }
    case DELETE_POST:
      return {
        ...state,
        items: state.items.filter(
          (post) => post.id != action.payload.deletedPost.id
        ),
      };
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload.loading,
      };
    case UPDATE_PROFILE_PICTURE:
      const username = action.payload.username;
      const items = state.items.map((post) => {
        if (post.author.username == username) {
          return {
            ...post,
            author: {
              ...post.author,
              profilePic: action.payload.url,
            },
          };
        } else {
          return post;
        }
      });

      return { ...state, items };
    case TOGGLE_EDITING_COMMENT:
      return {
        ...state,
        editingCommentId: action.payload,
      };
    case ADD_COMMENT:
      return {
        ...state,
        items: state.items.map((post) => {
          if (post.id === action.payload.postId) {
            return {
              ...post,
              comments: [...(post.comments || []), action.payload.comment],
            };
          }
          return post;
        }),
      };
    case EDIT_COMMENT:
      return {
        ...state,
        items: state.items.map((post) => {
          if (post.id === action.payload.postId) {
            return {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === action.payload.comment.id
                  ? action.payload.comment
                  : comment
              ),
            };
          }
          return post;
        }),
      };
    case DELETE_COMMENT:
      return {
        ...state,
        items: state.items.map((post) => {
          if (post.id === action.payload.postId) {
            return {
              ...post,
              comments: post.comments.filter(
                (comment) => comment.id !== action.payload.commentId
              ),
            };
          }
          return post;
        }),
      };
    case LIKE_COMMENT:
      return {
        ...state,
        items: state.items.map((post) => {
          if (post.id === action.payload.postId) {
            // Helper function to update comment recursively in threaded structure
            const updateCommentInThread = (comments) => {
              return comments.map((comment) => {
                if (comment.id === action.payload.comment.id) {
                  return { ...comment, ...action.payload.comment, liked: true };
                }
                // If this comment has replies, recursively update them
                if (comment.replies && comment.replies.length > 0) {
                  return {
                    ...comment,
                    replies: updateCommentInThread(comment.replies),
                  };
                }
                return comment;
              });
            };

            return {
              ...post,
              comments: updateCommentInThread(post.comments),
            };
          }
          return post;
        }),
      };
    case UNLIKE_COMMENT:
      return {
        ...state,
        items: state.items.map((post) => {
          if (post.id === action.payload.postId) {
            // Helper function to update comment recursively in threaded structure
            const updateCommentInThread = (comments) => {
              return comments.map((comment) => {
                if (comment.id === action.payload.comment.id) {
                  return { ...comment, ...action.payload.comment, liked: false };
                }
                // If this comment has replies, recursively update them
                if (comment.replies && comment.replies.length > 0) {
                  return {
                    ...comment,
                    replies: updateCommentInThread(comment.replies),
                  };
                }
                return comment;
              });
            };

            return {
              ...post,
              comments: updateCommentInThread(post.comments),
            };
          }
          return post;
        }),
      };
    case SET_COMMENT_LOADING:
      return {
        ...state,
        commentLoading: action.payload.loading,
      };
    case RESTART_STATE:
      return defaultState;
    default:
      return state;
  }
};
