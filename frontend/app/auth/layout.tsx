import type { Metadata } from "next";
import Link from "next/link";
import { Terminal, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-bg-void flex flex-col justify-between text-text-primary selection:bg-accent-scan/20 selection:text-accent-scan relative overflow-hidden">
      {/* Ambient background glow matching landing page */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] bg-accent-scan/[0.04] blur-[150px] pointer-events-none -z-10" />

      {/* Top Navigation Header */}
      <header className="h-16 px-6 sm:px-10 border-b border-border-hairline/60 bg-bg-void/60 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-bg-panel border border-border-hairline text-accent-scan group-hover:border-accent-scan transition-colors">
            <Terminal className="h-4.5 w-4.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-text-primary tracking-wider">
              ZYRON
            </span>
            <span className="hidden sm:inline text-text-muted/60 font-light text-xs">|</span>
            <span className="hidden sm:inline text-accent-scan font-medium text-xs tracking-wider">
              AI AUDITOR
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />
          <Link
            href="/"
            className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to website</span>
          </Link>
        </div>
      </header>

      {/* Main Auth Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-[440px]">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 px-6 sm:px-10 border-t border-border-hairline/60 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-2">
        <span>© {new Date().getFullYear()} Zyron Protocol Security. All rights reserved.</span>
        <div className="flex items-center gap-4 text-text-muted">
          <Link href="/#faq" className="hover:text-text-primary transition-colors">
            FAQ
          </Link>
          <Link href="/#pricing" className="hover:text-text-primary transition-colors">
            Pricing
          </Link>
          <a href="mailto:security@zyron.security" className="hover:text-text-primary transition-colors">
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
}
