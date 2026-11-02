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

        if (savedToken || savedRole) {
          if (savedToken) {
            setToken(savedToken);
            setAuthCookie(savedToken); // Keep cookie in sync
          }
          try {
            const res = await apiClient.get("/auth/profile");
            setUser(res.data);
          } catch (e: any) {
            // Decode non-expired JWT claims so rate limits (429) or Privy fallback tokens never log the user out
            let restoredFromToken: AuthUser | null = null;
            if (savedToken) {
              try {
                const parts = savedToken.split(".");
                if (parts.length === 3) {
                  const decoded = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
                  const now = Math.floor(Date.now() / 1000);
                  if (decoded?.sub && (!decoded.exp || decoded.exp > now)) {
                    const isPrivy = String(decoded.sub).startsWith("did:privy:");
                    restoredFromToken = {
                      id: isPrivy ? String(decoded.sub).replace("did:privy:", "usr_") : decoded.sub,
                      email: decoded.email || `${String(decoded.sub).replace("did:privy:", "")}@privy.user`,
                      name: decoded.name || (decoded.walletAddress ? `${decoded.walletAddress.slice(0, 6)}...${decoded.walletAddress.slice(-4)}` : "Monad Developer"),
                      role: (decoded.role || savedRole || "CLIENT").toUpperCase(),
                      walletAddress: decoded.walletAddress,
                      privyDid: isPrivy ? decoded.sub : decoded.privyDid,
                    };
                  }
                }
              } catch {}
            }

            if (restoredFromToken) {
              setUser(restoredFromToken);
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
        let apiUser: AuthUser;
        let accessToken: string;

        try {
          const res = await apiClient.post("/auth/privy", {
            privyToken,
            walletAddress,
            email,
          });
          apiUser = res.data.user;
          accessToken = res.data.accessToken;
        } catch (err: any) {
          // Resilient fallback if backend is rate-limited (429) or redeploying (5xx) after Privy has already authenticated the user
          let sub = "did:privy:verified";
          try {
            const parts = privyToken.split(".");
            if (parts.length === 3) {
              const decoded = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
              if (decoded?.sub) sub = decoded.sub;
            }
          } catch {}

          const cleanWallet = walletAddress?.toLowerCase();
          const fallbackName = cleanWallet
            ? `${cleanWallet.slice(0, 6)}...${cleanWallet.slice(-4)}`
            : email?.split("@")[0] || "Monad Developer";

          apiUser = {
            id: sub.replace("did:privy:", "usr_"),
            email: email || `${sub.replace("did:privy:", "")}@privy.user`,
            name: fallbackName,
            role: "CLIENT",
            walletAddress: cleanWallet,
            privyDid: sub,
          };
          accessToken = privyToken;
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
