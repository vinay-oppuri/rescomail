import Link from "next/link";

const HomeFooter = () => {
  return (
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
              <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
              <Link href="/#pricing" className="hover:text-primary transition-colors">Pricing</Link>
              <Link href="/#faq" className="hover:text-primary transition-colors">FAQ</Link>
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
  );
};

export default HomeFooter;
