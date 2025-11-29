import { createSlice } from '@reduxjs/toolkit';
import { notificationsApi } from '../../features/notifications/notifications';

const notificationSlice = createSlice({
  name: 'noti',
  initialState: {
    notifications: [],
    unreadCount: 0
  },
  reducers: {
    addNotification: (state, action) => {
      console.log('Adding notification to Redux:', action.payload);
      // Check if notification already exists
      const exists = state.notifications.some(
        notif => notif._id === action.payload._id
      );
      if (!exists) {
        state.notifications.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      }
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n._id !== action.payload);
    },
    clearAllRead: (state) => {
      const readCount = state.notifications.filter(n => n.read).length;
      state.notifications = state.notifications.filter(n => !n.read);
      console.log(`Cleared ${readCount} read notifications`);
    }
  },

  extraReducers: (builder) => {
    builder.addMatcher(
      notificationsApi.endpoints.getAllNotifications.matchFulfilled,
      (state, { payload }) => {
        console.log('API notifications loaded:', payload);
        state.notifications = payload?.data?.result || [];
        state.unreadCount = state.notifications.filter(n => !n.read).length;
      }
    );
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllRead
} = notificationSlice.actions;
export default notificationSlice.reducer;