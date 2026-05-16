import { Button } from "@repo/ui/components/button"
import HomeNavbar from "../components/home-navbar"
import { CheckCircle, Zap, FileText, Mail, ArrowRight } from "lucide-react"
import Link from "next/link"

const HomeView = () => {
    return (
        <main className="min-h-screen bg-background">
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
                <HomeNavbar />
            </div>

            <section className="py-20 lg:py-28">
                <div className="relative z-10 mx-auto max-w-7xl px-6">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="mb-8 inline-flex items-center gap-2 rounded-none border bg-background px-3 py-1 text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-none bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-none h-2 w-2 bg-primary"></span>
                            </span>
                            New: AI-Powered Resume Tailoring is here
                        </div>
                        <h1 className="mb-8 text-4xl font-bold tracking-tight text-foreground lg:text-6xl">
                            Land Your Dream Job with <span className="text-primary">Rescomail</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                            The ultimate AI Job Application Copilot. Optimize your resume for ATS, generate personalized cold emails, and track your applications in one place.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="px-8 h-12 text-base" asChild>
                                <Link href="/signup">
                                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="px-8 h-12 text-base">
                                View Demo
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="py-24">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything you need to succeed</h2>
                        <p className="text-muted-foreground">Powerful AI tools designed to give you an edge in the competitive job market.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "ATS Optimization",
                                description: "Detailed keyword analysis and semantic matching to ensure your resume passes any ATS screening.",
                                icon: <Zap className="h-6 w-6 text-primary" />
                            },
                            {
                                title: "Cold Email Generator",
                                description: "Create highly personalized outreach emails for recruiters and hiring managers in seconds.",
                                icon: <Mail className="h-6 w-6 text-primary" />
                            },
                            {
                                title: "Smart Resume Analysis",
                                description: "Get actionable feedback on your resume structure, impact, and phrasing with AI-driven scores.",
                                icon: <FileText className="h-6 w-6 text-primary" />
                            }
                        ].map((feature, i) => (
                            <div key={i} className="rounded-none border bg-card p-8 transition-colors hover:bg-muted/30">
                                <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24">
                <div className="mx-auto max-w-4xl px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold tracking-tight">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'How accurate is the ATS analysis?',
                                a: 'Rescomail combines keyword analysis, semantic matching, and AI-based scoring to provide highly relevant ATS optimization suggestions.',
                            },
                            {
                                q: 'Can I generate cold emails automatically?',
                                a: 'Yes. Rescomail creates personalized outreach emails based on your resume and target role.',
                            },
                            {
                                q: 'Does Rescomail support different resume formats?',
                                a: 'Yes. You can upload PDF and DOCX resumes for analysis.',
                            },
                        ].map((faq) => (
                            <div key={faq.q} className="rounded-none border bg-card p-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    {faq.q}
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground ml-7">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="mx-auto max-w-7xl px-6 py-24">
                <div className="relative overflow-hidden rounded-none border bg-primary px-8 py-20 text-center text-primary-foreground">
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold tracking-tight lg:text-5xl">
                            Start Optimizing Your Resume Today
                        </h2>

                        <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80">
                            Join students and developers using Rescomail to improve ATS scores, generate better applications, and land more interviews.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            <Button size="lg" variant="secondary" className="px-8" asChild>
                                <Link href="/signup">Upload Resume</Link>
                            </Button>

                            <Button size="lg" variant="outline" className="px-8 bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground">
                                Book Demo
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-12">
                <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-none bg-primary text-primary-foreground font-bold text-xl">
                                R
                            </div>

                            <div>
                                <h3 className="font-bold text-lg">Rescomail</h3>
                                <p className="text-sm text-muted-foreground">
                                    AI Job Application Copilot
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-8 text-sm font-medium text-muted-foreground">
                        <Link href="#" className="hover:text-foreground transition">Privacy</Link>
                        <Link href="#" className="hover:text-foreground transition">Terms</Link>
                        <Link href="#" className="hover:text-foreground transition">Contact</Link>
                        <Link href="#" className="hover:text-foreground transition">Twitter</Link>
                        <Link href="#" className="hover:text-foreground transition">GitHub</Link>
                    </div>
                </div>
                <div className="container mx-auto px-6 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Rescomail. All rights reserved.
                </div>
            </footer>
        </main>
    )
}

export default HomeView

