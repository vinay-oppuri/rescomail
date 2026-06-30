import Link from "next/link";

const HomeFooter = () => {
  return (
    <footer className="relative flex flex-col justify-between h-screen min-h-[500px] overflow-hidden bg-muted/10 pt-12 pb-6">
      
      {/* 1. Background Image Layer */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-50 bg-[url('/water.jpg')] dark:bg-[url('/water-dark.jpg')]"
      />

      {/* 2. Giant Background Text Layer */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center translate-y-[20%] pointer-events-none select-none overflow-hidden">
        <h1 className="text-[16vw] font-black tracking-tighter text-foreground dark:text-foreground/40 whitespace-nowrap">
          Rescomail
        </h1>
      </div>

      {/* 3. The Spreading Blur / Gradient Fade Layer */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 z-20 pointer-events-none">
        {/* This handles the color fading smoothly into the background */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />

        {/* This handles the blur fading smoothly without a harsh top edge */}
        <div
          className="absolute inset-0 backdrop-blur-md dark:backdrop-blur-2xl"
          style={{
            WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 90%)',
            maskImage: 'linear-gradient(to top, black 10%, transparent 90%)'
          }}
        />
      </div>

      {/* 4. Foreground Content Layer */}
      <div className="relative z-30 mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 lg:px-8 lg:flex-row lg:items-start lg:justify-between flex-1">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground font-bold text-sm md:text-lg shadow-lg">
              R
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-lg tracking-tight">Rescomail</h3>
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-foreground leading-relaxed">
            The AI copilot designed to help you organize your job search, optimize your resume, and land more interviews.
          </p>
        </div>

        <div className="flex flex-wrap gap-10 lg:gap-20">
          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-4">Product</h4>
            <div className="flex flex-col gap-3 text-xs text-foreground">
              <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
              <Link href="/#pricing" className="hover:text-primary transition-colors">Pricing</Link>
              <Link href="/#faq" className="hover:text-primary transition-colors">FAQ</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-4">Legal</h4>
            <div className="flex flex-col gap-3 text-xs text-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="mailto:support@rescomail.com" className="hover:text-primary transition-colors">Contact Support</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="relative z-30 mx-auto w-full max-w-7xl px-6 lg:px-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground mt-auto">
        <p>&copy; {new Date().getFullYear()} Rescomail. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default HomeFooter;