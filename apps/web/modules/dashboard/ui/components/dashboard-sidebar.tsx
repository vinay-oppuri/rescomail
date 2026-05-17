"use client"

import {
  Briefcase,
  FileText,
  LayoutDashboard,
  Mail,
  Settings,
  Plus,
  Sparkles,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@repo/ui/components/sidebar"
import { Button } from "@repo/ui/components/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@repo/ui/lib/utils"
import { signOut } from "@repo/auth/client"

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Resumes", href: "/dashboard/resumes", icon: FileText },
  { name: "Job Tracker", href: "/dashboard/applications", icon: Briefcase },
  { name: "Cold Emails", href: "/dashboard/emails", icon: Mail },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const DashboardSidebar = () => {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar/50 backdrop-blur-xl">
      <SidebarHeader className="h-16 border-b border-sidebar-border px-6 flex flex-row items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-none bg-primary text-primary-foreground font-bold transition-colors group-hover:bg-primary/90">
            R
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight leading-none">Rescomail</span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase opacity-70">AI Copilot</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="p-4 gap-6">
        <div className="px-2">
          <Button className="h-10 w-full justify-start gap-2 rounded-none transition-colors" size="sm">
            <Plus className="h-4 w-4" />
            <span>New Application</span>
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground/70 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "h-10 rounded-none px-3 py-2 transition-colors",
                      pathname === item.href 
                        ? "bg-primary/10 text-primary hover:bg-primary/15" 
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className={cn("h-4 w-4 transition-colors", pathname === item.href ? "text-primary" : "text-muted-foreground/70")} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6">
        <div className="relative mb-4 overflow-hidden rounded-none border border-primary/10 bg-primary/5 p-4">
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-primary uppercase tracking-wider">AI Credits</p>
            <span className="rounded-none bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">75%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-none bg-primary/10">
            <div className="h-full w-3/4 rounded-none bg-primary transition-all duration-1000 ease-out" />
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-[10px] text-muted-foreground font-medium">25 credits left</p>
            <Link href="/dashboard/billing" className="text-[10px] text-primary font-bold hover:underline underline-offset-4">Upgrade</Link>
          </div>
        </div>
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()} 
              className="h-11 w-full justify-start gap-3 rounded-none px-3 font-medium text-muted-foreground transition-colors hover:bg-destructive/5 hover:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default DashboardSidebar
