"use client";

import { useSession } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { LogIn } from "lucide-react";
import Link from "next/link";

interface AuthProps {
  className?: string;
}

const AuthDialog = ({ className }: AuthProps) => {
  const { data: session } = useSession();
  const destination = session?.user ? "/dashboard" : "/login";

  return (
    <Button
      asChild
      className={cn(
        "-mr-1 h-8 gap-2 bg-foreground px-4 font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg",
        className,
      )}
    >
      <Link href={destination}>
        <LogIn className="h-4 w-4" />
        <span>{session?.user ? "Dashboard" : "Login"}</span>
      </Link>
    </Button>
  );
};

export default AuthDialog;
