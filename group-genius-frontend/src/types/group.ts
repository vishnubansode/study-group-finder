export interface Group {
  groupId: number;
  groupName: string;
  description: string;
  courseName?: string | null;
  createdBy: number; // backend GroupResponse.createdBy (userId)
  privacyType: 'PUBLIC' | 'PRIVATE';
  createdAt?: string; // backend returns createdAt as LocalDateTime
  membershipStatus?: 'APPROVED' | 'PENDING' | 'NOT_MEMBER' | null;
  membershipRole?: 'ADMIN' | 'MEMBER' | null;
  memberCount?: number;
}

export interface GroupCreateRequest {
  name: string;
  description: string;
  courseId?: number;
  createdBy: number;
  privacy: 'PUBLIC' | 'PRIVATE';
  password?: string;
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
  userId?: number;
  filterByMembership?: boolean; // Whether to filter results to only groups user is a member of
}
