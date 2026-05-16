import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const AuthSignup = () => {
    return (
        <div className="flex min-h-screen w-full flex-col lg:flex-row">
            {/* Left Side - Signup Form */}
            <div className="flex w-full items-center justify-center lg:w-1/2 p-8 lg:p-16">
                <div className="w-full max-w-sm space-y-8">
                    <div className="space-y-2">
                        <Link href="/" className="flex items-center gap-2 mb-8 group">
                            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-primary text-primary-foreground font-bold">
                                R
                            </div>
                            <span className="font-bold text-xl">Rescomail</span>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
                        <p className="text-muted-foreground">
                            Start your journey to landing your dream job today
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first-name">First name</Label>
                                <Input id="first-name" placeholder="John" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last-name">Last name</Label>
                                <Input id="last-name" placeholder="Doe" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="name@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required />
                        </div>
                        <Button className="w-full h-10 text-base" size="lg">
                            Sign Up <ArrowRight className="ml-2 h-4 w-4" />
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
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>

            <div className="relative hidden w-1/2 overflow-hidden border-l bg-muted/20 lg:flex">
                <div className="relative z-10 flex w-full flex-col justify-center p-16">
                    <div className="max-w-md space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-none border bg-background px-3 py-1 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Trusted by developers worldwide
                        </div>
                        <h2 className="text-4xl font-bold leading-tight">
                            The best investment I made for my career this year.
                        </h2>
                        <div className="space-y-6 pt-8">
                            {[
                                { title: "ATS Optimized", desc: "Pass through filters effortlessly" },
                                { title: "AI Generation", desc: "Personalized content that sticks" },
                                { title: "Time Saver", desc: "Apply to 10x more roles daily" }
                            ].map((item) => (
                                <div key={item.title} className="flex gap-4">
                                    <div className="h-6 w-6 border border-primary flex items-center justify-center shrink-0">
                                        <div className="h-2 w-2 bg-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{item.title}</p>
                                        <p className="text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthSignup

