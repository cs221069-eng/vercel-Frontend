import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://vercel-backend-w7h5.vercel.app";

export function storeAuthSession(payload = {}) {
  const { token, accountId, role, email, name } = payload;

  if (token) localStorage.setItem("authToken", token);
  if (accountId) localStorage.setItem("userId", accountId);
  if (role) localStorage.setItem("role", role);
  if (email) localStorage.setItem("email", email);
  if (name) localStorage.setItem("name", name);
}

export async function logoutUser() {
  const token = localStorage.getItem("authToken");
  const config = {
    withCredentials: true,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };

  try {
    await axios.post(`${API_BASE_URL}/api/auth/logout/9165`, {}, config);
  } catch {
    // Clear local session even if network request fails.
  } finally {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
  }
}

export function getAuthConfig(extraConfig = {}) {
  const token = localStorage.getItem("authToken");
  const baseConfig = {
    withCredentials: true,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };

  return {
    ...baseConfig,
    ...extraConfig,
    headers: {
      ...baseConfig.headers,
      ...(extraConfig.headers || {}),
    },
  };
}

function decodeJwtPayload(token) {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getAuthToken() {
  return localStorage.getItem("authToken") || "";
}

export function isTokenValid(token) {
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  // JWT exp is in seconds.
  if (!payload.exp || typeof payload.exp !== "number") return false;
  return Date.now() < payload.exp * 1000;
}

export function isAuthenticated() {
  return isTokenValid(getAuthToken());
}

export function clearLocalSession() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("name");
}

export function getRoleHomePath(role) {
  if (role === "admin") return "/admin-dashboard-1";
  if (role === "teacher") return "/teacher-dashboard-1";
  return "/student-dashboard-1";
}
