"use client"

import { Button } from "@repo/ui/components/button"
import { LogIn, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

const HomeNavbar = () => {
    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Features", path: "#features" },
        { name: "Pricing", path: "#pricing" },
        { name: "About", path: "#about" },
    ]

    return (
        <nav className=" mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:py-6 md:px-0">
            <Link href="/" className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center border bg-primary font-heading text-sm text-primary-foreground">
                    R
                </span>
                <h1 className="text-2xl font-bold">Rescomail</h1>
            </Link>
            <div className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                    <Link key={link.name} href={link.path} className="group flex flex-col">
                        {link.name}
                        <div className="h-0.5 w-full scale-x-0 origin-left bg-primary transition-transform duration-200 group-hover:scale-x-100" />
                    </Link>
                ))}
            </div>
            <div className="flex items-center gap-4">
                <Button asChild className="gap-2 px-3">
                    <Link href="/login"><LogIn /> Login</Link>
                </Button>
                <ThemeToggle />
            </div>
        </nav>
    )
}
export default HomeNavbar

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
