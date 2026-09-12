import type { Metadata } from "next";
import { AuditorSidebar } from "@/components/auditor-sidebar";
import { AuditorHeader } from "@/components/auditor-header";
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
        <div className="min-h-screen bg-bg-void flex text-text-primary selection:bg-accent-scan/20 selection:text-accent-scan">
          {/* Auditor Side Navigation (Desktop Fixed & Mobile Drawer) */}
          <AuditorSidebar />

          {/* Main Auditor Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <AuditorHeader />
            <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </RequireAuth>
  );
}
