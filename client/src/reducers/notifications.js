import {
  FETCH_NOTIFICATIONS_REQUEST,
  FETCH_NOTIFICATIONS_SUCCESS,
  FETCH_NOTIFICATIONS_FAILURE,
  FETCH_UNREAD_COUNT_REQUEST,
  FETCH_UNREAD_COUNT_SUCCESS,
  FETCH_UNREAD_COUNT_FAILURE,
  MARK_NOTIFICATION_READ_SUCCESS,
  MARK_ALL_READ_SUCCESS,
  DELETE_NOTIFICATION_SUCCESS,
} from "../actions/notifications";

const initialState = {
  notifications: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false,
  },
  unreadCount: 0,
  unreadLoading: false,
};

const notificationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_NOTIFICATIONS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: action.payload.notifications,
        pagination: action.payload.pagination,
        error: null,
      };

    case FETCH_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case FETCH_UNREAD_COUNT_REQUEST:
      return {
        ...state,
        unreadLoading: true,
      };

    case FETCH_UNREAD_COUNT_SUCCESS:
      return {
        ...state,
        unreadLoading: false,
        unreadCount: action.payload,
      };

    case FETCH_UNREAD_COUNT_FAILURE:
      return {
        ...state,
        unreadLoading: false,
        unreadCount: 0,
      };

    case MARK_NOTIFICATION_READ_SUCCESS:
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
      };

    case MARK_ALL_READ_SUCCESS:
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      };

    case DELETE_NOTIFICATION_SUCCESS:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
        pagination: {
          ...state.pagination,
          totalItems: Math.max(0, state.pagination.totalItems - 1),
        },
      };

    default:
      return state;
  }
};

export default notificationsReducer;
