"use client";

import Link from "next/link";
import { FileText, Mail, Search, Target } from "lucide-react";
import { Button, CommandDialog, CommandGroup, CommandInput, CommandItem, CommandList } from "@repo/ui";
import { SidebarTrigger } from "@repo/ui/components/sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DashboardUserProfile } from "./dashboard-user-profile";

const commands = [
  { label: "Manage resumes", href: "/dashboard/resumes", icon: FileText },
  { label: "Run an ATS analysis", href: "/dashboard/ats", icon: Target },
  { label: "Generate a cold email", href: "/dashboard/emails", icon: Mail },
] as const;

const DashboardNavbar = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <SidebarTrigger className="transition-colors hover:bg-muted/50" />
        <Link href="/dashboard" className="font-semibold md:hidden p-0.5 bg-custom/80 rounded-md text-sm text-white">
          <span className="bg-custom h-7 w-7 flex items-center justify-center rounded-sm">R</span>
        </Link>
        <div className="flex flex-1">
          <Button
            variant="outline"
            className="h-8! sm:h-9! w-full max-w-xs justify-start rounded-sm text-xs text-muted-foreground flex"
            onClick={() => setOpen(true)} 
          >
            <Search className="mr-2 h-4 w-4" />
            Open a tool
            <kbd className="hidden sm:block ml-auto rounded border px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd>
          </Button>
        </div>
        <DashboardUserProfile />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search tools..." />
        <CommandList>
          <CommandGroup heading="Tools">
            {commands.map((command) => (
              <CommandItem
                key={command.href}
                onSelect={() => {
                  setOpen(false);
                  router.push(command.href);
                }}
              >
                <command.icon className="mr-2 h-4 w-4" />
                {command.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
};

export default DashboardNavbar;
