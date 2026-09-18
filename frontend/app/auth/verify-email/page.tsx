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
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/eyebrow";
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
      toast.success(res.data?.message || "Verification email dispatched!");
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
        <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6 text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-accent-scan/10 border border-accent-scan/30 flex items-center justify-center text-accent-scan animate-pulse">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <Eyebrow size="xs" variant="scan" prefix="// SECURITY_VALIDATION · ">
              TOKEN_VERIFICATION
            </Eyebrow>
            <h1 className="font-display text-lg font-semibold text-text-primary">
              Verifying Your Email Address
            </h1>
            <p className="text-xs text-text-muted font-mono">
              Validating single-use cryptographic token against Zyron security protocol...
            </p>
          </div>
        </div>
      );
    }

    if (verifySuccess) {
      return (
        <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-signal-success/10 border border-signal-success/30 flex items-center justify-center text-signal-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-1.5 text-center">
            <Eyebrow size="xs" variant="scan" prefix="// PROTOCOL_ACTIVATED · ">
              VERIFICATION_COMPLETE
            </Eyebrow>
            <h1 className="font-display text-xl font-semibold tracking-tight text-text-primary">
              Account Successfully Verified
            </h1>
            <p className="text-xs text-text-muted font-mono">
              Your email address has been confirmed. You now have full access to Zyron Protocol Security.
            </p>
          </div>

          <div className="pt-2">
            <Button
              className="w-full h-10 font-mono text-xs font-semibold uppercase tracking-wider bg-accent-scan text-bg-void hover:bg-accent-scan/90"
              onClick={() => router.push("/auth/login")}
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Button>
          </div>
        </div>
      );
    }

    // Token verification failed
    return (
      <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-signal-critical/10 border border-signal-critical/30 flex items-center justify-center text-signal-critical">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="space-y-1.5 text-center">
          <Eyebrow size="xs" variant="scan" prefix="// VERIFICATION_ERROR · ">
            INVALID_OR_EXPIRED
          </Eyebrow>
          <h1 className="font-display text-xl font-semibold tracking-tight text-text-primary">
            Verification Failed
          </h1>
          <p className="text-xs text-signal-critical font-mono">
            {verifyError || "This verification link is invalid, expired, or has already been used."}
          </p>
        </div>

        <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-2">
          <p className="text-[11px] font-mono text-text-muted leading-relaxed">
            Verification tokens expire after 24 hours. Request a new verification link below to activate your account.
          </p>
        </div>

        <form onSubmit={handleResend} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-xs text-text-muted">ACCOUNT EMAIL</label>
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
            disabled={isResending}
            className="w-full h-10 font-mono text-xs font-semibold uppercase tracking-wider bg-accent-scan text-bg-void hover:bg-accent-scan/90"
          >
            {isResending ? "Dispatching New Link..." : "Resend Verification Link"}
          </Button>

          <div className="text-center font-mono text-xs text-text-muted pt-2">
            <Link href="/auth/login" className="text-accent-scan hover:underline inline-flex items-center gap-1">
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
      <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-accent-scan/10 border border-accent-scan/30 flex items-center justify-center text-accent-scan">
            <Mail className="h-6 w-6" />
          </div>
        </div>

        <div className="space-y-1.5 text-center">
          <Eyebrow size="xs" variant="scan" prefix="// ACTIVATION_PENDING · ">
            INBOX_VERIFICATION
          </Eyebrow>
          <h1 className="font-display text-xl font-semibold tracking-tight text-text-primary">
            Check Your Email
          </h1>
          <p className="text-xs text-text-muted font-mono">
            We sent a single-use verification link to:
          </p>
          {initialEmail && (
            <div className="inline-block mt-1 px-3 py-1 rounded-[4px] bg-bg-void border border-border-hairline text-accent-scan font-mono text-xs font-semibold">
              {initialEmail}
            </div>
          )}
        </div>

        <div className="p-3.5 rounded-[4px] bg-bg-void border border-border-hairline space-y-2">
          <div className="flex items-center gap-2 text-text-primary font-mono text-xs font-semibold">
            <Clock className="h-3.5 w-3.5 text-accent-scan" />
            <span>24-Hour Link Validity</span>
          </div>
          <p className="text-[11px] font-mono text-text-muted leading-relaxed">
            Click the activation button in the email to unlock your workspace. If you do not see it within a few minutes, check your spam folder.
          </p>
        </div>

        {resendSuccess ? (
          <div className="p-3 rounded-[4px] bg-signal-success/10 border border-signal-success/30 text-signal-success font-mono text-xs text-center">
            A fresh verification link has been dispatched to your inbox.
          </div>
        ) : (
          <form onSubmit={handleResend} className="space-y-3 pt-2">
            {!initialEmail && (
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="security@protocol.io"
                prefix={<Mail className="h-3.5 w-3.5 text-text-muted" />}
                required
              />
            )}
            <Button
              type="submit"
              disabled={isResending}
              variant="outline"
              className="w-full h-9 font-mono text-xs border-border-hairline hover:bg-bg-void hover:text-text-primary"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isResending ? "animate-spin" : ""}`} />
              <span>{isResending ? "Resending..." : "Didn't receive it? Resend Email"}</span>
            </Button>
          </form>
        )}

        <div className="pt-2 text-center font-mono text-xs text-text-muted border-t border-border-hairline">
          <Link href="/auth/login" className="text-accent-scan hover:underline inline-flex items-center gap-1">
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
    <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
      <div className="space-y-1.5 border-b border-border-hairline pb-4">
        <Eyebrow size="xs" variant="scan" prefix="// ACCOUNT_ACTIVATION · ">
          RESEND_VERIFICATION
        </Eyebrow>
        <h1 className="font-display text-xl font-semibold tracking-tight text-text-primary">
          Verify Email Address
        </h1>
        <p className="text-xs text-text-muted font-mono">
          Enter your registered work email to receive a new verification link.
        </p>
      </div>

      {resendSuccess ? (
        <div className="space-y-4">
          <div className="p-3.5 rounded-[4px] bg-signal-success/10 border border-signal-success/30 text-signal-success font-mono text-xs space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Request Processed</span>
            </div>
            <p className="text-[11px] text-text-muted">
              If an account with this email exists and is pending verification, a link has been dispatched.
            </p>
          </div>
          <Button
            className="w-full h-10 font-mono text-xs font-semibold uppercase tracking-wider bg-accent-scan text-bg-void hover:bg-accent-scan/90"
            onClick={() => router.push("/auth/login")}
          >
            <span>Return to Sign In</span>
            <ArrowRight className="h-3.5 w-3.5 ml-2" />
          </Button>
        </div>
      ) : (
        <form onSubmit={handleResend} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-xs text-text-muted">REGISTERED WORK EMAIL</label>
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
            disabled={isResending}
            className="w-full h-10 font-mono text-xs font-semibold uppercase tracking-wider bg-accent-scan text-bg-void hover:bg-accent-scan/90"
          >
            {isResending ? "Sending Verification Link..." : "Send Verification Link"}
          </Button>

          <div className="pt-2 text-center font-mono text-xs text-text-muted">
            <Link href="/auth/login" className="text-accent-scan hover:underline inline-flex items-center gap-1">
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
        <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline text-center font-mono text-xs text-text-muted">
          Loading verification protocol...
        </div>
      }
    >
      <VerifyEmailContent />
    </React.Suspense>
  );
}
