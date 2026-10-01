"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AuditorContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Strip out layout padding on dual-pane review workspace to maximize usable screen real estate
  const isReviewPage = pathname?.includes("/auditor/review");

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto",
        isReviewPage ? "p-1 sm:p-1.5" : "p-4 sm:p-6 md:p-8"
      )}
    >
      {children}
    </div>
  );
}
