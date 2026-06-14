"use client";

import { Button } from "@repo/ui/components/button";
import { Bell, Search, Loader2, Briefcase } from "lucide-react";
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
import { GetJobNotificationsAction, MarkNotificationsAsReadAction, type JobNotification } from "../../server/actions";
import Link from "next/link";

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
            className="hidden md:flex relative h-8! w-full justify-start rounded-sm bg-muted/60 text-xs text-muted-foreground sm:pr-12 md:max-w-xs shadow-sm border-foreground/5"
            onClick={() => setOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search applications...</span>
            <kbd className="pointer-events-none absolute right-1.5 hidden h-5 select-none items-center gap-1 rounded-sm border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
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
  const [jobs, setJobs] = useState<JobNotification[] | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const fetchJobs = async () => {
    try {
      const result = await GetJobNotificationsAction();
      if (result.needsSetup) {
        setNeedsSetup(true);
        setJobs(null);
        setUnreadCount(0);
      } else if (result.jobs) {
        setJobs(result.jobs);
        setUnreadCount(result.unreadCount || 0);
        setNeedsSetup(false);
      }
    } catch (e) {
      console.error("Failed to fetch jobs", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    window.addEventListener("preferences-updated", fetchJobs);
    return () => window.removeEventListener("preferences-updated", fetchJobs);
  }, []);

  const handleOpenChange = async (open: boolean) => {
    if (open && unreadCount > 0) {
      setUnreadCount(0);
      try {
        await MarkNotificationsAsReadAction();
      } catch (e) {
        console.error("Failed to mark notifications as read", e);
      }
    }
  };

  const displayedJobs = jobs ? jobs.slice(0, 5) : [];

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger className="relative group outline-hidden">
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-semibold text-primary-foreground bg-primary shadow-sm border border-background animate-pulse">
            {unreadCount}
          </span>
        )}
        <Bell className="h-4 w-4 text-muted-foreground transition-transform group-hover:rotate-12 group-hover:text-foreground outline-hidden" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col p-1 gap-1 w-80 mt-4 rounded-sm shadow-lg bg-card/80 backdrop-blur-md border-foreground/5">
        <div className="flex items-center justify-between p-2 border-b border-border/50">
          <h1 className="text-xs font-semibold text-foreground">Job Matches</h1>
          {unreadCount > 0 && <span className="text-[10px] text-muted-foreground">{unreadCount} new</span>}
        </div>
        
        <div className="min-h-16 flex flex-col items-stretch text-[10px] text-muted-foreground px-1 pb-1 gap-1 max-h-[60vh] overflow-y-auto no-scrollbar pt-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : needsSetup ? (
            <div className="flex flex-col items-center justify-center text-center p-4 gap-2">
              <p>Set up your profile to get automated job matches.</p>
              <Link href="/settings" className="text-primary hover:underline font-medium">Go to Settings</Link>
            </div>
          ) : displayedJobs.length > 0 ? (
            displayedJobs.map((job) => {
              const content = (
                <div className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer border border-transparent hover:border-border/50">
                  <div className="mt-0.5 flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary shrink-0">
                    <Briefcase className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col flex-1 gap-0.5 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-medium text-foreground truncate">{job.title}</span>
                      {!job.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground flex justify-between truncate">
                      {job.company} • {job.location}
                    </span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[9px] font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm shrink-0">{job.matchScore}% Match</span>
                      <span className="text-[9px] text-muted-foreground shrink-0">{job.timeAgo}</span>
                    </div>
                  </div>
                </div>
              );

              return job.url ? (
                <a key={job.id} href={job.url} target="_blank" rel="noopener noreferrer" className="block">
                  {content}
                </a>
              ) : (
                <div key={job.id}>{content}</div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <p>No job matches found yet.</p>
            </div>
          )}
        </div>
        <div className="p-1 border-t border-border/50 mt-1">
          <Link href="/dashboard/notifications" className="block w-full">
            <Button size="xs" variant="ghost" className="w-full text-[10px] h-7 text-muted-foreground hover:text-foreground">
              Show all matches
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export { Notification };