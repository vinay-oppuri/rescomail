"use client";

import { Button } from "@repo/ui/components/button";
import { LogIn, Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";

const HomeNavbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Docs", path: "/docs" },
    { name: "Features", path: "/#features" },
    { name: "Pricing", path: "/#pricing" },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="mx-auto w-full max-w-6xl px-6 md:px-0 py-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center border bg-foreground font-heading text-xs md:text-sm text-primary-foreground">
            R
          </span>
          <h1 className="text-lg md:text-2xl font-bold">Rescomail</h1>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center fixed top-0 left-1/2 -translate-x-1/2">
          <div
            className="flex items-center gap-8 px-14 py-4 bg-foreground backdrop-blur-md text-sm text-background"
            style={{ clipPath: "polygon(0 0, 100% 0, 92% 100%, 8% 100%)" }}
          >
            {navLinks.map((link) => (
              <Link key={link.name} href={link.path} className="group relative flex flex-col font-semibold transition-colors">
                {link.name}
                <div className="absolute -bottom-1 left-0 h-1 w-full scale-x-0 origin-center bg-background transition-transform duration-200 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button asChild className="gap-2 px-3 text-sm bg-foreground! text-background!">
            <Link href="/login">
              <LogIn className="h-4 w-4" /> Login
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        {/* Mobile actions */}
        <div 
          className="absolute right-0 top-0 flex md:hidden items-center gap-1 pl-6 pr-2 py-2 bg-foreground backdrop-blur-md"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 25% 100%)" }}
        >
          <ThemeToggle iconClassName="text-background!" />
          <div className="bg-muted-foreground h-7 w-px"/>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-background/20 px-5!"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5 text-background!" /> : <Menu className="h-5 w-5 text-background!" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t pb-4 flex flex-col gap-3 pt-4 mt-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className="text-sm font-medium px-1 py-1 hover:text-primary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Button asChild className="gap-2 mt-2 w-full text-sm">
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <LogIn className="h-4 w-4" /> Login
            </Link>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default HomeNavbar;

const ThemeToggle = ({ iconClassName }: { iconClassName?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className="px-5!"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className={`h-5 w-5 dark:hidden ${iconClassName || 'text-foreground!'}`} />
      <Moon className={`hidden h-5 w-5 dark:block ${iconClassName || 'text-foreground!'}`} />
    </Button>
  );
};
