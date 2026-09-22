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
    <div className="min-h-screen bg-bg-void flex flex-col justify-between text-text-primary selection:bg-accent-scan/20 selection:text-accent-scan">
      {/* Top Hairline Header */}
      <header className="h-14 px-6 border-b border-border-hairline bg-bg-void/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center h-7 w-7 rounded-[4px] bg-bg-panel border border-border-hairline text-accent-scan group-hover:border-accent-scan transition-colors">
            <Terminal className="h-4 w-4" />
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-text-primary">
            ZYRON
          </span>
          <span className="hidden sm:inline font-mono text-[11px] text-text-muted">
            // PROTOCOL_SECURITY
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />
          <Link
            href="/"
            className="font-mono text-xs text-text-muted hover:text-text-primary flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>RETURN TO HOME</span>
          </Link>
        </div>
      </header>

      {/* Main Auth Form Container */}
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-md space-y-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 px-6 border-t border-border-hairline flex items-center justify-between text-[11px] font-mono text-text-muted">
        <span>ZYRON PROTOCOL SECURITY // ENCRYPTED AUTH SESSION</span>
        <div className="flex items-center gap-3">
          <Link href="/kitchen-sink" className="hover:text-text-primary">
            /kitchen-sink
          </Link>
        </div>
      </footer>
    </div>
  );
}
