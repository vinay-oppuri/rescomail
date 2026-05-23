import AuthResetPassword from "@/modules/auth/ui/auth-reset-password";
import { Suspense } from "react";

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center p-8">
          <div className="h-8 w-40 animate-pulse bg-muted" />
        </div>
      }
    >
      <AuthResetPassword />
    </Suspense>
  );
};

export default Page;
