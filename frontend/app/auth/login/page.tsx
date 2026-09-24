"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Wallet,
  ArrowRight,
  ArrowUpRight,
  Lock,
  Mail,
  AlertCircle,
  Github,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { useAuth, getDashboardForRole } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { getAddress } from "ethers";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithSiwe, user, loading } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isWeb3Loading, setIsWeb3Loading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Auto-redirect if already authenticated
  React.useEffect(() => {
    if (!loading && user) {
      const redirectParam = searchParams?.get("redirect");
      const isValidRedirect =
        redirectParam &&
        !redirectParam.startsWith("/auth") &&
        redirectParam !== "/";
      const dest = isValidRedirect ? redirectParam : getDashboardForRole(user.role);
      router.replace(dest);
    }
  }, [user, loading, router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const loggedUser = await login(email, password);
      toast.success("Welcome back! Redirecting to workspace...");
      const redirectParam = searchParams?.get("redirect");
      const isValidRedirect =
        redirectParam &&
        !redirectParam.startsWith("/auth") &&
        redirectParam !== "/";
      const dest = isValidRedirect ? redirectParam : getDashboardForRole(loggedUser?.role);
      router.replace(dest);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Invalid email or password";
      const displayMsg = Array.isArray(msg) ? msg.join(", ") : msg;
      setErrorMsg(displayMsg);
      toast.error(displayMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeb3Login = async () => {
    setIsWeb3Loading(true);
    setErrorMsg(null);

    const withTimeout = <T,>(promise: Promise<T>, ms = 15000): Promise<T> => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Wallet request timed out")), ms);
        promise
          .then((res) => {
            clearTimeout(timer);
            resolve(res);
          })
          .catch((err) => {
            clearTimeout(timer);
            reject(err);
          });
      });
    };

    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        let ethereum = (window as any).ethereum;
        if (ethereum?.providers?.length) {
          ethereum = ethereum.providers.find((p: any) => p.isMetaMask) || ethereum.providers[0];
        }

        const accounts = (await withTimeout(
          ethereum.request({ method: "eth_requestAccounts" }),
          15000
        )) as string[];

        const address = getAddress(accounts[0]);
        const domain = window.location.host;
        const origin = window.location.origin;
        const issuedAt = new Date().toISOString();

        let nonce = Math.random().toString(36).substring(2, 10);
        try {
          const nonceRes = await apiClient.get("/auth/siwe/nonce");
          if (nonceRes.data?.nonce) {
            nonce = nonceRes.data.nonce;
          }
        } catch {}

        const message = `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nSign in to Zyron Audit Workbench.\n\nURI: ${origin}\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${issuedAt}`;
        const hexMessage = "0x" + Array.from(new TextEncoder().encode(message)).map((b) => b.toString(16).padStart(2, "0")).join("");

        let signature: string;
        try {
          signature = (await withTimeout(
            ethereum.request({
              method: "personal_sign",
              params: [hexMessage, address],
            }),
            15000
          )) as string;
        } catch {
          signature = (await withTimeout(
            ethereum.request({
              method: "personal_sign",
              params: [message, address],
            }),
            15000
          )) as string;
        }

        toast.success(`Wallet connected: ${address.substring(0, 6)}...${address.substring(38)}`);
        const loggedUser = await loginWithSiwe(message, signature);
        const dest = getDashboardForRole(loggedUser?.role);
        router.replace(dest);
      } else {
        toast.error("Please install MetaMask or another EVM wallet extension.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Wallet authentication failed");
    } finally {
      setIsWeb3Loading(false);
    }
  };

  const githubAuthUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://144.91.110.133:4000'}/api/v1/auth/github`;

  return (
    <div className="relative rounded-2xl bg-bg-panel/95 backdrop-blur-xl border border-border-hairline p-7 sm:p-9 shadow-xl space-y-6 overflow-hidden">
      {/* Top subtle specular reflection line */}
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-accent-scan/25 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="space-y-1.5 text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
          Welcome back
        </h1>
        <p className="text-sm text-text-muted">
          Sign in to manage your smart contract audits and security reviews.
        </p>
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-signal-critical/10 border border-signal-critical/30 text-signal-critical text-xs space-y-1.5 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium leading-relaxed">{errorMsg}</p>
            {errorMsg.toLowerCase().includes("verify your email") && (
              <Link
                href={`/auth/verify-email?status=pending${email ? `&email=${encodeURIComponent(email)}` : ""}`}
                className="text-signal-success underline hover:text-signal-success/80 font-medium inline-flex items-center gap-1"
              >
                <span>Resend verification link</span>
                <span>&rarr;</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Social / GitHub & Web3 Actions (Using Landing Page ExpandingButton Component) */}
      <div className="space-y-3">
        {/* Continue with GitHub (ExpandingButton CTA) */}
        <a href={githubAuthUrl} className="block w-full">
          <ExpandingButton
            type="button"
            variant="dark"
            size="md"
            rounded="xl"
            className="w-full cursor-pointer"
            icon={
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            }
          >
            <span className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 fill-current shrink-0 text-text-primary group-hover:text-bg-void transition-colors"
                viewBox="0 0 24 24"
                width="16"
                height="16"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>Continue with GitHub</span>
            </span>
          </ExpandingButton>
        </a>

        {/* Web3 Sign-in Button (ExpandingButton CTA) */}
        <ExpandingButton
          type="button"
          variant="dark"
          size="md"
          rounded="xl"
          disabled={isWeb3Loading}
          onClick={handleWeb3Login}
          className="w-full cursor-pointer"
          icon={<ArrowUpRight className="h-4 w-4 stroke-[2.5]" />}
        >
          <span className="flex items-center gap-2.5">
            <Wallet className="h-4 w-4 text-accent-scan shrink-0" />
            <span>{isWeb3Loading ? "Connecting wallet..." : "Sign in with Ethereum"}</span>
          </span>
        </ExpandingButton>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-2">
        <div className="w-full border-t border-border-hairline" />
        <span className="bg-bg-panel px-3 text-xs text-text-muted select-none">
          or sign in with email
        </span>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted">
            Email address
          </label>
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-text-muted">
              Password
            </label>
            <Link
              href="/auth/reset-password"
              className="text-accent-scan hover:underline text-xs font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            prefix={<Lock className="h-4 w-4 text-text-muted" />}
            className="rounded-xl h-11 border-border-hairline focus-within:border-accent-scan"
            required
          />
        </div>

        {/* Primary Submit Button (Landing Page Light ExpandingButton CTA) */}
        <div className="pt-1">
          <ExpandingButton
            type="submit"
            variant="light"
            size="md"
            rounded="xl"
            disabled={isLoading}
            className="w-full cursor-pointer"
            icon={<ArrowRight className="h-4 w-4 stroke-[2.5]" />}
          >
            {isLoading ? "Signing in..." : "Sign in to Zyron"}
          </ExpandingButton>
        </div>
      </form>

      {/* Bottom Switch Link */}
      <div className="pt-2 border-t border-border-hairline/60 text-center text-xs text-text-muted">
        <span>Need to audit a new protocol? </span>
        <Link href="/auth/register" className="text-accent-scan hover:underline font-semibold ml-1">
          Create an account &rarr;
        </Link>
      </div>
    </div>
  );
}
