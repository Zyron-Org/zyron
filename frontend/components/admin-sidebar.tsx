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
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/ui/sidebar-context";
import { X } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isOpen, close } = useSidebar();

  const navLinks = [
    {
      group: "GOVERNANCE & ACCESS",
      items: [
        {
          href: "/admin/users",
          label: "User & Role Management",
          icon: Users,
          badge: "8 ACCOUNTS",
          badgeType: "muted" as const,
        },
        {
          href: "/admin/oversight",
          label: "Global Ticket Oversight",
          icon: Activity,
          badge: "1 SLA ALERT",
          badgeType: "critical" as const,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Top Section */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Brand Bar */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-border-hairline bg-bg-void/40 sticky top-0 bg-bg-panel z-10">
          <Link href="/admin/users" onClick={close} className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center h-7 w-7 rounded-[4px] bg-signal-critical/10 border border-signal-critical/40 text-signal-critical">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight text-text-primary block leading-none">
                ZYRON
              </span>
              <span className="font-mono text-[9px] text-signal-critical leading-none">
                PLATFORM_ADMIN // ROOT
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-signal-critical animate-pulse" title="Admin Active" />
            <button
              type="button"
              onClick={close}
              className="lg:hidden p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-panel-raised transition-colors"
              aria-label="Close admin menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Privileged Identity Card */}
        <div className="px-4">
          <div className="p-3 rounded-[4px] bg-bg-void border border-signal-critical/30 space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-primary font-semibold text-xs flex items-center gap-1.5 truncate">
                <Key className="h-3.5 w-3.5 text-signal-critical shrink-0" />
                <span className="truncate">{user?.name || user?.email || "Admin"}</span>
              </span>
              <span className="text-[9px] bg-signal-critical/15 text-signal-critical px-1.5 py-0.2 rounded border border-signal-critical/40 font-bold shrink-0">
                ROOT SUPERUSER
              </span>
            </div>
            <div className="text-[10px] text-text-muted leading-tight truncate">
              {user?.email || "Audit Logging: Active"}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-3 space-y-6">
          {navLinks.map((group) => (
            <div key={group.group} className="space-y-1">
              <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                {group.group}
              </div>
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
                          item.badgeType === "critical"
                            ? "bg-signal-critical/15 text-signal-critical border border-signal-critical/40 font-bold animate-pulse"
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

      {/* Pinned Bottom Controls */}
      <div className="p-4 border-t border-border-hairline space-y-3 bg-bg-void/30 shrink-0 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px] text-text-muted">
          <span className="text-[10px] text-text-muted truncate">
            {user?.role ? `ROLE: ${user.role}` : "SEC_OPS // SESSION ACTIVE"}
          </span>
          <button
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
