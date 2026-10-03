import { createReducer, on } from '@ngrx/store';
import { NotificationActions, NotificationItem } from './notification.actions';

export interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export const initialNotificationState: NotificationState = {
  items: [
    {
      id: 'notif-1',
      title: 'Phiếu xuất kho mới',
      message: 'Kho Hà Nội vừa tạo phiếu xuất 50 thiết bị PAX A920.',
      type: 'info',
      createdAt: new Date().toISOString(),
      isRead: false,
      link: '/inventory/exports'
    },
    {
      id: 'notif-2',
      title: 'Yêu cầu duyệt cấp phát',
      message: 'Merchant Nhà hàng Biển Sâu cần phê duyệt 2 TID mới.',
      type: 'warning',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: false,
      link: '/approval/inbox'
    }
  ],
  unreadCount: 2,
  isLoading: false,
  error: null,
};

export const notificationReducer = createReducer(
  initialNotificationState,
  on(NotificationActions.loadNotificationsSuccess, (state, { notifications, unreadCount }) => ({
    ...state,
    items: notifications,
    unreadCount,
    isLoading: false
  })),
  on(NotificationActions.markAsRead, (state, { id }) => {
    const updated = state.items.map(item => item.id === id ? { ...item, isRead: true } : item);
    const unread = updated.filter(item => !item.isRead).length;
    return {
      ...state,
      items: updated,
      unreadCount: unread
    };
  }),
  on(NotificationActions.markAllAsRead, (state) => ({
    ...state,
    items: state.items.map(item => ({ ...item, isRead: true })),
    unreadCount: 0
  })),
  on(NotificationActions.addNotification, (state, { notification }) => ({
    ...state,
    items: [notification, ...state.items],
    unreadCount: state.unreadCount + (notification.isRead ? 0 : 1)
  }))
);
