"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function GitHubCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = params.get("token");
    const role = params.get("role");
    const error = params.get("error");

    if (error) {
      setErrorMsg(decodeURIComponent(error));
      setStatus("error");
      return;
    }

    if (!token) {
      setErrorMsg("No authentication token received from GitHub.");
      setStatus("error");
      return;
    }

    // Store the JWT and redirect to the right dashboard
    try {
      loginWithToken(token, role ?? "CLIENT");
      const dest =
        role === "AUDITOR"
          ? "/auditor"
          : role === "ADMIN"
          ? "/auditor"
          : "/portal";
      router.replace(dest);
    } catch {
      setErrorMsg("Failed to complete GitHub login. Please try again.");
      setStatus("error");
    }
  }, [params, router, loginWithToken]);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base p-6">
        <div className="max-w-md w-full p-8 rounded-[4px] bg-bg-panel border border-signal-critical/40 space-y-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-signal-critical" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="font-display font-semibold text-text-primary">GitHub Login Failed</h1>
          </div>
          <p className="font-mono text-xs text-signal-critical">{errorMsg}</p>
          <button
            onClick={() => router.replace("/auth/login")}
            className="w-full py-2.5 px-4 rounded-[4px] bg-accent-scan text-bg-base font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <svg className="animate-spin h-8 w-8 text-accent-scan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="font-mono text-xs text-text-muted">Completing GitHub authentication...</p>
      </div>
    </div>
  );
}
