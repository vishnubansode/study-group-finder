import { tokenService } from '@/services/api';

const API_BASE_URL = 'http://localhost:8080/api';

const buildHeaders = () => {
  const token = tokenService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text().catch(() => '');
  const data = contentType.includes('application/json') ? JSON.parse(text || '{}') : text;
  if (!response.ok) {
    const errMsg = (data && typeof data === 'object' && data.message) ? data.message : text || `Request failed (${response.status})`;
    throw new Error(errMsg);
  }
  return data;
};

export interface NotificationResponse {
  id: number;
  recipientId: number;
  recipientName: string;
  sessionId?: number;
  type: 'GENERAL' | 'INVITATION' | 'ACCEPTED' | 'DECLINED' | 'REMINDER' | 'SESSION_UPDATE' | 'SESSION_CANCELLED';
  message: string;
  read: boolean;
  createdAt: string;
}

export const notificationAPI = {
  /**
   * Get all notifications for a user
   */
  getUserNotifications: async (userId: number): Promise<NotificationResponse[]> => {
    const url = `${API_BASE_URL}/notifications/user/${userId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
    });
    return handleResponse(response);
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: number): Promise<NotificationResponse> => {
    const url = `${API_BASE_URL}/notifications/${notificationId}/read`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
    });
    return handleResponse(response);
  },
};
