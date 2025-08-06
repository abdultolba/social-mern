import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { logout, togglePostModal, toggleSettingsModal } from "../actions/app";

import NewPostModal from "./NewPostModal";
import Auth from "./Auth";
import DarkModeToggle from "./DarkModeToggle";

const Navbar = () => {
  const isVisible = useSelector((state) => state.app.navbar.isVisible);
  const profile = useSelector((state) => state.app.logged);
  const dispatch = useDispatch();

  return (
    <>
      {isVisible && (
        <div className="navbar-cs bg-light d-flex flex-column justify-content-between">
          <div className="d-flex flex-row flex-md-column">
            <Auth>
              <NavLink
                to={"/u/" + profile.username}
                className="navbar-cs__button"
                data-balloon-pos="left"
                aria-label="Profile"
                data-balloon-blunt
              >
                <img
                  src={profile.profilePic}
                  style={{ width: "35px", height: "35px" }}
                  className="img-fluid d-block mx-auto rounded-circle"
                  alt="Profile"
                />
              </NavLink>
              <div
                className="navbar-cs__button"
                onClick={() => dispatch(toggleSettingsModal())}
                data-balloon-pos="left"
                aria-label="Settings"
                data-balloon-blunt
              >
                <p className="text-center my-0">
                  <i className="fas fa-cog fa-2x"></i>
                </p>
              </div>
              <div
                className="navbar-cs__button"
                onClick={() => dispatch(togglePostModal())}
                data-balloon-pos="left"
                aria-label="Submit a Post"
                data-balloon-blunt
              >
                <p className="text-center my-0">
                  <i className="fas fa-plus-circle fa-2x"></i>
                </p>
              </div>
            </Auth>
            <NavLink
              to={"/explore"}
              className={({ isActive }) =>
                `navbar-cs__button ${isActive ? "bg-brand text-white" : ""}`
              }
              data-balloon-pos="left"
              aria-label="Explore"
              data-balloon-blunt
            >
              <p className="text-center my-0">
                <i className="fas fa-compass fa-2x"></i>
              </p>
            </NavLink>
            <a
              href="https://www.github.com/abdultolba/social-mern"
              className="navbar-cs__button"
              target="_blank"
              data-balloon-pos="left"
              aria-label="Source Code"
              data-balloon-blunt
            >
              <p className="text-center my-0">
                <i className="fab fa-github fa-2x"></i>
              </p>
            </a>
            <DarkModeToggle />
            <Auth>
              <div
                className="navbar-cs__button"
                onClick={() => dispatch(logout())}
                data-balloon-pos="left"
                aria-label="Logout"
                data-balloon-blunt
              >
                <p className="text-center my-0">
                  <i className="fas fa-sign-out-alt fa-2x"></i>
                </p>
              </div>
            </Auth>
            <Auth whenLogged={false}>
              <NavLink
                to="/"
                className="navbar-cs__button"
                onClick={() => dispatch(logout())}
                data-balloon-pos="left"
                aria-label="Login"
                data-balloon-blunt
              >
                <p className="text-center my-0">
                  <i className="fas fa-sign-in-alt fa-2x"></i>
                </p>
              </NavLink>
            </Auth>
          </div>
          <div className="d-none d-md-block">
            <img
              src="/assets/images/small-logo.png"
              className="d-block mx-auto img-fluid"
              alt="Logo"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
