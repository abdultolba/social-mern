import React, { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import ProfilePictureModal from "../components/ProfilePictureModal";
import NewPostForm from "../components/NewPostForm";
import Loading from "../components/Loading";
import Post from "../components/Post";
import Auth from "../components/Auth";

import {
  fetchUserPosts,
  newPost,
  restartState as restartStatePosts,
} from "../actions/posts";
import {
  fetchProfile,
  restartState,
  toggleSidenav,
  toggleEditingDescription,
} from "../actions/profile";
import { toggleNavbar, toggleProfilePictureModal } from "../actions/app";
import { changeDescription } from "../actions/settings";
import { logout } from "../actions/app";

const Profile = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const params = useParams();
  const logged = useSelector((state) => state.app.logged);
  const ownsProfile = useSelector((state) => state.profile.ownProfile);
  const profilePicModal = useSelector(
    (state) => state.app.profilePicModal.isVisible
  );
  const profile = useSelector((state) => state.profile);
  const posts = useSelector((state) => state.posts.items);
  const postsLoading = useSelector((state) => state.posts.loading);

  // Fallback profile picture logic:
  // 1. Use profile.profilePic if available
  // 2. If it's own profile, use logged user's profilePic
  // 3. For other users, try to get profilePic from their own posts (not posts by others on their profile)
  const getProfilePicFromPosts = () => {
    if (posts && posts.length > 0 && profile.username) {
      // Find a post authored by the profile owner (not posts by others on their profile)
      const postByOwner = posts.find(
        (post) =>
          post.author &&
          post.author.username === profile.username &&
          post.author.profilePic
      );
      return postByOwner ? postByOwner.author.profilePic : null;
    }
    return null;
  };

  const profilePicUrl =
    profile.profilePic ||
    (ownsProfile ? logged.profilePic : null) ||
    getProfilePicFromPosts();

  const initializeProfile = useCallback(() => {
    dispatch(fetchProfile(params.id));
    dispatch(fetchUserPosts(params.id));
  }, [dispatch, params.id]);

  useEffect(() => {
    initializeProfile();

    return () => {
      dispatch(restartState());
      dispatch(restartStatePosts());
    };
  }, [location, initializeProfile, dispatch]);

  const openProfilePictureModal = useCallback(() => {
    if (ownsProfile) {
      dispatch(toggleProfilePictureModal());
    }
  }, [dispatch, ownsProfile]);

  const updateDescription = useCallback(
    (e) => {
      e.preventDefault();
      const description = e.target.description.value;

      if (profile.description === description) {
        toast("The descriptions look the same... 🙊", { icon: "⚠️" });
      } else if (description.length > 150) {
        toast("Descriptions may not be longer than 150 characters", {
          icon: "⚠️",
        });
      } else {
        Promise.resolve(dispatch(changeDescription(description))).then(() =>
          dispatch(toggleEditingDescription())
        );
      }
    },
    [dispatch, profile.description]
  );

  return (
    <div className="d-flex flex-column flex-md-row profile w-100">
      {profilePicModal && ownsProfile && <ProfilePictureModal />}
      <div
        className={`d-none d-md-flex sidenav flex-column ${
          !profile.visibleSidenav ? "sidenav--inactive" : ""
        }`}
      >
        <div className="sidenav__description">
          <div
            onClick={openProfilePictureModal}
            className={`sidenav__avatar mx-auto d-block mt-5 mb-2 ${
              ownsProfile && "sidenav__avatar--owner cursor-pointer"
            }`}
          >
            <img
              src={profilePicUrl}
              className={
                "sidenav__avatar__image img-fluid rounded-circle mx-auto d-block w-100 h-100"
              }
              alt="Profile"
              onError={(e) => {
                console.error("Profile image failed to load:", profilePicUrl);
              }}
              style={{
                minHeight: "200px",
                minWidth: "200px",
              }}
            />
            <span className="sidenav__avatar--owner__camera">
              <i className="fas fa-camera"></i>
            </span>
          </div>
          <p className="text-center title mt-3">{profile.username}</p>
          {profile.editingDescription ? (
            <div className="px-5 mb-3">
              <form onSubmit={updateDescription}>
                <div className="form-group">
                  <textarea
                    className="form-control"
                    id="description"
                    defaultValue={profile.description}
                    maxLength={150}
                  ></textarea>
                </div>
                <div className="form-group d-flex justify-content-end">
                  <button
                    className="btn btn-brand-secondary text-white mr-2 rounded-pill"
                    type="button"
                    onClick={() => dispatch(toggleEditingDescription())}
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
            <p className="text-left text-wrap description px-5 mb-0">
              {profile.description ||
                "This user hasn't yet provided a description 🥴"}
            </p>
          )}
          {ownsProfile && !profile.editingDescription && (
            <a
              className="text-left btn-link text-muted btn px-5"
              onClick={() => dispatch(toggleEditingDescription())}
            >
              Edit Description <i className="fas fa-pencil-alt"></i>
            </a>
          )}
          <div className="d-flex flex-column justify-content-between h-100">
            <div className="d-flex justify-content-between px-5">
              <div>
                <p className="text-white mb-0">{profile.posts} Posts</p>
              </div>
              <div>
                <p className="text-white mb-0">{profile.likes} Likes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex position-relative profile__body justify-content-center flex-wrap">
        <Auth>
          {profile.openProfile || ownsProfile ? (
            <div className="profile__body__textarea w-100 mt-5">
              <div className="card border-0">
                <div className="card-body">
                  <NewPostForm profileId={params.id} />
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5">
              <i className="fas fa-lock"></i> This user hasn't authorized other
              users to post on their profile.
            </p>
          )}
        </Auth>
        <div className="profile__body__posts w-100">
          <div className="d-flex flex-column">
            {posts.map((post, i) => (
              <Post {...post} key={post.message + "_" + i} />
            ))}
            {postsLoading && (
              <div className="d-flex justify-content-center">
                <Loading classes="my-5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
