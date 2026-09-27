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
  X,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar-context";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";

export function PortalSidebar() {
  const pathname = usePathname();
  const { isOpen, close, isCollapsed, toggleCollapse } = useSidebar();
  const { user, logout } = useAuth();
  const [copied, setCopied] = React.useState(false);
  const [audits, setAudits] = React.useState<any[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    apiClient
      .get("/audits")
      .then((res) => {
        if (isMounted && Array.isArray(res.data)) {
          setAudits(res.data);
        }
      })
      .catch((e) => console.warn("PortalSidebar fetch error:", e.message));
    return () => {
      isMounted = false;
    };
  }, []);

  const normalize = (stage: string) => {
    const s = stage?.toUpperCase();
    if (s === "PENDING") return "pending";
    if (s === "SCANNING") return "scanning";
    if (s === "IN_REVIEW") return "in-review";
    if (s === "CORRECTIONS_REQUESTED") return "corrections-requested";
    if (s === "COMPLETED") return "completed";
    return (stage || "").toLowerCase();
  };

  const inFlightAudits = audits.filter((a) =>
    ["pending", "scanning", "in-review", "corrections-requested"].includes(normalize(a.stage))
  );
  const completedAudits = audits.filter((a) => normalize(a.stage) === "completed");

  const openFindingsCount = audits.reduce((acc, a) => {
    if (Array.isArray(a.findings)) {
      return (
        acc +
        a.findings.filter((f: any) => {
          const st = (f.status || "OPEN").toUpperCase();
          return st === "OPEN" || st === "FIX_SUBMITTED";
        }).length
      );
    }
    return acc;
  }, 0);

  const latestActiveAuditId = inFlightAudits[0]?.id || audits[0]?.id || null;

  const handleCopy = () => {
    const textToCopy = user?.walletAddress || user?.email || "";
    if (textToCopy) {
      navigator.clipboard?.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
          href: latestActiveAuditId ? `/portal/track/${latestActiveAuditId}` : "/portal/track",
          label: "Active Trackers",
          icon: Radio,
          badge: inFlightAudits.length > 0 ? `${inFlightAudits.length} LIVE` : null,
          badgeColor: "pulse" as const,
        },
        {
          href: "/portal/vault",
          label: "Document Vault",
          icon: FileCheck2,
          badge: completedAudits.length > 0 ? `${completedAudits.length}` : null,
          badgeColor: "muted" as const,
        },
        {
          href: "/portal/findings",
          label: "Open Findings",
          icon: ShieldAlert,
          badge: openFindingsCount > 0 ? `${openFindingsCount} OPEN` : null,
          badgeColor: "scan" as const,
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
      <div className="flex-1 overflow-y-auto space-y-5">
        {/* Brand Bar */}
        {!isCollapsed ? (
          <div className="h-14 px-3 flex items-center justify-between sticky top-0 bg-transparent z-10">
            <Link href="/" onClick={close} className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white dark:bg-bg-panel border border-border-hairline text-accent-scan group-hover:border-accent-scan transition-colors shadow-xs shrink-0">
                <Terminal className="h-4 w-4" />
              </div>
              <span className="font-display font-bold text-sm tracking-wider text-text-primary block leading-none">
                ZYRON
              </span>
            </Link>

            <div className="flex items-center gap-1">
              {/* Desktop Collapse Toggle Button */}
              <button
                type="button"
                onClick={toggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-panel/60 transition-colors cursor-pointer"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={close}
                className="lg:hidden p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-panel-raised transition-colors"
                aria-label="Close sidebar menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-14 px-2 flex items-center justify-center sticky top-0 bg-transparent z-10">
            <button
              type="button"
              onClick={toggleCollapse}
              className="flex items-center justify-center h-8 w-8 rounded-lg bg-white dark:bg-bg-panel border border-border-hairline text-accent-scan hover:border-accent-scan transition-colors shadow-xs cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Client Protocol Context Card (Hidden when collapsed) */}
        {!isCollapsed && (
          <div className="px-2">
            <div className="p-3 rounded-xl bg-white/50 dark:bg-bg-panel/50 border border-border-hairline/60 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-semibold text-text-primary truncate">
                  {user?.organization?.name || user?.name || "Client Workspace"}
                </span>
                <span className="font-mono text-[9px] text-accent-scan bg-accent-scan/10 px-1 py-0.5 rounded-[4px] border border-accent-scan/20">
                  {user?.role || "CLIENT"}
                </span>
              </div>

              <div className="flex items-center justify-between font-mono text-[10px] text-text-muted">
                <span className="truncate max-w-[140px]">
                  {user?.walletAddress
                    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                    : user?.email || "Connected"}
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
        )}

        {/* Navigation Groups */}
        <div className="px-1 space-y-4">
          {navLinks.map((group) => (
            <div key={group.group} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-text-muted/80">
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center ${isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2"} rounded-lg text-xs font-sans transition-all ${
                      isActive
                        ? "bg-white dark:bg-bg-panel text-text-primary font-semibold shadow-xs border border-border-hairline/70"
                        : "text-text-muted hover:text-text-primary hover:bg-bg-panel/40"
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5 truncate"}`}>
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-accent-scan" : "text-text-muted"}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`font-mono text-[9px] px-1.5 py-0.2 rounded-[4px] ${
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
      <div className={`p-2.5 border-t border-border-hairline/40 ${isCollapsed ? "flex justify-center" : "space-y-2.5"} bg-transparent`}>
        {!isCollapsed ? (
          <>
            {/* Dedicated Auditor Hotline */}
            <div className="p-2.5 rounded-xl bg-white/40 dark:bg-bg-panel-raised/50 border border-border-hairline/60 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-text-primary font-semibold flex items-center gap-1.5">
                  <LifeBuoy className="h-3 w-3 text-accent-scan" />
                  Lead Auditor War Room
                </span>
              </div>
              <p className="text-[10px] text-text-muted leading-tight">
                Direct communication channel with {audits[0]?.leadAuditor?.name || audits[0]?.leadAuditor?.email || "assigned lead auditor"}.
              </p>
            </div>

            {/* Sign Out / Links */}
            <div className="flex items-center justify-between text-[11px] font-mono text-text-muted pt-0.5">
              <span className="text-[10px] text-text-muted truncate">
                {user?.role ? `ROLE: ${user.role}` : "CLIENT SESSION"}
              </span>
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
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              close();
              logout();
            }}
            className="p-2 rounded-lg text-text-muted hover:text-signal-critical hover:bg-bg-panel/60 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sticky Sidebar */}
      <aside className={`hidden lg:flex ${isCollapsed ? "w-16" : "w-60 xl:w-64"} shrink-0 bg-transparent flex-col justify-between h-full z-10 select-none transition-all duration-200 ease-in-out`}>
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
