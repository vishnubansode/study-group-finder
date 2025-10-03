import { Course, UserCourse, CoursePeer, CourseSearchParams, PaginatedCourseResponse, EnrollmentResponse, CourseStats } from '@/types/course';

const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get current user ID (replace with actual auth logic)
const getCurrentUserId = (): number | null => {
  // This should get the user ID from your authentication system
  // For now, using a hardcoded value for testing
  return 1;
};

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
    const userId = getCurrentUserId();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDirection', params.sortDir);
    if (userId) queryParams.append('userId', userId.toString());

    const response = await fetch(`${API_BASE_URL}/courses?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      content: data.content,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      size: data.size,
      number: data.number,
      first: data.first,
      last: data.last
    };
  },

  // Search courses by code/name
  searchCourses: async (query: string, page = 0, size = 10): Promise<PaginatedCourseResponse> => {
    const queryParams = new URLSearchParams();
    const userId = getCurrentUserId();
    
    queryParams.append('q', query);
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    if (userId) queryParams.append('userId', userId.toString());

    const response = await fetch(`${API_BASE_URL}/courses/search?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to search courses: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      content: data.content,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      size: data.size,
      number: data.number,
      first: data.first,
      last: data.last
    };
  },

  // Get detailed course information
  getCourseById: async (courseId: number): Promise<Course> => {
    const userId = getCurrentUserId();
    const queryParams = new URLSearchParams();
    if (userId) queryParams.append('userId', userId.toString());

    const response = await fetch(`${API_BASE_URL}/courses/${courseId}?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch course details: ${response.statusText}`);
    }
    
    return response.json();
  }
};

// User Course Management
export const userCourseApi = {
  // Get user's enrolled courses
  getUserCourses: async (): Promise<any> => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/user/courses?userId=${userId}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user courses: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Enroll in a course
  enrollInCourse: async (courseId: number): Promise<Course> => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/user/courses/${courseId}/enroll?userId=${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to enroll in course: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Drop a course
  dropCourse: async (courseId: number): Promise<void> => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/user/courses/${courseId}?userId=${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to drop course: ${response.statusText}`);
    }
  },

  // Find peers in same course
  getCoursePeers: async (courseId: number): Promise<any> => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/user/courses/peers?courseId=${courseId}&userId=${userId}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch course peers: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get course statistics for dashboard
  getCourseStats: async (): Promise<CourseStats> => {
    try {
      const userCourses = await userCourseApi.getUserCourses();
      
      // Calculate stats from user courses
      const totalCreditHours = userCourses?.totalCreditHours || 0;
      const totalCourses = userCourses?.totalCourses || 0;
      const averageEnrollmentPercentage = userCourses?.averageEnrollmentPercentage || 0;
      
      return {
        totalEnrolledCredits: totalCreditHours,
        totalCourses: totalCourses,
        averageProgress: averageEnrollmentPercentage,
        studyGroupsCount: 2 // Mock for now
      };
    } catch (error) {
      // Return default stats if error
      return {
        totalEnrolledCredits: 0,
        totalCourses: 0,
        averageProgress: 0,
        studyGroupsCount: 0
      };
    }
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

// Main course service combining all APIs for backwards compatibility
export const courseService = {
  // Course catalog methods
  getAllCourses: courseApi.getAllCourses,
  searchCourses: courseApi.searchCourses,
  getCourseById: courseApi.getCourseById,
  
  // User course methods
  getUserCourses: userCourseApi.getUserCourses,
  enrollInCourse: userCourseApi.enrollInCourse,
  dropCourse: userCourseApi.dropCourse,
  getCoursePeers: userCourseApi.getCoursePeers,
  getCourseStats: userCourseApi.getCourseStats,
};

export default courseService;