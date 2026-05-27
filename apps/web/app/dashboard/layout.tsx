import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import DashboardNavbar from "@/modules/dashboard/ui/components/dashboard-navbar";
import DashboardSidebar from "@/modules/dashboard/ui/components/dashboard-sidebar";
import DashboardCredits from "@/modules/dashboard/ui/components/dashboard-credits";

interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen w-full bg-background font-sans antialiased">
      <SidebarProvider>
        <DashboardSidebar
          creditsSlot={
            <Suspense fallback={<div className="h-24 rounded-none bg-primary/5 animate-pulse" />}>
              <DashboardCredits userId={session.user.id} />
            </Suspense>
          }
        />
        <SidebarInset>
          <DashboardNavbar />
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
