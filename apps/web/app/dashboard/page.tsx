import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar"
import DashboardNavbar from "@/modules/dashboard/ui/components/dashboard-navbar"
import DashboardSidebar from "@/modules/dashboard/ui/components/dashboard-sidebar"
import DashboardView from "@/modules/dashboard/ui/views/dashboard-view"
import { auth } from "@repo/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const Page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect("/login")
    }

    return (
        <SidebarProvider>
            <DashboardSidebar />
            <SidebarInset>
                <DashboardNavbar />
                <main className="flex-1 p-6">
                    <DashboardView />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
export default Page
