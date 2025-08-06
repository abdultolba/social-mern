import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { addComment } from "../actions/comments";

const CommentForm = ({ postId, isExpandedView = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const logged = useSelector((state) => state.app.logged.isLogged);
  const session = useSelector((state) => state.app.logged);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!logged) {
        return toast("Sorry, you need to be logged in to comment 😔", {
          icon: "⚠️",
        });
      }

      const trimmedMessage = message.trim();

      if (!trimmedMessage) {
        return toast("Comment cannot be empty 🙊", { icon: "⚠️" });
      }

      if (trimmedMessage.length > 1000) {
        return toast("Comment is too long! Maximum 1000 characters 📝", {
          icon: "⚠️",
        });
      }

      setIsSubmitting(true);

      try {
        await dispatch(
          addComment({
            message: trimmedMessage,
            postId,
            onSuccess: () => {
              // If not in expanded view, navigate to the post page
              if (!isExpandedView) {
                navigate(`/post/${postId}`);
              }
            },
          })
        );
        setMessage(""); // Clear the form on success
      } catch (error) {
        console.error("Error adding comment:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, message, postId, logged, navigate, isExpandedView]
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  if (!logged) {
    return (
      <div
        className="comment-form p-3 text-center rounded"
        style={{
          backgroundColor: "var(--comment-bg)",
          border: "1px solid var(--border-color)",
        }}
      >
        <small className="text-muted">
          <i className="fas fa-info-circle me-1"></i>
          Please log in to leave a comment
        </small>
      </div>
    );
  }

  return (
    <div
      className="comment-form p-3 rounded"
      style={{
        backgroundColor: "var(--comment-bg)",
        border: "1px solid var(--border-color)",
      }}
    >
      <div className="d-flex align-items-start">
        <div className="comment-form__avatar me-3">
          <img
            src={session.profilePic}
            className="img-fluid rounded-circle"
            alt="Your Profile"
            style={{ width: "36px", height: "36px", objectFit: "cover" }}
          />
        </div>

        <div className="flex-grow-1">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-2">
              <textarea
                className="form-control"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Write a comment..."
                rows="2"
                maxLength={1000}
                disabled={isSubmitting}
                style={{
                  fontSize: "0.9rem",
                  backgroundColor: "var(--input-bg)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  resize: "none",
                }}
              />
              <div className="d-flex justify-content-between align-items-center mt-1">
                <small className="text-muted">
                  {message.length}/1000 characters
                </small>
                <small className="text-muted">
                  Tip: Ctrl+Enter to submit quickly
                </small>
              </div>
            </div>

            <div className="d-flex justify-content-end">
              {message.trim() && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => setMessage("")}
                  disabled={isSubmitting}
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="btn btn-sm btn-primary"
                disabled={!message.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Posting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane me-1"></i>
                    Comment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;
