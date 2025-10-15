import { Course, UserCourse, CoursePeer, CoursePeersResponse } from '@/types/course';

const API_BASE = 'http://localhost:8080/api';

// Helper function to get current user ID from localStorage or context
const getCurrentUserId = (): number | null => {
  // Try to get user ID from localStorage first
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.id || null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
  }
  return null;
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
    console.log('🔍 Getting user courses for userId:', userId);
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const url = `${API_BASE}/user/courses?userId=${userId}`;
    console.log('🔍 Fetching from URL:', url);
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    console.log('🔍 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch user courses:', errorText);
      throw new Error('Failed to fetch user courses');
    }
    
    const data = await response.json();
    console.log('✅ User courses data:', data);
    return data;
  },

  // Enroll in a course
  async enrollInCourse(courseId: number): Promise<Course> {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/user/courses/${courseId}/enroll?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
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

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/user/courses/${courseId}?userId=${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
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

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/user/courses/peers?courseId=${courseId}&userId=${userId}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
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