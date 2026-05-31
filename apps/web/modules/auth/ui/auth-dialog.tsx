import { LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui";
import { SiGoogle } from "react-icons/si";
import { SiGithub } from "react-icons/si";
import Link from "next/link";
import { signIn, useSession } from "@repo/auth/client";

const AuthDialog = () => {
    const { data: session } = useSession();

    const onGoogle = async () => {
        await signIn.social({
            provider: 'google',
            callbackURL: '/dashboard'
        })
    }

    if (session?.user) {
        return (
            <Button asChild className="font-semibold gap-2 px-4 h-8 bg-foreground! text-background! transition-all duration-300 ease-out hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5">
                <Link href="/dashboard">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                </Link>
            </Button>
        )
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="font-semibold gap-2 px-4 h-8 bg-foreground! text-background! transition-all duration-300 ease-out hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-lg sm:max-w-100 p-0 overflow-hidden bg-background/95 backdrop-blur-2xl shadow-2xl">
                <div className="p-8">
                    <DialogHeader className="mb-8">
                        <DialogTitle className="text-2xl font-extrabold tracking-tight">
                            Welcome back
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-2">
                            Sign in to your Rescomail account to access your AI copilot and track your applications.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        <Button
                            className="h-11 w-full justify-center gap-4 px-6 hover:scale-103 transition-all duration-300"
                            onClick={onGoogle}
                        >
                            <SiGoogle className="h-5 w-5" />
                            Continue with Google
                        </Button>
                        <Button disabled
                            className="h-11 w-full justify-center gap-4 px-6 hover:scale-103"
                        >
                            <SiGithub className="h-5 w-5" />
                            Continue with Github
                        </Button>
                    </div>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground tracking-widest font-bold">
                                Or
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                        <DialogFooter className="flex! flex-row! items-center! justify-center! gap-6 text-xs font-medium">
                            <Link href='/login' className="text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4">
                                Email Login
                            </Link>
                            <span className="text-border/50">•</span>
                            <Link href='/signup' className="text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4">
                                Create Account
                            </Link>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AuthDialog;