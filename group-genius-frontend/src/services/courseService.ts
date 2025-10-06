// services/courseService.ts
const API_BASE_URL = 'http://localhost:8080/api';

export const courseApi = {
  // Get all courses (public endpoint)
  getAllCourses: async (params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
    userId?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params.userId) queryParams.append('userId', params.userId.toString());

    console.log('🌐 Fetching courses from:', `${API_BASE_URL}/courses?${queryParams}`);
    
    const response = await fetch(`${API_BASE_URL}/courses?${queryParams}`);
    
    console.log('🌐 Courses response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Courses API error:', errorText);
      throw new Error(`Failed to fetch courses: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Courses data received:', data);
    return data;
  },

  // Search courses (public endpoint)
  searchCourses: async (query: string, params: {
    page?: number;
    size?: number;
    userId?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.userId) queryParams.append('userId', params.userId.toString());

    console.log('🌐 Searching courses:', `${API_BASE_URL}/courses/search?${queryParams}`);
    
    const response = await fetch(`${API_BASE_URL}/courses/search?${queryParams}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Search courses API error:', errorText);
      throw new Error(`Failed to search courses: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Search results:', data);
    return data;
  },

  // Get course by ID (public endpoint)
  getCourse: async (id: number, userId?: number) => {
    const queryParams = userId ? `?userId=${userId}` : '';
    console.log('🌐 Fetching course:', `${API_BASE_URL}/courses/${id}${queryParams}`);
    
    const response = await fetch(`${API_BASE_URL}/courses/${id}${queryParams}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Get course API error:', errorText);
      throw new Error(`Failed to fetch course: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Course data:', data);
    return data;
  }
};

export const userCourseApi = {
  // Get user's enrolled courses (protected endpoint)
  getUserCourses: async (userId: number) => {
    const token = localStorage.getItem('token');
    console.log('🌐 Fetching user courses for user:', userId);
    
    const response = await fetch(`${API_BASE_URL}/user/courses?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('🌐 User courses response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ User courses API error:', errorText);
      throw new Error(`Failed to fetch user courses: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ User courses data:', data);
    return data;
  },

  // Enroll in course (protected endpoint)
  enrollInCourse: async (userId: number, courseId: number) => {
    const token = localStorage.getItem('token');
    console.log('🌐 Enrolling user', userId, 'in course', courseId);
    
    const response = await fetch(`${API_BASE_URL}/user/courses/${courseId}/enroll?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Enroll API error:', errorText);
      throw new Error(`Failed to enroll in course: ${response.status} ${errorText}`);
    }

    const data = await response.text();
    console.log('✅ Enrollment success:', data);
    return data;
  },

  // Drop course (protected endpoint)
  dropCourse: async (userId: number, courseId: number) => {
    const token = localStorage.getItem('token');
    console.log('🌐 Dropping course', courseId, 'for user', userId);
    
    const response = await fetch(`${API_BASE_URL}/user/courses/${courseId}?userId=${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Drop course API error:', errorText);
      throw new Error(`Failed to drop course: ${response.status} ${errorText}`);
    }

    const data = await response.text();
    console.log('✅ Drop course success:', data);
    return data;
  },

  // Get course peers (protected endpoint)
  getCoursePeers: async (courseId: number, userId: number) => {
    const token = localStorage.getItem('token');
    console.log('🌐 Fetching peers for course', courseId, 'user', userId);
    
    const response = await fetch(`${API_BASE_URL}/user/courses/peers?courseId=${courseId}&userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Course peers API error:', errorText);
      throw new Error(`Failed to fetch course peers: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Course peers data:', data);
    return data;
  },

  // Get user dashboard (protected endpoint)
  getUserDashboard: async (userId: number) => {
    const token = localStorage.getItem('token');
    console.log('🌐 Fetching dashboard for user:', userId);
    
    const response = await fetch(`${API_BASE_URL}/user/courses/dashboard?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Dashboard API error:', errorText);
      throw new Error(`Failed to fetch dashboard: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Dashboard data:', data);
    return data;
  }
};