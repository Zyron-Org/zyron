"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Plus, ShieldCheck, FileText, Settings, LayoutDashboard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useAuth } from "@/lib/auth-context";

export function PortalNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: "/portal", label: "DASHBOARD", icon: LayoutDashboard },
    { href: "/portal/new-request", label: "NEW REQUEST", icon: Plus },
    { href: "/portal/vault", label: "DOCUMENT VAULT", icon: FileText },
    { href: "/portal/settings", label: "SETTINGS", icon: Settings },
  ];

  const displayName = user?.organization?.name || user?.name || "Client Portal";
  const displayAddress = user?.walletAddress
    ? `// ${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : user?.email
    ? `// ${user.email}`
    : "";

  return (
    <header className="sticky top-0 z-50 border-b border-border-hairline bg-bg-void/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left: Brand + Client Protocol Identity */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center h-7 w-7 rounded-[4px] bg-bg-panel border border-border-hairline text-accent-scan group-hover:border-accent-scan/50 transition-colors">
              <Terminal className="h-4 w-4" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-text-primary">
              ZYRON
            </span>
          </Link>

          <span className="text-border-hairline font-mono text-xs select-none">/</span>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-text-primary">
              {displayName}
            </span>
            {displayAddress && (
              <span className="hidden sm:inline font-mono text-[11px] text-text-muted">
                {displayAddress}
              </span>
            )}
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-[4px] transition-colors ${
                  isActive
                    ? "bg-bg-panel-raised text-accent-scan font-medium border border-border-hairline"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-panel"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Status Beacon & Action */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-resolved" />
            <span>PIPELINE ONLINE</span>
          </div>

          <Link href="/portal/new-request">
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              New Request
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
