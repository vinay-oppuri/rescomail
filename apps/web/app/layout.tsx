import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@repo/ui/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { ScrollToTop } from "@repo/ui/components/scroll-to-top";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ),
  title: {
    default: "Rescomail | AI Job Search Copilot",
    template: "%s | Rescomail",
  },
  description: "Land your dream job with AI-powered resume optimization, ATS analysis, and perfectly tailored cold emails.",
  keywords: [
    "resume builder",
    "ATS optimization",
    "cold emails",
    "job search",
    "AI career coach",
    "resume parser",
  ],
  authors: [{ name: "Rescomail Team" }],
  creator: "Rescomail",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Rescomail | AI Job Search Copilot",
    description: "Optimize your resume for ATS, generate personalized cold emails, and track applications—all in one place.",
    siteName: "Rescomail",
    images: [
      {
        url: "/og-image.jpg", // Ensure this exists in public/
        width: 1200,
        height: 630,
        alt: "Rescomail Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rescomail | AI Job Search Copilot",
    description: "Optimize your resume for ATS, generate personalized cold emails, and track applications.",
    images: ["/og-image.jpg"],
    creator: "@rescomail",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
      <body className="min-h-full flex flex-col text-sm md:text-base">
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
      </body>
    </html>
  );
}

