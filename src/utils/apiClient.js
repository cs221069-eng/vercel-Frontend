import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://vercel-backend-w7h5.vercel.app",
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;



