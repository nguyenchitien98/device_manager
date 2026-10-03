import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationState } from './notification.reducer';

export const selectNotificationState = createFeatureSelector<NotificationState>('notification');

export const selectAllNotifications = createSelector(
  selectNotificationState,
  (state) => state.items
);

export const selectUnreadNotificationCount = createSelector(
  selectNotificationState,
  (state) => state.unreadCount
);
