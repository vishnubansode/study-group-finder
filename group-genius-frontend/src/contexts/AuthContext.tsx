import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI, tokenService } from '@/services/api';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string | null;
  avatar?: string | null;  // Backend avatar path
  secondarySchool?: string;
  graduationYear?: string;
  university?: string;
  major?: string;
  currentYear?: string;
  bio?: string; // ADD THIS FIELD
  selectedCourses?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: any, profileImage?: File) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (userData: User) => void; // ADD THIS FUNCTION
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = tokenService.getToken();
    if (token) {
      try {
        const userData = await userAPI.getProfile(token);
        setUser(userData);
        // Store user data in localStorage for API access
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        tokenService.removeToken();
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  };

  // ADD THIS FUNCTION - Update user in context
  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const register = async (userData: any, profileImage?: File) => {
    setIsLoading(true);
    try {
      console.log('🔵 AuthContext: Calling authAPI.register');
      // Register the user - backend now returns proper JSON
      await authAPI.register(userData, profileImage);
      console.log('✅ AuthContext: Register API call completed');
      
      // Registration successful - auto-login will be handled by the Register component
      return;
    } catch (error) {
      console.error('❌ AuthContext: Register failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      console.log('🔵 AuthContext: Calling authAPI.login with:', email);
      const response = await authAPI.login(email, password);
      console.log('✅ AuthContext: Login API response received:', response);
      
      console.log('🔵 AuthContext: Setting token');
      tokenService.setToken(response.token);
      
      console.log('🔵 AuthContext: Fetching user profile');
      const userData = await userAPI.getProfile(response.token);
      console.log('✅ AuthContext: User profile fetched:', userData);
      
      console.log('🔵 AuthContext: Setting user state');
      setUser(userData);
      // Store user data in localStorage for API access
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ AuthContext: User state updated');
      
      return userData;
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    tokenService.removeToken();
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isLoading,
      updateUser // ADD THIS TO THE PROVIDER
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};