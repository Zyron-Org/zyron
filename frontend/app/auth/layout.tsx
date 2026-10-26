import type { Metadata } from "next";
import Link from "next/link";
import { Terminal } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
  title: "Authentication — Zyron Protocol Security",
  description: "Secure client and auditor access for smart contract audits.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-bg-void text-text-primary selection:bg-accent-scan/20 selection:text-accent-scan flex flex-col lg:flex-row overflow-x-hidden">
      {/* Left Column: Brand, Form, and Legal links (wider section) */}
      <div className="w-full lg:w-[57%] xl:w-[60%] flex flex-col justify-between min-h-screen px-6 sm:px-10 lg:px-12 xl:px-16 pt-4 sm:pt-5 pb-6 z-10 bg-bg-void">
        {/* Top Header / Brand Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-bg-panel border border-border-hairline text-accent-scan group-hover:border-accent-scan transition-colors shadow-sm">
              <Terminal className="h-4.5 w-4.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base text-text-primary tracking-wider">
                ZYRON
              </span>
              <span className="text-text-muted/60 font-light text-xs">|</span>
              <span className="text-accent-scan font-medium text-xs tracking-wider">
                AI AUDITOR
              </span>
            </div>
          </Link>
          <ThemeToggle size="sm" />
        </div>

        {/* Center: Auth Form Container (no card wrapper) */}
        <main className="w-full max-w-[420px] mx-auto py-6 sm:py-8 my-auto">
          {children}
        </main>

        {/* Bottom: Terms / Privacy Notice */}
        <div className="text-center text-xs text-text-muted pt-3">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="text-text-primary hover:text-accent-scan underline underline-offset-4 transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-text-primary hover:text-accent-scan underline underline-offset-4 transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </div>
      </div>

      {/* Right Column: Hero Graphic Visual with Perspective Grid (frameless, reduced radius and padding) */}
      <div className="hidden lg:flex lg:w-[43%] xl:w-[40%] items-center justify-center p-2.5 lg:p-3 xl:p-3.5 relative h-screen bg-bg-void">
        <div className="relative w-full h-full rounded-xl border border-border-hairline overflow-hidden bg-bg-panel">
          {/* Light mode visual */}
          <div className="absolute inset-0 block dark:hidden">
            <img
              src="/images/auth-hero-light.jpg"
              alt="Zyron Smart Contract Audit Infrastructure"
              className="w-full h-full object-cover object-center select-none"
            />
          </div>

          {/* Dark mode visual */}
          <div className="absolute inset-0 hidden dark:block">
            <img
              src="/images/auth-hero-dark.jpg"
              alt="Zyron Smart Contract Audit Infrastructure"
              className="w-full h-full object-cover object-center select-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
