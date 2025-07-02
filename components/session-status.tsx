"use client";
import { useSessionContext } from "@supabase/auth-helpers-react";

export function SessionStatus() {
  const { session } = useSessionContext();
  if (!session) return null;
  return (
    <p className="text-sm text-muted-foreground text-center">
      Logged in as {session.user.email}
    </p>
  );
}
