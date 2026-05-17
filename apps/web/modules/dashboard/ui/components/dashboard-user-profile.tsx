"use client";

import { signOut, useSession } from "@repo/auth/client";
import {
    Avatar,
    AvatarImage,
    Badge,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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

const DashboardUserProfile = () => {
    const { data } = useSession();
    const router = useRouter();

    const onSignOut = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/sign-in");
                },
            },
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 border-none px-2 transition-colors hover:bg-primary/10"
                >
                    <div className="flex h-7 w-7 items-center justify-center border border-primary/20 bg-primary/10">
                        {data?.user?.image ? (
                            <Avatar className="h-7 w-7 rounded-none">
                                <AvatarImage
                                    className="h-7 w-7 rounded-none"
                                    src={data.user.image}
                                />
                            </Avatar>
                        ) : (
                            <User className="h-4 w-4 text-primary" />
                        )}
                    </div>
                    <span className="hidden text-[10px] font-bold uppercase sm:inline-block">Account </span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <UserProfileDialog />
                    <DropdownMenuItem>Billing </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={onSignOut}
                    >
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export { DashboardUserProfile };

const UserProfileDialog = () => {
    const { data } = useSession();

    const user = data?.user;

    const initials =
        user?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "U";

    return (
        <Dialog>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Profile
                </DropdownMenuItem>
            </DialogTrigger>

            <DialogContent className="sm:max-w-130">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-xl font-bold">
                        My Profile
                    </DialogTitle>

                    <DialogDescription>
                        Manage your account information and profile details.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-20 w-20 border">
                                {data?.user.image ? (
                                    <AvatarImage src={user?.image || ""} />
                                ) : (
                                    <User className="h-4 w-4 text-primary" />
                                )}
                            </Avatar>

                            <Button
                                size="icon"
                                variant="secondary"
                                className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full"
                            >
                                <Camera className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">
                                {user?.name || "Unknown User"}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {user?.email}
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <Badge variant="secondary">
                                    <Shield className="mr-1 h-3 w-3" />
                                    Authenticated
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* User Information */}
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>

                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                                <Input
                                    id="name"
                                    defaultValue={user?.name || ""}
                                    className="pl-10"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>

                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                                <Input
                                    id="email"
                                    type="email"
                                    defaultValue={user?.email || ""}
                                    className="pl-10"
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Account Status</Label>

                            <div className="flex items-center gap-2 rounded-md border p-3 text-sm">
                                <Shield className="h-4 w-4 text-green-500" />

                                <span className="font-medium">
                                    Your account is active and secure
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Member Since</Label>

                            <div className="flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                May 2026
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline">
                            Cancel
                        </Button>

                        <Button>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
export { UserProfileDialog };