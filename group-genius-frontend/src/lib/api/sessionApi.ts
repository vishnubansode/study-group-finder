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

export const sessionAPI = {
  createSession: async (groupId: number, createdById: number, payload: any) => {
    const url = `${API_BASE_URL}/sessions/group/${groupId}/creator/${createdById}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  updateSession: async (id: number, payload: any) => {
    const url = `${API_BASE_URL}/sessions/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  deleteSession: async (id: number) => {
    const url = `${API_BASE_URL}/sessions/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...buildHeaders(),
      },
    });
    return handleResponse(response);
  },

  getSessionsByGroup: async (groupId: number, page = 0, size = 50) => {
    const url = `${API_BASE_URL}/sessions/group/${groupId}?page=${page}&size=${size}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
    });
    return handleResponse(response);
  },

  getSessionsByCreator: async (creatorId: number) => {
    const url = `${API_BASE_URL}/sessions/creator/${creatorId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
    });
    return handleResponse(response);
  },

  // Participant endpoints
  getParticipants: async (sessionId: number) => {
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

  getParticipantCount: async (sessionId: number) => {
    const url = `${API_BASE_URL}/sessions/participants/${sessionId}/count`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
    });
    return handleResponse(response);
  },

  isParticipant: async (sessionId: number, userId: number) => {
    const url = `${API_BASE_URL}/sessions/participants/${sessionId}/user/${userId}/is-participant`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
    });
    // The backend returns { isParticipant: true/false } — extract the boolean
    const data = await handleResponse(response);
    return data?.isParticipant ?? false;
  },

  addParticipant: async (sessionId: number, userId: number) => {
    const url = `${API_BASE_URL}/sessions/participants/${sessionId}/user/${userId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
    });
    return handleResponse(response);
  },

  removeParticipant: async (sessionId: number, userId: number) => {
    const url = `${API_BASE_URL}/sessions/participants/${sessionId}/user/${userId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...buildHeaders(),
      },
    });
    return handleResponse(response);
  }
};
