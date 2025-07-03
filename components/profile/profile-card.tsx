"use client";
import { useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  displayName: string;
  username: string;
  bio?: string | null;
  avatarUrl?: string | null;
  className?: string;
}

export function ProfileCard({
  displayName,
  username,
  bio,
  avatarUrl,
  className,
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
    </div>
  );
}
