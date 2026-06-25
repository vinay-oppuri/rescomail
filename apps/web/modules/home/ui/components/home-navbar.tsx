"use client";

import { Button } from "@repo/ui/components/button";
import { Menu, Moon, Sun, X, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import { useTheme } from "next-themes";
import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import AuthDialog from "@/modules/auth/ui/auth-dialog";

const navLinks = [
  { name: "Features", path: "/#features" },
  { name: "FAQ", path: "/#faq" },
  { name: "Docs", path: "/docs" }
];

const HomeNavbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

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
        <motion.div
          animate={{
            y: isScrolled ? 0 : 4,
            scale: isScrolled ? 0.95 : 1,
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "pointer-events-auto flex items-center justify-between w-full max-w-xl sm:max-w-2xl h-14 px-3 sm:px-4 rounded-full",
            "bg-background/80 backdrop-blur-md border border-foreground/5 shadow-lg transition-all duration-300"
          )}
        >
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" onClick={handleLogoClick} className="inline-flex items-center gap-2 group">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background font-bold text-sm transition-transform duration-300 group-hover:scale-105">
                R
              </span>
              <span className="text-sm sm:text-base font-semibold tracking-tight text-foreground hover:text-muted-foreground transition-colors">
                Rescomail
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
            <AuthDialog className="hidden md:flex rounded-full h-8 px-4 text-xs font-medium" />

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
        </motion.div>
      </header>

      {/* Mobile drawer menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-21 left-4 right-4 z-40 p-4 rounded-3xl bg-background/80 backdrop-blur-2xl border border-black/8 dark:border-white/10 shadow-2xl flex flex-col gap-4 sm:hidden"
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="block px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="w-full flex flex-col">
              <AuthDialog className="w-full rounded-2xl h-11 text-sm font-medium justify-center" />
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
      className="rounded-full h-8 w-8 text-foreground hover:bg-black/5 dark:hover:bg-white/5"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 dark:hidden" />
      <Moon className="h-4 w-4 hidden dark:block" />
    </Button>
  );
};

export { ThemeToggle };
