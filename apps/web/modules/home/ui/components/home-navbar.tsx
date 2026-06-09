"use client";

import { Button } from "@repo/ui/components/button";
import { Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";
import {
  motion,
  AnimatePresence,
  useTransform,
  useSpring,
  useScroll,
} from "motion/react";
import AuthDialog from "@/modules/auth/ui/auth-dialog";

const SCROLL_THRESHOLD = 150;

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Docs", path: "/docs" },
  { name: "Features", path: "/#features" },
  { name: "Privacy", path: "/docs#privacy" }
];

const HomeNavbar = () => {

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { scrollY } = useScroll();
  const rawProgress = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0, 1]);
  const progress = useSpring(rawProgress, { stiffness: 60, damping: 20, mass: 1 });

  const pillOpacity = useTransform(progress, [0, 0.4], [1, 0]);
  const pillY = useTransform(progress, [0, 0.5], [0, -12]);
  const logoOpacity = useTransform(progress, [0, 0.3], [1, 0]);
  const actionsOpacity = useTransform(progress, [0, 0.3], [1, 0]);
  const menuOpacity = useTransform(progress, [0.3, 0.8], [0, 1]);
  const menuScale = useTransform(progress, [0.3, 0.8], [0.8, 1]);

  return (
    <>
      {/* ── DESKTOP ── */}
      {/* Outer nav: only holds logo (left) and actions (right), constrained to max-w-6xl */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block pt-5">

        {/* Logo — left-anchored inside the max-width container */}
        <div className="mx-auto max-w-6xl px-6 md:px-0 flex items-center justify-between">
          <motion.div style={{ opacity: logoOpacity }}>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm border bg-foreground font-heading text-sm text-primary-foreground">
                R
              </span>
              <h1 className="text-2xl font-bold">Rescomail</h1>
            </Link>
          </motion.div>

          {/* Right actions */}
          <motion.div style={{ opacity: actionsOpacity }} className="flex items-center gap-3">
            <AuthDialog />
            <ThemeToggle />
          </motion.div>
        </div>

        {/* 
          Nav pill & compact pill: both absolutely centered on the full viewport,
          NOT constrained by the max-width container. 
          We use a separate fixed layer for these.
        */}
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">

          {/* Unscrolled: centered nav pill — fixed to true viewport top-0 center */}
          <motion.div
            style={{ opacity: pillOpacity, y: pillY }}
            className="pointer-events-auto"
          >
            <div
              className="flex items-center gap-8 px-14 py-4 bg-foreground text-sm text-background font-semibold"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, calc(100% - 30px) calc(100% - 15px), calc(100% - 36px) calc(100% - 7px), calc(100% - 41px) calc(100% - 2px), calc(100% - 45px) 100%, 45px 100%, 41px calc(100% - 2px), 36px calc(100% - 7px), 30px calc(100% - 15px))",
              }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className="group relative flex flex-col transition-colors"
                >
                  {link.name}
                  <div className="absolute -bottom-1 left-0 h-1 w-full scale-x-0 origin-center bg-background transition-transform duration-200 group-hover:scale-x-100" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Scrolled: compact pill — fades in, centered */}
          <motion.div
            style={{ opacity: menuOpacity, scale: menuScale }}
            className="pointer-events-auto fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center bg-muted/80 backdrop-blur-sm text-foreground text-sm rounded-md shadow-lg border border-border/50">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 p-4 py-[11px]">
                <span className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-foreground font-heading text-[10px] font-bold text-background">
                  R
                </span>
                <span className="pl-2 font-bold text-sm">Rescomail</span>
              </Link>

              {/* Menu trigger */}
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="px-4 py-[11px] hover:bg-muted transition-colors cursor-pointer"
                aria-label="Navigation menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {menuOpen ? (
                    <motion.span
                      key="x"
                      initial={{ rotate: -45, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 45, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="block"
                    >
                      <X className="h-4 w-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ rotate: 45, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -45, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="block"
                    >
                      <Menu className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Login + theme */}
              <div className="flex items-center gap-2 p-4 py-[11px]">
                <AuthDialog />
              </div>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-muted/80 backdrop-blur-sm text-foreground rounded-sm overflow-hidden min-w-36 shadow-lg"
                >
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.path}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center px-5 py-3 text-sm font-medium hover:bg-background/10 transition-colors border-b border-background/10 last:border-0"
                    >
                      {link.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </nav>

      {/* ── MOBILE ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-sm">
        <div className="mx-auto w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-sm border bg-foreground font-heading text-xs text-primary-foreground">
                R
              </span>
              <h1 className="text-lg font-bold">Rescomail</h1>
            </Link>
            <div
              className="absolute right-0 top-0 flex items-center gap-1 pl-6 pr-2 py-2 bg-foreground"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% 100%, 40% 100%, 33% 99.5%, 28% 97.5%, 24% 93%, 21% 85%, 16% 65%, 10% 40%)",
              }}
            >
              <ThemeToggle iconClassName="text-background!" />
              <div className="bg-muted-foreground h-7 w-px" />
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-background/20 px-5!"
                aria-label="Toggle menu"
                onClick={() => setMobileOpen((o) => !o)}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5 text-background!" />
                ) : (
                  <Menu className="h-5 w-5 text-background!" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile drawer */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="border-t overflow-hidden mt-4"
              >
                <div className="flex flex-col gap-3 pb-4 pt-4 bg-background">
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
                  <div className="mt-2 flex w-full [&_button]:w-full">
                    <AuthDialog />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-20" />
    </>
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
      <Sun className={`h-5 w-5 dark:hidden ${iconClassName || "text-foreground!"}`} />
      <Moon className={`hidden h-5 w-5 dark:block ${iconClassName || "text-foreground!"}`} />
    </Button>
  );
};
export { ThemeToggle };