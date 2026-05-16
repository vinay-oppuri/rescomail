"use client"

import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import { Bell, Search, User } from "lucide-react"
import { SidebarTrigger } from "@repo/ui/components/sidebar"

const DashboardNavbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="hover:bg-muted" />
          <div className="h-6 w-px bg-border mx-1 md:hidden" />
          <div className="md:hidden flex h-8 w-8 items-center justify-center rounded-none bg-primary text-primary-foreground font-bold text-xs">
            R
          </div>
        </div>

        <div className="flex flex-1 items-center gap-4 md:gap-8">
          <form className="hidden md:flex flex-1 max-w-sm relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input 
              placeholder="Search applications..." 
              className="h-9 rounded-none border-border bg-muted/30 pl-9 transition-colors focus-visible:bg-muted/50 focus-visible:ring-1"
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-none hover:bg-muted group">
            <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
          </Button>
          <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
          <Button variant="ghost" size="sm" className="gap-2 rounded-none px-2 hover:bg-muted transition-colors">
            <div className="h-7 w-7 bg-primary/10 flex items-center justify-center rounded-none border border-primary/20">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden sm:inline-block font-bold text-[10px] uppercase">Account</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default DashboardNavbar

