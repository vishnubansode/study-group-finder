import { tokenService } from '@/services/api';

const API_BASE_URL = 'http://localhost:8080/api';

const buildHeaders = () => {
  const token = tokenService.getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export type NotificationDTO = {
  id: number;
  recipientId: number;
  recipientName: string;
  sessionId?: number | null;
  invitationId?: number | null;
  message: string;
  read: boolean;
  createdAt: string;
};

export const notificationAPI = {
  getUserNotifications: async (userId: number): Promise<NotificationDTO[]> => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/notifications`, { headers: buildHeaders() });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Failed to fetch notifications (${res.status})`);
    }
    return res.json();
  },

  markAsRead: async (notificationId: number): Promise<NotificationDTO> => {
    const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}/mark-read`, {
      method: 'POST',
      headers: buildHeaders(),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Failed to mark notification read (${res.status})`);
    }
    return res.json();
  }
};

export default notificationAPI;
