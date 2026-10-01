"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Users,
  Layers,
  Terminal,
  Activity,
  UserCheck,
  FileCheck,
  SlidersHorizontal,
  LogOut,
  Shield,
  Key,
  PanelLeftClose,
  PanelLeft,
  X,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/ui/sidebar-context";
import { apiClient } from "@/lib/api-client";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isOpen, close, isCollapsed, toggleCollapse } = useSidebar();
  const [usersCount, setUsersCount] = React.useState<number | null>(null);
  const [oversightCount, setOversightCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    apiClient
      .get("/users")
      .then((res) => {
        if (isMounted && Array.isArray(res.data)) {
          setUsersCount(res.data.length);
        }
      })
      .catch(() => {});

    apiClient
      .get("/audits")
      .then((res) => {
        if (isMounted && Array.isArray(res.data)) {
          setOversightCount(res.data.length);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const navLinks = [
    {
      group: "GOVERNANCE & ACCESS",
      items: [
        {
          href: "/admin/users",
          label: "User & Role Management",
          icon: Users,
          badge: usersCount !== null ? `${usersCount} ACCOUNTS` : "ACCOUNTS",
          badgeType: "muted" as const,
        },
        {
          href: "/admin/oversight",
          label: "Global Ticket Oversight",
          icon: Activity,
          badge: oversightCount !== null ? `${oversightCount} SCOPES` : "OVERSIGHT",
          badgeType: "scan" as const,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Top Section */}
      <div className="flex-1 overflow-y-auto space-y-5">
        {/* Brand Bar */}
        {!isCollapsed ? (
          <div className="h-14 px-3 flex items-center justify-between sticky top-0 bg-transparent z-10">
            <Link href="/admin/users" onClick={close} className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white dark:bg-bg-panel border border-border-hairline text-signal-critical shadow-xs shrink-0">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <span className="font-display font-bold text-sm tracking-wider text-text-primary block leading-none">
                ZYRON
              </span>
            </Link>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-panel/60 transition-colors cursor-pointer"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={close}
                className="lg:hidden p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-panel-raised transition-colors"
                aria-label="Close admin menu"
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
              className="flex items-center justify-center h-8 w-8 rounded-lg bg-white dark:bg-bg-panel border border-border-hairline text-signal-critical hover:border-signal-critical transition-colors shadow-xs cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Privileged Identity Card */}
        {!isCollapsed && (
          <div className="px-2">
            <div className="p-3 rounded-xl bg-white/50 dark:bg-bg-panel/50 border border-signal-critical/30 space-y-1.5 font-mono text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-primary font-semibold text-xs flex items-center gap-1.5 truncate">
                  <Key className="h-3.5 w-3.5 text-signal-critical shrink-0" />
                  <span className="truncate">{user?.name || user?.email || "Admin"}</span>
                </span>
                <span className="text-[9px] bg-signal-critical/15 text-signal-critical px-1.5 py-0.2 rounded-md border border-signal-critical/40 font-bold shrink-0">
                  ROOT SUPERUSER
                </span>
              </div>
              <div className="text-[10px] text-text-muted leading-tight truncate">
                {user?.email || "Audit Logging: Active"}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="px-1 space-y-4">
          {navLinks.map((group) => (
            <div key={group.group} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-text-muted/80">
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/admin/users" && pathname === "/admin");
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
                        className={`font-mono text-[9px] px-1.5 py-0.5 rounded-md ${
                          item.badgeType === "scan"
                            ? "bg-accent-scan/15 text-accent-scan border border-accent-scan/40 font-bold"
                            : "bg-gray-100 dark:bg-bg-void text-text-muted border border-border-hairline"
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

      {/* Pinned Bottom Controls / Sign Out */}
      <div className="p-2.5 border-t border-border-hairline/40 bg-transparent shrink-0">
        {!isCollapsed ? (
          <ExpandingButton
            variant="danger"
            size="sm"
            rounded="xl"
            className="w-full"
            icon={<LogOut className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              logout();
            }}
          >
            Sign Out
          </ExpandingButton>
        ) : (
          <button
            type="button"
            onClick={() => {
              close();
              logout();
            }}
            className="w-full flex items-center justify-center p-2 rounded-xl text-signal-critical hover:text-white bg-bg-void/90 dark:bg-bg-void hover:bg-signal-critical border border-signal-critical/50 hover:border-signal-critical transition-all cursor-pointer shadow-xs active:scale-[0.98]"
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
