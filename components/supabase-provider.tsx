"use client";

import { ReactNode, useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

interface Props {
  children: ReactNode;
}

export function SupabaseProvider({ children }: Props) {
  // Ensure the client instance is memoised between re-renders
  const [supabaseClient] = useState(() => supabaseBrowser());

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
}
