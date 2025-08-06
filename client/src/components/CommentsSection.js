import React, { useState } from "react";
import Comment from "./Comment";
import CommentForm from "./CommentForm";

const CommentsSection = ({ postId, comments = [], isExpandedView = false }) => {
  const [showAllComments, setShowAllComments] = useState(isExpandedView);
  const [showCommentForm, setShowCommentForm] = useState(isExpandedView);

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;

  return (
    <div className="comments-section">
      {/* Comments header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {isExpandedView ? (
          <h5 className="mb-0">
            <i className="far fa-comment me-2"></i>
            {comments.length === 0
              ? "Comments"
              : `${comments.length} comment${comments.length !== 1 ? "s" : ""}`}
          </h5>
        ) : (
          <button
            className="btn btn-sm btn-link text-decoration-none p-0"
            onClick={() => setShowCommentForm(!showCommentForm)}
            style={{ color: "var(--text-secondary)" }}
          >
            <i className="far fa-comment me-1"></i>
            {comments.length === 0
              ? "Add a comment"
              : `${comments.length} comment${comments.length !== 1 ? "s" : ""}`}
          </button>
        )}

        {/* Show more/less buttons - only in non-expanded view */}
        {!isExpandedView && hasMoreComments && !showAllComments && (
          <button
            className="btn btn-sm btn-link text-decoration-none p-0"
            onClick={() => setShowAllComments(true)}
            style={{ color: "var(--text-secondary)" }}
          >
            Show all {comments.length} comments
          </button>
        )}

        {!isExpandedView && showAllComments && hasMoreComments && (
          <button
            className="btn btn-sm btn-link text-decoration-none p-0"
            onClick={() => setShowAllComments(false)}
            style={{ color: "var(--text-secondary)" }}
          >
            Show less
          </button>
        )}
      </div>

      {/* Comment form */}
      {showCommentForm && (
        <div className="mb-4">
          <CommentForm postId={postId} isExpandedView={isExpandedView} />
        </div>
      )}

      {/* Comments list */}
      {comments.length > 0 && (
        <div className="comments-list">
          {displayedComments.map((comment) => (
            <Comment key={comment.id} {...comment} postId={postId} />
          ))}
        </div>
      )}

      {/* No comments message */}
      {comments.length === 0 && showCommentForm && (
        <div className="text-center text-muted mt-3 mb-3">
          <i
            className="far fa-comment-dots me-2"
            style={{ fontSize: "2rem", opacity: 0.3 }}
          ></i>
          <p className="mb-0">Be the first to comment on this post!</p>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
