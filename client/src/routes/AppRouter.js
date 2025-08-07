import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Home = lazy(() => import("../pages/Home"));
const Profile = lazy(() => import("../pages/Profile"));
const PostPage = lazy(() => import("../pages/PostPage"));
const Error = lazy(() => import("../pages/Error"));
const Explore = lazy(() => import("../pages/Explore"));
const Notifications = lazy(() => import("../pages/Notifications"));

const SettingsModal = lazy(() => import("../components/SettingsModal"));
const NewPostModal = lazy(() => import("../components/NewPostModal"));
const Navbar = lazy(() => import("../components/Navbar"));

const AppLayout = ({ children }) => (
  <div className="d-flex page">
    <NewPostModal />
    <SettingsModal />
    {children}
    <Navbar />
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/explore"
            element={
              <AppLayout>
                <Explore />
              </AppLayout>
            }
          />
          <Route
            path="/u/:id"
            element={
              <AppLayout>
                <Profile />
              </AppLayout>
            }
          />
          <Route
            path="/post/:postId"
            element={
              <AppLayout>
                <PostPage />
              </AppLayout>
            }
          />
          <Route
            path="/notifications"
            element={
              <AppLayout>
                <Notifications />
              </AppLayout>
            }
          />
          <Route path="*" element={<Error />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
