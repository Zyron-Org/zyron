"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/eyebrow";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  // Mode 1: Forgot Password Form State (No token)
  const [email, setEmail] = React.useState("");
  const [isRequesting, setIsRequesting] = React.useState(false);
  const [requestSent, setRequestSent] = React.useState(false);

  // Mode 2: Reset Password Form State (With token)
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isResetting, setIsResetting] = React.useState(false);
  const [resetSuccess, setResetSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Handle Step 1: Request Password Reset Link
  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequesting(true);
    setErrorMsg(null);

    try {
      await apiClient.post("/auth/forgot-password", { email });
      setRequestSent(true);
      toast.success("Password recovery link dispatched! Check your inbox.");
    } catch (err: any) {
      const msg = err?.message || "Failed to request password reset link";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsRequesting(false);
    }
  };

  // Handle Step 2: Submit New Password with Token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify and re-type.");
      return;
    }

    setIsResetting(true);

    try {
      await apiClient.post("/auth/reset-password", {
        token,
        newPassword,
      });
      setResetSuccess(true);
      toast.success("Password successfully updated! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2500);
    } catch (err: any) {
      const msg = err?.message || "Invalid or expired recovery token. Please request a new link.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsResetting(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER MODE A: RESET PASSWORD (TOKEN PRESENT IN URL)
  // -------------------------------------------------------------
  if (token) {
    return (
      <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
        <div className="space-y-1.5 border-b border-border-hairline pb-4">
          <Eyebrow size="xs" variant="scan" prefix="// RECOVERY_PROTOCOL · ">
            AUTHORIZE_NEW_PASSWORD
          </Eyebrow>
          <h1 className="font-display text-xl font-semibold tracking-tight text-text-primary">
            Set New Account Password
          </h1>
          <p className="text-xs text-text-muted font-mono">
            Create a secure new password for your Zyron protocol workspace.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-[4px] bg-signal-critical/10 border border-signal-critical/30 text-signal-critical font-mono text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div>{errorMsg}</div>
              <Link
                href="/auth/reset-password"
                className="text-accent-scan hover:underline text-[11px] block"
              >
                Request a new recovery link →
              </Link>
            </div>
          </div>
        )}

        {resetSuccess ? (
          <div className="space-y-4">
            <div className="p-4 rounded-[4px] bg-bg-void border border-signal-resolved/40 space-y-2">
              <div className="flex items-center gap-2 font-display text-sm font-semibold text-signal-resolved">
                <CheckCircle2 className="h-4 w-4 text-signal-resolved" />
                <span>Password Successfully Updated</span>
              </div>
              <p className="text-xs font-mono text-text-muted leading-relaxed">
                Your credentials have been updated and all active sessions refreshed. You can now sign in with your new password.
              </p>
            </div>

            <Link href="/auth/login">
              <Button variant="primary" className="w-full" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Proceed to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-text-muted">NEW PASSWORD</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                prefix={<Lock className="h-3.5 w-3.5 text-text-muted" />}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-xs text-text-muted">CONFIRM NEW PASSWORD</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                prefix={<Lock className="h-3.5 w-3.5 text-text-muted" />}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="md"
              isLoading={isResetting}
              rightIcon={<KeyRound className="h-4 w-4" />}
            >
              Update Password
            </Button>

            <div className="pt-2 text-center font-mono text-xs text-text-muted">
              <Link href="/auth/login" className="text-accent-scan hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER MODE B: FORGOT PASSWORD (NO TOKEN PRESENT)
  // -------------------------------------------------------------
  return (
    <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
      <div className="space-y-1.5 border-b border-border-hairline pb-4">
        <Eyebrow size="xs" variant="scan" prefix="// RECOVERY_PROTOCOL · ">
          CREDENTIAL_RESET
        </Eyebrow>
        <h1 className="font-display text-xl font-semibold tracking-tight text-text-primary">
          Reset Portal Access Password
        </h1>
        <p className="text-xs text-text-muted font-mono">
          Enter your registered work email to receive an authorized password recovery link.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-[4px] bg-signal-critical/10 border border-signal-critical/30 text-signal-critical font-mono text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {requestSent ? (
        <div className="space-y-4">
          <div className="p-4 rounded-[4px] bg-bg-void border border-border-hairline space-y-2">
            <div className="flex items-center gap-2 font-display text-sm font-semibold text-signal-resolved">
              <CheckCircle2 className="h-4 w-4 text-signal-resolved" />
              <span>Recovery Link Dispatched</span>
            </div>
            <p className="text-xs font-mono text-text-muted leading-relaxed">
              If an account exists for <strong className="text-text-primary">{email}</strong>, a cryptographically signed password reset link has been dispatched to your inbox.
            </p>
            <p className="text-[11px] font-mono text-text-muted pt-1">
              The link will expire in <strong>1 hour</strong> and can only be used once.
            </p>
          </div>

          <div className="space-y-2">
            <Link href="/auth/login">
              <Button variant="outline" className="w-full" size="md" leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}>
                Return to Sign In
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setRequestSent(false)}
              className="w-full text-center font-mono text-[11px] text-accent-scan hover:underline pt-1 block cursor-pointer"
            >
              Didn't receive the email? Resend link
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRequestLink} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-xs text-text-muted">WORK EMAIL ADDRESS</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="security@protocol.io"
              prefix={<Mail className="h-3.5 w-3.5 text-text-muted" />}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            size="md"
            isLoading={isRequesting}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Send Recovery Link
          </Button>

          <div className="pt-2 text-center font-mono text-xs text-text-muted">
            <Link href="/auth/login" className="text-accent-scan hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline text-center font-mono text-xs text-text-muted">
          Loading recovery protocol...
        </div>
      }
    >
      <ResetPasswordContent />
    </React.Suspense>
  );
}
