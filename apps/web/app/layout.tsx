import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Geist, JetBrains_Mono } from "next/font/google";
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

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "variable"
})

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "https://rescomail.vinayweb.in"
).replace(/\/$/, "");

const productDescription =
  "Rescomail helps people analyze resumes for ATS compatibility and generate personalized cold emails from one private workspace.";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Rescomail",
      url: siteUrl,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Rescomail",
      url: siteUrl,
      description: productDescription,
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "Rescomail",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description: productDescription,
      featureList: [
        "ATS resume optimization",
        "AI cold email generation",
        "Resume parsing",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rescomail | AI Resume Optimizer & Cold Email Generator",
    template: "%s | Rescomail",
  },
  applicationName: "Rescomail",
  appleWebApp: {
    title: "Rescomail",
    capable: true,
    statusBarStyle: "default",
  },
  description: productDescription,
  keywords: [
    "AI resume optimizer",
    "ATS optimization",
    "ATS resume checker",
    "cold email generator",
    "resume analysis workspace",
    "AI career coach",
    "resume parser",
  ],
  authors: [{ name: "Rescomail Team" }],
  creator: "Rescomail",
  publisher: "Rescomail",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Rescomail | AI Resume Optimizer & Cold Email Generator",
    description: productDescription,
    siteName: "Rescomail",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Rescomail AI resume analysis workspace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rescomail | AI Resume Optimizer & Cold Email Generator",
    description: productDescription,
    images: ["/opengraph-image"],
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
        serif.variable,
        geistSans.variable,
        jetbrainsMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col text-sm md:text-base">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
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
