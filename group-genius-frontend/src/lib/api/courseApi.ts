import { Course, UserCourse, CoursePeer, CoursePeersResponse } from '@/types/course';

const API_BASE = 'http://localhost:8080/api';

// Helper function to get current user ID (you'll need to implement this based on your auth system)
const getCurrentUserId = (): number | null => {
  // This should return the current logged-in user's ID
  // For now, we'll use a hardcoded ID for testing
  return 1; // Replace with actual auth logic
};

export const courseApi = {
  // Get all courses with pagination
  async getAllCourses(page = 0, size = 10, sortBy = 'courseName', sortDirection = 'asc'): Promise<{
    content: Course[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const userId = getCurrentUserId();
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDirection,
      ...(userId && { userId: userId.toString() })
    });

    const response = await fetch(`${API_BASE}/courses?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    return response.json();
  },

  // Search courses
  async searchCourses(query: string, page = 0, size = 10): Promise<{
    content: Course[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const userId = getCurrentUserId();
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      size: size.toString(),
      ...(userId && { userId: userId.toString() })
    });

    const response = await fetch(`${API_BASE}/courses/search?${params}`);
    if (!response.ok) {
      throw new Error('Failed to search courses');
    }
    return response.json();
  },

  // Get single course
  async getCourse(id: number): Promise<Course> {
    const userId = getCurrentUserId();
    const params = new URLSearchParams({
      ...(userId && { userId: userId.toString() })
    });

    const response = await fetch(`${API_BASE}/courses/${id}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch course');
    }
    return response.json();
  },

  // Get user's enrolled courses
  async getUserCourses(): Promise<UserCourse[]> {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE}/user/courses?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user courses');
    }
    return response.json();
  },

  // Enroll in a course
  async enrollInCourse(courseId: number): Promise<Course> {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE}/user/courses/${courseId}/enroll?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to enroll in course');
    }
    return response.json();
  },

  // Drop a course
  async dropCourse(courseId: number): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE}/user/courses/${courseId}?userId=${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to drop course');
    }
  },

  // Get course peers
  async getCoursePeers(courseId: number): Promise<CoursePeersResponse> {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE}/user/courses/peers?courseId=${courseId}&userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch course peers');
    }
    return response.json();
  },

  // Create a new course (admin function)
  async createCourse(course: Omit<Course, 'id' | 'currentEnrollment' | 'enrollmentPercentage' | 'isFull' | 'isEnrolled'>): Promise<Course> {
    const response = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(course),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create course');
    }
    return response.json();
  }
};