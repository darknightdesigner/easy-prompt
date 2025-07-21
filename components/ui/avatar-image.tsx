"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarImageProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  fallbackSrc?: string;
  showInitials?: boolean;
  initials?: string;
}

/**
 * Robust avatar image component with error handling and fallbacks
 */
export function AvatarImage({
  src,
  alt = "Avatar",
  size = 40,
  className,
  fallbackSrc = "/default-avatar.png",
  showInitials = true,
  initials
}: AvatarImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false); // Reset error state for fallback
    } else {
      setHasError(true);
    }
  };

  // If we have an error with fallback and should show initials
  if (hasError && showInitials && initials) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      onError={handleError}
      priority={size > 50} // Prioritize larger avatars
    />
  );
}

/**
 * Generate initials from display name
 */
export function generateInitials(displayName?: string | null): string {
  if (!displayName) return "U";
  
  const words = displayName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0);
  }
  
  return words[0].charAt(0) + words[words.length - 1].charAt(0);
}

/**
 * Avatar component that automatically handles user data
 */
interface UserAvatarProps {
  user: {
    avatar_url?: string | null;
    display_name?: string | null;
  };
  size?: number;
  className?: string;
}

export function UserAvatar({ user, size = 40, className }: UserAvatarProps) {
  const initials = generateInitials(user.display_name);
  
  return (
    <AvatarImage
      src={user.avatar_url}
      alt={`${user.display_name || 'User'}'s avatar`}
      size={size}
      className={className}
      initials={initials}
      showInitials={true}
    />
  );
}
