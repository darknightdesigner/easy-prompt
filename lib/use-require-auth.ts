"use client";

import { useSessionContext } from "@supabase/auth-helpers-react";
import { useAuthDialog } from "@/components/ui/auth-required-dialog";

/**
 * Hook that enforces authentication before performing an action.
 *
 * Usage:
 * const { requireAuth } = useRequireAuth();
 * if (!requireAuth()) return;
 */
export function useRequireAuth() {
  const { session } = useSessionContext();
  const { showDialog } = useAuthDialog();

  function requireAuth(message?: string): boolean {
    if (!session) {
      showDialog(message);
      return false;
    }
    return true;
  }

  return { requireAuth };
}
