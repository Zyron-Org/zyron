"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const status = searchParams?.get("status");
  const initialEmail = searchParams?.get("email") || "";

  // Mode 1: Auto-verification with token
  const [isVerifying, setIsVerifying] = React.useState(!!token);
  const [verifySuccess, setVerifySuccess] = React.useState(false);
  const [verifyError, setVerifyError] = React.useState<string | null>(null);

  // Mode 2 & 3: Resend verification email
  const [email, setEmail] = React.useState(initialEmail);
  const [isResending, setIsResending] = React.useState(false);
  const [resendSuccess, setResendSuccess] = React.useState(false);

  // If token is present, automatically trigger verification on mount
  React.useEffect(() => {
    if (!token) return;

    let isMounted = true;

    async function executeVerification() {
      setIsVerifying(true);
      setVerifyError(null);
      try {
        await apiClient.post("/auth/verify-email", { token });
        if (isMounted) {
          setVerifySuccess(true);
          toast.success("Email address verified successfully!");
        }
      } catch (err: any) {
        if (isMounted) {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Verification failed. The link may be invalid or expired.";
          const displayMsg = Array.isArray(msg) ? msg.join(", ") : msg;
          setVerifyError(displayMsg);
          toast.error(displayMsg);
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    }

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsResending(true);
    try {
      const res = await apiClient.post("/auth/resend-verification", { email });
      setResendSuccess(true);
      toast.success(res.data?.message || "Verification email sent!");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send verification email.";
      const displayMsg = Array.isArray(msg) ? msg.join(", ") : msg;
      toast.error(displayMsg);
    } finally {
      setIsResending(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER CASE 1: TOKEN PRESENT IN URL (AUTO-VERIFYING)
  // -------------------------------------------------------------
  if (token) {
    if (isVerifying) {
      return (
        <div className="relative rounded-2xl bg-bg-panel/95 backdrop-blur-xl border border-border-hairline p-7 sm:p-9 shadow-xl space-y-6 text-center overflow-hidden">
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-accent-scan/25 to-transparent pointer-events-none" />
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-accent-scan/10 border border-accent-scan/30 flex items-center justify-center text-accent-scan">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
              Verifying your email
            </h1>
            <p className="text-sm text-text-muted">
              Confirming your security credentials with the platform...
            </p>
          </div>
        </div>
      );
    }

    if (verifySuccess) {
      return (
        <div className="relative rounded-2xl bg-bg-panel/95 backdrop-blur-xl border border-border-hairline p-7 sm:p-9 shadow-xl space-y-6 text-center overflow-hidden">
          <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-accent-scan/25 to-transparent pointer-events-none" />
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-signal-resolved/10 border border-signal-resolved/30 flex items-center justify-center text-signal-resolved">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
              Email verified
            </h1>
            <p className="text-sm text-text-muted">
              Your email has been confirmed. You now have full access to your workspace.
            </p>
          </div>

          <div className="pt-2">
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
        </div>
      );
    }

    // Token verification failed
    return (
      <div className="relative rounded-2xl bg-bg-panel/95 backdrop-blur-xl border border-border-hairline p-7 sm:p-9 shadow-xl space-y-6 overflow-hidden">
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-accent-scan/25 to-transparent pointer-events-none" />
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-signal-critical/10 border border-signal-critical/30 flex items-center justify-center text-signal-critical">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="space-y-1.5 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
            Verification failed
          </h1>
          <p className="text-sm text-signal-critical">
            {verifyError || "This verification link is invalid, expired, or has already been used."}
          </p>
        </div>

        <p className="text-xs text-text-muted leading-relaxed text-center">
          Links expire after 24 hours. Request a new link below to activate your account.
        </p>

        <form onSubmit={handleResend} className="space-y-4">
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
              disabled={isResending}
              className="w-full cursor-pointer"
              icon={<ArrowRight className="h-4 w-4 stroke-[2.5]" />}
            >
              {isResending ? "Sending link..." : "Resend Verification Link"}
            </ExpandingButton>
          </div>

          <div className="text-center text-xs text-text-muted pt-2">
            <Link href="/auth/login" className="text-accent-scan hover:underline inline-flex items-center gap-1 font-medium">
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER CASE 2: PENDING STATUS (AFTER REGISTRATION)
  // -------------------------------------------------------------
  if (status === "pending") {
    return (
      <div className="relative rounded-2xl bg-bg-panel/95 backdrop-blur-xl border border-border-hairline p-7 sm:p-9 shadow-xl space-y-6 text-center overflow-hidden">
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-accent-scan/25 to-transparent pointer-events-none" />
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-accent-scan/10 border border-accent-scan/30 flex items-center justify-center text-accent-scan">
            <Mail className="h-6 w-6" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
            Check your email
          </h1>
          <p className="text-sm text-text-muted">
            We sent a verification link to:
          </p>
          {initialEmail && (
            <div className="inline-block mt-1 px-3 py-1 rounded-lg bg-bg-void border border-border-hairline text-accent-scan font-medium text-xs">
              {initialEmail}
            </div>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-bg-void border border-border-hairline space-y-1.5 text-left">
          <div className="flex items-center gap-2 text-text-primary text-xs font-semibold">
            <Clock className="h-4 w-4 text-accent-scan" />
            <span>Link valid for 24 hours</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Click the activation button in the email to unlock your workspace. If you do not see it within a few minutes, please check your spam folder.
          </p>
        </div>

        {resendSuccess ? (
          <div className="p-3 rounded-xl bg-signal-resolved/10 border border-signal-resolved/30 text-signal-resolved text-xs text-center font-medium">
            A new verification email has been sent!
          </div>
        ) : (
          <form onSubmit={handleResend} className="space-y-3 pt-2">
            {!initialEmail && (
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                prefix={<Mail className="h-4 w-4 text-text-muted" />}
                className="rounded-xl h-11 border-border-hairline focus-within:border-accent-scan"
                required
              />
            )}
            <ExpandingButton
              type="submit"
              variant="dark"
              size="md"
              rounded="xl"
              disabled={isResending}
              className="w-full cursor-pointer"
              icon={<RefreshCw className={`h-4 w-4 ${isResending ? "animate-spin text-accent-scan" : ""}`} />}
            >
              <span>{isResending ? "Sending..." : "Resend Email"}</span>
            </ExpandingButton>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-text-muted border-t border-border-hairline/60">
          <Link href="/auth/login" className="text-accent-scan hover:underline inline-flex items-center gap-1 font-medium">
            <ArrowLeft className="h-3 w-3" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER CASE 3: GENERAL RESEND VERIFICATION FORM
  // -------------------------------------------------------------
  return (
    <div className="relative rounded-2xl bg-bg-panel/95 backdrop-blur-xl border border-border-hairline p-7 sm:p-9 shadow-xl space-y-6 overflow-hidden">
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-accent-scan/25 to-transparent pointer-events-none" />

      <div className="space-y-1.5 text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
          Verify email address
        </h1>
        <p className="text-sm text-text-muted">
          Enter your registered email to receive an activation link.
        </p>
      </div>

      {resendSuccess ? (
        <div className="space-y-4 text-center">
          <div className="p-4 rounded-xl bg-signal-resolved/10 border border-signal-resolved/30 text-signal-resolved text-xs space-y-1">
            <div className="font-semibold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>Verification email sent</span>
            </div>
            <p className="text-text-muted text-xs">
              If an account with this email exists, a link has been dispatched to your inbox.
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
              Return to Sign In
            </ExpandingButton>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleResend} className="space-y-4">
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
              disabled={isResending}
              className="w-full cursor-pointer"
              icon={<ArrowRight className="h-4 w-4 stroke-[2.5]" />}
            >
              {isResending ? "Sending..." : "Send Verification Link"}
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

export default function VerifyEmailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 rounded-2xl bg-bg-panel border border-border-hairline text-center text-xs text-text-muted">
          Loading verification...
        </div>
      }
    >
      <VerifyEmailContent />
    </React.Suspense>
  );
}
