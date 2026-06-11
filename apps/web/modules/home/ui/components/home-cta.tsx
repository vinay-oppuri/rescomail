import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { ArrowRight, Zap } from "lucide-react";

export function HomeCta() {
  return (
    <section className="py-8 md:py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-sm border border-border/50 bg-card shadow-xl">
          {/* Content */}
          <div className="relative z-10 px-5 py-10 md:px-16 md:py-8 text-center bg-blue-400/20 dark:bg-card/20">

            {/* Badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full border border-foreground/5 bg-primary/5 text-primary text-[9px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6">
              <Zap className="h-2.5 w-2.5 md:h-3 md:w-3" />
              Start for free
            </div>

            <h2 className="text-xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2.5 md:mb-4 max-w-2xl mx-auto leading-tight">
              Ready to land your{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-500">
                next role?
              </span>
            </h2>

            <p className="text-[11px] md:text-sm text-muted-foreground mb-6 md:mb-10 leading-relaxed max-w-lg mx-auto">
              Join professionals who use Rescomail to outsmart the ATS, track applications effortlessly, and write perfect cold emails in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 md:gap-3">
              <Button
                size="lg"
                className="w-full sm:w-auto h-9 md:h-12 px-5 md:px-8 text-xs md:text-sm font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                asChild
              >
                <Link href="/signup">
                  Create Free Account <ArrowRight className="ml-1.5 md:ml-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-9 md:h-12 px-5 md:px-8 text-xs md:text-sm font-semibold border-border/50 hover:bg-muted/50 transition-all"
                asChild
              >
                <Link href="#features">See Features</Link>
              </Button>
            </div>

            {/* Social proof strip */}
            <p className="mt-5 md:mt-8 text-[9px] md:text-xs text-muted-foreground/70">
              No credit card required &nbsp;·&nbsp; Free plan forever &nbsp;·&nbsp; Cancel anytime
            </p>

          </div>
        </div>
      </div>
    </section>
  );
}
