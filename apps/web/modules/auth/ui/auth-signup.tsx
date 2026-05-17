"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signUp } from "@repo/auth/client";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const AuthSignup = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const isPending = form.formState.isSubmitting || socialLoading;

  const onSubmit = async (values: SignupFormValues) => {
    setAuthError(null);

    try {
      const response = await signUp.email({
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        password: values.password,
      });

      if (response.error) {
        setAuthError(response.error.message ?? "Unable to create an account.");
        return;
      }

      form.reset();
      window.location.href = "/dashboard";
    } catch (error) {
      setAuthError(getErrorMessage(error, "Unable to create an account."));
    }
  };

  const onGoogleSignIn = async () => {
    setAuthError(null);
    setSocialLoading(true);

    try {
      const response = await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (response.error) {
        setAuthError(
          response.error.message ?? "Unable to continue with Google.",
        );
      }
    } catch (error) {
      setAuthError(getErrorMessage(error, "Unable to continue with Google."));
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left Side - Signup Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <Link href="/" className="group mb-8 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-none bg-primary font-bold text-primary-foreground">
                R
              </div>
              <span className="text-xl font-bold">Rescomail</span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              Create an account
            </h1>
            <p className="text-muted-foreground">
              Start your journey to landing your dream job today
            </p>
          </div>

          {authError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sign up failed</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          ) : null}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          autoComplete="given-name"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          autoComplete="family-name"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        autoComplete="email"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="h-10 w-full text-base"
                size="lg"
                disabled={isPending}
              >
                {form.formState.isSubmitting ? "Creating account" : "Sign Up"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>

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
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onGoogleSignIn}
              disabled={isPending}
            >
              Google
            </Button>
            <Button type="button" variant="outline" className="w-full" disabled>
              GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
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
                {
                  title: "ATS Optimized",
                  desc: "Pass through filters effortlessly",
                },
                {
                  title: "AI Generation",
                  desc: "Personalized content that sticks",
                },
                {
                  title: "Time Saver",
                  desc: "Apply to 10x more roles daily",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-primary">
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
  );
};

export default AuthSignup;
