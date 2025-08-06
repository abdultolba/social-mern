import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Linkify from "react-linkify";
import { Link, useParams } from "react-router-dom";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import EmbedPreview from "./EmbedPreview";

import {
  likePost,
  unlikePost,
  deletePost,
  editPost,
  toggleEditingPost,
} from "../actions/posts";

// Initialize dayjs plugin
dayjs.extend(relativeTime);

const Post = (props) => {
  const dispatch = useDispatch();
  const params = useParams();
  const logged = useSelector((state) => state.app.logged.isLogged);
  const session = useSelector((state) => state.app.logged);
  const editedPostId = useSelector((state) => state.posts.editedPostId);

  const deletePostHandler = useCallback(() => {
    dispatch(deletePost({ postId: props.id }));
  }, [dispatch, props.id]);

  const editPostHandler = useCallback(
    (e) => {
      e.preventDefault();
      const message = e.target.message.value;

      if (props.message === message) {
        toast("The post looks the same... 🙊", { icon: "⚠️" });
      } else {
        Promise.resolve(dispatch(editPost({ message, postId: props.id }))).then(
          () => dispatch(toggleEditingPost(""))
        );
      }
    },
    [dispatch, props.message, props.id]
  );

  const canEditOrDeletePost = useCallback(() => {
    // If this is my post
    if (session.id && props.author.id) return session.id === props.author.id;
    // If the post is visible on my profile, even if i'm not the author of it
    else if (session.username && params.id)
      return session.username === params.id;
  }, [session.id, session.username, props.author.id, params.id]);

  const handleLike = useCallback(() => {
    if (!logged) {
      return toast("Sorry, you need to be logged in to like this post 😔", {
        icon: "⚠️",
      });
    }

    if (props.liked) {
      dispatch(unlikePost(props.id));
    } else {
      dispatch(likePost(props.id));
    }
  }, [dispatch, logged, props.liked, props.id]);

  return (
    <div className="card w-100 my-5 post">
      <div className="card-header pb-0 border-0 d-flex justify-content-between">
        <div>
          <small className="text-muted">
            {dayjs(props.createdAt).fromNow()}
          </small>
        </div>
        <div className="d-flex">
          <div>
            <Link to={"/u/" + props.author.username}>
              {props.author.username}
            </Link>
          </div>
          <div className="post__avatar ml-2">
            <Link to={"/u/" + props.author.username}>
              <img
                src={props.author.profilePic}
                className="img-fluid cursor-pointer rounded-circle"
                alt="Profile"
              />
            </Link>
          </div>
        </div>
      </div>
      <div className="card-body px-4 py-4">
        <Linkify properties={{ target: "_blank" }}>
          {editedPostId && props.id === editedPostId ? (
            <div className="px-5 mb-3">
              <form onSubmit={editPostHandler}>
                <div className="form-group">
                  <textarea
                    className="form-control border-top-0 border-left-0 border-right-0 border-brand rounded-0 profile__body__textarea__input"
                    id="message"
                    defaultValue={props.message}
                  ></textarea>
                </div>
                <div className="form-group d-flex justify-content-end">
                  <button
                    className="btn btn-brand-secondary text-white mr-2 rounded-pill"
                    type="button"
                    onClick={() => dispatch(toggleEditingPost(""))}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-brand text-white rounded-pill">
                    Update
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <p className="my-0 py-0 ws-pre-line">{props.message}</p>
          )}
        </Linkify>
        <EmbedPreview post={props} />
        <div
          onClick={handleLike}
          className="d-inline-flex px-3 py-1 text-brand-secondary rounded-pill post__likes cursor-pointer"
        >
          <span>
            {props.likes}{" "}
            <i
              className={`mr-1 ${
                props.liked ? "fas fa-heart" : "far fa-heart"
              }`}
            ></i>
          </span>
        </div>
        {canEditOrDeletePost() && !editedPostId && (
          <>
            <div
              onClick={() => dispatch(toggleEditingPost(props.id))}
              className="d-inline-flex px-3 py-1 rounded-pill post__edit cursor-pointer"
            >
              <span className="text-secondary">
                <i className="fas fa-pencil-alt"></i>
              </span>
            </div>
            <div
              onClick={deletePostHandler}
              className="d-inline-flex px-3 py-1 rounded-pill post__delete cursor-pointer"
            >
              <span className="text-secondary">
                <i className="fas fa-times"></i>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Post;
