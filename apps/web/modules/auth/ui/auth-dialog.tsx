"use client";

import { useSession } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { LogIn } from "lucide-react";
import Link from "next/link";

interface AuthProps {
  className?: string;
}

const AuthButton = ({ className }: AuthProps) => {
  const { data: session } = useSession();
  const destination = session?.user ? "/dashboard" : "/login";

  return (
    <div className={cn("md:bg-custom md:p-0.5! rounded-md -mr-1", className)}>
      <Button
        asChild
        className={cn(
          "h-7! gap-2 bg-custom/80! px-3! font-semibold text-white! transition-all duration-300 hover:shadow-[inset_0_0_10px_rgba(255,255,255,0.4)]",
          className,
        )}
      >
        <Link href={destination}>
          <LogIn className="h-4 w-4" />
          <span>Login</span>
        </Link>
      </Button>
    </div>
  );
};

export default AuthButton;