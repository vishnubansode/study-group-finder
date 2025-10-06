// types/course.ts
export interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  description: string;
  isEnrolled: boolean;
}

export interface UserCourse {
  id: number;
  courseCode: string;
  courseName: string;
  description: string;
  isEnrolled: boolean;
}

// types/course.ts
export interface CourseSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string; // Changed from sortDir to sortDirection
  query?: string;
}

export interface CoursePeer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  secondarySchool?: string;
  graduationYear?: string;
  university?: string;
  major?: string;
  currentYear?: string;
  bio?: string;
  commonCourses: number;
}

export interface CourseStats {
  totalEnrolledCredits: number;
  totalCourses: number;
  averageProgress: number;
  studyGroupsCount: number;
}

export interface UserDashboardResponse {
  userId: number;
  userName: string;
  enrolledCourses: Course[];
  suggestedPeers: CoursePeer[];
  totalCourses: number;
  totalPeers: number;
}

export interface CoursePeersResponse {
  courseId: number;
  courseCode: string;
  courseName: string;
  peers: CoursePeer[];
  totalPeers: number;
}