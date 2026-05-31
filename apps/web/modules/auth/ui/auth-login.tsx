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
import { clientEnv } from "@repo/env/client";
import { Turnstile } from "@marsidev/react-turnstile";

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
  const [socialLoading, setSocialLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
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

  const isPending = form.formState.isSubmitting || socialLoading;

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);

    try {
      const response = await signIn.email({
        email: values.email,
        password: values.password,
        fetchOptions: {
          headers: {
            "x-captcha-response": captchaToken || "",
          }
        }
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
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
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
              {clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                  <Turnstile
                    siteKey={clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                    onSuccess={setCaptchaToken}
                    options={{
                      theme: "auto",
                      size: "invisible"
                    }}
                  />
              )}
              <Button
                type="submit"
                className="h-10 w-full text-sm md:text-base"
                size="lg"
                disabled={isPending}
              >
                {form.formState.isSubmitting ? "Signing in" : "Sign In"}
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

      <div className="relative hidden w-1/2 overflow-hidden border-l bg-muted/20 lg:flex">
        <div className="relative z-10 flex w-full flex-col justify-center p-16">
          <div className="max-w-md space-y-6">
            <div className="inline-flex items-center gap-2 border bg-background px-4 py-2 text-sm font-medium rounded-full">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Used by 5000+ applicants
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Rescomail helped me double my interview rate in just 2 weeks.
            </h2>
            <div className="space-y-4 pt-8">
              {[
                "AI-Powered ATS analysis",
                "Personalized cold emails",
                "Smart application tracking",
                "Unlimited resume versions",
              ].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  <span className="text-sm md:text-lg text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 border-t pt-12">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary rounded-sm" />
                <div>
                  <p className="font-bold">Alex Chen</p>
                  <p className="text-sm text-muted-foreground">
                    Software Engineer @ Google
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;
