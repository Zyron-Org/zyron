"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Activity,
  Terminal,
  Cpu,
  ShieldAlert,
  Inbox,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/ui/sidebar-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";

export function AuditorHeader() {
  const { user, logout } = useAuth();
  const { toggle, isOpen } = useSidebar();

  return (
    <header className="h-14 px-4 sm:px-6 border-b border-border-hairline/60 bg-white/95 dark:bg-bg-panel/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-40 shrink-0">
      {/* Left Context + Mobile Drawer Trigger */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={toggle}
          className="lg:hidden p-1.5 rounded-lg bg-bg-void border border-border-hairline text-text-muted hover:text-text-primary hover:border-accent-scan/50 transition-colors shrink-0"
          aria-label="Toggle auditor navigation"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-2 text-xs text-text-muted truncate">
          <span className="text-accent-scan font-bold truncate">AUDITOR_LABS</span>
          <span className="text-text-muted/60">/</span>
          <span className="text-text-primary font-medium truncate">Workbench</span>
        </div>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex items-center w-64 lg:w-80">
        <Input
          placeholder="Filter queue by ticket, contract, SWC (⌘K)..."
          prefix={<Search className="h-3.5 w-3.5 text-text-muted" />}
          className="h-8 text-xs bg-bg-void/60 rounded-lg border-border-hairline/60"
        />
      </div>

      {/* Right Telemetry & Role Switcher */}
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
