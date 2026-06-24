import { Suspense } from "react";
import type { Metadata } from "next";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, userPreferences } from "@repo/db";
import { eq } from "drizzle-orm";
import { hasUsableSecret } from "@/lib/server/secrets";

import DashboardNavbar from "@/modules/dashboard/ui/components/dashboard-navbar";
import DashboardSidebar from "@/modules/dashboard/ui/components/dashboard-sidebar";
import DashboardCredits from "@/modules/dashboard/ui/components/dashboard-credits";

interface Props {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const Layout = async ({ children }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const existingPrefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, session.user.id),
  });
  
  const hasApiKey = hasUsableSecret(existingPrefs?.geminiApiKey);

  return (
    <div className="min-h-screen w-full bg-background font-sans antialiased">
      <SidebarProvider>
        <DashboardSidebar
          creditsSlot={
            <Suspense
              fallback={
                <div className="h-24 bg-primary/5 animate-pulse" />
              }
            >
              <DashboardCredits userId={session.user.id} />
            </Suspense>
          }
        />
        <SidebarInset>
          <DashboardNavbar />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
