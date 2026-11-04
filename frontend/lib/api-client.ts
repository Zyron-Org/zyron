import axios from "axios";

const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1").replace(/\/+$/, "");
export const API_BASE_URL = rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 45000,
});

const CACHED_AUDITS_KEY = "zyron_cached_audits";

export function cacheSubmittedAudit(audit: any): void {
  if (typeof window === "undefined" || !audit?.id) return;
  try {
    const cleanId = String(audit.id).replace(/^#/, "");
    const raw = localStorage.getItem(CACHED_AUDITS_KEY);
    const map: Record<string, any> = raw ? JSON.parse(raw) : {};
    map[cleanId] = {
      ...map[cleanId],
      ...audit,
      id: cleanId,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(CACHED_AUDITS_KEY, JSON.stringify(map));
  } catch {}
}

export function getCachedAudit(ticketId: string): any | null {
  if (typeof window === "undefined" || !ticketId) return null;
  try {
    const cleanId = String(ticketId).replace(/^#/, "");
    const raw = localStorage.getItem(CACHED_AUDITS_KEY);
    if (!raw) return null;
    const map: Record<string, any> = JSON.parse(raw);
    return map[cleanId] || null;
  } catch {
    return null;
  }
}

export function getAllCachedAudits(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHED_AUDITS_KEY);
    if (!raw) return [];
    const map: Record<string, any> = JSON.parse(raw);
    return Object.values(map);
  } catch {
    return [];
  }
}

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
