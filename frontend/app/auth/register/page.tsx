"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/eyebrow";

import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [protocolName, setProtocolName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [daoTier, setDaoTier] = React.useState("growth");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({
        email,
        password,
        name: protocolName,
        organizationName: protocolName,
      });
      toast.success("Registration successful! Check your email to activate your account.");
      router.push(`/auth/verify-email?status=pending&email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Registration failed";
      const displayMsg = Array.isArray(msg) ? msg.join(", ") : msg;
      toast.error(`Registration Failed: ${displayMsg}`);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="p-8 rounded-[4px] bg-bg-panel border border-border-hairline space-y-6">
      <div className="space-y-1.5 border-b border-border-hairline pb-4">
        <Eyebrow size="xs" variant="scan" prefix="// CLIENT_ONBOARDING · ">
          PROTOCOL_REGISTRATION
        </Eyebrow>
        <h1 className="font-display text-xl font-semibold tracking-tight text-text-primary">
          Register Protocol Organization
        </h1>
        <p className="text-xs text-text-muted font-mono">
          Create your client workspace to request audits, track AST telemetry, and verify releases.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1.5">
          <label className="font-mono text-xs text-text-muted">PROTOCOL OR DAO NAME</label>
          <Input
            value={protocolName}
            onChange={(e) => setProtocolName(e.target.value)}
            placeholder="e.g. Aura Core Protocol"
            prefix={<Building className="h-3.5 w-3.5 text-text-muted" />}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-xs text-text-muted">WORK EMAIL</label>
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
          <label className="font-mono text-xs text-text-muted">PASSWORD</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 10 characters"
            prefix={<Lock className="h-3.5 w-3.5 text-text-muted" />}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-xs text-text-muted">SCOPE CAPACITY TIER</label>
          <select
            value={daoTier}
            onChange={(e) => setDaoTier(e.target.value)}
            className="w-full h-9 px-3 rounded-[4px] bg-bg-void border border-border-hairline font-mono text-xs text-text-primary focus:outline-none"
          >
            <option value="single">Single Smart Contract Scope (&lt;1,000 SLOC)</option>
            <option value="growth">Protocol Growth Suite (&lt;5,000 SLOC)</option>
            <option value="enterprise">Full Ecosystem Multi-Contract Scope (Unlimited SLOC)</option>
          </select>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          size="md"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Create Workspace & Request First Audit
        </Button>
      </form>

      <div className="pt-2 border-t border-border-hairline text-center font-mono text-xs text-text-muted">
        <span>Already registered? </span>
        <Link href="/auth/login" className="text-accent-scan hover:underline font-semibold">
          Sign In →
        </Link>
      </div>
    </div>
  );
}
