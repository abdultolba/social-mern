import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Loading from "../components/Loading";
import Post from "../components/Post";
import api from "../api/api";
import toast from "react-hot-toast";
import { loadSinglePost } from "../actions/posts";

const API = new api();

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logged = useSelector((state) => state.app.logged.isLogged);
  const session = useSelector((state) => state.app.logged);
  const postsFromStore = useSelector((state) => state.posts.items);

  // Try to get post from Redux store first, then fall back to local state
  const postFromStore = postsFromStore.find((p) => p.id === postId);
  const currentPost = postFromStore || post;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await API.get(`post/${postId}`);

        if (response.code === 200) {
          // Process the post data to add liked status for current user
          const postData = response.response;
          if (logged && session.id) {
            postData.liked =
              postData.likedByUsers?.some((user) => user.id === session.id) ||
              false;

            // Process comments to add liked status
            if (postData.comments) {
              postData.comments = postData.comments.map((comment) => ({
                ...comment,
                liked:
                  comment.likedByUsers?.some(
                    (user) => user.id === session.id
                  ) || false,
              }));
            }
          }

          // Always set local state
          setPost(postData);

          // Also add to Redux store for like/unlike functionality
          dispatch(loadSinglePost(postData));
        } else {
          setError("Failed to load post");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        if (err.response?.status === 404) {
          setError("Post not found");
        } else {
          setError("Failed to load post");
        }
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, logged, session.id, dispatch]);

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="page container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentPost) {
    return (
      <div className="page container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card mt-5">
              <div className="card-body text-center">
                <i
                  className="fas fa-exclamation-triangle text-warning mb-3"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h4 className="card-title">Post Not Found</h4>
                <p className="card-text text-muted">
                  {error ||
                    "The post you're looking for doesn't exist or has been removed."}
                </p>
                <button className="btn btn-primary" onClick={handleBackClick}>
                  <i className="fas fa-arrow-left me-2"></i>
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          {/* Back button */}
          <div className="mb-3 mt-3">
            <button
              className="btn btn-link text-decoration-none p-0"
              onClick={handleBackClick}
              style={{ color: "var(--text-secondary)" }}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back
            </button>
          </div>

          {/* Post with comments expanded */}
          <Post {...currentPost} isExpandedView={true} />
        </div>
      </div>
    </div>
  );
};

export default PostPage;
