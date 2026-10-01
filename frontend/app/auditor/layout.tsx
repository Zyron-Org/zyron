import type { Metadata } from "next";
import { AuditorSidebar } from "@/components/auditor-sidebar";
import { AuditorHeader } from "@/components/auditor-header";
import { AuditorContentWrapper } from "@/components/auditor-content-wrapper";
import { SidebarProvider } from "@/components/ui/sidebar-context";
import { RequireAuth } from "@/components/require-auth";

export const metadata: Metadata = {
  title: "Auditor Workspace — Zyron Protocol Security",
  description: "Internal diagnostic ticket queue, dual-pane code review, and vulnerability triage.",
};

export default function AuditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth allowedRoles={["AUDITOR", "ADMIN"]}>
      <SidebarProvider>
        <div className="min-h-screen h-screen bg-bg-void flex text-text-primary selection:bg-accent-scan/20 selection:text-accent-scan overflow-hidden p-1 sm:p-1.5 lg:p-2 gap-1.5 lg:gap-2">
          {/* Auditor Side Navigation (Desktop Fixed & Mobile Drawer) */}
          <AuditorSidebar />

          {/* Floating White Content Section with Rounded Border and Light Border */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-bg-panel border border-border-hairline/80 rounded-2xl shadow-xs overflow-hidden relative">
            <AuditorHeader />
            <AuditorContentWrapper>
              {children}
            </AuditorContentWrapper>
          </div>
        </div>
      </SidebarProvider>
    </RequireAuth>
  );
}
