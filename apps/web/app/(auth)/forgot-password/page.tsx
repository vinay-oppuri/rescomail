import { Button } from "@repo/ui/components/button";
import Link from "next/link";

const Page = () => {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
              R
            </span>
            <span className="text-xl font-bold">Rescomail</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            Password recovery
          </h1>
          <p className="text-sm text-muted-foreground">
            Password reset emails are not wired yet. Use Google sign-in or
            contact support while this flow is being connected.
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild>
            <Link href="mailto:support@rescomail.com">Contact Support</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Page;
