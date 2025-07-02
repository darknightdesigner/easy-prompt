import { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">Sign in</h1>
        <AuthForm variant="signin" />
        <p className="text-center text-sm">
          Don’t have an account? <a className="underline" href="/register">Sign up</a>
        </p>
      </div>
    </main>
  );
}
