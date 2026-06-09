"use client";

import { signOut, useSession } from "@repo/auth/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui";
import { LogOut, User, Sparkles, Monitor, CreditCard, Settings, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";

const DashboardUserProfile = () => {
  const { data } = useSession();
  const router = useRouter();

  const onSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const user = data?.user;
  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 border-none px-2 transition-colors hover:bg-muted/50 h-9"
        >
          <Avatar className="h-8 w-8 border border-primary/20 bg-primary/10">
            <AvatarImage
              src={user?.image ?? undefined}
              alt={user?.name || "User"}
            />
            <AvatarFallback>
              <User className="h-4 w-4 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex items-center gap-1.5 pl-1 pr-0.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/70">
              {user?.name ? user.name.split(" ")[0] : "Account"}
            </p>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 border-foreground/5 shadow-xl bg-card/80 backdrop-blur-md p-2">
        <div className="flex items-center justify-start gap-3 p-2">
          <Avatar className="h-10 w-10 border border-primary/20 bg-primary/10">
            <AvatarImage
              src={user?.image ?? undefined}
              alt={user?.name || "User"}
            />
            <AvatarFallback className="text-sm font-bold text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold leading-tight">{user?.name || "Unknown User"}</p>
            <p className="text-xs text-muted-foreground truncate w-[160px]">
              {user?.email}
            </p>
          </div>
        </div>

{/* <div className="px-1 py-1">
          <div className="flex items-center justify-between bg-secondary/50 px-3 py-2 mt-2 text-sm font-medium border border-border/50 rounded-sm">
            <div className="flex items-center gap-2 text-xs text-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Pro Plan</span>
            </div>
            <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground font-semibold mt-1">Upgrade</span>
          </div>
        </div> */}

        <div className="px-1 py-1 space-y-0.5">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="cursor-pointer gap-3 py-2.5 hover:rounded-sm! ">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium">Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer gap-3 py-2.5 hover:rounded-sm! ">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium">Dashboard</span>
            </DropdownMenuItem>
            
{/* <DropdownMenuItem onClick={() => router.push("/dashboard/billing")} className="cursor-pointer gap-3 py-2.5 hover:rounded-sm! ">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium">Billing & Plans</span>
            </DropdownMenuItem> */}
            
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="cursor-pointer gap-3 py-2.5 hover:rounded-sm! ">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium">Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </div>

        <DropdownMenuSeparator className="bg-border/50 mx-1" />
        
        <div className="px-1 py-1">
          <DropdownMenuItem onClick={onSignOut} className="cursor-pointer gap-3 py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive hover:rounded-sm! ">
            <LogOut className="h-4 w-4" /> 
            <span className="text-xs font-medium">Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { DashboardUserProfile };
