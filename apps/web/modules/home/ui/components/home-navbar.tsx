"use client";

import { Button } from "@repo/ui/components/button";
import { Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
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
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { scrollY } = useScroll();
  const rawProgress = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0, 1]);
  const progress = useSpring(rawProgress, { stiffness: 60, damping: 20, mass: 1 });

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ─── SCROLL TRANSFORMATION MAPPINGS ─── //
  const navMaxWidth = useTransform(progress, [0, 1], ["1152px", "380px"]);
  const navHeight = useTransform(progress, [0, 1], ["80px", "56px"]);
  const navPadding = useTransform(progress, [0, 1], ["0px 16px", "0px 12px"]);

  // Moves the compact pill slightly down from the screen edge when scrolled
  const navY = useTransform(progress, [0, 1], ["0px", "16px"]);
  const compactBgOpacity = useTransform(progress, [0, 1], [0, 1]);

  const linksWidth = useTransform(progress, [0, 1], ["400px", "0px"]);
  const linksOpacity = useTransform(progress, [0, 0.4], [1, 0]);
  const linksY = useTransform(progress, [0, 0.5], ["0px", "-40px"]);

  const menuWidth = useTransform(progress, [0.5, 1], ["0px", "44px"]);
  const menuOpacity = useTransform(progress, [0.6, 1], [0, 1]);

  const themeToggleWidth = useTransform(progress, [0, 0.4], ["40px", "0px"]);
  const themeToggleOpacity = useTransform(progress, [0, 0.3], [1, 0]);

  const logoIconWidth = useTransform(progress, [0, 0.4], ["40px", "0px"]);
  const logoIconOpacity = useTransform(progress, [0, 0.3], [1, 0]);

  return (
    <>
      {/* ── DESKTOP ── */}
      <div className="fixed top-0 left-0 right-0 z-50 hidden md:flex justify-center pointer-events-none">

        <motion.nav
          className="pointer-events-auto flex items-stretch justify-between relative overflow-hidden"
          style={{
            width: "100%",
            maxWidth: navMaxWidth,
            height: navHeight,
            padding: navPadding,
            y: navY,
          }}
        >
          {/* Scrolled Background Layer (Glass effect) */}
          <motion.div
            className="absolute inset-0 bg-muted/80 backdrop-blur-md border border-border/50 shadow-sm rounded-sm"
            style={{ opacity: compactBgOpacity }}
          />

          {/* Left: Logo */}
          <motion.div className="flex-1 flex items-center relative z-10">
            <Link href="/" onClick={handleLogoClick} className="inline-flex items-center pl-2">
              <motion.div
                style={{ width: logoIconWidth, opacity: logoIconOpacity }}
                className="overflow-hidden shrink-0 flex items-center justify-start"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-sm border bg-foreground font-heading text-sm text-primary-foreground shrink-0">
                  R
                </span>
              </motion.div>
              <h1 className="text-xl font-bold tracking-tight">Rescomail</h1>
            </Link>
          </motion.div>

          {/* Center: The Nav Pill (Strictly top-0) */}
          <div className="flex items-start justify-center relative z-10 flex-1">

            {/* Nav Links Container */}
            <motion.div
              style={{ width: linksWidth, opacity: linksOpacity, y: linksY }}
              className="flex items-start justify-center overflow-hidden"
            >
              <div
                className="flex items-center gap-8 px-14 py-4 bg-foreground text-sm text-background font-semibold w-max"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, calc(100% - 30px) calc(100% - 15px), calc(100% - 36px) calc(100% - 7px), calc(100% - 41px) calc(100% - 2px), calc(100% - 45px) 100%, 45px 100%, 41px calc(100% - 2px), 36px calc(100% - 7px), 30px calc(100% - 15px))",
                }}
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.path}
                    className="group relative transition-colors hover:text-background/80"
                  >
                    {link.name}
                    <div className="absolute -bottom-1 left-0 h-px w-full scale-x-0 bg-background transition-transform duration-200 group-hover:scale-x-100" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Compact Menu Trigger (Centered vertically in compact mode) */}
            <motion.div
              style={{ width: menuWidth, opacity: menuOpacity }}
              className="flex items-center justify-center h-full overflow-hidden shrink-0"
            >
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors text-foreground z-20"
              >
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </motion.div>
          </div>

          {/* Right: Actions */}
          <motion.div className="flex-1 flex items-center justify-end gap-2 relative z-10">
            <AuthDialog />
            <motion.div
              style={{ width: themeToggleWidth, opacity: themeToggleOpacity }}
              className="flex items-center justify-center overflow-hidden shrink-0"
            >
              <ThemeToggle />
            </motion.div>
          </motion.div>
        </motion.nav>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-[80px] pointer-events-auto bg-muted/90 backdrop-blur-md border border-border/50 rounded-sm min-w-[200px] shadow-xl overflow-hidden"
            >
              <div className="flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.path}
                    onClick={() => setMenuOpen(false)}
                    className="px-6 py-3 text-sm font-medium hover:bg-foreground/5 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-sm">
        <div className="mx-auto w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={handleLogoClick} className="inline-flex items-center gap-2">
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
    </>
  );
};

export default HomeNavbar;

const ThemeToggle = ({ iconClassName }: { iconClassName?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className={cn("h-5 w-5 dark:hidden", iconClassName)} />
      <Moon className={cn("hidden h-5 w-5 dark:block", iconClassName)} />
    </Button>
  );
};
export { ThemeToggle }