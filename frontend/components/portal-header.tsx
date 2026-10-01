"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Plus,
  Terminal,
  Activity,
  ShieldCheck,
  ChevronRight,
  ShieldAlert,
  CheckCheck,
  Clock,
  ArrowRight,
  GitCommit,
  Radio,
  X,
  Menu,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useSidebar } from "@/components/ui/sidebar-context";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  ticketId: string;
  severity: "critical" | "high" | "medium" | "resolved" | "informational";
  unread: boolean;
  href: string;
}

export function PortalHeader() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const { toggle, isOpen: sidebarOpen } = useSidebar();

  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: "n-1",
      title: "Critical Candidate Flagged: ZYR-VAULT-001",
      desc: "AST engine flagged low-level call before balance reset on VaultCore.sol:142 (SWC-107).",
      time: "10m ago",
      ticketId: "ZYR-9481",
      severity: "critical",
      unread: true,
      href: "/portal/track/ZYR-9481",
    },
    {
      id: "n-2",
      title: "Remediation Verified: ZYR-9481-003",
      desc: "Lead Auditor 0xAuditor_K4 verified constructor zero-address fix in commit 7e21a99.",
      time: "2h ago",
      ticketId: "ZYR-9481",
      severity: "resolved",
      unread: true,
      href: "/portal/track/ZYR-9481",
    },
    {
      id: "n-3",
      title: "Pipeline Milestone: Stage 02 Active",
      desc: "Target contract VaultCore.sol passed bytecode ingestion. 11/14 AST taint passes active.",
      time: "5h ago",
      ticketId: "ZYR-9481",
      severity: "informational",
      unread: false,
      href: "/portal/track/ZYR-9481",
    },
    {
      id: "n-4",
      title: "Manual Triage Assigned: ZYR-9478",
      desc: "Lead Auditor 0xAuditor_K4 assigned to Nexus Collateral Manager review queue.",
      time: "1d ago",
      ticketId: "ZYR-9478",
      severity: "informational",
      unread: false,
      href: "/portal/track/ZYR-9478",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 px-4 sm:px-6 border-b border-border-hairline/60 bg-white/95 dark:bg-bg-panel/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-40 shrink-0">
      {/* Left: Mobile Menu Trigger + Context Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={toggle}
          className="lg:hidden p-1.5 rounded-lg bg-bg-void border border-border-hairline text-text-muted hover:text-text-primary hover:border-accent-scan/50 transition-colors shrink-0"
          aria-label="Toggle navigation drawer"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {/* Breadcrumb Path */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-text-muted truncate">
          <span className="text-text-primary font-semibold truncate">{user?.organization?.name || user?.name || "Client Portal"}</span>
          <span className="text-text-muted/60">/</span>
          <span className="text-accent-scan font-medium truncate">Dashboard</span>
        </div>
      </div>

      {/* Center: Global Search / Filter Input (Hidden on mobile) */}
      <div className="hidden md:flex items-center w-64 lg:w-72">
        <Input
          placeholder="Filter contracts, tickets (⌘K)..."
          prefix={<Search className="h-3.5 w-3.5 text-text-muted" />}
          className="h-8 text-xs bg-bg-void/60 rounded-lg border-border-hairline/60"
        />
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Notification Bell & Dropdown Container (Commented out for now) */}
        {/*
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative h-8 w-8 rounded-lg border flex items-center justify-center transition-colors ${
              isOpen
                ? "bg-bg-panel-raised border-accent-scan text-accent-scan"
                : "bg-bg-void/60 border-border-hairline/60 text-text-muted hover:text-text-primary"
            }`}
            title="Notifications"
          >
            <Bell className="h-3.5 w-3.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-signal-critical ring-2 ring-bg-panel" />
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-[4px] bg-bg-panel-raised border border-border-hairline shadow-2xl z-50 overflow-hidden font-mono text-xs animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 border-b border-border-hairline bg-bg-void/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary text-xs">
                    NOTIFICATIONS
                  </span>
                  {unreadCount > 0 && (
                    <span className="bg-signal-critical/10 text-signal-critical border border-signal-critical/30 text-[10px] font-bold px-1.5 py-0.2 rounded-[2px]">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-text-muted hover:text-accent-scan transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-border-hairline">
                {notifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`p-3.5 block transition-colors hover:bg-bg-void/70 ${
                      item.unread ? "bg-bg-void/30" : ""
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          {item.unread && (
                            <span className="h-1.5 w-1.5 rounded-full bg-accent-scan shrink-0" />
                          )}
                          <span className="font-display font-semibold text-xs text-text-primary truncate">
                            {item.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-text-muted shrink-0">
                          {item.time}
                        </span>
                      </div>

                      <p className="text-[11px] text-text-muted font-sans leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-text-muted">
                        <span className="text-accent-scan font-bold">{item.ticketId}</span>
                        <span className="hover:text-text-primary flex items-center gap-1">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="p-2.5 border-t border-border-hairline bg-bg-void/80 text-center">
                <Link
                  href="/portal/findings"
                  onClick={() => setIsOpen(false)}
                  className="text-[11px] text-accent-scan hover:underline flex items-center justify-center gap-1 font-semibold"
                >
                  <span>View All in Open Findings</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
        */}

        {/* Theme Mode Switcher */}
        <ThemeToggle size="sm" />

        {/* Primary CTA Action */}
        <Link href="/portal/new-request">
          <ExpandingButton variant="accent" rounded="xl" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
            New Request
          </ExpandingButton>
        </Link>

        {/* Profile Picture with Dropdown Menu & Sign Out */}
        <div className="pl-1 sm:pl-2 border-l border-border-hairline/60">
          <UserProfileDropdown align="right" />
        </div>
      </div>
    </header>
  );
}
