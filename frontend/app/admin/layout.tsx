import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { SidebarProvider } from "@/components/ui/sidebar-context";
import { RequireAuth } from "@/components/require-auth";

export const metadata = {
  title: "Platform Administration // Zyron Security Labs",
  description: "User & Role Governance and Global Ticket Oversight",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth allowedRoles={["ADMIN"]}>
      <SidebarProvider>
        <div className="min-h-screen bg-bg-void text-text-primary flex">
          {/* Admin Sidebar (Desktop Fixed & Mobile Drawer) */}
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader />
            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </RequireAuth>
  );
}
