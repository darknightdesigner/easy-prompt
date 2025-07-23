"use client";
import { useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

interface ProfileCardProps {
  displayName: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
  className?: string;
  isOwnProfile?: boolean;
}

export function ProfileCard({
  displayName,
  username,
  bio,
  avatarUrl,
  className,
  isOwnProfile = false,
}: ProfileCardProps) {
  const fallbackInitial = useMemo(() => displayName.charAt(0).toUpperCase(), [displayName]);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`${displayName} avatar`}
          width={96}
          height={96}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="size-24 flex items-center justify-center rounded-full bg-secondary text-3xl font-semibold">
          {fallbackInitial}
        </div>
      )}
      <div className="text-center">
        <h2 className="text-xl font-bold">{displayName}</h2>
        <p className="text-muted-foreground">@{username}</p>
        {bio && <p className="mt-2 max-w-xs text-sm text-muted-foreground whitespace-pre-wrap">{bio}</p>}
      </div>
      
      {/* Action buttons - different for own profile vs others */}
      <div className="flex gap-2 mt-4">
        {isOwnProfile ? (
          // Own profile buttons (like Instagram/Twitter)
          <>
            <Button variant="outline" size="sm">
              <Icon name="pencil" className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="share" className="w-4 h-4 mr-2" />
              Share Profile
            </Button>
          </>
        ) : (
          // Other user's profile buttons
          <>
            <Button size="sm">
              <Icon name="plus" className="w-4 h-4 mr-2" />
              Follow
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="chat" className="w-4 h-4 mr-2" />
              Message
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
