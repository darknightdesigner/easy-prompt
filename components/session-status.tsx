"use client";
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";

export function SessionStatus() {
  const { session } = useSessionContext();
  if (!session) return null;
  const supabase = useSupabaseClient();
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <span>Logged in as {session.user.email}</span>
      <button
        onClick={() => supabase.auth.signOut()}
        className="underline text-primary hover:opacity-80"
      >
        Sign out
      </button>
    </div>
  );
}
