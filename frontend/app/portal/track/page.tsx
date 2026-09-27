"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandingButton } from "@/components/ui/expanding-button";
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
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="h-8 w-8 text-accent-scan animate-spin" />
        <span className="text-sm font-medium text-text-muted">
          Checking active engagements...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-6">
      <div className="p-1 rounded-2xl bg-[#F2F4F7] dark:bg-bg-void/60 border border-[#E2E6EC] dark:border-border-hairline shadow-xs">
        <div className="rounded-xl bg-white dark:bg-bg-panel border border-[#E8ECF1] dark:border-border-hairline/60 p-8 sm:p-12 space-y-4 shadow-xs">
          <div className="h-12 w-12 rounded-full bg-accent-scan/10 text-accent-scan mx-auto flex items-center justify-center">
            <Radio className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">
              No Active Engagements to Track
            </h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
              You currently do not have any active or in-flight smart contract audit engagements. Submit a new audit request to initiate real-time security tracking.
            </p>
          </div>
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Link href="/portal">
              <Button variant="secondary" size="md" className="rounded-xl">
                Return to Dashboard
              </Button>
            </Link>
            <Link href="/portal/new-request">
              <ExpandingButton variant="accent" rounded="xl" size="md" icon={<Plus className="h-4 w-4" />}>
                Submit Audit Request
              </ExpandingButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
