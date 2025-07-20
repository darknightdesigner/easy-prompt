import { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { CopyIcon } from "@/components/animated-icons/easyprompt";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { LoginPageClient } from "@/components/auth/login-page-client";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <LoginPageClient />
      <div className="w-full max-w-sm space-y-6 pb-24">
        <div className="flex flex-col items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/"><CopyIcon size={32} /></Link>
              </TooltipTrigger>
              <TooltipContent side="right">Let's go home</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <h1 className="text-2xl font-bold text-center">Login</h1>
        </div>
        <AuthForm variant="signin" />
        <p className="text-center text-sm">
          Don’t have an account? <a className="underline" href="/register">Sign up</a>
        </p>
      </div>
    </main>
  );
}
