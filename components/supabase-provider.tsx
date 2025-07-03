"use client";

import { ReactNode, useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

import type { Session } from "@supabase/supabase-js";

interface Props {
  children: ReactNode;
  initialSession: Session | null;
}

export function SupabaseProvider({ children, initialSession }: Props) {
  // Ensure the client instance is memoised between re-renders
  const [supabaseClient] = useState(() => supabaseBrowser());

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={initialSession}>
      {children}
    </SessionContextProvider>
  );
}
