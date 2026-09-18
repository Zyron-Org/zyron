"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  LayoutDashboard,
  PlusCircle,
  FileCheck2,
  ShieldAlert,
  SlidersHorizontal,
  Code2,
  Users,
  Copy,
  Check,
  LogOut,
  ExternalLink,
  LifeBuoy,
  Radio,
  Shield,
  Activity,
  BookOpen,
  X,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar-context";
import { useAuth } from "@/lib/auth-context";
import { MOCK_CLIENT_PROFILE, MOCK_AUDIT_REQUESTS } from "@/lib/mock-data";

export function PortalSidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const { user, logout } = useAuth();
  const [copied, setCopied] = React.useState(false);


  const activeCount = MOCK_AUDIT_REQUESTS.filter(
    (a) => a.stage === "scanning" || a.stage === "in-review" || a.stage === "pending"
  ).length;

  const completedCount = MOCK_AUDIT_REQUESTS.filter((a) => a.stage === "completed").length;

  const handleCopy = () => {
    navigator.clipboard?.writeText(MOCK_CLIENT_PROFILE.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navLinks = [
    {
      group: "AUDIT WORKSPACE",
      items: [
        {
          href: "/portal",
          label: "Dashboard",
          icon: LayoutDashboard,
          badge: null,
        },
        {
          href: "/portal/new-request",
          label: "New Audit Request",
          icon: PlusCircle,
          badge: "INTAKE",
          badgeColor: "scan" as const,
        },
        {
          href: "/portal/track/ZYR-9481",
          label: "Active Trackers",
          icon: Radio,
          badge: `${activeCount} LIVE`,
          badgeColor: "pulse" as const,
        },
        {
          href: "/portal/vault",
          label: "Document Vault",
          icon: FileCheck2,
          badge: `${completedCount}`,
          badgeColor: "muted" as const,
        },
        {
          href: "/portal/findings",
          label: "Open Findings",
          icon: ShieldAlert,
          badge: "6 OPEN",
          badgeColor: "scan" as const,
        },
      ],
    },
    {
      group: "SECURITY TOOLS & LABS",
      items: [
        {
          href: "/portal/token-risk",
          label: "Token Risk Analyzer",
          icon: Shield,
          badge: "NEW",
          badgeColor: "scan" as const,
        },
        {
          href: "/portal/incident-monitor",
          label: "Incident Monitor",
          icon: Activity,
          badge: "LIVE",
          badgeColor: "pulse" as const,
        },
        {
          href: "/portal/learn",
          label: "Learning CTF Arena",
          icon: BookOpen,
          badge: "XP",
          badgeColor: "resolved" as const,
        },
      ],
    },
    {
      group: "DEVELOPER & SYSTEM",
      items: [
        {
          href: "/portal/integrations",
          label: "CI/CD & CLI Hooks",
          icon: Code2,
          badge: "COMING SOON",
          badgeColor: "muted" as const,
        },
        {
          href: "/portal/team",
          label: "Team & Role Access",
          icon: Users,
          badge: "COMING SOON",
          badgeColor: "muted" as const,
        },
        {
          href: "/portal/settings",
          label: "Account Settings",
          icon: SlidersHorizontal,
          badge: null,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Top Sidebar Header & Nav (Scrollable) */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Brand Bar */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-border-hairline bg-bg-void/40 sticky top-0 bg-bg-panel z-10">
          <Link href="/" onClick={close} className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center h-7 w-7 rounded-[4px] bg-bg-panel-raised border border-border-hairline text-accent-scan group-hover:border-accent-scan transition-colors">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight text-text-primary block leading-none">
                ZYRON
              </span>
              <span className="font-mono text-[9px] text-text-muted leading-none">
                CLIENT_PORTAL // v1.2
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-signal-resolved animate-pulse" title="System Online" />
            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={close}
              className="lg:hidden p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-panel-raised transition-colors"
              aria-label="Close sidebar menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Client Protocol Context Card */}
        <div className="px-4">
          <div className="p-3 rounded-[4px] bg-bg-void border border-border-hairline space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-semibold text-text-primary truncate">
                {user?.name || user?.organization?.name || MOCK_CLIENT_PROFILE.name}
              </span>
              <span className="font-mono text-[9px] text-accent-scan bg-accent-scan/10 px-1 py-0.5 rounded-[2px] border border-accent-scan/20">
                {user?.role || "CLIENT"}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-[10px] text-text-muted">
              <span className="truncate max-w-[140px]">
                {user?.walletAddress
                  ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                  : user?.email || MOCK_CLIENT_PROFILE.address.slice(0, 6) + "..." + MOCK_CLIENT_PROFILE.address.slice(-4)}
              </span>
              <button
                onClick={handleCopy}
                className="hover:text-text-primary transition-colors flex items-center gap-1"
                title="Copy Address"
              >
                {copied ? <Check className="h-3 w-3 text-signal-resolved" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="px-3 space-y-6">
          {navLinks.map((group) => (
            <div key={group.group} className="space-y-1">
              <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                {group.group}
              </div>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={`flex items-center justify-between px-3 py-2 rounded-[4px] text-xs font-sans transition-colors ${
                      isActive
                        ? "bg-bg-panel-raised text-accent-scan font-medium border border-border-hairline"
                        : "text-text-muted hover:text-text-primary hover:bg-bg-panel-raised/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-accent-scan" : "text-text-muted"}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`font-mono text-[9px] px-1.5 py-0.2 rounded-[2px] ${
                          item.badgeColor === "scan"
                            ? "bg-accent-scan text-bg-void font-bold"
                            : item.badgeColor === "pulse"
                            ? "bg-accent-scan/10 text-accent-scan border border-accent-scan/30 animate-pulse"
                            : "bg-bg-void text-text-muted border border-border-hairline"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Bottom / Auditor Support & User Session */}
      <div className="p-4 border-t border-border-hairline space-y-3 bg-bg-void/30">
        {/* Dedicated Auditor Hotline */}
        <div className="p-2.5 rounded-[4px] bg-bg-panel-raised border border-border-hairline space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-text-primary font-semibold flex items-center gap-1.5">
              <LifeBuoy className="h-3 w-3 text-accent-scan" />
              Lead Auditor War Room
            </span>
          </div>
          <p className="text-[10px] text-text-muted leading-tight">
            Direct communication channel with assigned auditor 0xAuditor_K4.
          </p>
        </div>

        {/* Sign Out / Links */}
        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted pt-1">
          <Link href="/kitchen-sink" onClick={close} className="hover:text-accent-scan">
            /kitchen-sink
          </Link>
          <button
            type="button"
            onClick={() => {
              close();
              logout();
            }}
            className="hover:text-signal-critical flex items-center gap-1 transition-colors cursor-pointer"
          >
            <LogOut className="h-3 w-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-bg-panel border-r border-border-hairline flex-col justify-between sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Visible on < lg screens when toggled) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Darkened Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-bg-void/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={close}
            aria-hidden="true"
          />

          {/* Sliding Drawer Container */}
          <aside className="relative w-72 max-w-[85vw] bg-bg-panel border-r border-border-hairline h-full flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
