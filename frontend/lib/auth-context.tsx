"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "./api-client";

/** Sync JWT to a cookie so Next.js middleware can read it at the edge */
function setAuthCookie(token: string) {
  try {
    // Expires in 7 days; SameSite=Lax is safe for same-origin redirects
    document.cookie = `zyron_jwt_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  } catch {}
}

function clearAuthCookie() {
  try {
    document.cookie = "zyron_jwt_token=; path=/; max-age=0";
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
}

export const SAMPLE_ACCOUNTS: Record<string, AuthUser> = {
  client: {
    id: "usr_client_01",
    email: "security@auraprotocol.io",
    name: "Aura Core Protocol",
    role: "CLIENT",
    organization: { name: "Aura Finance DAO Ltd." },
    walletAddress: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
  },
  auditor: {
    id: "usr_auditor_01",
    email: "k4@zyron.labs",
    name: "0xAuditor_K4",
    role: "AUDITOR",
    auditorHandle: "0xAuditor_K4",
    specialization: "EVM Opcodes · Reentrancy · Invariant Proofs",
  },
  admin: {
    id: "usr_admin_01",
    email: "admin@zyron.labs",
    name: "Platform Security Lead",
    role: "ADMIN",
    organization: { name: "Zyron Security Labs HQ" },
  },
};

interface AuthContextType {
  user: AuthUser | null;
  role: string | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (dto: { email: string; password: string; name: string; organizationName?: string }) => Promise<void>;
  loginAs: (roleStr: string) => void;
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
          } catch (e) {
            // Restore session from saved persona role if API profile endpoint fails or is mock
            const roleKey = (savedRole || "client").toLowerCase();
            const restoredUser = SAMPLE_ACCOUNTS[roleKey] || SAMPLE_ACCOUNTS.client;
            setUser(restoredUser);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        const savedRole = localStorage.getItem("zyron_auth_role") || "client";
        setUser(SAMPLE_ACCOUNTS[savedRole.toLowerCase()] || SAMPLE_ACCOUNTS.client);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const { user: apiUser, accessToken } = res.data;
      setUser(apiUser);
      setToken(accessToken);

      localStorage.setItem("zyron_jwt_token", accessToken);
      localStorage.setItem("zyron_auth_role", apiUser.role.toLowerCase());
      setAuthCookie(accessToken); // Sync to cookie for edge middleware

      const r = apiUser.role.toUpperCase();
      const destination = redirectAfterLogin ||
        (r === "AUDITOR" ? "/auditor/queue" : r === "ADMIN" ? "/admin/users" : "/portal");
      router.push(destination);
    } finally {
      setLoading(false);
    }
  };

  const register = async (dto: { email: string; password: string; name: string; organizationName?: string }) => {
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/register", dto);
      const { user: apiUser, accessToken } = res.data;
      setUser(apiUser);
      setToken(accessToken);

      localStorage.setItem("zyron_jwt_token", accessToken);
      localStorage.setItem("zyron_auth_role", apiUser.role.toLowerCase());
      setAuthCookie(accessToken); // Sync to cookie for edge middleware

      router.push("/portal");
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await apiClient.get("/auth/profile");
      setUser(res.data);
    } catch (e) {
      // ignore
    }
  };

  const loginAs = async (roleStr: string) => {
    const key = roleStr.toLowerCase();
    let email = "security@auraprotocol.io";
    let password = "SecurePassword123!";

    if (key === "auditor") {
      email = "k4@zyron.labs";
      password = "AuditorPass123!";
    } else if (key === "admin") {
      email = "admin@zyron.labs";
      password = "AdminPass123!";
    }

    try {
      await login(email, password);
    } catch (e) {
      // Fallback to sample persona state if backend is unreachable
      const selected = SAMPLE_ACCOUNTS[key] || SAMPLE_ACCOUNTS.client;
      setUser(selected);
      localStorage.setItem("zyron_auth_role", key);
      const dest = key === "auditor" ? "/auditor/queue" : key === "admin" ? "/admin/users" : "/portal";
      router.push(dest);
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
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ? user.role.toLowerCase() : null,
        token,
        loading,
        login,
        register,
        loginAs,
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
