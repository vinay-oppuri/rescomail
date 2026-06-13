"use client";

import { Button } from "@repo/ui/components/button";
import { Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import { DashboardUserProfile } from "./dashboard-user-profile";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui";
import { useState, useEffect } from "react";

const DashboardNavbar = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-none bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="hover:bg-muted/50 transition-colors" />
          <div className="h-6 w-px bg-border/50 mx-1 md:hidden" />
          <div className="md:hidden flex h-7 w-7 items-center justify-center rounded-sm bg-foreground text-background font-bold text-sm shadow-md">
            R
          </div>
        </div>

        <div className="flex flex-1 items-center gap-4 md:gap-8">
          <Button
            variant="outline"
            className="hidden md:flex relative h-9 w-full justify-start rounded-[0.5rem] bg-background/50 text-sm text-muted-foreground sm:pr-12 md:max-w-sm shadow-sm border-border/50"
            onClick={() => setOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search applications...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Notification />
          <div className="h-6 w-px bg-border/50 mx-1 hidden sm:block" />
          <DashboardUserProfile />
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Resumes">
            <CommandItem>Software Engineer Resume</CommandItem>
            <CommandItem>Frontend Developer Resume</CommandItem>
          </CommandGroup>
          <CommandGroup heading="ATS Analysis">
            <CommandItem>Google SWE Application</CommandItem>
            <CommandItem>Meta Frontend Application</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Tracked Jobs">
            <CommandItem>Senior React Developer - Netflix</CommandItem>
            <CommandItem>Full Stack Engineer - Vercel</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
};

export default DashboardNavbar;


const Notification = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative" >
        <span className="absolute -top-2 -right-2 flex h-3 w-3 items-center justify-center rounded-full text-[10px] font-semibold text-yellow-600 bg-yellow-600/20">
          3
        </span>
        <Bell className="h-4 w-4 text-muted-foreground transition-transform group-hover:rotate-12 group-hover:text-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col p-1 gap-2 w-64 mt-4">
        <h1 className="text-xs font-medium p-2">Notifications</h1>
        <div className="min-h-16 flex flex-col items-start text-[10px] text-muted-foreground px-2 pb-2 gap-2">
          <p>No notifications</p>
        </div>
        <Button size="xs" variant="link" className="ml-auto text-[10px]">Mark all as read</Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
export { Notification }