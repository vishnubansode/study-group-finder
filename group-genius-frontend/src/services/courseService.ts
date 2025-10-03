import { Course, UserCourse, CoursePeer, CourseSearchParams, PaginatedCourseResponse, EnrollmentResponse, CourseStats } from '@/types/course';

const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Course Catalog Management
export const courseApi = {
  // Get all available courses (paginated)
  getAllCourses: async (params: CourseSearchParams = {}): Promise<PaginatedCourseResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.query) queryParams.append('q', params.query);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);

    const response = await fetch(`${API_BASE_URL}/courses?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Search courses by code/name
  searchCourses: async (query: string, page = 0, size = 10): Promise<PaginatedCourseResponse> => {
    const response = await fetch(`${API_BASE_URL}/courses/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to search courses: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get detailed course information
  getCourseById: async (courseId: number): Promise<Course> => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch course details: ${response.statusText}`);
    }
    
    return response.json();
  },
};

// User Course Management
export const userCourseApi = {
  // Get user's enrolled courses
  getUserCourses: async (): Promise<UserCourse[]> => {
    const response = await fetch(`${API_BASE_URL}/user/courses`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user courses: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Enroll in a course
  enrollInCourse: async (courseId: number): Promise<EnrollmentResponse> => {
    const response = await fetch(`${API_BASE_URL}/user/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to enroll in course: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Drop a course
  dropCourse: async (courseId: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/user/courses/${courseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Failed to drop course: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Find peers in same course
  getCoursePeers: async (courseId: number): Promise<CoursePeer[]> => {
    const response = await fetch(`${API_BASE_URL}/user/courses/peers?courseId=${courseId}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch course peers: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get course statistics for dashboard
  getCourseStats: async (): Promise<CourseStats> => {
    const response = await fetch(`${API_BASE_URL}/user/courses/stats`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch course stats: ${response.statusText}`);
    }
    
    return response.json();
  },
};

// Mock data fallback for development
export const mockData = {
  courses: [
    {
      id: 1,
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      description: 'Fundamentals of programming and computer science concepts',
      instructorName: 'Dr. Sarah Mitchell',
      classSchedule: 'MWF 10:00-11:00 AM',
      creditHours: 4,
      courseCapacity: 30,
      currentEnrollment: 25,
    },
    {
      id: 2,
      courseCode: 'MATH201',
      courseName: 'Calculus II',
      description: 'Advanced calculus including integration techniques and applications',
      instructorName: 'Prof. Michael Chen',
      classSchedule: 'TTh 2:00-3:30 PM',
      creditHours: 4,
      courseCapacity: 35,
      currentEnrollment: 28,
    },
    {
      id: 3,
      courseCode: 'PHYS151',
      courseName: 'Physics I: Mechanics',
      description: 'Introduction to classical mechanics and physics principles',
      instructorName: 'Dr. Emma Rodriguez',
      classSchedule: 'MWF 1:00-2:00 PM',
      creditHours: 4,
      courseCapacity: 25,
      currentEnrollment: 22,
    },
    // Add more mock courses as needed
  ] as Course[],
  
  userCourses: [
    {
      enrollmentId: 1,
      userId: 1,
      courseId: 1,
      enrollmentDate: '2024-08-15',
      course: {
        id: 1,
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
        description: 'Fundamentals of programming and computer science concepts',
        instructorName: 'Dr. Sarah Mitchell',
        classSchedule: 'MWF 10:00-11:00 AM',
        creditHours: 4,
        courseCapacity: 30,
        currentEnrollment: 25,
      },
    },
  ] as UserCourse[],
};