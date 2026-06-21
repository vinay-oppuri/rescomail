import { Button } from "@repo/ui/components/button";
import { Target, Briefcase, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

import { BentoFeatures } from "../components/bento-features";
import { HeroScrollDashboard } from "../components/scroll-dashboard";
import { HomeFaq } from "../components/home-faq";
import { HomeCta } from "../components/home-cta";


const HomeView = () => {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/20">
      {/* Split Hero Section */}
      <section className="relative overflow-visible min-h-screen lg:min-h-[85vh] flex items-center pt-0 lg:pt-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left Column: Title & Description */}
            <div className="max-w-2xl min-h-screen lg:min-h-0 flex flex-col justify-center pb-0 lg:py-0">
              <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl leading-[1.1]">
                Land Your Dream Job with{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-500">
                  Rescomail
                </span>
              </h1>
              <p className="mb-8 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                The ultimate AI assistant for your career. Discover relevant jobs, optimize your resume for ATS, track your pipeline, and generate personalized cold emails—all in one place.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Button size="lg" className="w-[75%] sm:w-auto h-10 md:h-12 px-6 text-sm shadow-md shadow-primary/20 transition-all hover:scale-105 " asChild>
                  <Link href="/signup">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-[65%] md:w-auto h-10 md:h-12 px-6 text-sm border-foreground/5!"
                  asChild
                >
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-linear-to-br from-primary/40 to-blue-500/40" />
                    </div>
                  ))}
                </div>
                <p>Join <span className="font-semibold text-foreground">1,000+</span> professionals landing interviews.</p>
              </div>
            </div>

            {/* Right Column: Features Explanation / Visuals */}
            <div className="relative lg:ml-auto w-full max-w-xl pb-12 lg:pb-0">
              {/* Decorative background blur */}
              <div className="absolute -inset-0.5 bg-linear-to-br from-primary/30 to-blue-500/30 blur-2xl opacity-50"></div>

              <div className="relative flex flex-col gap-4">
                {/* Feature Card 1 */}
                <div className="group relative rounded-sm border border-border/50 bg-background/80 backdrop-blur-xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/10">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary shadow-inner">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-base mb-1">Smart ATS Optimization</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                        Upload your resume and a job description. Our AI instantly analyzes keyword gaps and formatting issues to boost your match score.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature Card 2 */}
                <div className="group relative rounded-sm border border-border/50 bg-background/80 backdrop-blur-xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/10 ml-0 sm:ml-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-blue-500/10 text-blue-500 shadow-inner">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-base mb-1">1-Click Cold Emails</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                        Stop staring at a blank screen. Generate highly personalized outreach emails tailored perfectly to the hiring manager.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature Card 3 */}
                <div className="group relative rounded-sm border border-border/50 bg-background/80 backdrop-blur-xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-purple-500/10">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-purple-500/10 text-purple-500 shadow-inner">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-base mb-1">Kanban Job Tracker</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                        Organize your entire pipeline. Move applications from &apos;Saved&apos; to &apos;Offer&apos; and never lose track of a crucial follow-up.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      <HeroScrollDashboard />
      <BentoFeatures />
      <HomeFaq />
      <HomeCta />

    </main>
  );
};

export default HomeView;
