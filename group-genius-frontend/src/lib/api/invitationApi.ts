import { tokenService } from '@/services/api';

const API_BASE_URL = 'http://localhost:8080/api';

const buildHeaders = () => {
  const token = tokenService.getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export const invitationAPI = {
  // Create invitations for a session (matches backend):
  // POST /api/sessions/{sessionId}/invitations/sender/{senderId}
  // body: { recipientIds: number[], message?: string }
  createInvitationsForSession: async (
    sessionId: number,
    recipientIds: number[],
    senderId?: number,
    message?: string
  ) => {
    // Resolve senderId (prefer explicit param; fallback to localStorage user)
    let sid = senderId;
    if (!sid) {
      try {
        const raw = localStorage.getItem('user');
        if (raw) sid = JSON.parse(raw).id;
      } catch {
        // ignore
      }
    }

    if (!sid) {
      throw new Error('Missing senderId for creating invitations');
    }

    const url = `${API_BASE_URL}/sessions/${sessionId}/invitations/sender/${sid}`;
    const body: Record<string, unknown> = { recipientIds };
    if (message) body.message = message;

    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `Failed to create invitations (${response.status})`);
    }

    return response.json();
  }
  ,
  // Respond to a single invitation (accept or decline)
  // Wrapper that resolves userId and calls the backend route that expects userId in the path.
  respondToInvitation: async (
    invitationId: number,
    action: 'accept' | 'decline',
    userId?: number
  ) => {
    let uid = userId;
    if (!uid) {
      try {
        const raw = localStorage.getItem('user');
        if (raw) uid = JSON.parse(raw).id;
      } catch {
        // ignore
      }
    }

    if (!uid) {
      throw new Error('Not authenticated');
    }

    return invitationAPI.respondToInvitationWithUser(invitationId, uid, action);
  }
  ,
  // Respond to invitation with explicit userId in the path (backend expects /respond/user/{userId})
  respondToInvitationWithUser: async (invitationId: number, userId: number, action: 'accept' | 'decline') => {
    const url = `${API_BASE_URL}/invitations/${invitationId}/respond/user/${userId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ action }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `Failed to respond to invitation (${response.status})`);
    }

    // Try to parse JSON when present; if parsing fails (server returned plain text)
    // fall back to returning the raw text to avoid unhandled JSON parse errors
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    // Some backend endpoints may return an empty body or plain text; handle gracefully
    const text = await response.text().catch(() => '');
    if (!text) return undefined;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
};

export default invitationAPI;
