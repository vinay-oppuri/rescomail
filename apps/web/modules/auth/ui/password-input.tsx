"use client";

import { Input } from "@repo/ui/components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import type { ComponentProps } from "react";
import { useState } from "react";

type PasswordInputProps = Omit<ComponentProps<"input">, "type">;

const PasswordInput = ({
  className,
  disabled,
  ...props
}: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;
  const label = isVisible ? "Hide password" : "Show password";

  return (
    <div className="relative">
      <Input
        type={isVisible ? "text" : "password"}
        className={cn("pr-9", className)}
        disabled={disabled}
        {...props}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-muted-foreground outline-none hover:text-foreground focus-visible:border focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              aria-label={label}
              aria-pressed={isVisible}
              disabled={disabled}
              onClick={() => setIsVisible((current) => !current)}
              onMouseDown={(event) => event.preventDefault()}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export { PasswordInput };
