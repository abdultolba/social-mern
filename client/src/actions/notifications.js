import Api from "../api/api";

const api = new Api();

// Action types
export const FETCH_NOTIFICATIONS_REQUEST = "FETCH_NOTIFICATIONS_REQUEST";
export const FETCH_NOTIFICATIONS_SUCCESS = "FETCH_NOTIFICATIONS_SUCCESS";
export const FETCH_NOTIFICATIONS_FAILURE = "FETCH_NOTIFICATIONS_FAILURE";

export const FETCH_UNREAD_COUNT_REQUEST = "FETCH_UNREAD_COUNT_REQUEST";
export const FETCH_UNREAD_COUNT_SUCCESS = "FETCH_UNREAD_COUNT_SUCCESS";
export const FETCH_UNREAD_COUNT_FAILURE = "FETCH_UNREAD_COUNT_FAILURE";

export const MARK_NOTIFICATION_READ_REQUEST = "MARK_NOTIFICATION_READ_REQUEST";
export const MARK_NOTIFICATION_READ_SUCCESS = "MARK_NOTIFICATION_READ_SUCCESS";
export const MARK_NOTIFICATION_READ_FAILURE = "MARK_NOTIFICATION_READ_FAILURE";

export const MARK_ALL_READ_REQUEST = "MARK_ALL_READ_REQUEST";
export const MARK_ALL_READ_SUCCESS = "MARK_ALL_READ_SUCCESS";
export const MARK_ALL_READ_FAILURE = "MARK_ALL_READ_FAILURE";

export const DELETE_NOTIFICATION_REQUEST = "DELETE_NOTIFICATION_REQUEST";
export const DELETE_NOTIFICATION_SUCCESS = "DELETE_NOTIFICATION_SUCCESS";
export const DELETE_NOTIFICATION_FAILURE = "DELETE_NOTIFICATION_FAILURE";

// Action creators
export const fetchNotifications =
  (page = 1, limit = 20) =>
  async (dispatch) => {
    dispatch({ type: FETCH_NOTIFICATIONS_REQUEST });

    try {
      const response = await api.get(
        `notifications?page=${page}&limit=${limit}`
      );

      if (response.code === 200) {
        dispatch({
          type: FETCH_NOTIFICATIONS_SUCCESS,
          payload: response.response,
        });
      } else {
        throw new Error(
          response.message || "Failed to fetch notifications"
        );
      }
    } catch (error) {
      dispatch({
        type: FETCH_NOTIFICATIONS_FAILURE,
        payload: error.message || "Failed to fetch notifications",
      });
    }
  };

export const fetchUnreadCount = () => async (dispatch) => {
  dispatch({ type: FETCH_UNREAD_COUNT_REQUEST });

  try {
    const response = await api.get("notifications/unread-count");

    if (response.code === 200) {
      dispatch({
        type: FETCH_UNREAD_COUNT_SUCCESS,
        payload: response.response.unreadCount,
      });
    } else {
      throw new Error(response.message || "Failed to fetch unread count");
    }
  } catch (error) {
    dispatch({
      type: FETCH_UNREAD_COUNT_FAILURE,
      payload: error.message || "Failed to fetch unread count",
    });
  }
};

export const markNotificationAsRead = (notificationId) => async (dispatch) => {
  dispatch({ type: MARK_NOTIFICATION_READ_REQUEST });

  try {
    const response = await api.patch(`notifications/${notificationId}/read`);

    if (response.code === 200) {
      dispatch({
        type: MARK_NOTIFICATION_READ_SUCCESS,
        payload: notificationId,
      });
      // Also update the unread count
      dispatch(fetchUnreadCount());
    } else {
      throw new Error(
        response.message || "Failed to mark notification as read"
      );
    }
  } catch (error) {
    dispatch({
      type: MARK_NOTIFICATION_READ_FAILURE,
      payload: error.message || "Failed to mark notification as read",
    });
  }
};

export const markAllAsRead = () => async (dispatch) => {
  dispatch({ type: MARK_ALL_READ_REQUEST });

  try {
    const response = await api.patch("notifications/mark-all-read");

    if (response.code === 200) {
      dispatch({ type: MARK_ALL_READ_SUCCESS });
      // Refresh notifications and unread count
      dispatch(fetchNotifications());
      dispatch(fetchUnreadCount());
    } else {
      throw new Error(response.message || "Failed to mark all as read");
    }
  } catch (error) {
    dispatch({
      type: MARK_ALL_READ_FAILURE,
      payload: error.message || "Failed to mark all as read",
    });
  }
};

export const deleteNotification = (notificationId) => async (dispatch) => {
  dispatch({ type: DELETE_NOTIFICATION_REQUEST });

  try {
    const response = await api.delete(`notifications/${notificationId}`);

    if (response.code === 200) {
      dispatch({
        type: DELETE_NOTIFICATION_SUCCESS,
        payload: notificationId,
      });
      // Also update the unread count
      dispatch(fetchUnreadCount());
    } else {
      throw new Error(response.message || "Failed to delete notification");
    }
  } catch (error) {
    dispatch({
      type: DELETE_NOTIFICATION_FAILURE,
      payload: error.message || "Failed to delete notification",
    });
  }
};
