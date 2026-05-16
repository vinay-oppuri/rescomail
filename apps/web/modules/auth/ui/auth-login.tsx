import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const AuthLogin = () => {
    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row">
            {/* Left Side - Login Form */}
            <div className="flex w-full items-center justify-center lg:w-1/2 p-8 lg:p-16">
                <div className="w-full max-w-sm space-y-8">
                    <div className="space-y-2">
                        <Link href="/" className="flex items-center gap-2 mb-8 group">
                            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-primary text-primary-foreground font-bold">
                                R
                            </div>
                            <span className="font-bold text-xl">Rescomail</span>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="name@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link href="#" className="text-sm font-medium text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input id="password" type="password" required />
                        </div>
                        <Button className="w-full h-10 text-base" size="lg">
                            Sign In <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="w-full">
                            Google
                        </Button>
                        <Button variant="outline" className="w-full">
                            GitHub
                        </Button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="font-semibold text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            <div className="relative hidden w-1/2 overflow-hidden border-l bg-muted/20 lg:flex">
                <div className="relative z-10 flex w-full flex-col justify-center p-16">
                    <div className="max-w-md space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-none border bg-background px-3 py-1 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Used by 5000+ applicants
                        </div>
                        <h2 className="text-4xl font-bold leading-tight">
                            Rescomail helped me double my interview rate in just 2 weeks.
                        </h2>
                        <div className="space-y-4 pt-8">
                            {[
                                "AI-Powered ATS analysis",
                                "Personalized cold emails",
                                "Smart application tracking",
                                "Unlimited resume versions"
                            ].map((text) => (
                                <div key={text} className="flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 bg-primary" />
                                    <span className="text-lg text-muted-foreground">{text}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="pt-12 border-t mt-12">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-primary rounded-none" />
                                <div>
                                    <p className="font-bold">Alex Chen</p>
                                    <p className="text-sm text-muted-foreground">Software Engineer @ Google</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthLogin

