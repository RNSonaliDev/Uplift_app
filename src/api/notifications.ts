import { api, loadAuthToken } from './client';

export interface RegisterDeviceTokenPayload {
  device_token: {
    token: string;
    platform: 'ios' | 'android';
  };
}

export interface NotificationSettingsPayload {
  notification_settings: {
    push_notifications_enabled: boolean;
    email_notifications_enabled: boolean;
    sms_notifications_enabled: boolean;
  };
}

export interface NotificationSettingsResponse {
  id?: number;
  user_id?: number;
  push_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  notification_type?: string;
  reference_id?: number;
  reference_type?: string;
  created_at: string;
}

export const notificationsApi = {
  registerDeviceToken: async (payload: RegisterDeviceTokenPayload) => {
    const token = await loadAuthToken();
    if (!token) {
      console.log('Skipping registerDeviceToken: No auth token present');
      return { message: 'Skipped - not logged in' };
    }
    return api.post<{message: string}>('/device_tokens', payload);
  },
  
  deleteDeviceToken: async (userId: number) => {
    const token = await loadAuthToken();
    if (!token) {
      console.log('Skipping deleteDeviceToken: No auth token present');
      return { message: 'Skipped - not logged in' };
    }
    return api.delete<{message: string}>(`/device_tokens/${userId}`);
  },
  
  getSettings: () => {
    return api.get<NotificationSettingsResponse>('/notification_settings');
  },
  
  updateSettings: (payload: NotificationSettingsPayload) => {
    return api.put<NotificationSettingsResponse>('/notification_settings', payload);
  },
  
  getNotifications: (role?: string) => {
    const url = '/notifications';
    return api.get<AppNotification[]>(url);
  },
  
  markAsRead: (id: number) => {
    return api.patch<{message: string}>(`/notifications/${id}/read`);
  },
  
  markAllAsRead: () => {
    return api.patch<{message: string}>('/notifications/read_all');
  }
};
