"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  Inbox,
  Split,
  FileCheck,
  SlidersHorizontal,
  User,
  LogOut,
  ArrowLeftRight,
  Cpu,
  Layers,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/ui/sidebar-context";
import { X } from "lucide-react";

export function AuditorSidebar() {
  const pathname = usePathname();
  const { user, loginAs, logout } = useAuth();
  const { isOpen, close } = useSidebar();

  const navLinks = [
    {
      group: "AUDITOR WORKSPACE",
      items: [
        {
          href: "/auditor/queue",
          label: "Ticket Queue",
          icon: Inbox,
          badge: "2 RE-VERIFY",
          badgeType: "reverify" as const,
        },
        {
          href: "/auditor/review/ZYR-9481",
          label: "Dual-Pane Review",
          icon: Split,
          badge: "ZYR-9481",
          badgeType: "scan" as const,
        },
        {
          href: "/auditor/reports",
          label: "Reports Vault",
          icon: FileCheck,
          badge: "SHA-256",
          badgeType: "resolved" as const,
        },
        {
          href: "/auditor/settings",
          label: "Account Settings",
          icon: SlidersHorizontal,
          badge: null,
          badgeType: "muted" as const,
        },
      ],
    },
    {
      group: "INTERNAL ENGINE & RULES",
      items: [
        {
          href: "/auditor/rules",
          label: "AST Taint Rules",
          icon: Cpu,
          badge: "14 PASSES",
          badgeType: "muted" as const,
        },
        {
          href: "/auditor/invariants",
          label: "Invariant Proof Suite",
          icon: Layers,
          badge: "FOUNDRY",
          badgeType: "muted" as const,
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
          <Link href="/auditor/queue" onClick={close} className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center h-7 w-7 rounded-[4px] bg-bg-panel-raised border border-border-hairline text-accent-scan group-hover:border-accent-scan transition-colors">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight text-text-primary block leading-none">
                ZYRON
              </span>
              <span className="font-mono text-[9px] text-accent-scan leading-none">
                AUDITOR_LABS // v2.4
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-signal-resolved animate-pulse" title="Scanner Live" />
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

        {/* Auditor Profile Card */}
        <div className="px-4">
          <div className="p-3 rounded-[4px] bg-bg-void border border-border-hairline space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-primary font-semibold text-xs flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-accent-scan" />
                <span>0xAuditor_K4</span>
              </span>
              <span className="text-[9px] bg-accent-scan/10 text-accent-scan px-1.5 py-0.2 rounded border border-accent-scan/30">
                LEAD AUDITOR
              </span>
            </div>
            <div className="text-[10px] text-text-muted leading-tight">
              Queue: 2 Claimed · 2 Awaiting Re-test
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
                  (item.href === "/auditor/queue" && pathname === "/auditor") ||
                  (item.href.startsWith("/auditor/review") && pathname.startsWith("/auditor/review"));
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
                          item.badgeType === "reverify"
                            ? "bg-signal-high/15 text-signal-high border border-signal-high/40 font-bold animate-pulse"
                            : item.badgeType === "scan"
                            ? "bg-accent-scan text-bg-void font-bold"
                            : item.badgeType === "resolved"
                            ? "bg-signal-resolved/10 text-signal-resolved border border-signal-resolved/30"
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
        {/* Switch to Client Portal button */}
        <button
          onClick={() => {
            close();
            loginAs("client");
          }}
          className="w-full p-2 rounded-[4px] bg-bg-panel border border-border-hairline hover:border-accent-scan/50 text-text-muted hover:text-text-primary transition-colors flex items-center justify-between text-[11px]"
        >
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-3.5 w-3.5 text-accent-scan" />
            <span>Switch to Client Portal</span>
          </div>
          <span className="text-[9px] text-text-muted">Aura DAO</span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
          <Link href="/kitchen-sink" onClick={close} className="hover:text-accent-scan">
            /kitchen-sink
          </Link>
          <button
            onClick={() => {
              close();
              logout();
            }}
            className="hover:text-signal-critical flex items-center gap-1 transition-colors"
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
