"use client";

import { Button } from "@repo/ui";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="z-10 flex max-w-xl flex-col items-center space-y-8 px-4 text-center">
        {/* Error Code & Icon */}
        <div className="relative">
          <div className="flex h-32 w-32 items-center justify-center border-2 border-primary/20 bg-background/50 shadow-2xl backdrop-blur-sm">
            <SearchX className="h-16 w-16 text-primary" />
          </div>
          <div className="absolute -bottom-6 -right-6 flex h-16 w-32 items-center justify-center border border-primary/20 bg-primary font-mono text-3xl font-black text-primary-foreground shadow-lg">
            404
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 pt-8">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            Page Not Found
          </h1>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            The page you are looking for doesn&apos;t exist or has been moved.
            Check the URL or navigate back.
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
          <Button
            variant="default"
            size="lg"
            className="h-12 gap-2 rounded-none text-base"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 gap-2 rounded-none text-base"
            asChild
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
