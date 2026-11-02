import axios from "axios";

const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1").replace(/\/+$/, "");
export const API_BASE_URL = rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`;

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
        error.config?.url?.includes("/auth/privy") ||
        error.config?.url?.includes("/auth/profile") ||
        error.config?.url?.includes("/passport/me") ||
        error.config?.url?.includes("/auth/reset-password");

      // Never auto-logout if the client holds a locally synthesized Privy session
      // (issued when the remote backend's SQLite schema is out of sync).
      let isLocalSynthesizedSession = false;
      try {
        const currentToken = localStorage.getItem("zyron_jwt_token") || "";
        isLocalSynthesizedSession = currentToken.endsWith(".zyron-local-session");
      } catch {}

      // Only auto-logout if session expired during normal app usage, not during bad credential submit or Privy fallback
      if (!isAuthRoute && !isAuthAttempt && !isLocalSynthesizedSession) {
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
    const wrapped: any = new Error(Array.isArray(message) ? message.join(", ") : message);
    wrapped.status = error.response?.status;
    wrapped.response = error.response;
    wrapped.retryAfter =
      error.response?.headers?.["retry-after"] || error.response?.headers?.["x-ratelimit-reset"];
    return Promise.reject(wrapped);
  }
);
