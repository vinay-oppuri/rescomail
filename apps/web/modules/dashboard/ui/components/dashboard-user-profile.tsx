"use client";

import { signOut, useSession } from "@repo/auth/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Separator,
} from "@repo/ui";
import { Calendar, Camera, LogOut, Mail, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SessionData = ReturnType<typeof useSession>["data"];

const DashboardUserProfile = () => {
  const { data } = useSession();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const onSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 border-none px-2 transition-colors hover:bg-muted/50 h-9"
          >
            <Avatar className="h-6 w-6 border border-primary/20 bg-primary/10">
              <AvatarImage
                src={data?.user?.image ?? undefined}
                alt={data?.user?.name || "User"}
              />
              <AvatarFallback>
                <User className="h-3.5 w-3.5 text-primary" />
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:inline-block">
              Account
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="rounded-none border-border/50 shadow-xl bg-background/95 backdrop-blur-md p-2">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-bold text-xs uppercase tracking-wider text-muted-foreground">My Account</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => setIsProfileOpen(true)} className="rounded-none text-xs font-medium cursor-pointer">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-none text-xs font-medium cursor-pointer">Billing</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuGroup>
            <DropdownMenuItem className="rounded-none text-xs font-medium cursor-pointer">Subscription</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onSignOut} className="rounded-none text-xs font-bold cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserProfileDialog
        isOpen={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        data={data}
      />
    </>
  );
};

export { DashboardUserProfile };

interface UserProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  data: SessionData;
}

const UserProfileDialog = ({
  isOpen,
  onOpenChange,
  data,
}: UserProfileDialogProps) => {
  const user = data?.user;

  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-130 rounded-none border-border/50 shadow-2xl bg-background/95 backdrop-blur-xl p-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-blue-500" />
        
        <div className="p-6 md:p-8 space-y-8">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-2xl font-extrabold tracking-tight">My Profile</DialogTitle>
            <DialogDescription className="text-sm">
              Manage your account information and security details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-5">
              <div className="relative group">
                <Avatar className="h-20 w-20 border border-border/50 bg-muted/50 shadow-sm transition-all group-hover:shadow-md">
                  <AvatarImage
                    src={user?.image ?? undefined}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="text-xl font-bold text-muted-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-7 w-7 rounded-none border border-border/50 shadow-sm hover:scale-105 transition-transform"
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold tracking-tight">
                  {user?.name || "Unknown User"}
                </h3>

                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="secondary" className="rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <Shield className="mr-1 h-3 w-3" />
                    Authenticated
                  </Badge>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* User Information */}
            <div className="space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    defaultValue={user?.name || ""}
                    className="h-10 pl-10 rounded-none border-border/50 bg-background/50 focus-visible:ring-primary/50 font-medium text-sm transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <div className="flex items-center gap-3 h-10 bg-muted/30 border border-border/50 px-3 rounded-none">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium text-muted-foreground">{data?.user.email}</div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Status</Label>
                <div className="h-10 flex items-center gap-3 border border-border/50 bg-background/50 px-3 rounded-none">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">
                    Active and secure
                  </span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Member Since</Label>
                <div className="h-10 flex items-center gap-3 border border-border/50 bg-background/50 px-3 text-muted-foreground rounded-none">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">May 2026</span>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-none border-border/50 hover:bg-muted/50 h-10 px-5 text-sm font-bold transition-colors">
                Cancel
              </Button>

              <Button onClick={() => onOpenChange(false)} className="rounded-none h-10 px-6 text-sm font-bold shadow-md shadow-primary/20 hover:scale-105 transition-all">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export { UserProfileDialog };
