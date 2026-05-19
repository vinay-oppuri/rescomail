import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@repo/ui/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { ScrollToTop } from "@repo/ui/components/scroll-to-top";
import { TRPCReactProvider } from "@repo/trpc/client";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rescomail",
  description: "AI job application copilot for resumes, cold emails, and tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              {children}
              <ScrollToTop />
            </TooltipProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}

