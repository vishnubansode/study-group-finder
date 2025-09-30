/* eslint-disable react-refresh/only-export-components */
// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser, getMe } from "../services/api"; // named imports

// 1. Export the Context object
export const AuthContext = createContext();

// 2. Export the Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await getMe();
      setUser(res.data);
    } catch {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials, { remember = true } = {}) => {
    const res = await loginUser(credentials);
    const { token, user: userFromResponse } = res.data;
    if (remember) localStorage.setItem("token", token); else sessionStorage.setItem("token", token);
    if (userFromResponse) setUser(userFromResponse); else await fetchUserProfile();
    return res;
  };

  const register = async (payload) => {
    const res = await registerUser(payload);
    const { token, user: userFromResponse } = res.data || {};
    if (token) {
      localStorage.setItem("token", token);
      if (userFromResponse) setUser(userFromResponse); else await fetchUserProfile();
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  // 3. Provide the state and functions to consumers
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}