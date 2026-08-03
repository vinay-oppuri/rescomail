"use client";

import {
  FileText,
  LayoutDashboard,
  Mail,
  Settings,
  Plus,
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
  useSidebar,
} from "@repo/ui/components/sidebar";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import { ThemeToggle } from "@/modules/home/ui/components/home-navbar";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Resumes", href: "/dashboard/resumes", icon: FileText },
  { name: "ATS Analysis", href: "/dashboard/ats", icon: Target },
  { name: "Cold Emails", href: "/dashboard/emails", icon: Mail },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const DashboardSidebar = ({ creditsSlot }: { creditsSlot?: React.ReactNode }) => {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <Sidebar className="font-mono border-r border-border/50 bg-sidebar/80 backdrop-blur-xl ">
      <SidebarHeader className="h-16 border-b border-border/50 px-6 flex flex-row items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-custom p-1 rounded-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-custom text-white font-bold transition-all hover:shadow-[inset_0_0_10px_rgba(255,255,255,0.4)]">
              R
            </div>
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
        <div className="p-0.5 mx-2 bg-custom rounded-md">
          <Button
            className="h-9! w-full bg-custom/80! text-white justify-start gap-2 transition-all hover:shadow-[inset_0_0_10px_rgba(255,255,255,0.4)] "
            size="sm"
            asChild
            onClick={() => {
              if (isMobile) setOpenMobile(false);
            }}
          >
            <Link href="/dashboard/resumes">
              <Plus className="h-4 w-4" />
              <span className="text-xs font-semibold">Upload Resume</span>
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
                      "h-10 px-3 py-2 rounded-sm transition-all duration-200",
                      pathname === item.href
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
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
                      <span className={cn("text-xs", pathname === item.href ? "font-bold" : "font-medium")}>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 gap-4">
        <div>{creditsSlot}</div>
        <div className="rounded-xl border border-border/50 bg-muted/30 p-2 shadow-sm transition-colors hover:bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-background/40 shadow-sm border border-border/50">
                <Settings className="h-4 w-4 text-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">Theme</span>
                <span className="text-[10px] text-muted-foreground">Appearance</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
