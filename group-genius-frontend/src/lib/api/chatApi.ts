const API_BASE_URL = 'http://localhost:8080/api';

export const chatAPI = {
  getHistory: async (token: string, groupId: number) => {
    const response = await fetch(`${API_BASE_URL}/chat/history/${groupId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Failed to fetch chat history');
    }

    return response.json();
  },
};
