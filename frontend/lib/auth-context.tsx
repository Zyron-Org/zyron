"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "./api-client";
import { startTopLoader } from "@/components/top-loader";

/** Sync JWT to a cookie so Next.js middleware can read it at the edge */
function setAuthCookie(token: string) {
  try {
    // Expires in 7 days; SameSite=Lax is safe for same-origin redirects
    document.cookie = `zyron_jwt_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  } catch {}
}

function clearAuthCookie() {
  try {
    document.cookie = "zyron_jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax";
    document.cookie = "zyron_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax";
  } catch {}
}

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

/** A raw Privy access token (sub = did:privy:...) is not a Zyron session JWT (sub = Zyron user id). */
function isRawPrivyToken(token: string): boolean {
  const payload = decodeJwtPayload(token);
  return Boolean(payload?.sub && String(payload.sub).startsWith("did:privy:"));
}

/** Rebuild a minimal user from a still-valid Zyron session JWT (used only when the API is transiently unavailable). */
function decodeZyronJwtUser(token: string, savedRole: string | null): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.sub || String(payload.sub).startsWith("did:privy:")) return null;
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp <= now) return null;
  const wallet: string | undefined = payload.walletAddress || undefined;
  return {
    id: payload.sub,
    email: payload.email || "",
    name: wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : payload.email || "Zyron User",
    role: String(payload.role || savedRole || "CLIENT").toUpperCase(),
    walletAddress: wallet,
    privyDid: payload.privyDid || undefined,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type UserRole = "CLIENT" | "AUDITOR" | "ADMIN" | "client" | "auditor" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId?: string;
  organization?: any;
  walletAddress?: string;
  auditorHandle?: string;
  specialization?: string;
  githubLogin?: string;
  githubAvatarUrl?: string;
  githubAccessToken?: string;
  privyDid?: string;
}

export function getDashboardForRole(role?: string | null): string {
  const r = (role || "").toUpperCase();
  if (r === "AUDITOR") return "/auditor/queue";
  if (r === "ADMIN") return "/admin/users";
  return "/portal";
}

export function isRedirectValidForRole(
  redirectUrl: string | null | undefined,
  role: string | null | undefined
): boolean {
  if (!redirectUrl || !role) return false;
  try {
    const decoded = decodeURIComponent(redirectUrl);
    if (decoded.startsWith("/auth") || decoded === "/") return false;

    const r = role.toUpperCase();
    if (r === "ADMIN") {
      return decoded.startsWith("/admin");
    }
    if (r === "AUDITOR") {
      return decoded.startsWith("/auditor");
    }
    if (r === "CLIENT") {
      return decoded.startsWith("/portal");
    }
    return false;
  } catch {
    return false;
  }
}

interface AuthContextType {
  user: AuthUser | null;
  role: string | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  loginWithSiwe: (message: string, signature: string) => Promise<AuthUser>;
  loginWithPrivy: (privyToken: string, walletAddress?: string, email?: string) => Promise<AuthUser>;
  loginWithToken: (token: string, role: string) => void;
  register: (dto: { email: string; password: string; name: string; organizationName?: string }) => Promise<any>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  /** Destination to return to after login (set by middleware redirect) */
  const redirectAfterLogin = searchParams?.get("redirect") || null;

  // Load from localStorage or API profile on mount
  React.useEffect(() => {
    async function initAuth() {
      try {
        const savedToken = localStorage.getItem("zyron_jwt_token");
        const savedRole = localStorage.getItem("zyron_auth_role");

        // Purge stale raw Privy tokens stored by an earlier client build — they are NOT Zyron session JWTs
        // and cause every protected API call to 401, bouncing the user back to /auth/login in a loop.
        if (savedToken && isRawPrivyToken(savedToken)) {
          clearAuthCookie();
          localStorage.removeItem("zyron_jwt_token");
          localStorage.removeItem("zyron_auth_role");
          setUser(null);
          return;
        }

        if (savedToken || savedRole) {
          if (savedToken) {
            setToken(savedToken);
            setAuthCookie(savedToken); // Keep cookie in sync
          }
          try {
            const res = await apiClient.get("/auth/profile");
            setUser(res.data);
          } catch (e: any) {
            const status = e?.status;
            const isTransient = !status || status === 429 || status >= 500;
            const restored = isTransient && savedToken ? decodeZyronJwtUser(savedToken, savedRole) : null;

            if (restored) {
              // Backend temporarily unavailable / rate-limited: keep the valid Zyron session
              setUser(restored);
            } else {
              setUser(null);
              clearAuthCookie();
              localStorage.removeItem("zyron_jwt_token");
              localStorage.removeItem("zyron_auth_role");
            }
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const { user: apiUser, accessToken } = res.data;
      setUser(apiUser);
      setToken(accessToken);

      localStorage.setItem("zyron_jwt_token", accessToken);
      localStorage.setItem("zyron_auth_role", apiUser.role.toLowerCase());
      setAuthCookie(accessToken); // Sync to cookie for edge middleware

      const defaultDest = getDashboardForRole(apiUser.role);
      const destination =
        isRedirectValidForRole(redirectAfterLogin, apiUser.role) && redirectAfterLogin
          ? redirectAfterLogin
          : defaultDest;

      startTopLoader();
      router.push(destination);
      router.replace(destination);
      return apiUser;
    } finally {
      setLoading(false);
    }
  };

  const loginWithSiwe = async (message: string, signature: string): Promise<AuthUser> => {
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/siwe/verify", { message, signature });
      const { user: apiUser, accessToken } = res.data;
      setUser(apiUser);
      setToken(accessToken);

      localStorage.setItem("zyron_jwt_token", accessToken);
      localStorage.setItem("zyron_auth_role", apiUser.role.toLowerCase());
      setAuthCookie(accessToken);

      const defaultDest = getDashboardForRole(apiUser.role);
      const dest =
        isRedirectValidForRole(redirectAfterLogin, apiUser.role) && redirectAfterLogin
          ? redirectAfterLogin
          : defaultDest;
      startTopLoader();
      router.push(dest);
      router.replace(dest);
      return apiUser;
    } finally {
      setLoading(false);
    }
  };

  const loginWithPrivy = React.useCallback(
    async (
      privyToken: string,
      walletAddress?: string,
      email?: string
    ): Promise<AuthUser> => {
      setLoading(true);
      try {
        let apiUser: AuthUser | undefined;
        let accessToken: string | undefined;
        let lastErr: any;

        // Exchange the Privy token for a real Zyron session JWT. Retry briefly on 429/5xx,
        // but NEVER store the raw Privy token as a Zyron session (that causes a redirect loop).
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const res = await apiClient.post("/auth/privy", {
              privyToken,
              walletAddress,
              email,
            });
            apiUser = res.data.user;
            accessToken = res.data.accessToken;
            break;
          } catch (err: any) {
            lastErr = err;
            const status = err?.status;
            const transient = !status || status === 429 || status >= 500;
            if (!transient || attempt === 2) break;
            const waitSec = Math.min(Number(err?.retryAfter) || 2 * (attempt + 1), 10);
            await sleep(waitSec * 1000);
          }
        }

        if (!apiUser || !accessToken) {
          throw lastErr || new Error("Could not create Zyron session from Privy login");
        }

        setUser(apiUser);
        setToken(accessToken);

        localStorage.setItem("zyron_jwt_token", accessToken);
        localStorage.setItem("zyron_auth_role", (apiUser.role || "client").toLowerCase());
        setAuthCookie(accessToken);

        const defaultDest = "/portal/passport";
        const dest =
          isRedirectValidForRole(redirectAfterLogin, apiUser.role) && redirectAfterLogin
            ? redirectAfterLogin
            : defaultDest;

        startTopLoader();
        router.push(dest);
        router.replace(dest);
        return apiUser;
      } finally {
        setLoading(false);
      }
    },
    [redirectAfterLogin, router]
  );

  const register = async (dto: { email: string; password: string; name: string; organizationName?: string }): Promise<any> => {
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/register", dto);
      return res.data;
    } finally {
      setLoading(false);
    }
  };


  /** Used by GitHub OAuth callback to store token received via URL param */
  const loginWithToken = (accessToken: string, role: string) => {
    localStorage.setItem("zyron_jwt_token", accessToken);
    localStorage.setItem("zyron_auth_role", role.toLowerCase());
    setToken(accessToken);
    setAuthCookie(accessToken);
    // Fire-and-forget profile fetch to populate the user object
    apiClient.get("/auth/profile").then((res) => setUser(res.data)).catch(() => {});
  };

  const refreshProfile = async () => {
    try {
      const res = await apiClient.get("/auth/profile");
      setUser(res.data);
    } catch (e) {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem("zyron_jwt_token");
      localStorage.removeItem("zyron_auth_role");
      clearAuthCookie(); // Clear edge middleware cookie
    } catch (e) {}
    if (typeof window !== "undefined") {
      startTopLoader();
      window.location.href = "/auth/login";
    } else {
      router.replace("/auth/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ? user.role.toLowerCase() : null,
        token,
        loading,
        login,
        loginWithSiwe,
        loginWithPrivy,
        loginWithToken,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
