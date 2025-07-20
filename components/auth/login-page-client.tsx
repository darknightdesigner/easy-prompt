"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { getAndClearReturnUrl, getFallbackUrl } from "@/lib/utils/auth-redirect";

/**
 * Client component to handle OAuth callbacks and return URL redirects
 */
export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useSessionContext();

  useEffect(() => {
    // If user is already authenticated, redirect them
    if (session) {
      // Check for return URL in query params (from OAuth callback)
      const returnUrlFromQuery = searchParams.get('returnUrl');
      
      if (returnUrlFromQuery) {
        // Decode and validate the return URL
        try {
          const decodedUrl = decodeURIComponent(returnUrlFromQuery);
          router.replace(decodedUrl);
          return;
        } catch {
          // If decoding fails, fall back to stored URL or default
        }
      }
      
      // Check for stored return URL
      const storedReturnUrl = getAndClearReturnUrl();
      if (storedReturnUrl) {
        router.replace(storedReturnUrl);
        return;
      }
      
      // Fallback to default page
      router.replace(getFallbackUrl());
    }
  }, [session, router, searchParams]);

  // This component doesn't render anything visible
  return null;
}
