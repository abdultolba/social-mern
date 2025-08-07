import React, { useState } from "react";
import Comment from "./Comment";
import CommentForm from "./CommentForm";
import ThreadedComment from "./ThreadedComment";

const CommentsSection = ({ postId, comments = [], isExpandedView = false }) => {
  const [showAllComments, setShowAllComments] = useState(isExpandedView);
  const [showCommentForm, setShowCommentForm] = useState(isExpandedView);

  // Organize comments into threaded structure
  const organizeComments = (comments) => {
    // Separate top-level comments and replies
    const topLevel = comments.filter(comment => !comment.parentCommentId);
    const allReplies = comments.filter(comment => comment.parentCommentId);
    
    // Function to find the root parent of any comment
    const findRootParent = (comment) => {
      if (!comment.parentCommentId) {
        return comment.id;
      }
      
      // Find the parent comment
      const parent = comments.find(c => c.id === comment.parentCommentId);
      if (!parent) {
        return comment.parentCommentId; // Fallback if parent not found
      }
      
      // Recursively find the root
      return findRootParent(parent);
    };
    
    // For each top-level comment, collect ALL replies in its thread
    const organized = topLevel.map(topComment => {
      // Find all replies that belong to this thread (directly or indirectly)
      const threadReplies = allReplies.filter(reply => {
        const rootParentId = findRootParent(reply);
        return rootParentId === topComment.id;
      });
      
      return {
        ...topComment,
        replies: threadReplies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      };
    });
    
    return organized.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };
  
  const organizedComments = organizeComments(comments);
  
  // In expanded view, show all top-level comments, otherwise limit to 3
  const displayedComments = showAllComments ? organizedComments : organizedComments.slice(0, 3);
  const hasMoreComments = organizedComments.length > 3;
  
  // Total comment count is just the length of all comments
  const totalComments = comments.length;

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
          {isExpandedView ? (
            // Use threaded comments in expanded view
            displayedComments.map((comment) => (
              <ThreadedComment 
                key={comment.id} 
                comment={comment} 
                postId={postId} 
                level={0}
                isExpandedView={isExpandedView}
              />
            ))
          ) : (
            // Use simple comments in timeline view
            displayedComments.map((comment) => (
              <Comment key={comment.id} {...comment} postId={postId} />
            ))
          )}
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
