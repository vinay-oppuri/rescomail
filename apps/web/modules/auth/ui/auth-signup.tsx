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
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { signupSchema, type SignupInput } from "@repo/validations";
import { clientEnv } from "@repo/env/client";
import { Turnstile } from "@marsidev/react-turnstile";

import { PasswordInput } from "./password-input";

type SignupFormValues = SignupInput;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const AuthSignup = () => {
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
            ? "This email is already registered. Please sign in with your email and password."
            : `An error occurred during authentication (${errorParam}). Please try again.`
        );
      }, 0);
    }
  }, [searchParams]);

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
        fetchOptions: {
          headers: {
            "x-captcha-response": captchaToken || "",
          }
        }
      });

      if (response.error) {
        if (response.error.status === 429) {
          setAuthError("Too many failed attempts. Please try again later.");
        } else {
          setAuthError(response.error.message ?? "Unable to create an account.");
        }
        return;
      }

      form.reset();
      router.push("/dashboard");
      router.refresh();
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
        errorCallbackURL: "/signup",
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
      <div className="flex w-full items-center justify-center p-6 sm:p-8 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-sm space-y-6 md:space-y-8">
          <div className="space-y-2">
            <Link href="/" className="group mb-6 md:mb-8 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center bg-primary font-bold text-primary-foreground rounded-sm">
                R
              </div>
              <span className="text-base md:text-xl font-bold">Rescomail</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Elon"
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Musk"
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="elon@musk.com"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        autoComplete="new-password"
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
                    theme: "light",
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
            <div className="inline-flex items-center gap-2 border bg-background px-4 py-2 text-sm font-medium rounded-full">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Trusted by developers worldwide
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
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
                <div key={item.title} className="flex gap-4 [&_div]:rounded-full">
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
