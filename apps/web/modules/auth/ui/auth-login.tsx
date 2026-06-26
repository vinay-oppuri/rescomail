"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@repo/auth/client";
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
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "@repo/validations";

import { PasswordInput } from "./password-input";

type LoginFormValues = LoginInput;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const AuthLogin = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setTimeout(() => {
        setAuthError(
          errorParam === "account_already_linked" || errorParam === "OAuthAccountNotLinked" || errorParam === "account_not_linked" || errorParam?.includes("linked")
            ? "This email is already registered with a different provider. Please sign in with your email and password."
            : `An error occurred during authentication (${errorParam}). Please try again.`
        );
      }, 0);
    }
  }, [searchParams]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isPending = form.formState.isSubmitting || socialLoading || authSuccess;

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    setAuthSuccess(false);

    try {
      const response = await signIn.email({
        email: values.email,
        password: values.password,
      });

      if (response.error) {
        if (response.error.status === 429) {
          setAuthError("Too many failed attempts. Please try again in 15 minutes.");
        } else {
          setAuthError(response.error.message ?? "Unable to sign in.");
        }
        return;
      }

      form.reset();
      setAuthSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 700));
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setAuthError(getErrorMessage(error, "Unable to sign in."));
    }
  };

  const onGoogleSignIn = async () => {
    setAuthError(null);
    setSocialLoading(true);

    try {
      const response = await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        errorCallbackURL: "/login",
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
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background transition-colors duration-300">
      {/* Left Side - Login Form */}
      <div className="flex w-full items-center justify-center p-6 sm:p-8 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-sm space-y-6 md:space-y-8">
          <div className="space-y-2">
            <Link href="/" className="group mb-6 md:mb-8 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center bg-primary font-bold text-primary-foreground rounded-sm">
                R
              </div>
              <span className="text-base md:text-xl font-bold">Rescomail</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          {authError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sign in failed</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          ) : null}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="elon@example.com"
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
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <PasswordInput
                        autoComplete="current-password"
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
                className={
                  authSuccess
                    ? "h-10 w-full bg-emerald-500 text-sm text-white hover:bg-emerald-500 md:text-base"
                    : "h-10 w-full text-sm md:text-base"
                }
                size="lg"
                disabled={isPending}
              >
                {authSuccess ? "Login successful" : form.formState.isSubmitting ? "Signing in" : "Sign In"}
                {authSuccess ? (
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowRight className="ml-2 h-4 w-4" />
                )}
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
              className="w-full border-foreground/5!"
              onClick={onGoogleSignIn}
              disabled={isPending}
            >
              Google
            </Button>
            <Button type="button" variant="outline" className="w-full border-foreground/5!" disabled>
              GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden w-1/2 overflow-hidden bg-background lg:flex">
        {/* ── Horizon Gradient Backdrop (mirrored) ── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 blur-sm"
          style={{
            backgroundImage: `radial-gradient(
              circle at 0% 50%,
              var(--radial-center) 0%,
              var(--radial-stop1) 18%,
              var(--radial-stop2) 35%,
              var(--radial-stop3) 25%,
              var(--radial-stop4) 60%,
              var(--radial-stop5) 100%
            )`
          }}
        >
          {/* Semicircle Overlay */}
          <div
            className="absolute top-1/2 -translate-y-1/2 bg-background transition-colors duration-300 animate-fade-in z-50 w-[150vh] aspect-square rounded-[50%] left-[-75vh]"
          />
        </div>

        <div className="relative z-10 flex w-full flex-col justify-center items-start py-16">
          <div className="max-w-md space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Your AI-powered job copilot.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Scan your resume against job listings, draft custom outreach templates, and manage your application pipeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;
