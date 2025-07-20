"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { getAndClearReturnUrl, getFallbackUrl } from "@/lib/utils/auth-redirect";

interface AuthFormProps {
  variant: "signin" | "signup";
}

export function AuthForm({ variant }: AuthFormProps) {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let res;
    if (variant === "signup") {
      res = await supabase.auth.signUp({ email, password });
    } else {
      res = await supabase.auth.signInWithPassword({ email, password });
    }

    if (res.error) {
      setError(res.error.message);
      setLoading(false);
      return;
    }

    // Success - redirect to stored return URL or fallback
    const returnUrl = getAndClearReturnUrl() || getFallbackUrl();
    router.replace(returnUrl);
  }

  async function handleGoogle() {
    try {
      setOauthLoading(true);
      
      // Get return URL to include in OAuth redirect
      const returnUrl = getAndClearReturnUrl() || getFallbackUrl();
      const redirectTo = `${window.location.origin}/login?returnUrl=${encodeURIComponent(returnUrl)}`;
      
      await supabase.auth.signInWithOAuth({ 
        provider: "google",
        options: {
          redirectTo
        }
      });
    } finally {
      setOauthLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          id="email"
          type="email"
          className="shadow-none"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Input
          id="password"
          type="password"
          className="shadow-none"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Loading…" : variant === "signup" ? "Create account" : "Log in"}
      </Button>
      <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={oauthLoading}>
        <FcGoogle className="mr-2 size-5" />
        {oauthLoading ? "Redirecting…" : "Continue with Google"}
      </Button>
    </form>
  );
}
