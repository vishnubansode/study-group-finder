import { Group, GroupCreateRequest, GroupMember, GroupSearchParams } from '@/types/group';

const API_BASE_URL = 'http://localhost:8080/api';

export const groupAPI = {
  // Search/Get all groups with filters
  searchGroups: async (token?: string | null, params?: GroupSearchParams) => {
    const queryParams = new URLSearchParams();
    if (params?.courseId) queryParams.append('courseId', params.courseId.toString());
    if (params?.privacy) queryParams.append('privacy', params.privacy);
    if (params?.name) queryParams.append('name', params.name);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.userId) queryParams.append('userId', params.userId.toString());
    if (params?.filterByMembership !== undefined) queryParams.append('filterByMembership', params.filterByMembership.toString());

    const url = `${API_BASE_URL}/groups${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const msg = data && typeof data === 'object' ? JSON.stringify(data) : await response.text().catch(() => '');
      throw new Error(msg || `Failed to fetch groups (${response.status})`);
    }

    // Normalize common paginated shapes into an array of groups
    // Try: data.content (Spring Page), data.items, or raw array
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.content)) return data.content;
    if (Array.isArray((data as any).items)) return (data as any).items;

    // If response is an object that looks like a single group, wrap it
    return [data];
  },

  // Create a new group
  createGroup: async (token: string, groupData: GroupCreateRequest) => {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create group');
    }

    return response.json();
  },

  // Join a group
  joinGroup: async (token: string, groupId: number, userId: number, password?: string) => {
    const params = new URLSearchParams();
    params.append('userId', String(userId));
    if (password) params.append('password', password);
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/join?${params.toString()}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to join group');
    }

    return response.json();
  },

  // Approve a member (admin only)
  approveMember: async (token: string, groupId: number, adminId: number, userId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/groups/${groupId}/approve?adminId=${adminId}&userId=${userId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve member');
    }

    return response.json();
  },

  // Remove a member (admin only)
  removeMember: async (token: string, groupId: number, adminId: number, userId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/groups/${groupId}/remove-member?adminId=${adminId}&userId=${userId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove member');
    }

    return response.json();
  },

  // Get group members (backend exposes: GET /api/group-members/group/{groupId})
  getGroupMembers: async (token: string, groupId: number): Promise<GroupMember[]> => {
    const response = await fetch(`${API_BASE_URL}/group-members/group/${groupId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Failed to fetch group members');
    }

    return response.json();
  },

  // Change a member's role (admin only)
  changeMemberRole: async (token: string, groupId: number, adminId: number, userId: number, role: string) => {
    const response = await fetch(
      `${API_BASE_URL}/group-members/change-role?adminId=${adminId}&userId=${userId}&groupId=${groupId}&role=${encodeURIComponent(role)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to change member role');
    }

    return response.text();
  },

  // Delete a group (admin only)
  deleteGroup: async (token: string, groupId: number, adminId: number) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}?adminId=${adminId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete group');
    }

    return response.json();
  },

  // Leave a group (user leaves their membership)
  leaveGroup: async (token: string, groupId: number, userId: number) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/leave?userId=${userId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to leave group');
    }

    return response.json();
  },
};
