"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, Plus, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api-client";

export default function TrackIndexPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [hasNoAudits, setHasNoAudits] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    apiClient
      .get("/audits")
      .then((res) => {
        if (!isMounted) return;
        const audits = Array.isArray(res.data) ? res.data : [];
        const inFlight = audits.find((a: any) => {
          const s = (a.stage || "").toUpperCase();
          return ["PENDING", "SCANNING", "IN_REVIEW", "CORRECTIONS_REQUESTED"].includes(s);
        });

        if (inFlight) {
          router.replace(`/portal/track/${inFlight.id}`);
        } else if (audits.length > 0) {
          router.replace(`/portal/track/${audits[0].id}`);
        } else {
          setHasNoAudits(true);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasNoAudits(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3 font-sans">
        <Loader2 className="h-8 w-8 text-accent-scan animate-spin" />
        <span className="text-sm font-medium text-text-muted">
          Checking active engagements...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <EmptyState
        icon={Radio}
        badge="Real-Time Telemetry"
        title="No Active Engagements to Track"
        description="You currently do not have any active or in-flight smart contract audit engagements. Submit a new audit request to initiate real-time security tracking and auditor triage."
        primaryAction={{
          label: "Submit Audit Request",
          href: "/portal/new-request",
          icon: <Plus className="h-4 w-4" />,
        }}
        secondaryAction={{
          label: "Explore Demo Tracker",
          href: "/portal/track/ZYR-9481",
          icon: <ExternalLink className="h-4 w-4" />,
        }}
      />
    </div>
  );
}
