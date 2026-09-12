"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2, ShieldAlert } from "lucide-react";

interface RequireAuthProps {
  children: React.ReactNode;
  /** Roles allowed to access this section. Leave empty to allow any authenticated user. */
  allowedRoles?: string[];
}

/**
 * Client-side auth guard used inside protected layouts.
 *
 * The middleware.ts handles the edge redirect (before rendering) so in most
 * cases the user never reaches this component unauthenticated. This component
 * acts as a secondary defence — it handles the hydration gap where localStorage
 * is read async — and also enforces role-based access control within an
 * already-authenticated session.
 */
export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = (user.role || "").toUpperCase();
      const allowed = allowedRoles.map((r) => r.toUpperCase());
      if (!allowed.includes(userRole)) {
        // Wrong role — redirect to their correct dashboard
        if (userRole === "AUDITOR") router.replace("/auditor/queue");
        else if (userRole === "ADMIN") router.replace("/admin/users");
        else router.replace("/portal");
      }
    }
  }, [user, loading, router, pathname, allowedRoles]);

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-void flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 rounded-full bg-bg-panel border border-border-hairline flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-accent-scan animate-spin" />
          </div>
          <div className="space-y-1">
            <div className="font-mono text-xs font-semibold text-accent-scan">
              VERIFYING SESSION…
            </div>
            <div className="font-mono text-[10px] text-text-muted">
              Authenticating protocol credentials
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is missing or wrong role, show nothing while redirecting
  if (!user) return null;

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || "").toUpperCase();
    const allowed = allowedRoles.map((r) => r.toUpperCase());
    if (!allowed.includes(userRole)) {
      return (
        <div className="min-h-screen bg-bg-void flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <ShieldAlert className="h-8 w-8 text-signal-critical" />
            <div className="font-mono text-xs text-signal-critical font-semibold">
              ACCESS DENIED
            </div>
            <div className="font-mono text-[10px] text-text-muted">
              Redirecting to authorized workspace…
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
