"use client";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";

export function SessionStatus() {
  const supabase = useSupabaseClient();
  const { session } = useSessionContext();
  if (!session) return null;
  return (
    <div className="relative z-20 flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <span>Logged in as {session.user.email}</span>
      <button type="button"
        onClick={() => supabase.auth.signOut()}
        className="underline text-primary hover:opacity-80"
      >
        Sign out
      </button>
    </div>
  );
}
