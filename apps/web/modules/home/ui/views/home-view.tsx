import { Button } from "@repo/ui/components/button";
import HomeNavbar from "../components/home-navbar";
import { CheckCircle, Zap, FileText, Mail, ArrowRight, Sparkles, Target, Briefcase } from "lucide-react";
import Link from "next/link";
import { cn } from "@repo/ui/lib/utils";

const HomeView = () => {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/20">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/5 transition-all">
        <HomeNavbar />
      </div>

      {/* Split Hero Section */}
      <section className="relative overflow-hidden lg:min-h-[calc(100vh-4rem)] flex items-center">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-40%] left-[-10%] w-[70%] h-[70%] rounded-none bg-primary/10 blur-[120px]" />
          <div className="absolute top-[20%] right-[-20%] w-[60%] h-[60%] rounded-none bg-blue-500/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Title & Description */}
            <div className="max-w-2xl min-h-[calc(100vh-4rem)] lg:min-h-0 flex flex-col justify-center py-12 lg:py-0">
              <div className="mb-6 w-fit inline-flex items-center gap-2 rounded-none border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span>AI-Powered Job Search Copilot</span>
              </div>
              <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl leading-[1.1]">
                Land Your Dream Job with{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-500">
                  Rescomail
                </span>
              </h1>
              <p className="mb-8 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                The ultimate AI assistant for your career. Optimize your resume for ATS, generate personalized cold emails, and track applications—all in one place.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Button size="lg" className="w-[75%] sm:w-auto h-10 md:h-12 px-6 text-sm shadow-lg shadow-primary/20 transition-all hover:scale-105 rounded-none" asChild>
                  <Link href="/signup">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-[65%] md:w-auto h-10 md:h-12 px-6 text-sm border-border/50 hover:bg-muted/50 transition-all rounded-none"
                  asChild
                >
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>
              
              <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-none border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
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
               <div className="absolute -inset-0.5 bg-linear-to-br from-primary/30 to-blue-500/30 rounded-none blur-2xl opacity-50"></div>
               
               <div className="relative flex flex-col gap-4">
                  {/* Feature Card 1 */}
                  <div className="group relative rounded-none border border-border/50 bg-background/80 backdrop-blur-xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/10">
                     <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary shadow-inner">
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
                  <div className="group relative rounded-none border border-border/50 bg-background/80 backdrop-blur-xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/10 ml-0 sm:ml-8">
                     <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-blue-500/10 text-blue-500 shadow-inner">
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
                  <div className="group relative rounded-none border border-border/50 bg-background/80 backdrop-blur-xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-purple-500/10">
                     <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-purple-500/10 text-purple-500 shadow-inner">
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

      <section id="features" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-xl md:text-2xl font-bold mb-4 tracking-tight">
              Everything you need to succeed
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Powerful AI tools designed specifically to give you an edge in the competitive
              job market. Don&apos;t leave your next career move to chance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "ATS Semantic Matching",
                description:
                  "Go beyond simple keyword stuffing. Our models understand context and semantics to ensure your resume truly matches the job requirements.",
                icon: <Zap className="h-6 w-6 text-primary" />,
                color: "bg-primary/10 text-primary",
              },
              {
                title: "Draft Perfection",
                description:
                  "Create highly personalized outreach emails that get opened and replied to. We analyze the company context automatically.",
                icon: <Mail className="h-6 w-6 text-blue-500" />,
                color: "bg-blue-500/10 text-blue-500",
              },
              {
                title: "Actionable Feedback",
                description:
                  "Get concrete, actionable feedback on your resume structure, impact statements, and phrasing with deep AI-driven insights.",
                icon: <FileText className="h-6 w-6 text-purple-500" />,
                color: "bg-purple-500/10 text-purple-500",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative rounded-none border border-border/50 bg-card p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className={cn("w-12 h-12 rounded-none flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feature.color)}>
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 md:py-24 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xl md:text-2xl font-bold mb-4 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-sm text-muted-foreground">
              Start for free today. Upgrade when you need more power for your job search.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                detail: "Perfect for getting started",
                features: ["50 Resume Uploads", "100 Job Trackers", "Basic Parsing"],
                highlight: false,
              },
              {
                name: "Pro",
                price: "Soon",
                period: "per month",
                detail: "For the serious job seeker",
                features: ["10 ATS Scans /mo", "10 Cold Emails /mo", "Advanced Semantic Matching"],
                highlight: true,
              },
              {
                name: "Teams",
                price: "Soon",
                period: "per user/mo",
                detail: "For recruiters & agencies",
                features: ["Shared Workspaces", "Centralized Billing", "Unlimited Quotas"],
                highlight: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={cn(
                "relative rounded-none border p-6 flex flex-col transition-all",
                plan.highlight 
                  ? "bg-background border-primary shadow-xl shadow-primary/10 scale-105 z-10" 
                  : "bg-card border-border/50 hover:border-border"
              )}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className="text-base font-bold mb-2">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{plan.detail}</p>
                <div className="mb-6 flex items-baseline text-2xl font-extrabold">
                  {plan.price}
                  <span className="ml-1 text-xs font-medium text-muted-foreground">/{plan.period}</span>
                </div>
                <ul className="mb-6 space-y-3 flex-1">
                   {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs">
                         <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                         <span>{f}</span>
                      </li>
                   ))}
                </ul>
                <Button variant={plan.highlight ? "default" : "outline"} className="w-full rounded-none h-10 text-sm">
                   {plan.price === "Soon" ? "Coming Soon" : "Get Started"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground">Got questions? We&apos;ve got answers.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How accurate is the ATS analysis?",
                a: "Rescomail uses advanced embedding models and cross-encoders (the same tech powering modern search engines) to understand semantics, not just exact keyword matches. This provides highly accurate and realistic ATS scoring.",
              },
              {
                q: "Can I generate cold emails automatically?",
                a: "Absolutely. Once your resume is parsed, you can input a target job or company URL. Our AI fetches the company context and drafts a personalized email referencing your exact relevant experience.",
              },
              {
                q: "Is my data secure and private?",
                a: "Yes. Resumes are stored securely and parsed data is private to your account. We don&apos;t train public models on your personal data.",
              },
            ].map((faq) => (
              <div key={faq.q} className="rounded-none border border-border/50 bg-card p-6 transition-all hover:shadow-lg">
                <h3 className="text-base font-bold flex items-start gap-3">
                  <div className="mt-0.5 rounded-none bg-primary/10 p-1 shrink-0">
                     <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  {faq.q}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground ml-9">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-none border border-border/50 bg-card px-6 py-16 text-center shadow-xl">
          {/* Subtle gradient bg */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-blue-500/5" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
              Ready to land your next role?
            </h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-xl mx-auto">
              Join the growing community of professionals who use Rescomail to outsmart the ATS, track applications, and write perfect emails.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-sm shadow-xl shadow-primary/20 rounded-none hover:scale-105 transition-all" asChild>
                <Link href="/signup">Create Free Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/10 py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 lg:px-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-none bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                R
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-tight">Rescomail</h3>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The AI copilot designed to help you organize your job search, optimize your resume, and land more interviews.
            </p>
          </div>

          <div className="flex flex-wrap gap-12 lg:gap-20">
             <div>
                <h4 className="font-semibold text-sm mb-4">Product</h4>
                <div className="flex flex-col gap-3 text-xs text-muted-foreground">
                   <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
                   <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
                   <Link href="#faq" className="hover:text-primary transition-colors">FAQ</Link>
                </div>
             </div>
             <div>
                <h4 className="font-semibold text-sm mb-4">Legal</h4>
                <div className="flex flex-col gap-3 text-xs text-muted-foreground">
                   <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                   <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                   <Link href="mailto:support@rescomail.com" className="hover:text-primary transition-colors">Contact Support</Link>
                </div>
             </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-12 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Rescomail. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
};

export default HomeView;
