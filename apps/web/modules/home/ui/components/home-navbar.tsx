"use client";

import { Button } from "@repo/ui/components/button";
import { Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import { useTheme } from "next-themes";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import AuthDialog from "@/modules/auth/ui/auth-dialog";

const navLinks = [
  { name: "Features", path: "/#features" },
  { name: "FAQ", path: "/#faq" },
  { name: "Docs", path: "/docs" }
];

const HomeNavbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Desktop & Mobile Floating Header Container */}
      <header className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div
          className={cn(
            "pointer-events-auto flex items-center justify-between w-full max-w-xl sm:max-w-3xl h-14 px-3 sm:px-4 rounded-lg",
            "bg-background/80 backdrop-blur-md border border-foreground/5 shadow-lg transition-all duration-300"
          )}
        >
          {/* Left: Logo */}
          <div className="flex items-center md:-ml-1">
            <Link href="/" onClick={handleLogoClick} className="inline-flex items-center gap-2 group">
              <div className="bg-custom p-1 rounded-md">
                <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-custom/80 text-white font-bold text-sm transition-transform duration-300 group-hover:shadow-[inset_0_0_10px_rgba(255,255,255,0.4)]">
                  R
                </span>
              </div>
              <span className="text-sm sm:text-base font-semibold tracking-tight text-foreground hover:text-muted-foreground transition-colors">
                Rescomail
              </span>
              <span className="border border-foreground/20 p-1 ml-1 rounded-sm text-[9px]">
                beta
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-6">
            <ul className="flex items-center gap-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors relative py-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <div className="h-5 w-px bg-black/8 dark:bg-white/10 hidden sm:block" />
            <AuthDialog className="hidden md:flex rounded-md h-8 px-4 text-xs font-medium" />

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full sm:hidden h-8 w-8 text-foreground"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile drawer menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-21 left-4 right-4 z-40 p-4 rounded-2xl bg-background/80 backdrop-blur-md border border-foreground/5 shadow-2xl flex flex-col gap-4 sm:hidden"
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="block px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="w-full flex flex-col">
              <AuthDialog className="w-full rounded-lg h-10 text-sm font-medium justify-center" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HomeNavbar;

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full h-8 w-8 text-primary/80 hover:bg-black/5 dark:hover:bg-white/5"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 dark:hidden" />
      <Moon className="h-4 w-4 hidden dark:block" />
    </Button>
  );
};

export { ThemeToggle };
