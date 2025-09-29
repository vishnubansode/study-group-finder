import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});


API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
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

export default API;