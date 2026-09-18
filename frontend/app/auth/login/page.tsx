"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Wallet,
  ArrowRight,
  Lock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/eyebrow";
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
      toast.success("Authentication successful! Redirecting to workspace...");
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
      toast.error(`Authentication Failed: ${displayMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeb3Login = async () => {
    setIsWeb3Loading(true);
    setErrorMsg(null);

    // Timeout helper (15s limit so user has time to approve wallet popup)
    const withTimeout = <T,>(promise: Promise<T>, ms = 15000): Promise<T> => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Wallet request timed out (15s limit)")), ms);
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

        // Enforce canonical EIP-55 checksum on the Ethereum address
        const address = getAddress(accounts[0]);

        const domain = window.location.host;
        const origin = window.location.origin;
        const issuedAt = new Date().toISOString();

        // Fetch cryptographic SIWE nonce from backend
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
        } catch (e1: any) {
          signature = (await withTimeout(
            ethereum.request({
              method: "personal_sign",
              params: [message, address],
            }),
            15000
          )) as string;
        }
        toast.success(`Web3 Wallet Connected: ${address.substring(0, 6)}...${address.substring(38)}`);
        const loggedUser = await loginWithSiwe(message, signature);
        const dest = getDashboardForRole(loggedUser?.role);
        router.replace(dest);
      } else {
        toast.error("Web3 Wallet Extension Not Detected: Please install MetaMask or another EVM wallet extension.");
      }
    } catch (err: any) {
      console.warn("Web3 sign notice:", err);
      toast.error(err?.message || "Web3 Wallet Authentication Failed: Connection timed out or signature rejected.");
    } finally {
      setIsWeb3Loading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* STANDARD FORM LOGIN */}
      <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
        <div className="space-y-1.5 border-b border-border-hairline pb-4">
          <Eyebrow size="xs" variant="scan" prefix="// ACCESS_PORTAL · ">
            CREDENTIAL_AUTHENTICATION
          </Eyebrow>
          <h1 className="font-display text-xl font-semibold tracking-tight text-text-primary">
            Sign In with Email or Wallet
          </h1>
          <p className="text-xs text-text-muted font-mono">
            Access your protocol pipeline or internal auditor review queue.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-[4px] bg-signal-critical/10 border border-signal-critical/30 text-signal-critical font-mono text-xs space-y-2">
            <div>{errorMsg}</div>
            {errorMsg.toLowerCase().includes("verify your email") && (
              <div className="pt-1">
                <Link
                  href={`/auth/verify-email?status=pending${email ? `&email=${encodeURIComponent(email)}` : ""}`}
                  className="text-signal-success underline hover:text-signal-success/80 font-sans text-xs font-semibold inline-flex items-center gap-1"
                >
                  <span>Verify or Resend Verification Link</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            )}
          </div>
        )}


        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-xs text-text-muted">EMAIL ADDRESS</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              prefix={<Mail className="h-3.5 w-3.5 text-text-muted" />}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <label className="text-text-muted">PASSWORD</label>
              <Link
                href="/auth/reset-password"
                className="text-accent-scan hover:underline text-[11px]"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              prefix={<Lock className="h-3.5 w-3.5 text-text-muted" />}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            size="md"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Sign In with Credentials
          </Button>
        </form>

        {/* Web3 Sign-in Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-border-hairline" />
          <span className="bg-bg-panel px-2 font-mono text-[10px] text-text-muted uppercase tracking-wider relative">
            OR SIGN IN WITH WALLET
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          size="md"
          isLoading={isWeb3Loading}
          onClick={handleWeb3Login}
          leftIcon={<Wallet className="h-4 w-4 text-accent-scan" />}
        >
          Sign In with Ethereum (EIP-4361)
        </Button>

        <div className="pt-2 border-t border-border-hairline text-center font-mono text-xs text-text-muted">
          <span>Need to audit a new protocol? </span>
          <Link href="/auth/register" className="text-accent-scan hover:underline font-semibold">
            Register Protocol →
          </Link>
        </div>
      </div>
    </div>
  );
}
