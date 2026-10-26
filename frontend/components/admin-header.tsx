"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Key,
  Lock,
  Activity,
  LogOut,
  Bell,
  Terminal,
  Menu,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/ui/sidebar-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";

export function AdminHeader() {
  const { user, logout } = useAuth();
  const { toggle, isOpen } = useSidebar();

  return (
    <header className="h-14 border-b border-border-hairline/60 bg-white/95 dark:bg-bg-panel/95 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 font-mono text-xs shrink-0">
      {/* Left: Mobile Drawer Trigger + Privileged Context Indicator */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={toggle}
          className="lg:hidden p-1.5 rounded-lg bg-bg-void border border-signal-critical/40 text-signal-critical hover:bg-signal-critical/10 transition-colors shrink-0"
          aria-label="Toggle admin navigation"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-signal-critical/10 border border-signal-critical/40 text-signal-critical truncate">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span className="font-bold tracking-wider uppercase text-[11px] truncate">
            PLATFORM_ADMIN
          </span>
        </div>

        <span className="text-text-muted text-[11px] hidden xl:inline truncate">
          · IMMUTABLE ROLE MUTATION ACTIVE
        </span>
      </div>

      {/* Right: Telemetry & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Theme Mode Switcher */}
        <ThemeToggle size="sm" />

        {/* Profile Picture with Dropdown Menu & Sign Out */}
        <div className="pl-1 sm:pl-2 border-l border-border-hairline/60">
          <UserProfileDropdown align="right" />
        </div>
      </div>
    </header>
  );
}
