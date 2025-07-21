"use client";

import { useState, useCallback } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { syncCurrentUserAvatar, hasOAuthAvatar } from "@/lib/utils/avatar-sync";

interface AvatarSyncResult {
  success: boolean;
  updated?: boolean;
  error?: string;
}

/**
 * Hook for managing OAuth avatar synchronization with enhanced state management
 */
export function useAvatarSync() {
  const { session } = useSessionContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [wasUpdated, setWasUpdated] = useState(false);

  /**
   * Sync current user's avatar from OAuth provider
   */
  const syncAvatar = useCallback(async (): Promise<AvatarSyncResult> => {
    if (!session?.user) {
      const errorMsg = "User not authenticated";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsLoading(true);
    setError(null);
    setWasUpdated(false);

    try {
      const result = await syncCurrentUserAvatar();
      
      if (!result.success) {
        setError(result.error || "Failed to sync avatar");
        return { success: false, error: result.error };
      }

      setLastSyncTime(new Date());
      setWasUpdated(result.updated || false);
      
      return { 
        success: true, 
        updated: result.updated,
        error: undefined 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  /**
   * Check if user has OAuth avatar available for sync
   */
  const checkOAuthAvatar = useCallback(async (): Promise<boolean> => {
    if (!session?.user) return false;
    
    try {
      return await hasOAuthAvatar();
    } catch {
      return false;
    }
  }, [session?.user]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check if sync is needed (hasn't been done recently)
   */
  const shouldSync = useCallback((maxAgeMinutes: number = 60): boolean => {
    if (!lastSyncTime) return true;
    
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSyncTime.getTime()) / (1000 * 60);
    return diffMinutes > maxAgeMinutes;
  }, [lastSyncTime]);

  return {
    syncAvatar,
    checkOAuthAvatar,
    clearError,
    shouldSync,
    isLoading,
    error,
    lastSyncTime,
    wasUpdated,
    isAuthenticated: !!session?.user
  };
}
