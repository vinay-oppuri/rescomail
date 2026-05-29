import { Metadata } from "next";
import { ArrowRight, BookOpen, CheckCircle, FileText, Settings, Shield, User, SlidersHorizontal, Upload } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation | Rescomail",
  description: "Learn how to use Rescomail to optimize your job search, analyze your resume, and generate cold emails.",
};

const Page = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8 py-8 md:py-12">
        
        {/* Mobile Navigation (Horizontal Scroll) */}
        <div className="md:hidden flex overflow-x-auto pb-4 -mx-4 px-4 gap-2 scrollbar-none sticky top-18 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <Link href="#introduction" className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-full text-xs font-medium">Intro</Link>
          <Link href="#upload-resume" className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-full text-xs font-medium">Upload</Link>
          <Link href="#resume-editor" className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-full text-xs font-medium">Editor</Link>
          <Link href="#ats-analysis" className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-full text-xs font-medium">ATS</Link>
          <Link href="#cold-emails" className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-full text-xs font-medium">Emails</Link>
          <Link href="#profile-defaults" className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-full text-xs font-medium">Profile</Link>
          <Link href="#custom-api-key" className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-full text-xs font-medium">API Keys</Link>
        </div>

        {/* Left Sidebar Navigation (Desktop) */}
        <aside className="w-full md:w-56 lg:w-64 shrink-0 hidden md:block">
          <div className="sticky top-24">
            <h3 className="font-semibold text-base mb-4 tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Documentation
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-xs text-foreground mb-2 uppercase tracking-wider">Overview</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li><Link href="#introduction" className="hover:text-primary transition-colors">Introduction</Link></li>
                  <li><Link href="#why-rescomail" className="hover:text-primary transition-colors">Why Rescomail?</Link></li>
                  <li><Link href="#privacy-security" className="hover:text-primary transition-colors">Privacy & Security</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-xs text-foreground mb-2 uppercase tracking-wider">Getting Started</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li><Link href="#upload-resume" className="hover:text-primary transition-colors">Uploading Your Resume</Link></li>
                  <li><Link href="#resume-editor" className="hover:text-primary transition-colors">Live Resume Editor</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-xs text-foreground mb-2 uppercase tracking-wider">AI Features</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li><Link href="#ats-analysis" className="hover:text-primary transition-colors">ATS Analysis</Link></li>
                  <li><Link href="#cold-emails" className="hover:text-primary transition-colors">Cold Emails</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-xs text-foreground mb-2 uppercase tracking-wider">Configuration</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li><Link href="#profile-defaults" className="hover:text-primary transition-colors">Profile Defaults</Link></li>
                  <li><Link href="#custom-api-key" className="hover:text-primary transition-colors">Custom API Key</Link></li>
                  <li><Link href="#account-management" className="hover:text-primary transition-colors">Account Management</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 max-w-3xl">
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">Rescomail Documentation</h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Welcome to the official Rescomail documentation. Learn how to optimize your resume, outsmart the ATS, and land your dream job faster.
            </p>
          </div>

          <div className="space-y-12 sm:space-y-16">
            
            {/* Introduction */}
            <section id="introduction" className="scroll-mt-28">
              <h2 className="text-xl font-bold mb-3 tracking-tight border-b border-border/50 pb-2">What is Rescomail?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Rescomail is an AI-powered job search copilot designed specifically to give you an edge in today's competitive job market. We combine advanced natural language processing with career expertise to help you build better resumes and write outreach emails that actually get responses.
              </p>
            </section>

            {/* Why Rescomail */}
            <section id="why-rescomail" className="scroll-mt-28">
              <h2 className="text-xl font-bold mb-3 tracking-tight border-b border-border/50 pb-2">How is this helpful?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Applying to jobs is often a numbers game, but blindly sending out generic resumes leads to immediate rejections. Rescomail solves this by:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border border-border/50 bg-card p-4 rounded-none">
                  <h4 className="font-semibold text-sm mb-1.5 flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500"/> Beating the ATS</h4>
                  <p className="text-xs text-muted-foreground">Identifies missing keywords and semantic gaps between your resume and the job description before you apply.</p>
                </div>
                <div className="border border-border/50 bg-card p-4 rounded-none">
                  <h4 className="font-semibold text-sm mb-1.5 flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-blue-500"/> Saving Time</h4>
                  <p className="text-xs text-muted-foreground">Drafts highly personalized, context-aware cold emails to hiring managers in 1 click.</p>
                </div>
                <div className="border border-border/50 bg-card p-4 rounded-none">
                  <h4 className="font-semibold text-sm mb-1.5 flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-purple-500"/> Live Feedback</h4>
                  <p className="text-xs text-muted-foreground">A live two-panel resume editor lets you immediately fix weaknesses and see changes in real-time.</p>
                </div>
              </div>
            </section>

            {/* Privacy & Security */}
            <section id="privacy-security" className="scroll-mt-28">
              <h2 className="text-xl font-bold mb-3 tracking-tight border-b border-border/50 pb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Privacy & Security
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Your data privacy is our top priority. Rescomail processes your resumes and career history securely.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
                <li>We do <strong>not</strong> use your personal resume data to train public AI models.</li>
                <li>API keys provided by users are stored securely and used exclusively for your requests.</li>
                <li>You have complete control to delete your account and all associated data at any time from the Settings page.</li>
              </ul>
            </section>

            {/* Upload Resume */}
            <section id="upload-resume" className="scroll-mt-28">
              <h2 className="text-xl font-bold mb-3 tracking-tight border-b border-border/50 pb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Uploading Your Resume
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Everything in Rescomail starts with your base resume. We use powerful AI models to extract your experience, skills, and education into a structured format.
              </p>
              <div className="bg-muted/30 p-5 border border-border/50 rounded-none mb-3">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Navigate to the <strong>Dashboard</strong> after logging in.</li>
                  <li>Click on <strong>Resumes</strong> in the sidebar.</li>
                  <li>Click the <strong>Upload Resume</strong> button.</li>
                  <li>Select a PDF version of your current resume.</li>
                  <li>Wait a few seconds while our AI parses and structures your document.</li>
                </ol>
              </div>
            </section>

            {/* Resume Editor */}
            <section id="resume-editor" className="scroll-mt-28">
              <h2 className="text-xl font-bold mb-3 tracking-tight border-b border-border/50 pb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Live Resume Editor
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Once parsed, you can edit your resume directly in our Live Editor. This ensures your data is perfectly structured for our AI features.
              </p>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3 border border-border/50 p-4 bg-card">
                  <div className="mt-0.5 bg-primary/10 p-1 rounded-none shrink-0"><ArrowRight className="w-3.5 h-3.5 text-primary" /></div>
                  <div>
                    <strong className="text-foreground block mb-1">Two-Panel Layout</strong>
                    Use the left panel to update fields (Name, Experience, Skills) and instantly see the formatted HTML preview on the right.
                  </div>
                </li>
                <li className="flex items-start gap-3 border border-border/50 p-4 bg-card">
                  <div className="mt-0.5 bg-primary/10 p-1 rounded-none shrink-0"><ArrowRight className="w-3.5 h-3.5 text-primary" /></div>
                  <div>
                    <strong className="text-foreground block mb-1">Auto-Save & Versioning</strong>
                    Changes are automatically saved as you type. Use standard keyboard shortcuts (<kbd className="bg-muted px-1 py-0.5 border border-border/50 text-[10px]">Ctrl+Z</kbd> / <kbd className="bg-muted px-1 py-0.5 border border-border/50 text-[10px]">Cmd+Z</kbd>) to undo mistakes.
                  </div>
                </li>
                <li className="flex items-start gap-3 border border-border/50 p-4 bg-card">
                  <div className="mt-0.5 bg-primary/10 p-1 rounded-none shrink-0"><ArrowRight className="w-3.5 h-3.5 text-primary" /></div>
                  <div>
                    <strong className="text-foreground block mb-1">Export to PDF</strong>
                    Once you're happy with the edits, click the <strong>Export</strong> button to download a beautifully formatted, ATS-compliant PDF ready for applications.
                  </div>
                </li>
              </ul>
            </section>

            {/* ATS Analysis */}
            <section id="ats-analysis" className="scroll-mt-28">
              <h2 className="text-xl font-bold mb-3 tracking-tight border-b border-border/50 pb-2">Getting an ATS Analysis</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Applicant Tracking Systems (ATS) filter out up to 75% of resumes before a human ever sees them. Our semantic matching engine tells you exactly why.
              </p>
              <div className="bg-muted/30 p-5 border border-border/50 rounded-none mb-4">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to your <strong>Dashboard</strong> and click <strong>ATS Scans</strong>.</li>
                  <li>Click <strong>New Scan</strong>.</li>
                  <li>Select the resume you uploaded earlier.</li>
                  <li>Paste the <strong>Job Description</strong> of the role you are targeting.</li>
                  <li>Provide the <strong>Job Title</strong> and <strong>Company Name</strong>.</li>
                  <li>Click <strong>Analyze Match</strong>.</li>
                </ol>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                The AI will return a comprehensive dashboard featuring:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground ml-3">
                <li>An overall <strong>Match Score</strong> (0-100%).</li>
                <li>Missing and matching <strong>Keywords</strong>.</li>
                <li><strong>Skill Gaps</strong> and how to address them.</li>
                <li>Actionable <strong>Rewrite Suggestions</strong> for specific bullet points.</li>
              </ul>
            </section>

            {/* Cold Emails */}
            <section id="cold-emails" className="scroll-mt-28">
              <h2 className="text-xl font-bold mb-3 tracking-tight border-b border-border/50 pb-2">Generating Cold Emails</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Cold emailing hiring managers can increase your interview rate by 10x, but writing them is exhausting. We automate the hardest part: personalization.
              </p>
              <div className="bg-muted/30 p-5 border border-border/50 rounded-none">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Navigate to <strong>Cold Emails</strong> in the sidebar.</li>
                  <li>Click <strong>Draft New Email</strong>.</li>
                  <li>Select your resume and enter the <strong>Target Job Description</strong>.</li>
                  <li>(Optional) Add the <strong>Company Website URL</strong>. Our AI will scrape it to find recent company context to mention!</li>
                  <li>Choose your desired <strong>Tone</strong> (e.g., confident, warm) and <strong>Call to Action</strong> (e.g., ask for feedback, request interview).</li>
                  <li>Click <strong>Generate Email</strong>.</li>
                </ol>
              </div>
            </section>

            {/* Profile Defaults */}
            <section id="profile-defaults" className="scroll-mt-28">
              <h2 className="text-xl font-bold mb-3 tracking-tight border-b border-border/50 pb-2 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-orange-500" />
                Setting Profile Defaults
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                To save time when running multiple ATS scans or generating emails, you can set global defaults for your job search preferences.
              </p>
              <div className="bg-muted/30 p-5 border border-border/50 rounded-none mb-3">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to the <strong>Settings</strong> page from your dashboard.</li>
                  <li>In the <strong>Profile Defaults</strong> section, specify your preferences:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Target Seniority (e.g., Senior, New Grad)</li>
                      <li>Work Mode (Remote, Hybrid)</li>
                      <li>Employment Type</li>
                      <li>Preferred Locations</li>
                    </ul>
                  </li>
                  <li>Click <strong>Save Preferences</strong>.</li>
                </ol>
              </div>
            </section>

            {/* Custom API Key */}
            <section id="custom-api-key" className="scroll-mt-28">
              <h2 className="text-xl font-bold mb-3 tracking-tight border-b border-border/50 pb-2 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-500" />
                Custom API Keys (Bypass Limits)
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Rescomail offers a generous free tier for trial users. If you hit your limits, you can simply provide your own Google Gemini API key to unlock <strong>unlimited usage</strong>.
              </p>
              <div className="border border-primary/20 bg-primary/5 p-5 rounded-none">
                <h4 className="font-semibold text-sm text-foreground mb-3">How to add your API Key:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Get a free API key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.</li>
                  <li>Open the <strong>Settings</strong> page.</li>
                  <li>Scroll down to the <strong>Custom API Keys</strong> section.</li>
                  <li>Paste your key into the <strong>Gemini API Key</strong> field and click Save.</li>
                </ol>
                <p className="mt-4 text-xs text-muted-foreground">
                  Your key is securely stored and instantly validated.
                </p>
              </div>
            </section>

            {/* Account Management */}
            <section id="account-management" className="scroll-mt-28 pb-10">
              <h2 className="text-xl font-bold mb-3 tracking-tight border-b border-border/50 pb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-red-500" />
                Account Management
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                You can update your personal information or permanently delete your account directly from the platform.
              </p>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3 border border-border/50 p-4 bg-card">
                  <div className="mt-0.5 bg-primary/10 p-1 rounded-none shrink-0"><ArrowRight className="w-3.5 h-3.5 text-primary" /></div>
                  <div>
                    <strong className="text-foreground block mb-1">Update Name</strong>
                    Navigate to Settings &gt; Profile to update your display name across the platform.
                  </div>
                </li>
                <li className="flex items-start gap-3 border border-destructive/20 p-4 bg-destructive/5">
                  <div className="mt-0.5 bg-destructive/10 p-1 rounded-none shrink-0"><ArrowRight className="w-3.5 h-3.5 text-destructive" /></div>
                  <div>
                    <strong className="text-foreground block mb-1">Delete Account</strong>
                    Scroll to the bottom of the Settings page and click <strong>Delete Account</strong>. <span className="text-destructive font-medium">Warning:</span> This action is permanent and will securely wipe all your resumes, scans, emails, and preferences from our servers.
                  </div>
                </li>
              </ul>
            </section>

          </div>
        </main>
      </div>

    </div>
  );
};

export default Page;