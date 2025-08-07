import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import MentionText from "./MentionText";

import {
  likeComment,
  unlikeComment,
  deleteComment,
  editComment,
  toggleEditingComment,
} from "../actions/comments";

// Initialize dayjs plugin
dayjs.extend(relativeTime);

const Comment = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logged = useSelector((state) => state.app.logged.isLogged);
  const session = useSelector((state) => state.app.logged);
  const editingCommentId = useSelector((state) => state.posts.editingCommentId);

  const deleteCommentHandler = useCallback(() => {
    dispatch(
      deleteComment({
        commentId: props.id,
        postId: props.postId,
      })
    );
  }, [dispatch, props.id, props.postId]);

  const editCommentHandler = useCallback(
    (e) => {
      e.preventDefault();
      const message = e.target.message.value.trim();

      if (!message) {
        toast("Comment cannot be empty 🙊", { icon: "⚠️" });
        return;
      }

      if (props.message === message) {
        toast("The comment looks the same... 🙊", { icon: "⚠️" });
      } else {
        Promise.resolve(
          dispatch(
            editComment({
              message,
              commentId: props.id,
              postId: props.postId,
            })
          )
        ).then(() => dispatch(toggleEditingComment("")));
      }
    },
    [dispatch, props.message, props.id, props.postId]
  );

  const canEditOrDeleteComment = useCallback(() => {
    // Only the comment author can edit/delete their comment
    return session.id && props.author.id && session.id === props.author.id;
  }, [session.id, props.author.id]);

  const handleLike = useCallback(() => {
    if (!logged) {
      return toast("Sorry, you need to be logged in to like this comment 😔", {
        icon: "⚠️",
      });
    }

    const currentUser = session;
    const isLiked = props.likedByUsers?.some(
      (user) => user.id === currentUser.id
    );

    if (isLiked) {
      dispatch(
        unlikeComment({
          commentId: props.id,
          postId: props.postId,
        })
      );
    } else {
      dispatch(
        likeComment({
          commentId: props.id,
          postId: props.postId,
        })
      );
    }
  }, [dispatch, logged, props.likedByUsers, props.id, props.postId, session]);

  const handleReply = useCallback(() => {
    if (!logged) {
      return toast("Sorry, you need to be logged in to reply 😔", {
        icon: "⚠️",
      });
    }
    // Navigate to the expanded post view to enable threaded replies
    navigate(`/post/${props.postId}`);
  }, [logged, navigate, props.postId]);

  const isLiked =
    session?.id && props.likedByUsers?.some((user) => user.id === session.id);

  return (
    <div
      className="comment mb-3 p-3 rounded"
      style={{
        backgroundColor: "var(--comment-bg)",
        border: "1px solid var(--border-color)",
      }}
    >
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="d-flex align-items-center">
          <div className="comment__avatar me-2">
            <Link to={"/u/" + props.author.username}>
              <img
                src={props.author.profilePic}
                className="img-fluid cursor-pointer rounded-circle"
                alt="Profile"
                style={{ width: "32px", height: "32px", objectFit: "cover" }}
              />
            </Link>
          </div>
          <div>
            <Link
              to={"/u/" + props.author.username}
              className="fw-bold text-decoration-none"
              style={{ color: "var(--text-primary)" }}
            >
              {props.author.username}
            </Link>
            <div>
              <small className="text-muted">
                {dayjs(props.createdAt).fromNow()}
              </small>
            </div>
          </div>
        </div>

        {canEditOrDeleteComment() && !editingCommentId && (
          <div className="d-flex">
            <button
              onClick={() => dispatch(toggleEditingComment(props.id))}
              className="btn btn-sm btn-outline-secondary me-1"
              style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
            >
              <i className="fas fa-pencil-alt"></i>
            </button>
            <button
              onClick={deleteCommentHandler}
              className="btn btn-sm btn-outline-danger"
              style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      </div>

      <div className="comment-content">
        {editingCommentId && props.id === editingCommentId ? (
          <div className="mb-3">
            <form onSubmit={editCommentHandler}>
              <div className="form-group mb-2">
                <textarea
                  className="form-control"
                  id="message"
                  rows="2"
                  defaultValue={props.message}
                  placeholder="Edit your comment... Use @username to mention someone"
                  style={{
                    fontSize: "0.9rem",
                    backgroundColor: "var(--input-bg)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                  }}
                />
              </div>
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-sm btn-secondary me-2"
                  type="button"
                  onClick={() => dispatch(toggleEditingComment(""))}
                >
                  Cancel
                </button>
                <button className="btn btn-sm btn-primary">Update</button>
              </div>
            </form>
          </div>
        ) : (
          <MentionText
            className="my-0 py-0 ws-pre-line"
            style={{
              fontSize: "0.9rem",
              color: "var(--text-primary)",
            }}
          >
            {props.message}
          </MentionText>
        )}
      </div>

      {!editingCommentId && (
        <div className="comment-actions mt-2 d-flex align-items-center">
          <button
            onClick={handleLike}
            className={`btn btn-sm btn-link p-0 me-3 ${
              isLiked ? "text-danger" : "text-muted"
            }`}
            style={{ fontSize: "0.8rem", textDecoration: "none" }}
          >
            <i className={`${isLiked ? "fas" : "far"} fa-heart me-1`}></i>
            {props.likes || 0}
          </button>
          
          <button
            onClick={handleReply}
            className="btn btn-sm btn-link p-0 me-3 text-muted"
            style={{ fontSize: "0.8rem", textDecoration: "none" }}
          >
            <i className="far fa-reply me-1"></i>
            Reply
          </button>
        </div>
      )}
    </div>
  );
};

export default Comment;
