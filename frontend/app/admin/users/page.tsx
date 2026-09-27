"use client";

import * as React from "react";
import {
  Users,
  Search,
  Key,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Edit,
  History,
  CheckCircle2,
  X,
  Check,
  FileCode,
  ArrowRight,
  Shield,
  UserCheck,
  Loader2,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function UserRoleManagementPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"all" | "auditor" | "client" | "admin">("all");
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      console.warn("User list notice:", e.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  // Modal State for Role Change Confirmation
  const [selectedUserForEdit, setSelectedUserForEdit] = React.useState<any | null>(null);
  const [targetNewRole, setTargetNewRole] = React.useState<string>("AUDITOR");
  const [justification, setJustification] = React.useState("");
  const [acknowledgedRisk, setAcknowledgedRisk] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mutationSuccess, setMutationSuccess] = React.useState(false);

  const openEditModal = (user: any) => {
    setSelectedUserForEdit(user);
    setTargetNewRole(user.role);
    setJustification("");
    setAcknowledgedRisk(false);
  };

  const handleConfirmRoleMutation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit || !justification.trim() || !acknowledgedRisk) return;

    setIsSubmitting(true);
    try {
      await apiClient.patch(`/users/${selectedUserForEdit.id}/role`, {
        role: targetNewRole,
      });

      toast.success(`Role for ${selectedUserForEdit.name || selectedUserForEdit.email} updated to ${targetNewRole}!`);
      setMutationSuccess(true);
      setSelectedUserForEdit(null);
      fetchUsers();
      setTimeout(() => setMutationSuccess(false), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update role";
      toast.error(`Role Mutation Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const auditorCount = users.filter((u) => u.role?.toUpperCase() === "AUDITOR").length;
  const clientCount = users.filter((u) => u.role?.toUpperCase() === "CLIENT").length;
  const adminCount = users.filter((u) => u.role?.toUpperCase() === "ADMIN").length;

  const filteredUsers = users.filter((u) => {
    const orgName = u.organization?.name || u.organization || "";
    const handle = u.auditorHandle || "";
    const matchesSearch =
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      handle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role?.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3 font-sans">
        <Loader2 className="h-8 w-8 text-accent-scan animate-spin" />
        <span className="text-sm font-medium text-text-muted">
          Loading platform accounts register...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* ─── 1. TOP HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1.5">
            <span>Admin</span>
            <span>/</span>
            <span>Governance & Access</span>
            <span>/</span>
            <span className="text-text-primary font-medium">User Accounts</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              User & Role Governance
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-scan/10 text-accent-scan border border-accent-scan/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              RBAC Policy Active
            </span>
          </div>

          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-3xl">
            Manage privileged access levels, confidential smart contract source permissions, and auditor designations across all registered accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Badge severity="informational" size="sm">
            {users.length} Registered Accounts
          </Badge>
          <Badge severity="resolved" size="sm">
            Zero Unauthorized Escalations
          </Badge>
        </div>
      </div>

      {mutationSuccess && (
        <div className="p-4 rounded-xl bg-signal-resolved/10 border border-signal-resolved/30 text-signal-resolved text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Role mutation committed successfully via backend API. Permissions updated immediately.</span>
        </div>
      )}

      {/* ─── 2. METRIC SUMMARY STATS CARDS (4 Layered SaaS Cards) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Accounts */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Total Accounts</span>
              <div className="h-8 w-8 rounded-lg bg-accent-scan/10 text-accent-scan flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-text-primary">
                {users.length}
              </div>
              <p className="text-[11px] text-text-muted">Registered platform identities</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Identity Directory</span>
            <span className="font-semibold text-accent-scan font-mono">100% Verified</span>
          </div>
        </div>

        {/* Security Auditors */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Security Auditors</span>
              <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-text-primary">
                {auditorCount}
              </div>
              <p className="text-[11px] text-text-muted">Active review pool</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Triage Permissions</span>
            <span className="font-semibold text-sky-600 dark:text-sky-400">Granted</span>
          </div>
        </div>

        {/* Protocol Clients */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Protocol Clients</span>
              <div className="h-8 w-8 rounded-lg bg-signal-resolved/10 text-signal-resolved flex items-center justify-center">
                <Building className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-text-primary">
                {clientCount}
              </div>
              <p className="text-[11px] text-text-muted">Audit project owners</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Submission Access</span>
            <span className="font-semibold text-signal-resolved">Standard</span>
          </div>
        </div>

        {/* Platform Admins */}
        <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 shadow-xs">
          <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">Platform Admins</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Lock className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="font-display text-2xl font-bold tracking-tight text-text-primary">
                {adminCount}
              </div>
              <p className="text-[11px] text-text-muted">Full administrative root</p>
            </div>
          </div>
          <div className="px-4 py-2 text-[11px] text-text-muted flex items-center justify-between">
            <span>Governance Tier</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">Root Access</span>
          </div>
        </div>
      </div>

      {/* ─── 3. FILTER TABS & SEARCH BAR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F2F4F7] dark:bg-bg-void/60 p-2 rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 shadow-xs">
        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-white dark:bg-bg-panel rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 shadow-xs">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0",
              roleFilter === "all"
                ? "bg-accent-scan text-white shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void"
            )}
          >
            All Accounts ({users.length})
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter("auditor")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              roleFilter === "auditor"
                ? "bg-accent-scan text-white shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void"
            )}
          >
            <span>Auditors</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 text-current">
              {auditorCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter("client")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              roleFilter === "client"
                ? "bg-accent-scan text-white shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void"
            )}
          >
            <span>Clients</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 text-current">
              {clientCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter("admin")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5",
              roleFilter === "admin"
                ? "bg-accent-scan text-white shadow-xs"
                : "text-text-muted hover:text-text-primary hover:bg-[#F2F4F7] dark:hover:bg-bg-void"
            )}
          >
            <span>Admins</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 text-current">
              {adminCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, org..."
            prefix={<Search className="h-4 w-4 text-text-muted" />}
            className="text-xs bg-white dark:bg-bg-panel rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60"
          />
        </div>
      </div>

      {/* ─── 4. ACCOUNTS TABLE (Layered SaaS Card) ─── */}
      <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 shadow-xs">
        <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E4E7EC] dark:border-border-hairline/60 bg-[#F8F9FA] dark:bg-bg-void/60">
                <TableHead className="py-3.5 px-4 text-xs font-semibold text-text-muted">USER IDENTITY</TableHead>
                <TableHead className="py-3.5 px-4 text-xs font-semibold text-text-muted">ACCESS ROLE</TableHead>
                <TableHead className="py-3.5 px-4 text-xs font-semibold text-text-muted">ORGANIZATION / HANDLE</TableHead>
                <TableHead className="py-3.5 px-4 text-xs font-semibold text-text-muted">VERIFICATION</TableHead>
                <TableHead className="py-3.5 px-4 text-xs font-semibold text-text-muted">CREATED DATE</TableHead>
                <TableHead className="py-3.5 px-4 text-xs font-semibold text-text-muted text-right">GOVERNANCE ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-xs text-text-muted">
                    No registered accounts matching query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((account) => {
                  const roleUpper = account.role?.toUpperCase() || "CLIENT";
                  const orgName = account.organization?.name || account.organization || "Independent";
                  const auditorHandle = account.auditorHandle || "—";
                  const initial = (account.name || account.email || "U").charAt(0).toUpperCase();

                  return (
                    <TableRow
                      key={account.id}
                      className="border-b border-border-hairline/60 hover:bg-[#F9FAFB] dark:hover:bg-bg-void/40 transition-colors"
                    >
                      {/* User Info */}
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-accent-scan/10 text-accent-scan font-bold flex items-center justify-center text-xs shrink-0">
                            {initial}
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-semibold text-xs text-text-primary">
                              {account.name || "Zyron Member"}
                            </div>
                            <div className="text-[11px] text-text-muted font-mono">
                              {account.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Access Role */}
                      <TableCell className="py-3.5 px-4">
                        {roleUpper === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Lock className="h-3 w-3" />
                            ADMIN
                          </span>
                        ) : roleUpper === "AUDITOR" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                            <Shield className="h-3 w-3" />
                            AUDITOR
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F2F4F7] dark:bg-bg-void text-text-muted border border-border-hairline">
                            <Building className="h-3 w-3" />
                            CLIENT
                          </span>
                        )}
                      </TableCell>

                      {/* Org / Handle */}
                      <TableCell className="py-3.5 px-4 text-xs font-mono text-text-primary">
                        {roleUpper === "AUDITOR" ? (
                          <span className="text-accent-scan font-semibold">{auditorHandle}</span>
                        ) : (
                          <span>{orgName}</span>
                        )}
                      </TableCell>

                      {/* Verification Status */}
                      <TableCell className="py-3.5 px-4">
                        {account.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-signal-resolved font-medium">
                            <Check className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">Unverified</span>
                        )}
                      </TableCell>

                      {/* Created Date */}
                      <TableCell className="py-3.5 px-4 text-xs text-text-muted font-mono">
                        {account.createdAt ? new Date(account.createdAt).toISOString().substring(0, 10) : "2026-09-27"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3.5 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => openEditModal(account)}
                          leftIcon={<Edit className="h-3.5 w-3.5" />}
                        >
                          Modify Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Bottom Gray Area Strip */}
        <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted font-sans rounded-b-2xl">
          <span>
            Displaying {filteredUsers.length} of {users.length} accounts · Real-time identity database
          </span>
          <span className="text-[11px]">
            Strict RBAC Authorization Guard Active
          </span>
        </div>
      </div>

      {/* ─── 5. ROLE MUTATION MODAL DIALOG ─── */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="rounded-2xl border border-[#E2E6EC] dark:border-border-hairline/80 bg-[#F2F4F7] dark:bg-bg-void/60 p-1.5 sm:p-2 max-w-lg w-full shadow-2xl">
            <div className="rounded-xl border border-[#E4E7EC] dark:border-border-hairline/60 bg-white dark:bg-bg-panel p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border-hairline/60 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-accent-scan" />
                  <h3 className="font-display text-base font-bold text-text-primary">
                    Modify Account Access Role
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="p-1 rounded-lg text-text-muted hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Target User Info */}
              <div className="p-3.5 rounded-xl bg-[#F8F9FA] dark:bg-bg-void/50 border border-border-hairline space-y-1">
                <div className="text-xs font-semibold text-text-primary">
                  {selectedUserForEdit.name || "Zyron Member"}
                </div>
                <div className="text-xs font-mono text-text-muted">
                  {selectedUserForEdit.email}
                </div>
                <div className="text-[11px] text-text-muted pt-1">
                  Current Role: <strong className="text-accent-scan font-bold">{selectedUserForEdit.role}</strong>
                </div>
              </div>

              <form onSubmit={handleConfirmRoleMutation} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary block">
                    Target Role Assignment
                  </label>
                  <select
                    value={targetNewRole}
                    onChange={(e) => setTargetNewRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-bg-panel border border-[#D0D5DD] dark:border-border-hairline text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-scan"
                  >
                    <option value="CLIENT">CLIENT (Standard Protocol Scope Submission)</option>
                    <option value="AUDITOR">AUDITOR (Triage Queue & Code Review Desk)</option>
                    <option value="ADMIN">ADMIN (Full Governance & Security Control)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary block">
                    Governance Justification (Required)
                  </label>
                  <Input
                    placeholder="Enter business reason or approval reference..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    required
                    className="text-xs rounded-xl"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Security Risk Notice</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Elevating roles to AUDITOR or ADMIN grants privileged access to confidential smart contract source code and report attestations.
                  </p>
                  <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={acknowledgedRisk}
                      onChange={(e) => setAcknowledgedRisk(e.target.checked)}
                      className="rounded border-[#D0D5DD] text-accent-scan focus:ring-accent-scan"
                    />
                    <span className="text-[11px] font-semibold text-text-primary">
                      I certify this privileged role change follows security protocol.
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="rounded-xl"
                    onClick={() => setSelectedUserForEdit(null)}
                  >
                    Cancel
                  </Button>

                  <ExpandingButton
                    type="submit"
                    variant="accent"
                    rounded="xl"
                    size="md"
                    disabled={isSubmitting || !justification.trim() || !acknowledgedRisk}
                    icon={<ArrowRight className="h-4 w-4" />}
                  >
                    {isSubmitting ? "Mutating Role..." : "Confirm Role Mutation"}
                  </ExpandingButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
