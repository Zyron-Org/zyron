"use client";

import * as React from "react";
import Link from "next/link";
import { Users, ArrowLeft, ShieldCheck, Mail, Plus, UserCheck, Sparkles, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export default function TeamAccessPage() {
  const { user } = useAuth();
  const [org, setOrg] = React.useState<any>(null);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const fetchOrg = async () => {
    try {
      const res = await apiClient.get("/organizations/me");
      setOrg(res.data);
    } catch (e: any) {
      console.warn("Org fetch notice:", e.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOrg();
  }, []);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !org) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await apiClient.post(`/organizations/${org.id}/members`, { email: inviteEmail });
      toast.success(`Successfully added ${res.data.email} to ${org.name}!`);
      setFeedback(`Successfully added ${res.data.email} to ${org.name}`);
      setInviteEmail("");
      fetchOrg();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to add member";
      toast.error(`Invitation Error: ${msg}`);
      setFeedback(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-border-hairline pb-4">
        <Link
          href="/portal"
          className="font-mono text-xs text-text-muted hover:text-text-primary flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>BACK TO DASHBOARD</span>
        </Link>
        <Badge severity="resolved" size="sm">
          ORGANIZATION MULTI-TENANCY ACTIVE
        </Badge>
      </div>

      <div className="p-8 rounded-[12px] bg-bg-panel border border-border-hairline space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-hairline">
          <div className="space-y-1">
            <Eyebrow size="xs" variant="scan" prefix="// ORGANIZATION_MANAGEMENT · ">
              TEAM_ACCESS_CONTROL
            </Eyebrow>
            <h1 className="font-display text-2xl font-semibold text-text-primary flex items-center gap-2">
              <Building className="h-6 w-6 text-accent-scan" />
              <span>{org?.name || user?.organization?.name || (user?.name ? `${user.name}'s Organization` : "Organization Access Control")}</span>
            </h1>
            <p className="text-xs text-text-muted font-mono">
              Tier: <span className="text-accent-scan uppercase font-bold">{org?.tier || "Standard"}</span> | Total Members: {org?.users?.length || (user ? 1 : 0)}
            </p>
          </div>

          <Badge severity="high" size="sm">
            ENTERPRISE DELEGATED ACCESS
          </Badge>
        </div>

        {/* Invite Member Form */}
        <form onSubmit={handleInviteMember} className="p-4 rounded-[8px] bg-bg-void border border-border-hairline space-y-3 font-mono text-xs">
          <div className="font-semibold text-text-primary flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-accent-scan" />
            <span>Invite Team Member by Email</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="developer@protocol.io"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                prefix={<Mail className="h-3.5 w-3.5 text-text-muted" />}
                required
                className="h-9 text-xs"
              />
            </div>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Add Member
            </Button>
          </div>

          {feedback && (
            <div className="p-2 rounded bg-accent-scan/10 border border-accent-scan/30 text-accent-scan text-[11px]">
              {feedback}
            </div>
          )}
        </form>

        {/* Team Members List */}
        <div className="space-y-3 font-mono text-xs">
          <div className="text-text-muted uppercase text-[10px] tracking-wider font-semibold">
            Active Organization Members ({org?.users?.length || 1})
          </div>

          <div className="space-y-2">
            {(org?.users?.length
              ? org.users
              : user
              ? [{ id: user.id, name: user.name || "User", email: user.email, role: user.role || "CLIENT" }]
              : []
            ).map((member: any, idx: number) => (
              <div
                key={member.id || idx}
                className="p-3 rounded-[6px] bg-bg-void border border-border-hairline flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-text-primary font-bold">{member.name}</div>
                  <div className="text-[11px] text-text-muted">{member.email}</div>
                </div>

                <Badge severity="resolved" size="sm">
                  {member.role || "CLIENT"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
