"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAvatarSync } from "@/lib/hooks/use-avatar-sync";
import { cn } from "@/lib/utils";

interface AvatarSyncButtonProps {
  onSyncComplete?: (updated: boolean) => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  showLastSync?: boolean;
  autoHide?: boolean; // Hide if sync not needed
}

/**
 * Enhanced button component to sync OAuth profile image to user avatar
 */
export function AvatarSyncButton({ 
  onSyncComplete, 
  className,
  variant = "outline",
  size = "sm",
  showLastSync = false,
  autoHide = false
}: AvatarSyncButtonProps) {
  const { 
    syncAvatar, 
    checkOAuthAvatar, 
    clearError,
    shouldSync,
    isLoading, 
    error, 
    lastSyncTime,
    wasUpdated,
    isAuthenticated 
  } = useAvatarSync();
  
  const [hasOAuthAvatar, setHasOAuthAvatar] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if user has OAuth avatar on mount
  useEffect(() => {
    if (isAuthenticated) {
      checkOAuthAvatar().then(setHasOAuthAvatar);
    }
  }, [isAuthenticated, checkOAuthAvatar]);

  // Show success message temporarily
  useEffect(() => {
    if (wasUpdated) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [wasUpdated]);

  const handleSync = async () => {
    clearError();
    const result = await syncAvatar();
    
    if (result.success && onSyncComplete) {
      onSyncComplete(result.updated || false);
    }
  };

  // Don't show button if user is not authenticated or has no OAuth avatar
  if (!isAuthenticated || !hasOAuthAvatar) {
    return null;
  }

  // Auto-hide if sync not needed and autoHide is enabled
  if (autoHide && !shouldSync(60)) {
    return null;
  }

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleSync}
        disabled={isLoading}
        className={cn("gap-2", className)}
      >
        {isLoading ? (
          <Icon name="arrowcounterclockwise" className="size-4 animate-spin" />
        ) : showSuccess ? (
          <Icon name="check" className="size-4 text-green-600" />
        ) : (
          <Icon name="profile" className="size-4" />
        )}
        {isLoading 
          ? "Syncing..." 
          : showSuccess 
          ? "Synced!" 
          : "Sync Profile Image"
        }
      </Button>
      
      {showLastSync && lastSyncTime && (
        <p className="text-xs text-muted-foreground">
          Last synced: {formatLastSync(lastSyncTime)}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {showSuccess && wasUpdated && (
        <p className="text-sm text-green-600">Profile image updated!</p>
      )}
      
      {showSuccess && !wasUpdated && (
        <p className="text-sm text-muted-foreground">Profile image is up to date</p>
      )}
    </div>
  );
}
