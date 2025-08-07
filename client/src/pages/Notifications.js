import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";

import {
  fetchNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
} from "../actions/notifications";
import Loading from "../components/Loading";

// Initialize dayjs plugin
dayjs.extend(relativeTime);

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error, pagination, unreadCount } =
    useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());

    // Auto-mark all notifications as read when visiting the page
    // Add a small delay to avoid race conditions
    const markAsReadTimer = setTimeout(() => {
      if (unreadCount > 0) {
        dispatch(markAllAsRead());
      }
    }, 1000);

    return () => clearTimeout(markAsReadTimer);
  }, [dispatch, unreadCount]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDelete = (notificationId) => {
    dispatch(deleteNotification(notificationId));
  };

  const getNotificationLink = (notification) => {
    if (notification.type === "mention_post") {
      return `/post/${notification.postId}`;
    } else if (notification.type === "mention_comment") {
      return `/post/${notification.postId}`;
    } else if (notification.type === "comment_on_post") {
      return `/post/${notification.postId}`;
    } else if (notification.type === "comment_reply") {
      return `/post/${notification.postId}`;
    }
    return "#";
  };

  const getNotificationIcon = (type) => {
    if (type === "mention_post") {
      return "fas fa-at";
    } else if (type === "mention_comment") {
      return "fas fa-comment";
    } else if (type === "comment_on_post") {
      return "fas fa-reply";
    } else if (type === "comment_reply") {
      return "fas fa-reply-all";
    }
    return "fas fa-bell";
  };

  if (loading && notifications.length === 0) {
    return <Loading />;
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0 montserrat">Notifications</h2>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn btn-primary btn-sm"
                style={{
                  backgroundColor: "var(--brand-color, #007bff)",
                  borderColor: "var(--brand-color, #007bff)",
                  color: "white",
                }}
              >
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-bell fa-3x text-muted mb-3"></i>
              <p className="text-muted">No notifications yet!</p>
              <p className="text-muted">
                You'll see mentions, comments on your posts, and other updates
                here.
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`card mb-3 notification-item ${
                    !notification.isRead ? "notification-unread" : ""
                  }`}
                  style={{
                    borderLeft: !notification.isRead
                      ? "4px solid var(--brand-color)"
                      : "4px solid transparent",
                  }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex align-items-start flex-grow-1">
                        {/* Notification icon */}
                        <div className="notification-icon me-3">
                          <i
                            className={`${getNotificationIcon(
                              notification.type
                            )} text-primary`}
                            style={{ fontSize: "1.2rem" }}
                          ></i>
                        </div>

                        {/* Notification content */}
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <Link
                              to={`/u/${notification.sender.username}`}
                              className="d-flex align-items-center text-decoration-none"
                            >
                              <img
                                src={notification.sender.profilePic}
                                alt="Profile"
                                className="rounded-circle me-2"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  objectFit: "cover",
                                }}
                              />
                              <strong className="text-primary">
                                @{notification.sender.username}
                              </strong>
                            </Link>
                            <small className="text-muted ms-2">
                              {dayjs(notification.createdAt).fromNow()}
                            </small>
                          </div>

                          <p className="mb-2">{notification.message}</p>

                          {/* Show preview of related content */}
                          {notification.type === "mention_post" &&
                            notification.relatedPost && (
                              <Link
                                to={getNotificationLink(notification)}
                                className="text-decoration-none"
                                onClick={() => {
                                  if (!notification.isRead) {
                                    handleMarkAsRead(notification.id);
                                  }
                                }}
                              >
                                <div className="bg-light p-2 rounded mb-2 cursor-pointer hover-preview">
                                  <small className="text-muted">
                                    📝 Post:{" "}
                                    {notification.relatedPost.message.substring(
                                      0,
                                      100
                                    )}
                                    {notification.relatedPost.message.length >
                                    100
                                      ? "..."
                                      : ""}
                                  </small>
                                </div>
                              </Link>
                            )}

                          {notification.type === "mention_comment" &&
                            notification.relatedComment && (
                              <Link
                                to={getNotificationLink(notification)}
                                className="text-decoration-none"
                                onClick={() => {
                                  if (!notification.isRead) {
                                    handleMarkAsRead(notification.id);
                                  }
                                }}
                              >
                                <div className="bg-light p-2 rounded mb-2 cursor-pointer hover-preview">
                                  <small className="text-muted">
                                    💬 Comment:{" "}
                                    {notification.relatedComment.message.substring(
                                      0,
                                      100
                                    )}
                                    {notification.relatedComment.message
                                      .length > 100
                                      ? "..."
                                      : ""}
                                  </small>
                                </div>
                              </Link>
                            )}

                          {notification.type === "comment_on_post" &&
                            notification.relatedComment && (
                              <Link
                                to={getNotificationLink(notification)}
                                className="text-decoration-none"
                                onClick={() => {
                                  if (!notification.isRead) {
                                    handleMarkAsRead(notification.id);
                                  }
                                }}
                              >
                                <div className="bg-light p-2 rounded mb-2 cursor-pointer hover-preview">
                                  <small className="text-muted">
                                    💬 Their comment:{" "}
                                    {notification.relatedComment.message.substring(
                                      0,
                                      100
                                    )}
                                    {notification.relatedComment.message
                                      .length > 100
                                      ? "..."
                                      : ""}
                                  </small>
                                </div>
                              </Link>
                            )}

                          {notification.type === "comment_reply" &&
                            notification.relatedComment && (
                              <Link
                                to={getNotificationLink(notification)}
                                className="text-decoration-none"
                                onClick={() => {
                                  if (!notification.isRead) {
                                    handleMarkAsRead(notification.id);
                                  }
                                }}
                              >
                                <div className="bg-light p-2 rounded mb-2 cursor-pointer hover-preview">
                                  <small className="text-muted">
                                    🔁 Reply to your comment:{" "}
                                    {notification.relatedComment.message.substring(
                                      0,
                                      100
                                    )}
                                    {notification.relatedComment.message
                                      .length > 100
                                      ? "..."
                                      : ""}
                                  </small>
                                </div>
                              </Link>
                            )}

                          {/* Action buttons */}
                          {!notification.isRead && (
                            <div className="d-flex gap-2 mt-2">
                              <button
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                className="btn btn-sm"
                                style={{
                                  backgroundColor:
                                    "var(--secondary-color, #6c757d)",
                                  borderColor:
                                    "var(--secondary-color, #6c757d)",
                                  color: "white",
                                }}
                              >
                                Mark as read
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="btn btn-sm ms-2"
                        style={{
                          backgroundColor: "#dc3545",
                          borderColor: "#dc3545",
                          color: "white",
                        }}
                        title="Delete notification"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav aria-label="Notifications pagination">
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      !pagination.hasPrevious ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        dispatch(fetchNotifications(pagination.currentPage - 1))
                      }
                      disabled={!pagination.hasPrevious}
                    >
                      Previous
                    </button>
                  </li>
                  <li className="page-item active">
                    <span className="page-link">
                      {pagination.currentPage} of {pagination.totalPages}
                    </span>
                  </li>
                  <li
                    className={`page-item ${
                      !pagination.hasNext ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        dispatch(fetchNotifications(pagination.currentPage + 1))
                      }
                      disabled={!pagination.hasNext}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .notification-unread {
          background-color: rgba(13, 110, 253, 0.05) !important;
        }
        
        .notification-icon {
          width: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .notification-item:hover {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
          transition: box-shadow 0.15s ease-in-out;
        }

        .hover-preview {
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #dee2e6 !important;
          background-color: #f8f9fa !important;
        }

        .hover-preview:hover {
          background-color: rgba(0, 123, 255, 0.1) !important;
          border-color: var(--brand-color, #007bff) !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .hover-preview small {
          color: #495057 !important;
          font-weight: 400;
        }

        .hover-preview:hover small {
          color: #007bff !important;
          font-weight: 500;
        }

        /* Dark mode support */
        [data-bs-theme="dark"] .hover-preview {
          background-color: #343a40 !important;
          border-color: #495057 !important;
        }

        [data-bs-theme="dark"] .hover-preview small {
          color: #adb5bd !important;
        }

        [data-bs-theme="dark"] .hover-preview:hover {
          background-color: rgba(0, 123, 255, 0.2) !important;
        }

        [data-bs-theme="dark"] .hover-preview:hover small {
          color: #66b3ff !important;
        }

        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Notifications;
