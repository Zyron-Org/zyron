import type { Metadata } from "next";
import { PortalSidebar } from "@/components/portal-sidebar";
import { PortalHeader } from "@/components/portal-header";
import { SidebarProvider } from "@/components/ui/sidebar-context";
import { RequireAuth } from "@/components/require-auth";

export const metadata: Metadata = {
  title: "Client Portal — Zyron Protocol Security",
  description: "Client audit oversight, live pipeline tracker, and cryptographic document vault.",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth allowedRoles={["CLIENT", "ADMIN"]}>
      <SidebarProvider>
        <div className="min-h-screen bg-bg-void flex text-text-primary selection:bg-accent-scan/20 selection:text-accent-scan">
          {/* Side Navigation (Desktop Fixed & Mobile Drawer) */}
          <PortalSidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <PortalHeader />
            <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </RequireAuth>
  );
}
