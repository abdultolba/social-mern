import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleDarkMode } from "../actions/app";

const DarkModeToggle = () => {
  const isDark = useSelector((state) => state.app.theme.isDark);
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <div
      className="dark-mode-toggle navbar-cs__button"
      onClick={handleToggle}
      data-balloon-pos="left"
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      data-balloon-blunt
    >
      <div className={`toggle-switch ${isDark ? "active" : ""}`}>
        <div className="toggle-slider">
          <i className={`fas ${isDark ? "fa-moon" : "fa-sun"}`}></i>
        </div>
      </div>
    </div>
  );
};

export default DarkModeToggle;
