import { createActionGroup, emptyProps, props } from '@ngrx/store';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  createdAt: string;
  isRead: boolean;
  link?: string;
}

export const NotificationActions = createActionGroup({
  source: 'Notification',
  events: {
    'Load Notifications': emptyProps(),
    'Load Notifications Success': props<{ notifications: NotificationItem[]; unreadCount: number }>(),
    'Load Notifications Failure': props<{ error: string }>(),
    'Mark As Read': props<{ id: string }>(),
    'Mark All As Read': emptyProps(),
    'Add Notification': props<{ notification: NotificationItem }>(),
  }
});
