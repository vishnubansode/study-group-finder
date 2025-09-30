import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

// Helper to get current user ID from stored user data
const getCurrentUserId = () => {
  const userData = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.id;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
};

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  // Add user ID to request headers for authenticated requests
  const userId = getCurrentUserId();
  if (userId) {
    req.headers["X-User-ID"] = userId;
  }
  return req;
});

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

// Profile-related endpoints
export const getMe = () => API.get("/auth/me");
export const updateProfile = (data) => API.put("/users/me", data);
export const deleteAccount = () => API.delete("/users/me");
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return API.post("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Example: Group-related endpoints with user ID
export const createGroup = (data) => {
  const userId = getCurrentUserId();
  return API.post("/groups", { ...data, createdBy: userId });
};

export const getUserGroups = () => {
  const userId = getCurrentUserId();
  return API.get(`/users/${userId}/groups`);
};

export default API;