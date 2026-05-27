"use client";

import { Button } from "@repo/ui/components/button";
import { LogIn, Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";

const HomeNavbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Features", path: "#features" },
    { name: "Pricing", path: "#pricing" },
    { name: "About", path: "#about" },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="mx-auto w-full max-w-6xl px-6 md:px-0 py-2">
      {/* Top bar */}
      <div className="flex items-center justify-between py-3">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center border bg-primary font-heading text-xs md:text-sm text-primary-foreground">
            R
          </span>
          <h1 className="text-lg md:text-2xl font-bold">Rescomail</h1>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.path} className="group flex flex-col">
              {link.name}
              <div className="h-0.5 w-full scale-x-0 origin-left bg-primary transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button asChild className="gap-2 px-3 text-sm">
            <Link href="/login">
              <LogIn className="h-4 w-4" /> Login
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        {/* Mobile actions */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t pb-4 flex flex-col gap-3 pt-4">
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

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
    </Button>
  );
};
