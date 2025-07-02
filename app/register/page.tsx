import { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">Create account</h1>
        <AuthForm variant="signup" />
        <p className="text-center text-sm">
          Already have an account? <a className="underline" href="/login">Sign in</a>
        </p>
      </div>
    </main>
  );
}
