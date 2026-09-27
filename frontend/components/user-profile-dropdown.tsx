"use client";

import * as React from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Users,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ExpandingButton } from "@/components/ui/expanding-button";

interface UserProfileDropdownProps {
  align?: "left" | "right";
}

export function UserProfileDropdown({ align = "right" }: UserProfileDropdownProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "ZY";

  const role = (user?.role || "CLIENT").toUpperCase();
  const isAuditor = role === "AUDITOR";
  const isAdmin = role === "ADMIN";

  const settingsHref = isAuditor
    ? "/auditor/settings"
    : isAdmin
    ? "/admin/users"
    : "/portal/settings";

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Profile Picture Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex items-center justify-center h-8 w-8 rounded-full bg-accent-scan/10 border border-border-hairline hover:border-accent-scan/60 hover:ring-2 hover:ring-accent-scan/20 transition-all cursor-pointer select-none group"
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={user?.name || user?.email || "Account Menu"}
      >
        {user?.githubAvatarUrl ? (
          <img
            src={user.githubAvatarUrl}
            alt={user?.name || "Avatar"}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="font-display font-semibold text-xs text-accent-scan leading-none">
            {initials}
          </span>
        )}
        {/* Subtle Online Status Dot */}
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-signal-resolved ring-2 ring-white dark:ring-bg-panel" />
      </button>

      {/* Dropdown Flyout */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 w-64 rounded-xl bg-white dark:bg-bg-panel border border-border-hairline shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 text-xs`}
        >
          {/* Header Info */}
          <div className="p-3.5 border-b border-border-hairline/70 bg-bg-void/40">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-accent-scan/15 border border-accent-scan/30 flex items-center justify-center text-accent-scan font-bold text-xs shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-text-primary text-xs truncate">
                  {user?.name || "Connected User"}
                </div>
                <div className="text-[11px] text-text-muted truncate">
                  {user?.email ||
                    (user?.walletAddress
                      ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                      : "user@zyron.security")}
                </div>
                {role !== "CLIENT" && (
                  <div className="mt-1">
                    <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-medium rounded-md bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
                      {role}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5 space-y-0.5 font-sans">
            <Link
              href={settingsHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-panel-raised/70 transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-text-muted" />
              <span>Account Settings</span>
            </Link>

            {!isAuditor && !isAdmin && (
              <Link
                href="/portal/team"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-panel-raised/70 transition-colors"
              >
                <Users className="h-3.5 w-3.5 text-text-muted" />
                <span>Team & Access</span>
              </Link>
            )}

            <Link
              href="/portal/vault"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-panel-raised/70 transition-colors"
            >
              <Shield className="h-3.5 w-3.5 text-text-muted" />
              <span>Security Vault</span>
            </Link>
          </div>

          {/* Footer / Sign Out */}
          <div className="p-1.5 border-t border-border-hairline/70 bg-bg-void/20">
            <ExpandingButton
              variant="danger"
              size="sm"
              rounded="lg"
              className="w-full text-xs"
              icon={<LogOut className="h-3.5 w-3.5" />}
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
            >
              Sign Out
            </ExpandingButton>
          </div>
        </div>
      )}
    </div>
  );
}
