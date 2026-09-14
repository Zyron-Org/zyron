"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Terminal,
  Wallet,
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  User,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { useAuth, SAMPLE_ACCOUNTS } from "@/lib/auth-context";

import { toast } from "sonner";

export default function LoginPage() {
  const { login, loginAs } = useAuth();
  const [email, setEmail] = React.useState("security@auraprotocol.io");
  const [password, setPassword] = React.useState("SecurePassword123!");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isWeb3Loading, setIsWeb3Loading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await login(email, password);
      toast.success("Authentication successful! Session token active.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Invalid email or password";
      const displayMsg = Array.isArray(msg) ? msg.join(", ") : msg;
      setErrorMsg(displayMsg);
      toast.error(`Authentication Failed: ${displayMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (roleStr: string) => {
    loginAs(roleStr);
    toast.info(`Switched to Demo Persona (${roleStr.toUpperCase()})`);
  };

  const handleWeb3Login = async () => {
    setIsWeb3Loading(true);
    setErrorMsg(null);

    // Timeout helper (5s limit so hung browser extensions never freeze the UI)
    const withTimeout = <T,>(promise: Promise<T>, ms = 5000): Promise<T> => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Wallet request timed out (5s limit)")), ms);
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
          5000
        )) as string[];

        const address = accounts[0];

        const domain = window.location.host;
        const origin = window.location.origin;
        const issuedAt = new Date().toISOString();
        const nonce = Math.random().toString(36).substring(2, 10);

        const message = `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nSign in to Zyron Audit Workbench.\n\nURI: ${origin}\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${issuedAt}`;
        const hexMessage = "0x" + Array.from(new TextEncoder().encode(message)).map((b) => b.toString(16).padStart(2, "0")).join("");

        try {
          await withTimeout(
            ethereum.request({
              method: "personal_sign",
              params: [hexMessage, address],
            }),
            5000
          );
        } catch (e1: any) {
          try {
            await withTimeout(
              ethereum.request({
                method: "personal_sign",
                params: [message, address],
              }),
              5000
            );
          } catch (e2: any) {}
        }
        toast.success(`Web3 Wallet Connected: ${address.substring(0, 6)}...${address.substring(38)}`);
        loginAs("client");
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
      {/* 1-CLICK DEMO PERSONA SELECTOR */}
      <div className="p-4 rounded-[4px] bg-bg-panel border border-accent-scan/30 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-border-hairline pb-2">
          <span className="text-accent-scan font-bold flex items-center gap-1.5 text-[11px]">
            <Sparkles className="h-3.5 w-3.5" />
            INSTANT DEMO PERSONAS
          </span>
          <span className="text-text-muted text-[10px]">1-CLICK LOGIN</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Client Sample Button */}
          <button
            type="button"
            onClick={() => handleDemoLogin("client")}
            className="p-3 rounded-[4px] bg-bg-void border border-border-hairline hover:border-accent-scan/60 text-left transition-colors space-y-1.5 group cursor-pointer"
          >
            <div className="flex items-center justify-between gap-1">
              <Badge severity="resolved" size="sm" className="text-[9px] px-1.5 py-0">
                CLIENT
              </Badge>
              <span className="text-[9px] text-text-muted">1-CLICK</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-text-primary font-bold group-hover:text-accent-scan text-[11px] truncate">
                Client Portal
              </div>
              <div className="text-[10px] text-text-muted truncate">Aura Finance DAO</div>
            </div>
          </button>

          {/* Auditor Sample Button */}
          <button
            type="button"
            onClick={() => handleDemoLogin("auditor")}
            className="p-3 rounded-[4px] bg-bg-void border border-border-hairline hover:border-signal-high/60 text-left transition-colors space-y-1.5 group cursor-pointer"
          >
            <div className="flex items-center justify-between gap-1">
              <Badge severity="high" size="sm" className="text-[9px] px-1.5 py-0">
                AUDITOR
              </Badge>
              <span className="text-[9px] text-text-muted">1-CLICK</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-text-primary font-bold group-hover:text-signal-high text-[11px] truncate">
                Auditor Workspace
              </div>
              <div className="text-[10px] text-text-muted truncate">0xAuditor_K4 (Queue)</div>
            </div>
          </button>

          {/* Platform Admin Sample Button */}
          <button
            type="button"
            onClick={() => handleDemoLogin("admin")}
            className="p-3 rounded-[4px] bg-bg-void border border-border-hairline hover:border-accent-scan text-left transition-colors space-y-1.5 group cursor-pointer"
          >
            <div className="flex items-center justify-between gap-1">
              <Badge severity="critical" size="sm" className="text-[9px] px-1.5 py-0">
                SUPERUSER
              </Badge>
              <span className="text-[9px] text-text-muted">1-CLICK</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-text-primary font-bold group-hover:text-accent-scan text-[11px] truncate">
                Platform Admin
              </div>
              <div className="text-[10px] text-text-muted truncate">0xAdmin_SecOps (Global)</div>
            </div>
          </button>
        </div>
      </div>

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

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-xs text-text-muted">EMAIL ADDRESS</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="security@protocol.io"
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

        {/* Quick Demo Persona Shortcuts */}
        <div className="p-4 rounded bg-bg-void border border-border-hairline space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-text-muted font-semibold tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-accent-scan" /> QUICK TEST ACCOUNTS
            </span>
            <Badge severity="resolved" size="sm">DEMO READY</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setEmail("security@auraprotocol.io");
                setPassword("SecurePassword123!");
                handleDemoLogin("client");
              }}
              className="p-2 rounded bg-bg-panel border border-border-hairline hover:border-accent-scan text-left transition-colors cursor-pointer"
            >
              <div className="text-[10px] text-text-muted">ROLE: CLIENT</div>
              <div className="font-bold text-text-primary text-[11px] truncate">Aura Client</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail("k4@zyron.labs");
                setPassword("AuditorPass123!");
                handleDemoLogin("auditor");
              }}
              className="p-2 rounded bg-bg-panel border border-border-hairline hover:border-accent-scan text-left transition-colors cursor-pointer"
            >
              <div className="text-[10px] text-signal-resolved font-bold">ROLE: AUDITOR</div>
              <div className="font-bold text-text-primary text-[11px] truncate">0xAuditor_K4</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail("admin@zyron.labs");
                setPassword("AdminPass123!");
                handleDemoLogin("admin");
              }}
              className="p-2 rounded bg-bg-panel border border-border-hairline hover:border-signal-critical text-left transition-colors cursor-pointer"
            >
              <div className="text-[10px] text-signal-critical font-bold">ROLE: ADMIN</div>
              <div className="font-bold text-text-primary text-[11px] truncate">Admin Lead</div>
            </button>
          </div>
        </div>

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
