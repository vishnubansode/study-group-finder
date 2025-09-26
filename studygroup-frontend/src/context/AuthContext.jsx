/* eslint-disable react-refresh/only-export-components */
// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../services/api"; // named imports

// 1. Export the Context object
export const AuthContext = createContext();

// 2. Export the Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      // NOTE: For a real app, move this URL to an environment variable (.env)
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUser(data);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    // Assuming loginUser returns a response object with a data property
    const res = await loginUser(credentials); 
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    setUser(user);
    return res;
  };

  const register = async (payload) => {
    const res = await registerUser(payload);
    return res;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // 3. Provide the state and functions to consumers
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}