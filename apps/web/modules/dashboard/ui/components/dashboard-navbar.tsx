"use client";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import { DashboardUserProfile } from "./dashboard-user-profile";

const DashboardNavbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-none bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="hover:bg-muted/50 transition-colors" />
          <div className="h-6 w-px bg-border/50 mx-1 md:hidden" />
          <div className="md:hidden flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm shadow-md">
            R
          </div>
        </div>

        <div className="flex flex-1 items-center gap-4 md:gap-8">
          <form className="hidden md:flex flex-1 max-w-sm relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search applications..."
              className="h-9 border-border/50 bg-background/50 pl-9 text-sm transition-all focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/50 shadow-sm"
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted/50 group transition-colors"
          >
            <Bell className="h-4 w-4 text-muted-foreground transition-transform group-hover:rotate-12 group-hover:text-foreground" />
          </Button>
          <div className="h-6 w-px bg-border/50 mx-1 hidden sm:block" />
          <DashboardUserProfile />
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
