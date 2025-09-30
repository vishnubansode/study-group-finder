const API_BASE_URL = 'http://localhost:8081/api';

export const authAPI = {
  register: async (userData: any, profileImage?: File) => {
    console.log('🌐 API: Starting register request');
    const formData = new FormData();
    
    const userJson = JSON.stringify(userData);
    const userBlob = new Blob([userJson], { type: 'application/json' });
    formData.append('user', userBlob);
    
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    console.log('🌐 API: Sending register request to backend');
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: formData,
    });

    console.log('🌐 API: Register response status:', response.status);
    console.log('🌐 API: Register response headers:', response.headers.get('content-type'));
    
    if (!response.ok) {
      const error = await response.text();
      console.error('🌐 API: Register error:', error);
      throw new Error(error);
    }

    // Check if response is JSON or plain text
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      // Parse JSON response from backend
      const result = await response.json();
      console.log('🌐 API: Register JSON success response:', result);
      return result;
    } else {
      // Handle plain text response
      const result = await response.text();
      console.log('🌐 API: Register plain text success response:', result);
      return {
        success: true,
        message: result,
        email: userData.email
      };
    }
  },

  login: async (email: string, password: string) => {
    console.log('🌐 API: Starting login request for:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('🌐 API: Login response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🌐 API: Login error:', errorText);
      throw new Error(errorText || 'Invalid email or password');
    }

    const data = await response.json();
    console.log('🌐 API: Login success response:', data);
    
    if (!data.token) {
      console.error('🌐 API: No token in login response');
      throw new Error('No authentication token received');
    }

    return data;
  },
};

export const userAPI = {
  getProfile: async (token: string) => {
    console.log('🌐 API: Fetching user profile with token');
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🌐 API: Profile response status:', response.status);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const userData = await response.json();
    console.log('🌐 API: Profile data received:', userData);
    return userData;
  },
};

export const tokenService = {
  getToken: (): string | null => localStorage.getItem('token'),
  setToken: (token: string): void => localStorage.setItem('token', token),
  removeToken: (): void => localStorage.removeItem('token'),
};