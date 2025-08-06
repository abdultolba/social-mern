import {
  DELETE_POST,
  DISCOVER_POSTS,
  EDIT_POST,
  FETCH_USER_POSTS,
  LIKE_POST,
  NEW_POST,
  RESTART_STATE,
  SET_LOADING,
  TOGGLE_EDITING_POST,
  UPDATE_PROFILE_PICTURE,
  UNLIKE_POST,
} from "../actions/posts";

const defaultState = {
  loading: false,
  isThereMore: true,
  offset: 0,
  quantity: 50,
  items: [],
  editedPostId: "",
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
      return {
        ...state,
        items: [
          ...state.items,
          ...action.payload.map((post) => ({
            ...post,
            author: {
              ...post.author,
              profilePic: post.author.profilePic,
            },
          })),
        ],
      };
    case DISCOVER_POSTS:
      return {
        ...state,
        items: [
          ...state.items,
          ...action.payload.map((post) => ({
            ...post,
            author: {
              ...post.author,
              profilePic: post.author.profilePic,
            },
          })),
        ],
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
    case LIKE_POST:
      const { likedPost } = action.payload;

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
    case UNLIKE_POST:
      const { unlikedPost } = action.payload;

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
    case RESTART_STATE:
      return defaultState;
    default:
      return state;
  }
};
