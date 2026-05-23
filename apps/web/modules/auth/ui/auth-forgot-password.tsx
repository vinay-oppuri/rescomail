"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@repo/auth/client";
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
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@repo/validations";

type ForgotPasswordFormValues = ForgotPasswordInput;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const AuthForgotPassword = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setAuthError(null);

    try {
      const response = await requestPasswordReset({
        email: values.email,
        redirectTo: "/reset-password",
      });

      if (response.error) {
        setAuthError(
          response.error.message ?? "Unable to send password reset email.",
        );
        return;
      }

      setIsSubmitted(true);
    } catch (error) {
      setAuthError(
        getErrorMessage(error, "Unable to send password reset email."),
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      <div className="flex w-full items-center justify-center p-6 sm:p-8 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-sm space-y-6 md:space-y-8">
          <div className="space-y-2">
            <Link href="/" className="group mb-6 md:mb-8 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-none bg-primary font-bold text-primary-foreground">
                R
              </div>
              <span className="text-base md:text-xl font-bold">Rescomail</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your account email and we&apos;ll send a secure reset link.
            </p>
          </div>

          {isSubmitted ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Check your email</AlertTitle>
              <AlertDescription>
                If that email belongs to an account, a reset link is on its way.
              </AlertDescription>
            </Alert>
          ) : null}

          {authError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Reset email failed</AlertTitle>
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
                        placeholder="name@example.com"
                        autoComplete="email"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="h-10 w-full text-sm md:text-base"
                size="lg"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Sending link"
                  : "Send reset link"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>

          <Button variant="ghost" className="w-full" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative hidden w-1/2 overflow-hidden border-l bg-muted/20 lg:flex">
        <div className="relative z-10 flex w-full flex-col justify-center p-16">
          <div className="max-w-md space-y-6">
            <div className="inline-flex items-center gap-2 rounded-none border bg-background px-3 py-1 text-sm font-medium">
              <Mail className="h-4 w-4 text-primary" />
              Secure account recovery
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Get back to your resumes, outreach, and applications.
            </h2>
            <div className="space-y-4 pt-8">
              {[
                "One-time reset links",
                "Short-lived recovery tokens",
                "Existing sessions revoked after reset",
              ].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 bg-primary" />
                  <span className="text-sm md:text-lg text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForgotPassword;
