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
import { Input } from "@/components/ui/input";
import { ExpandingButton } from "@/components/ui/expanding-button";
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
      toast.success("Password recovery link sent! Check your inbox.");
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
      }, 2000);
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
      <div className="relative rounded-2xl bg-bg-panel/95 backdrop-blur-xl border border-border-hairline p-7 sm:p-9 shadow-xl space-y-6 overflow-hidden">
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-accent-scan/25 to-transparent pointer-events-none" />

        <div className="space-y-1.5 text-center">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
            Set new password
          </h1>
          <p className="text-sm text-text-muted">
            Create a secure new password for your account.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-signal-critical/10 border border-signal-critical/30 text-signal-critical text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">{errorMsg}</p>
              <Link
                href="/auth/reset-password"
                className="text-accent-scan hover:underline text-xs block"
              >
                Request a new link &rarr;
              </Link>
            </div>
          </div>
        )}

        {resetSuccess ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-bg-void border border-signal-resolved/40 space-y-2">
              <div className="flex items-center justify-center gap-2 font-display text-sm font-semibold text-signal-resolved">
                <CheckCircle2 className="h-4 w-4 text-signal-resolved" />
                <span>Password updated</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Your password has been changed. You can now sign in with your new credentials.
              </p>
            </div>

            <Link href="/auth/login" className="block w-full">
              <ExpandingButton
                type="button"
                variant="light"
                size="md"
                rounded="xl"
                className="w-full cursor-pointer"
                icon={<ArrowRight className="h-4 w-4 stroke-[2.5]" />}
              >
                Proceed to Sign In
              </ExpandingButton>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted">New password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                prefix={<Lock className="h-4 w-4 text-text-muted" />}
                className="rounded-xl h-11 border-border-hairline focus-within:border-accent-scan"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted">Confirm new password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                prefix={<Lock className="h-4 w-4 text-text-muted" />}
                className="rounded-xl h-11 border-border-hairline focus-within:border-accent-scan"
                required
              />
            </div>

            <div className="pt-1">
              <ExpandingButton
                type="submit"
                variant="light"
                size="md"
                rounded="xl"
                disabled={isResetting}
                className="w-full cursor-pointer"
                icon={<KeyRound className="h-4 w-4 stroke-[2.5]" />}
              >
                {isResetting ? "Updating..." : "Update Password"}
              </ExpandingButton>
            </div>

            <div className="pt-2 text-center text-xs text-text-muted">
              <Link href="/auth/login" className="text-accent-scan hover:underline inline-flex items-center gap-1 font-medium">
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
    <div className="relative rounded-2xl bg-bg-panel/95 backdrop-blur-xl border border-border-hairline p-7 sm:p-9 shadow-xl space-y-6 overflow-hidden">
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-accent-scan/25 to-transparent pointer-events-none" />

      <div className="space-y-1.5 text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
          Reset password
        </h1>
        <p className="text-sm text-text-muted">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-signal-critical/10 border border-signal-critical/30 text-signal-critical text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {requestSent ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-bg-void border border-border-hairline space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 font-display text-sm font-semibold text-signal-resolved">
              <CheckCircle2 className="h-4 w-4 text-signal-resolved" />
              <span>Recovery link sent</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              If an account exists for <strong className="text-text-primary">{email}</strong>, a password reset link has been dispatched to your inbox.
            </p>
            <p className="text-[11px] text-text-muted/80">
              The link expires in 1 hour and can only be used once.
            </p>
          </div>

          <div className="space-y-2">
            <Link href="/auth/login" className="block w-full">
              <ExpandingButton
                type="button"
                variant="dark"
                size="md"
                rounded="xl"
                className="w-full cursor-pointer"
                icon={<ArrowLeft className="h-4 w-4 stroke-[2.5]" />}
              >
                Return to Sign In
              </ExpandingButton>
            </Link>

            <button
              type="button"
              onClick={() => setRequestSent(false)}
              className="w-full text-center text-xs text-accent-scan hover:underline pt-1 cursor-pointer"
            >
              Didn&apos;t receive the email? Resend link
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRequestLink} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Email address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              prefix={<Mail className="h-4 w-4 text-text-muted" />}
              className="rounded-xl h-11 border-border-hairline focus-within:border-accent-scan"
              required
            />
          </div>

          <div className="pt-1">
            <ExpandingButton
              type="submit"
              variant="light"
              size="md"
              rounded="xl"
              disabled={isRequesting}
              className="w-full cursor-pointer"
              icon={<ArrowRight className="h-4 w-4 stroke-[2.5]" />}
            >
              {isRequesting ? "Sending link..." : "Send Reset Link"}
            </ExpandingButton>
          </div>

          <div className="pt-2 text-center text-xs text-text-muted">
            <Link href="/auth/login" className="text-accent-scan hover:underline inline-flex items-center gap-1 font-medium">
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
        <div className="p-8 rounded-2xl bg-bg-panel border border-border-hairline text-center text-xs text-text-muted">
          Loading recovery options...
        </div>
      }
    >
      <ResetPasswordContent />
    </React.Suspense>
  );
}
