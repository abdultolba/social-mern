import { configureStore } from "@reduxjs/toolkit";

import appReducer from "./reducers/app";
import profileReducer from "./reducers/profile";
import postsReducer from "./reducers/posts";
import usersReducer from "./reducers/users";

const store = configureStore({
  reducer: {
    app: appReducer,
    profile: profileReducer,
    posts: postsReducer,
    users: usersReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
