import { tokenService } from '@/services/api';

const API_BASE_URL = 'http://localhost:8080/api';

const buildHeaders = () => {
  const token = tokenService.getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export const invitationAPI = {
  // Create invitations for a session. Backend must accept an array of userIds/emails and send emails/notifications.
  // Assumption: POST /api/invitations/session/{sessionId} with body { inviteeIds: number[] }
  createInvitationsForSession: async (sessionId: number, inviteeIds: number[]) => {
    const url = `${API_BASE_URL}/invitations/session/${sessionId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ inviteeIds }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `Failed to create invitations (${response.status})`);
    }

    return response.json();
  }
  ,
  // Respond to a single invitation (accept or decline)
  // Assumption: POST /api/invitations/{invitationId}/respond with body { action: 'accept' | 'decline' }
  respondToInvitation: async (invitationId: number, action: 'accept' | 'decline') => {
    const url = `${API_BASE_URL}/invitations/${invitationId}/respond`;
    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ action }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `Failed to respond to invitation (${response.status})`);
    }
    return response.json();
  }
};

export default invitationAPI;
