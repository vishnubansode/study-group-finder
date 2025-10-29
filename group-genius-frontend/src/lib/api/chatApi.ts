const API_ROOT = (import.meta?.env?.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080';
const API_BASE_URL = `${API_ROOT.replace(/\/$/, '')}/api`;

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
  uploadAttachment: async (
    token: string,
    groupId: number,
    file: File,
    options: { senderId: number; caption?: string; clientMessageId?: string }
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderId', String(options.senderId));
    if (options.caption) {
      formData.append('caption', options.caption);
    }
    if (options.clientMessageId) {
      formData.append('clientMessageId', options.clientMessageId);
    }

    const response = await fetch(`${API_BASE_URL}/chat/${groupId}/attachments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Failed to upload attachment');
    }

    return response.json();
  },
};
