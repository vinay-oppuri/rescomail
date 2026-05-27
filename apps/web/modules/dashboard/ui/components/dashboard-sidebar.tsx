"use client";

import {
  Briefcase,
  FileText,
  LayoutDashboard,
  Mail,
  Settings,
  Plus,
  LogOut,
  Target,
} from "lucide-react";

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
} from "@repo/ui/components/sidebar";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import { signOut } from "@repo/auth/client";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Resumes", href: "/dashboard/resumes", icon: FileText },
  { name: "ATS Analysis", href: "/dashboard/ats", icon: Target },
  { name: "Job Tracker", href: "/dashboard/applications", icon: Briefcase },
  { name: "Cold Emails", href: "/dashboard/emails", icon: Mail },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const DashboardSidebar = ({ creditsSlot }: { creditsSlot?: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar/80 backdrop-blur-xl rounded-none">
      <SidebarHeader className="h-16 border-b border-border/50 px-6 flex flex-row items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-none bg-foreground text-background font-bold shadow-md transition-all group-hover:scale-105">
            <span className="text-base">R</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-extrabold text-lg tracking-tight leading-none text-foreground">
              Rescomail
            </span>
            <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground">
              AI Copilot
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-4 gap-6">
        <div className="px-2">
          <Button
            className="h-10 w-full justify-start gap-2 rounded-none transition-all shadow-md shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5"
            size="sm"
            asChild
          >
            <Link href="/dashboard/applications">
              <Plus className="h-4 w-4" />
              <span className="font-semibold">New Application</span>
            </Link>
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "h-10 rounded-none px-3 py-2 transition-all duration-200",
                      pathname === item.href
                        ? "bg-primary/10 text-primary border-l-2 border-primary font-semibold"
                        : "text-muted-foreground border-l-2 border-transparent hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          pathname === item.href
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      <span className={cn("text-sm", pathname === item.href ? "font-bold" : "font-medium")}>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 space-y-4">
        {creditsSlot}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              className="h-10 w-full justify-start gap-3 rounded-none px-3 font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-semibold">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
