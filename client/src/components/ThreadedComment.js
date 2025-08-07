import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import MentionText from "./MentionText";
import CommentForm from "./CommentForm";

import {
  likeComment,
  unlikeComment,
  deleteComment,
  editComment,
  toggleEditingComment,
} from "../actions/comments";

// Initialize dayjs plugin
dayjs.extend(relativeTime);

const ThreadedComment = ({ comment, postId, level = 0, isExpandedView = false }) => {
  const dispatch = useDispatch();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  
  const logged = useSelector((state) => state.app.logged.isLogged);
  const session = useSelector((state) => state.app.logged);
  const editingCommentId = useSelector((state) => state.posts.editingCommentId);

  // For flat threading, only show replies at level 1 (one level of indentation)
  const isReply = level > 0;
  const marginLeft = isReply ? "20px" : "0px";
  
  // Sort replies by creation date (oldest first for better thread flow)
  const sortedReplies = comment.replies 
    ? [...comment.replies].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : [];

  const deleteCommentHandler = useCallback(() => {
    dispatch(
      deleteComment({
        commentId: comment.id,
        postId: postId,
      })
    );
  }, [dispatch, comment.id, postId]);

  const editCommentHandler = useCallback(
    (e) => {
      e.preventDefault();
      const message = e.target.message.value.trim();

      if (!message) {
        toast("Comment cannot be empty 🙊", { icon: "⚠️" });
        return;
      }

      if (comment.message === message) {
        toast("The comment looks the same... 🙊", { icon: "⚠️" });
      } else {
        Promise.resolve(
          dispatch(
            editComment({
              message,
              commentId: comment.id,
              postId: postId,
            })
          )
        ).then(() => dispatch(toggleEditingComment("")));
      }
    },
    [dispatch, comment.message, comment.id, postId]
  );

  const canEditOrDeleteComment = useCallback(() => {
    // Only the comment author can edit/delete their comment
    return session.id && comment.author.id && session.id === comment.author.id;
  }, [session.id, comment.author.id]);

  const handleLike = useCallback(() => {
    if (!logged) {
      return toast("Sorry, you need to be logged in to like this comment 😔", {
        icon: "⚠️",
      });
    }

    const currentUser = session;
    const isLiked = comment.likedByUsers?.some(
      (user) => user.id === currentUser.id
    );

    if (isLiked) {
      dispatch(
        unlikeComment({
          commentId: comment.id,
          postId: postId,
        })
      );
    } else {
      dispatch(
        likeComment({
          commentId: comment.id,
          postId: postId,
        })
      );
    }
  }, [dispatch, logged, comment.likedByUsers, comment.id, postId, session]);

  const handleReplyClick = useCallback(() => {
    if (!logged) {
      return toast("Sorry, you need to be logged in to reply 😔", {
        icon: "⚠️",
      });
    }
    setShowReplyForm(!showReplyForm);
  }, [logged, showReplyForm]);

  const handleCancelReply = useCallback(() => {
    setShowReplyForm(false);
  }, []);

  const isLiked =
    session?.id && comment.likedByUsers?.some((user) => user.id === session.id);

  return (
    <div
      className={`threaded-comment ${level > 0 ? 'reply-comment' : 'top-level-comment'}`}
      style={{
        marginLeft: marginLeft,
        marginBottom: level > 0 ? "12px" : "16px",
      }}
    >
      {/* Main comment */}
      <div
        className="comment mb-3 p-3 rounded"
        style={{
          backgroundColor: "var(--comment-bg)",
          border: "1px solid var(--border-color)",
          borderLeft: level > 0 
            ? "3px solid var(--brand-color, #007bff)"
            : "1px solid var(--border-color)",
        }}
      >
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center">
            <div className="comment__avatar me-2">
              <Link to={"/u/" + comment.author.username}>
                <img
                  src={comment.author.profilePic}
                  className="img-fluid cursor-pointer rounded-circle"
                  alt="Profile"
                  style={{ width: "32px", height: "32px", objectFit: "cover" }}
                />
              </Link>
            </div>
            <div>
              <Link
                to={"/u/" + comment.author.username}
                className="fw-bold text-decoration-none"
                style={{ color: "var(--text-primary)" }}
              >
                {comment.author.username}
              </Link>
              <div>
                <small className="text-muted">
                  {dayjs(comment.createdAt).fromNow()}
                </small>
                {level > 0 && (
                  <small className="text-muted ms-2">
                    <i className="fas fa-reply me-1"></i>
                    Reply
                  </small>
                )}
              </div>
            </div>
          </div>

          {canEditOrDeleteComment() && !editingCommentId && (
            <div className="d-flex">
              <button
                onClick={() => dispatch(toggleEditingComment(comment.id))}
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

        {/* Parent comment preview for replies */}
        {comment.parentComment && (
          <div 
            className="mb-2 p-2 rounded"
            style={{ 
              backgroundColor: "var(--reply-preview-bg, rgba(0, 123, 255, 0.05))",
              border: "1px solid var(--reply-preview-border, rgba(0, 123, 255, 0.2))"
            }}
          >
            <small className="text-muted">
              <i className="fas fa-reply me-1"></i>
              Replying to <strong>@{comment.parentComment.author.username}</strong>:
            </small>
            <div className="mt-1">
              <small style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                "{comment.parentComment.message.length > 100 
                  ? comment.parentComment.message.substring(0, 100) + "..."
                  : comment.parentComment.message}"
              </small>
            </div>
          </div>
        )}

        <div className="comment-content">
          {editingCommentId && comment.id === editingCommentId ? (
            <div className="mb-3">
              <form onSubmit={editCommentHandler}>
                <div className="form-group mb-2">
                  <textarea
                    className="form-control"
                    id="message"
                    rows="2"
                    defaultValue={comment.message}
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
              {comment.message}
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
              {comment.likes || 0}
            </button>

            {/* Reply button - always show since we use flat threading */}
            <button
              onClick={handleReplyClick}
              className="btn btn-sm btn-link p-0 me-3 text-muted"
              style={{ fontSize: "0.8rem", textDecoration: "none" }}
            >
              <i className="far fa-reply me-1"></i>
              Reply
            </button>

            {/* Toggle replies button - only show if there are replies */}
            {sortedReplies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="btn btn-sm btn-link p-0 text-muted"
                style={{ fontSize: "0.8rem", textDecoration: "none" }}
              >
                <i className={`fas fa-chevron-${showReplies ? 'up' : 'down'} me-1`}></i>
                {showReplies ? 'Hide' : 'Show'} {sortedReplies.length} repl{sortedReplies.length === 1 ? 'y' : 'ies'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div className="mb-3" style={{ marginLeft: "20px" }}>
          <CommentForm
            postId={postId}
            parentCommentId={comment.id}
            parentCommentAuthor={comment.author.username}
            isExpandedView={isExpandedView}
            onCancel={handleCancelReply}
          />
        </div>
      )}

      {/* Nested replies */}
      {showReplies && sortedReplies.length > 0 && (
        <div className="replies-container">
          {sortedReplies.map((reply) => (
            <ThreadedComment
              key={reply.id}
              comment={reply}
              postId={postId}
              level={level + 1}
              isExpandedView={isExpandedView}
            />
          ))}
        </div>
      )}

      {/* Nested styles */}
      <style>{`
        /* Hover effects for nested comments */
        .reply-comment:hover {
          transform: translateX(2px);
          transition: transform 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default ThreadedComment;
