import { BottomScrollListener } from "react-bottom-scroll-listener";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  discoverPosts,
  restartState as restartStatePosts,
} from "../actions/posts";
import {
  discoverUsers,
  restartState as restartStateUsers,
} from "../actions/users";

import UserCard from "../components/UserCard";
import Post from "../components/Post";
import Loading from "../components/Loading";

const Explore = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.items);
  const postsLoading = useSelector((state) => state.posts.loading);
  const users = useSelector((state) => state.users.items);
  const usersLoading = useSelector((state) => state.users.loading);

  useEffect(() => {
    dispatch(discoverPosts());
    dispatch(discoverUsers());

    return () => {
      dispatch(restartStatePosts());
      dispatch(restartStateUsers());
    };
  }, []);

  const handleBottomReached = () => {
    dispatch(discoverPosts());
  };

  return (
    <div className="container my-5">
      <h2 className="montserrat">Discover users</h2>
      <div
        className="d-inline-flex flex-row w-100 mb-5"
        style={{ overflowX: "scroll", overflowY: "hidden", minHeight: "100px" }}
      >
        {usersLoading && (
          <div className="d-flex justify-content-center m-auto">
            <Loading />
          </div>
        )}
        {users.map((user) => (
          <div className={"mx-3 mx-md-5 px-md-5 animated fadeIn"} key={user.id}>
            <UserCard {...user} />
          </div>
        ))}
      </div>
      <h2 className="montserrat">Explore posts</h2>
      <div className="row mt-5">
        <BottomScrollListener onBottom={handleBottomReached}>
          {posts.map((post, i) => (
            <div className="col-12 col-md-6 animated fadeIn" key={post.id + i}>
              <Post {...post} />
            </div>
          ))}
          {postsLoading && (
            <div className="d-flex justify-content-center m-auto my-5 py-5">
              <Loading />
            </div>
          )}
        </BottomScrollListener>
      </div>
    </div>
  );
};

export default Explore;
