export interface Group {
  groupId: number;
  groupName: string;
  description: string;
  courseName?: string | null;
  createdBy: number; // backend GroupResponse.createdBy (userId)
  privacyType: 'PUBLIC' | 'PRIVATE';
  createdAt?: string; // backend returns createdAt as LocalDateTime
}

export interface GroupCreateRequest {
  name: string;
  description: string;
  courseId?: number;
  createdBy: number;
  privacy: 'PUBLIC' | 'PRIVATE';
}

export interface GroupMember {
  // Matches backend GroupMemberDto
  groupMemberId: number;
  userId: number;
  userName?: string;
  groupId: number;
  groupName?: string;
  role: 'ADMIN' | 'MEMBER';
  status: 'PENDING' | 'APPROVED';
  joinedAt?: string; // ISO timestamp string
}

export interface GroupSearchParams {
  courseId?: number;
  privacy?: string;
  name?: string;
  page?: number;
  size?: number;
  sort?: string;
}
