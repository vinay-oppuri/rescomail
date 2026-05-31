"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@repo/auth/client";
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
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@repo/validations";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { PasswordInput } from "./password-input";

type ResetPasswordFormValues = ResetPasswordInput;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const AuthResetPassword = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const linkError = searchParams.get("error");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setAuthError("This reset link is missing a token.");
      return;
    }

    setAuthError(null);

    try {
      const response = await resetPassword({
        newPassword: values.password,
        token,
      });

      if (response.error) {
        setAuthError(response.error.message ?? "Unable to reset password.");
        return;
      }

      form.reset();
      setIsComplete(true);
    } catch (error) {
      setAuthError(getErrorMessage(error, "Unable to reset password."));
    }
  };

  const hasInvalidLink = Boolean(linkError) || !token;

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <Link href="/" className="group mb-8 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center bg-primary font-bold text-primary-foreground">
                R
              </div>
              <span className="text-xl font-bold">Rescomail</span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              Choose a new password
            </h1>
            <p className="text-muted-foreground">
              Use a password that&apos;s at least 8 characters long.
            </p>
          </div>

          {hasInvalidLink ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Reset link is invalid</AlertTitle>
              <AlertDescription>
                Request a new password reset link to continue.
              </AlertDescription>
            </Alert>
          ) : null}

          {isComplete ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Password updated</AlertTitle>
              <AlertDescription>
                You can now sign in with your new password.
              </AlertDescription>
            </Alert>
          ) : null}

          {authError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Password reset failed</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          ) : null}

          {!hasInvalidLink && !isComplete ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          autoComplete="new-password"
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          autoComplete="new-password"
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
                  className="h-10 w-full text-base"
                  size="lg"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Updating password"
                    : "Update password"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          ) : null}

          <Button
            variant={isComplete ? "default" : "ghost"}
            className="w-full"
            asChild
          >
            <Link href={isComplete ? "/login" : "/forgot-password"}>
              {isComplete ? null : <ArrowLeft className="mr-2 h-4 w-4" />}
              {isComplete ? "Go to Login" : "Request a new link"}
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative hidden w-1/2 overflow-hidden border-l bg-muted/20 lg:flex">
        <div className="relative z-10 flex w-full flex-col justify-center p-16">
          <div className="max-w-md space-y-6">
            <div className="inline-flex items-center gap-2 border bg-background px-3 py-1 text-sm font-medium">
              <LockKeyhole className="h-4 w-4 text-primary" />
              Password protected
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              A fresh password keeps your application workspace protected.
            </h2>
            <div className="space-y-4 pt-8">
              {[
                "Reset token expires after one hour",
                "Used links are immediately invalidated",
                "Active sessions close after a reset",
              ].map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 bg-primary" />
                  <span className="text-lg text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthResetPassword;
