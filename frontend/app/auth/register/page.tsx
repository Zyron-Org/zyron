"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building, Mail, Lock, ArrowRight, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ExpandingButton } from "@/components/ui/expanding-button";
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
      toast.success("Account created! Check your email to activate your account.");
      router.push(`/auth/verify-email?status=pending&email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Registration failed";
      const displayMsg = Array.isArray(msg) ? msg.join(", ") : msg;
      toast.error(displayMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const githubAuthUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://144.91.110.133:4000'}/api/v1/auth/github`;

  return (
    <div className="w-full space-y-6">

      {/* Header */}
      <div className="space-y-1.5 text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
          Create an account
        </h1>
        <p className="text-sm text-text-muted">
          Register your protocol to request automated audits and track security telemetry.
        </p>
      </div>

      {/* GitHub 1-Click Register (ExpandingButton CTA) */}
      <div>
        <a href={githubAuthUrl} className="block w-full">
          <ExpandingButton
            type="button"
            variant="dark"
            size="md"
            rounded="xl"
            className="w-full cursor-pointer"
            icon={<ArrowUpRight className="h-4 w-4 stroke-[2.5]" />}
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
      </div>

      {/* Divider */}
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border-hairline" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-bg-void px-3 text-text-muted select-none">
            or register with email
          </span>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted">Protocol or company name</label>
          <Input
            value={protocolName}
            onChange={(e) => setProtocolName(e.target.value)}
            placeholder="e.g. Aura Finance"
            prefix={<Building className="h-4 w-4 text-text-muted" />}
            className="rounded-xl h-11 border-border-hairline focus-within:border-accent-scan"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted">Work email</label>
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
          <label className="text-xs font-medium text-text-muted">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            prefix={<Lock className="h-4 w-4 text-text-muted" />}
            className="rounded-xl h-11 border-border-hairline focus-within:border-accent-scan"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted">Scope tier</label>
          <div className="relative">
            <select
              value={daoTier}
              onChange={(e) => setDaoTier(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-bg-void border border-border-hairline text-sm text-text-primary focus:outline-none focus:border-accent-scan transition-colors"
            >
              <option value="single">Single Smart Contract (&lt;1,000 SLOC)</option>
              <option value="growth">Protocol Growth Suite (&lt;5,000 SLOC)</option>
              <option value="enterprise">Full Ecosystem Multi-Contract (Unlimited SLOC)</option>
            </select>
          </div>
        </div>

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
            {isLoading ? "Creating workspace..." : "Create Account"}
          </ExpandingButton>
        </div>
      </form>

      {/* Bottom Switch Link */}
      <div className="pt-2 border-t border-border-hairline/60 text-center text-xs text-text-muted">
        <span>Already have an account? </span>
        <Link href="/auth/login" className="text-accent-scan hover:underline font-semibold ml-1">
          Sign In &rarr;
        </Link>
      </div>
    </div>
  );
}
