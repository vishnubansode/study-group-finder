export interface Group {
  groupId: number;
  groupName: string;
  description: string;
  courseName?: string | null;
  createdBy: number;
  privacyType: 'PUBLIC' | 'PRIVATE';
}

export interface GroupCreateRequest {
  name: string;
  description: string;
  courseId?: number;
  createdBy: number;
  privacy: 'PUBLIC' | 'PRIVATE';
}

export interface GroupMember {
  id: number;
  userId: number;
  groupId: number;
  role: 'ADMIN' | 'MEMBER';
  status: 'PENDING' | 'APPROVED';
  joinedAt: string;
  userName?: string;
  userEmail?: string;
}

export interface GroupSearchParams {
  courseId?: number;
  privacy?: string;
  name?: string;
  page?: number;
  size?: number;
  sort?: string;
}
