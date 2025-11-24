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
    const errMsg = (data && typeof data === 'object' && data.message)
      ? data.message
      : text || `Request failed (${response.status})`;
    throw new Error(errMsg);
  }
  return data;
};

export interface SessionInvitation {
  id: number;
  sessionId: number;
  sessionTitle: string;
  sessionDescription?: string;
  sessionStartTime: string;
  sessionEndTime: string;
  groupId: number;
  groupName: string;
  invitedBy: number;
  invitedByName: string;
  userId: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  invitedAt: string;
  respondedAt?: string;
}

export interface SessionCreateWithInvitationsRequest {
  groupId: number;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationDays: number; // integer number of days (>=1)
  meetingLink?: string;
  invitedUserIds: number[];
}

export interface SessionParticipant {
  id: number;
  sessionId: number;
  userId: number;
  userName: string;
  userEmail: string;
  joinedAt: string;
}

export const sessionInvitationAPI = {
  /**
   * Create a session with invitations
   */
  createSessionWithInvitations: async (createdById: number, request: SessionCreateWithInvitationsRequest) => {
    const url = `${API_BASE_URL}/sessions/invitations/create?createdById=${createdById}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
      body: JSON.stringify(request),
    });
    return handleResponse(response);
  },

  /**
   * Get pending invitations for a user
   */
  getPendingInvitations: async (userId: number): Promise<SessionInvitation[]> => {
    const url = `${API_BASE_URL}/sessions/invitations/user/${userId}/pending`;
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
   * Get pending invitations for a user in a specific group
   */
  getPendingInvitationsInGroup: async (groupId: number, userId: number): Promise<SessionInvitation[]> => {
    const url = `${API_BASE_URL}/sessions/invitations/groups/${groupId}/user/${userId}/pending`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
    });
    return handleResponse(response);
  },

  getDeclinedInvitations: async (userId: number): Promise<SessionInvitation[]> => {
    const url = `${API_BASE_URL}/sessions/invitations/user/${userId}/declined`;
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
   * Accept an invitation
   */
  acceptInvitation: async (invitationId: number, userId: number): Promise<SessionInvitation> => {
    const url = `${API_BASE_URL}/sessions/invitations/${invitationId}/accept?userId=${userId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
    });
    return handleResponse(response);
  },

  /**
   * Decline an invitation
   */
  declineInvitation: async (invitationId: number, userId: number): Promise<SessionInvitation> => {
    const url = `${API_BASE_URL}/sessions/invitations/${invitationId}/decline?userId=${userId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
    });
    return handleResponse(response);
  },

  rejoinInvitation: async (invitationId: number, userId: number): Promise<SessionInvitation> => {
    const url = `${API_BASE_URL}/sessions/invitations/${invitationId}/rejoin?userId=${userId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
    });
    return handleResponse(response);
  },

  /**
   * Get all invitations for a session
   */
  getInvitationsForSession: async (sessionId: number): Promise<SessionInvitation[]> => {
    const url = `${API_BASE_URL}/sessions/invitations/session/${sessionId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
    });
    return handleResponse(response);
  },
};

export const sessionParticipantAPI = {
  /**
   * Get all participants for a session
   */
  getParticipants: async (sessionId: number): Promise<SessionParticipant[]> => {
    const url = `${API_BASE_URL}/sessions/participants/${sessionId}`;
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
   * Get participant count for a session
   */
  getParticipantCount: async (sessionId: number): Promise<number> => {
    const url = `${API_BASE_URL}/sessions/participants/${sessionId}/count`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
    });
    const data = await handleResponse(response);
    return data.count;
  },

  /**
   * Check if user is a participant
   */
  isParticipant: async (sessionId: number, userId: number): Promise<boolean> => {
    const url = `${API_BASE_URL}/sessions/participants/${sessionId}/user/${userId}/is-participant`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
    });
    const data = await handleResponse(response);
    return data.isParticipant;
  },

  getParticipationStatus: async (userId: number, sessionIds: number[]): Promise<Record<number, boolean>> => {
    const url = `${API_BASE_URL}/sessions/participants/user/${userId}/status`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
      body: JSON.stringify({ sessionIds }),
    });
    return handleResponse(response);
  },
};
