import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ArrowRight } from "lucide-react";

export function HomeCta() {
  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl border border-foreground/5 bg-linear-to-b from-blue-500/10 via-blue-500/5 to-transparent dark:bg-muted/30 dark:bg-none shadow-xl">
          {/* Subtle ambient light glow */}
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 px-6 py-12 md:px-16 md:py-14 text-center backdrop-blur-xs">

            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground mb-4 max-w-2xl mx-auto leading-tight">
              Ready to land your next role?
            </h2>

            <p className="text-sm md:text-base text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto">
              Join professionals who use Rescomail to outsmart the ATS, track applications effortlessly, and write perfect cold emails in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="w-full sm:w-auto h-11 px-8 text-sm font-semibold rounded-full bg-blue-600 hover:bg-blue-500! text-white shadow-lg shadow-blue-500/10"
                asChild
              >
                <Link href="/signup">
                  Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-11 px-8 text-sm font-semibold border-foreground/5! rounded-full hover:bg-foreground/2"
                asChild
              >
                <Link href="#features">See Features</Link>
              </Button>
            </div>

            {/* Social proof strip */}
            <p className="mt-8 text-xs text-muted-foreground/60">
              No credit card required &nbsp;·&nbsp; Free plan forever &nbsp;·&nbsp; Cancel anytime
            </p>

          </div>
        </div>
      </div>
    </section>
  );
}
