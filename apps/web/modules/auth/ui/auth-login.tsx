"use client";

import { emailOtp, signIn } from "@repo/auth/client";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/components/input-otp";
import {
  emailOtpRequestSchema,
  emailOtpVerifySchema,
} from "@repo/validations";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { SiGithub, SiGoogle } from "react-icons/si";

type LoginStep = "options" | "verify";
type SocialProvider = "google" | "github";

const AuthLogin = () => {
  const [step, setStep] = useState<LoginStep>("options");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;

    const timeout = setTimeout(() => {
      setAuthError("Unable to complete social login. Please try again.");
    }, 0);

    return () => clearTimeout(timeout);
  }, [searchParams]);

  const onSocialLogin = async (provider: SocialProvider) => {
    setAuthError(null);
    setIsPending(true);

    try {
      const response = await signIn.social({
        provider,
        callbackURL: "/dashboard",
        errorCallbackURL: "/login",
      });

      if (response.error) {
        setAuthError(
          `${provider === "github" ? "GitHub" : "Google"} login is unavailable. Check the OAuth configuration and try again.`,
        );
      }
    } catch {
      setAuthError("Unable to start social login. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const onSendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);

    const parsed = emailOtpRequestSchema.safeParse({ email });
    if (!parsed.success) {
      setAuthError(parsed.error.issues[0]?.message ?? "Enter a valid email.");
      return;
    }

    setIsPending(true);
    try {
      const response = await emailOtp.sendVerificationOtp({
        email: parsed.data.email,
        type: "sign-in",
      });

      if (response.error) {
        setAuthError(response.error.message ?? "Unable to send the login code.");
        return;
      }

      setEmail(parsed.data.email);
      setStep("verify");
    } catch {
      setAuthError("Unable to send the login code. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const onVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);

    const parsed = emailOtpVerifySchema.safeParse({ email, otp });
    if (!parsed.success) {
      setAuthError(parsed.error.issues[0]?.message ?? "Enter a valid code.");
      return;
    }

    setIsPending(true);
    try {
      const response = await signIn.emailOtp(parsed.data);

      if (response.error) {
        setAuthError(
          response.error.code === "OTP_EXPIRED"
            ? "This code has expired. Request a new one."
            : "The code is invalid. Check it and try again.",
        );
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setAuthError("Unable to verify the code. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const resetOtp = () => {
    setStep("options");
    setOtp("");
    setAuthError(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background transition-colors duration-300 lg:flex-row">
      <main className="flex w-full items-center justify-center p-6 sm:p-8 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-sm space-y-6 md:space-y-8 px-2 md:px-6">
          <div className="space-y-2">
            <Link href="/" className="group mb-6 flex items-center gap-2 md:mb-8">
              <div className="bg-custom p-1 rounded-md">
                <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-custom/80 font-bold text-white hover:shadow-[inset_0_0_10px_rgba(255,255,255,0.4)]">
                  R
                </div>
              </div>
              <span className="text-base font-bold md:text-xl">Rescomail</span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {step === "options" ? "Welcome back" : "Enter your code"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "options"
                ? "Choose a secure way to access your account"
                : `We sent a six-digit code to ${email}.`}
            </p>
          </div>

          {authError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login failed</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          ) : null}

          {step === "options" ? (
            <div className="space-y-4">
              <form onSubmit={onSendOtp} className="space-y-4">
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="elon@musk.com"
                  autoComplete="email"
                  aria-label="Email address"
                  disabled={isPending}
                  className="h-10 rounded-lg! border-2! border-foreground/5!"
                />
                <div className="bg-custom p-0.5! rounded-lg!">
                  <Button type="submit" className="h-9 w-full rounded-lg! bg-custom/60! text-white! hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.4)]! transition-all! duration-300!" disabled={isPending}>
                    {!!isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send an OTP
                  </Button>
                </div>
              </form>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <div className="grid grid-rows-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full gap-4 border-2 border-foreground/10! rounded-lg"
                  onClick={() => onSocialLogin("github")}
                  disabled={isPending}
                >
                  <SiGithub className="h-4 w-4" />
                  Sign in with GitHub
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full gap-4 border-2 border-foreground/10! rounded-lg"
                  onClick={() => onSocialLogin("google")}
                  disabled={isPending}
                >
                  <SiGoogle className="h-4 w-4" />
                  Sign in with Google
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={onVerifyOtp} className="space-y-4">
              <InputOTP
                value={otp}
                onChange={(value) =>
                  setOtp(value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                aria-label="Six-digit login code"
                containerClassName="w-full"
                disabled={isPending}
                autoFocus
              >
                <InputOTPGroup className="w-full">
                  {Array.from({ length: 6 }, (_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="h-11 flex-1 text-lg"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <Button type="submit" className="h-10 w-full" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Verify and continue
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={resetOtp}
                disabled={isPending}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Use another login method
              </Button>
            </form>
          )}
        </div>
      </main>

      <aside className="relative hidden w-1/2 overflow-hidden bg-background lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden blur-sm"
          style={{
            backgroundImage: `radial-gradient(
              circle at 0% 50%,
              var(--radial-center) 0%,
              var(--radial-stop1) 18%,
              var(--radial-stop2) 35%,
              var(--radial-stop3) 25%,
              var(--radial-stop4) 60%,
              var(--radial-stop5) 100%
            )`,
          }}
        >
          <div className="absolute top-1/2 left-[-75vh] z-50 aspect-square w-[150vh] -translate-y-1/2 animate-fade-in rounded-[50%] bg-background transition-colors duration-300" />
        </div>

        <div className="relative z-10 flex w-full flex-col items-start justify-center py-16">
          <div className="max-w-md space-y-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Your AI writing workspace.
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Analyze resumes for ATS compatibility and draft personalized
              outreach emails in one place.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AuthLogin;
