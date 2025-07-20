"use client";

import { useSessionContext } from "@supabase/auth-helpers-react";
import { useAuthDialog } from "@/components/ui/auth-required-dialog";
import { storeReturnUrl } from "@/lib/utils/auth-redirect";

/**
 * Hook that enforces authentication before performing an action.
 * Automatically stores the current URL to return to after authentication.
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
      // Store current URL to return to after authentication
      storeReturnUrl();
      showDialog(message);
      return false;
    }
    return true;
  }

  return { requireAuth };
}
