"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useSessionContext } from "@supabase/auth-helpers-react";

interface PostInputProps {
  className?: string;
  onClick?: () => void;
}

/**
 * A minimal clickable input row similar to Threads "What's new?" composer.
 * Shows the user's avatar, a placeholder prompt and a Post button.
 * Entire row is wrapped in a div with `cursor-pointer` so the parent can
 * attach an `onClick` handler (e.g. open a dialog). For now, only the
 * visual layout is provided.
 */
export function PostInput({ className, onClick }: PostInputProps) {
  const { session } = useSessionContext();
  
  // Get user avatar from session
  const userAvatar = session?.user?.user_metadata?.avatar_url;
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center w-full gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-border bg-card hover:border-foreground transition-colors cursor-pointer hover:shadow-lg/2",
        className
      )}
    >
      {/* Avatar */}
      <Avatar className="h-[40px] w-[40px]">
        {userAvatar ? (
          <AvatarImage src={userAvatar} alt="User avatar" />
        ) : (
          <AvatarFallback>
            <Icon name="profile" className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>

      {/* Placeholder text */}
      <span className="flex-1 text-md text-muted-foreground select-none">
        Create Prompt Template
      </span>

      {/* Post button */}
      <Button variant="outline" onClick={onClick} className="pointer-events-none shadow-none sm:pointer-events-auto group-hover:border-foreground group-hover:text-accent-foreground flex items-center gap-1">
        <Icon name="plus" className="h-4 w-4" />
        Create
      </Button>
    </div>
  );
}
