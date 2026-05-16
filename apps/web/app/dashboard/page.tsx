import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar"
import DashboardNavbar from "@/modules/dashboard/ui/components/dashboard-navbar"
import DashboardSidebar from "@/modules/dashboard/ui/components/dashboard-sidebar"
import DashboardView from "@/modules/dashboard/ui/views/dashboard-view"

const Page = () => {
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
