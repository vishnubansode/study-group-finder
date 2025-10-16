import { Group, GroupCreateRequest, GroupMember, GroupSearchParams } from '@/types/group';

const API_BASE_URL = 'http://localhost:8080/api';

export const groupAPI = {
  // Search/Get all groups with filters
  searchGroups: async (token: string, params?: GroupSearchParams) => {
    const queryParams = new URLSearchParams();
    if (params?.courseId) queryParams.append('courseId', params.courseId.toString());
    if (params?.privacy) queryParams.append('privacy', params.privacy);
    if (params?.name) queryParams.append('name', params.name);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.userId) queryParams.append('userId', params.userId.toString());

    const url = `${API_BASE_URL}/groups${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Failed to fetch groups');
    }

    return response.json();
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
  joinGroup: async (token: string, groupId: number, userId: number) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/join?userId=${userId}`, {
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
};
