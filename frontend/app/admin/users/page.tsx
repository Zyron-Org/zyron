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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
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

export default function UserRoleManagementPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/users");
      setUsers(res.data || []);
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

      toast.success(`Role for ${selectedUserForEdit.name} updated to ${targetNewRole}!`);
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

  const filteredUsers = users.filter((u) => {
    const orgName = u.organization?.name || u.organization || "";
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orgName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[4px] bg-bg-panel border border-border-hairline font-mono text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-accent-scan" />
            <h1 className="font-display text-base font-semibold text-text-primary">
              User & Role Governance
            </h1>
          </div>
          <p className="text-text-muted text-[11px]">
            Manage privileged access levels and confidential smart contract source permissions across all accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge severity="informational" size="sm">
            {users.length} REGISTERED ACCOUNTS
          </Badge>
          <Badge severity="critical" size="sm">
            RBAC API ACTIVE
          </Badge>
        </div>
      </div>

      {mutationSuccess && (
        <div className="p-4 rounded-[4px] bg-signal-resolved/10 border border-signal-resolved/40 text-signal-resolved font-mono text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Role mutation committed successfully via backend API.</span>
          </div>
        </div>
      )}

      {/* Filter & Search Controls */}
      <div className="p-3.5 rounded-[4px] bg-bg-panel border border-border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts by name, email, or organization..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-text-muted text-[11px] shrink-0">FILTER ROLE:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-8 px-2.5 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="auditor">Auditors Only</option>
            <option value="client">Clients Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>
      </div>

      {/* ACCOUNTS TABLE */}
      <div className="space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-text-primary font-sans">
            Platform Accounts Register
          </h3>
          <span className="text-[11px] text-text-muted">
            Showing {filteredUsers.length} of {users.length} accounts
          </span>
        </div>

        <div className="rounded-[4px] bg-bg-panel border border-border-hairline overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border-hairline bg-bg-void/60 text-[11px]">
                <TableHead className="font-mono text-text-muted py-3 px-4">ACCOUNT / ENTITY</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4">ASSIGNED ROLE</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4">ACCESS PRIVILEGE</TableHead>
                <TableHead className="font-mono text-text-muted py-3 px-4 text-right">GOVERNANCE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-b border-border-hairline hover:bg-bg-panel-raised/50 transition-colors"
                >
                  <TableCell className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-text-primary text-xs">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {user.email} · {user.organization?.name || user.organization || "Independent"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-[2px] font-bold border ${
                        user.role === "ADMIN" || user.role === "admin"
                          ? "bg-signal-critical/15 text-signal-critical border-signal-critical/40"
                          : user.role === "AUDITOR" || user.role === "auditor"
                          ? "bg-accent-scan/15 text-accent-scan border-accent-scan/40"
                          : "bg-bg-void text-text-muted border-border-hairline"
                      }`}
                    >
                      {(user.role || "CLIENT").toUpperCase()}
                    </span>
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-text-primary text-xs">
                    <div className="flex items-center gap-1.5">
                      {user.role === "ADMIN" || user.role === "admin" ? (
                        <ShieldAlert className="h-3.5 w-3.5 text-signal-critical" />
                      ) : user.role === "AUDITOR" || user.role === "auditor" ? (
                        <FileCode className="h-3.5 w-3.5 text-accent-scan" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-text-muted" />
                      )}
                      <span>{user.role === "ADMIN" ? "Root Superuser" : user.role === "AUDITOR" ? "Source Reviewer" : "Read-Only"}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(user)}
                      leftIcon={<Edit className="h-3 w-3 text-accent-scan" />}
                    >
                      Modify Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MODAL: ROLE MUTATION */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 bg-bg-void/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[4px] bg-bg-panel border-2 border-signal-critical/50 shadow-2xl p-6 space-y-6 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border-hairline pb-4">
              <div className="space-y-0.5">
                <Eyebrow size="xs" variant="scan" prefix="// PRIVILEGED_ACTION · ">
                  ROLE_MUTATION
                </Eyebrow>
                <h3 className="font-display text-lg font-bold text-text-primary">
                  Modify Account Role
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRoleMutation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-text-muted text-[11px]">SELECT NEW ROLE</label>
                <select
                  value={targetNewRole}
                  onChange={(e) => setTargetNewRole(e.target.value)}
                  className="w-full h-9 px-3 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none"
                >
                  <option value="CLIENT">Client (Read-Only Portal)</option>
                  <option value="AUDITOR">Auditor (Smart Contract Reviewer)</option>
                  <option value="ADMIN">Platform Admin (Superuser)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-muted text-[11px]">JUSTIFICATION REASON</label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="State the reason for this role elevation or demotion..."
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-[4px] bg-bg-void border border-border-hairline text-text-primary text-xs focus:outline-none resize-none font-sans"
                />
              </div>

              <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledgedRisk}
                  onChange={(e) => setAcknowledgedRisk(e.target.checked)}
                  className="mt-0.5 rounded bg-bg-void border-border-hairline text-signal-critical focus:ring-0"
                />
                <span className="text-[11px] text-text-primary font-bold">
                  I confirm this role mutation.
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-hairline">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUserForEdit(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!justification.trim() || !acknowledgedRisk}
                  isLoading={isSubmitting}
                  className="bg-signal-critical text-bg-void font-bold"
                >
                  Commit Role Mutation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
