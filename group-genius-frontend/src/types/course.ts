// Course Types
export interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  description: string;
  instructorName: string;
  classSchedule: string;
  creditHours: number;
  courseCapacity: number;
  currentEnrollment: number;
  isEnrolled?: boolean;
  enrollmentDate?: string;
}

export interface UserCourse {
  enrollmentId: number;
  userId: number;
  courseId: number;
  enrollmentDate: string;
  course: Course;
}

export interface CoursePeer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  enrollmentDate: string;
}

export interface CourseSearchParams {
  page?: number;
  size?: number;
  query?: string;
  sortBy?: 'courseCode' | 'courseName' | 'instructorName' | 'creditHours';
  sortDir?: 'asc' | 'desc';
}

export interface PaginatedCourseResponse {
  content: Course[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CourseStats {
  totalEnrolledCredits: number;
  totalCourses: number;
  averageProgress: number;
  studyGroupsCount: number;
}

// Enrollment request/response types
export interface EnrollmentRequest {
  courseId: number;
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  enrollment?: UserCourse;
}

// User courses response
export interface UserCoursesResponse {
  courses: UserCourse[];
  totalCreditHours: number;
  totalCourses: number;
  averageEnrollmentPercentage: number;
}

// Course peers response
export interface CoursePeersResponse {
  courseId: number;
  courseName: string;
  peers: CoursePeer[];
}