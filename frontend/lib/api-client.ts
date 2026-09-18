import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Automatically inject JWT Bearer Token into requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("zyron_jwt_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 Unauthorized session expiration & format API error responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const isAuthRoute = window.location.pathname.startsWith("/auth");
      const isAuthAttempt =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register") ||
        error.config?.url?.includes("/auth/reset-password");

      // Only auto-logout if session expired during normal app usage, not during bad credential submit
      if (!isAuthRoute && !isAuthAttempt) {
        localStorage.removeItem("zyron_jwt_token");
        localStorage.removeItem("zyron_auth_role");
        document.cookie = "zyron_jwt_token=; path=/; max-age=0; SameSite=Lax";
        const redirect = encodeURIComponent(window.location.pathname);
        window.location.href = `/auth/login?redirect=${redirect}`;
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred connecting to Zyron API";
    return Promise.reject(new Error(Array.isArray(message) ? message.join(", ") : message));
  }
);
