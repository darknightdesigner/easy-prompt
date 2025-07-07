"use client"

import { Textarea } from "@/components/ui/textarea"
import { PromptProgressBar } from "@/components/ui/prompt-progress-bar";
import { extractVariables } from "@/lib/prompt-variables";
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import Link from "next/link"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

type PromptTemplateContextType = {
  isLoading: boolean
  value: string
  setValue: (value: string) => void
  expanded: boolean
  toggleExpanded: () => void
  maxHeight: number | string
  onSubmit?: () => void
  /** Interaction counts */
  likesCount: number
  commentsCount: number
  sharesCount: number
  savesCount: number
  totalSteps: number
  completedSteps: number
  disabled?: boolean
}

const PromptTemplateContext = createContext<PromptTemplateContextType>({
  isLoading: false,
  value: "",
  setValue: () => {},
  expanded: false,
  toggleExpanded: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  likesCount: 0,
  commentsCount: 0,
  sharesCount: 0,
  savesCount: 0,
  totalSteps: 0,
  completedSteps: 0,
  disabled: false,
})

function usePromptTemplate() {
  const context = useContext(PromptTemplateContext)
  if (!context) {
    throw new Error("usePromptTemplate must be used within a PromptTemplate")
  }
  return context
}

type PromptTemplateProps = {
  authorAvatar?: string;
  displayName?: string;
  username?: string;
  title?: string;
  footer?: React.ReactNode;
  verified?: boolean;
  isLoading?: boolean
  value?: string
  onValueChange?: (value: string) => void
  maxHeight?: number | string
  onSubmit?: () => void
  /** Interaction counts */
  likesCount?: number
  commentsCount?: number
  sharesCount?: number
  savesCount?: number
  children: React.ReactNode
  className?: string
}

function PromptTemplate({
  className,
  authorAvatar,
  displayName,
  username,
  title,
  verified = false,
  isLoading = false,
  maxHeight = 240,
  value,
  onValueChange,
  onSubmit,
  footer,
  likesCount,
  commentsCount,
  sharesCount,
  savesCount,
  children,
}: PromptTemplateProps) {
  const [internalValue, setInternalValue] = useState(value || "");
  const [expanded, setExpanded] = useState(false);
  const effectiveMaxHeight = expanded ? 10000 : maxHeight;

  const variables = React.useMemo(() => extractVariables(value ?? internalValue), [value, internalValue]);
  let totalSteps = variables.length;
  if (totalSteps === 0) totalSteps = 4; // TEMP: hard-coded for visual demo
  const completedSteps = Math.floor(totalSteps / 2);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <TooltipProvider>
      <PromptTemplateContext.Provider
                value={{
          isLoading,
          expanded,
          toggleExpanded: () => setExpanded((p) => !p),
          value: internalValue,
          maxHeight: effectiveMaxHeight,
          setValue: onValueChange ?? handleChange,
          onSubmit,
          likesCount: likesCount ?? 0,
          commentsCount: commentsCount ?? 0,
          sharesCount: sharesCount ?? 0,
          savesCount: savesCount ?? 0,
          totalSteps,
          completedSteps,
        }}
      >
        <div className={cn("inline-flex flex-col border bg-secondary rounded-[28px] p-1 gap-1", className)}>
          {(displayName || title) && (
            <div className="flex items-start gap-2 p-2">
              {authorAvatar && (
                <Link href={username ? `/user/${username}` : "#"} className="shrink-0" prefetch={false}>
                  <img
                    src={authorAvatar}
                    alt={displayName ?? username}
                    className="w-[38px] h-[38px] rounded-full object-cover"
                  />
                </Link>
              )}
              <div className="flex flex-col">
                <Link href={username ? `/user/${username}` : "#"} className="flex items-center gap-1 font-semibold text-foreground hover:underline">
                  {displayName}
                  {verified && (
                    <Icon
                      name="verified"
                      weight="fill"
                      className="size-4 text-[#1D9BF0]"
                    />
                  )}
                  {username && (
                    <span className="text-muted-foreground font-normal">@{username}</span>
                  )}
                </Link>
                {title && (
                  <p className="leading-none">{title}</p>
                )}
              </div>
            </div>
          )}
          <div className="border-input bg-card rounded-[24px] border shadow-[0px_2px_6px_0px_rgba(0,0,0,0.05)]">
            {children}
            <PromptProgressBar totalSteps={totalSteps} completedSteps={completedSteps} />
            {footer ?? (<div className="p-3"><DefaultPromptFooter /></div>)}
          </div>
        </div>
      </PromptTemplateContext.Provider>
    </TooltipProvider>
  )
}

export type PromptTemplateTextareaProps = {
  disableAutosize?: boolean
} & React.ComponentProps<typeof Textarea>

function PromptTemplateTextarea({
  className,
  onKeyDown,
  disableAutosize = false,
  ...props
}: PromptTemplateTextareaProps) {
  const { value, setValue, maxHeight, onSubmit, disabled } = usePromptTemplate()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Reusable measurement fn
  const measure = React.useCallback(() => {
    if (disableAutosize || !textareaRef.current) return

    const el = textareaRef.current
    el.style.height = "auto"
    el.style.height =
      typeof maxHeight === "number"
        ? `${Math.min(el.scrollHeight, maxHeight)}px`
        : `min(${el.scrollHeight}px, ${maxHeight})`
  }, [disableAutosize, maxHeight])

  // Initial measurement before paint & whenever value changes
  useLayoutEffect(() => {
    measure()
  }, [measure, value])

  // Re-measure when the element itself resizes (e.g. font load, container resize)
  useEffect(() => {
    if (!textareaRef.current || disableAutosize) return

    const ro = new ResizeObserver(measure)
    ro.observe(textareaRef.current)

    // Re-measure when custom fonts finish loading (if supported)
    const fonts = (document as any).fonts as FontFaceSet | undefined
    fonts?.addEventListener?.("loadingdone", measure)

    return () => {
      ro.disconnect()
      fonts?.removeEventListener?.("loadingdone", measure)
    }
  }, [measure, disableAutosize])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit?.()
    }
    onKeyDown?.(e)
  }

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className={cn(
        "text-base md:text-base text-card-foreground min-h-48 w-full p-4 resize-none overflow-hidden md:overflow-auto border-none !bg-transparent dark:!bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
        className
      )}
      rows={1}
      disabled={disabled}
      {...props}
    />
  )
}

type PromptTemplateActionsProps = React.HTMLAttributes<HTMLDivElement>

function PromptTemplateActions({
  children,
  className,
  ...props
}: PromptTemplateActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  )
}

type PromptTemplateActionProps = {
  className?: string
  tooltip?: React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
} & React.ComponentProps<typeof Tooltip>

function PromptTemplateAction({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}: PromptTemplateActionProps) {
  const { disabled } = usePromptTemplate()

  if (!tooltip) {
    // Render children without tooltip wrapper when no tooltip provided
    return (
      <div className={className} {...props as any /* cast since props are Tooltip props */}>
        {children}
      </div>
    )
  }

  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild disabled={disabled}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className={className}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

function DefaultPromptFooter() {
  const {
    likesCount: initialLikes,
    expanded,
    toggleExpanded,
    commentsCount: initialComments,
    sharesCount: initialShares,
    savesCount: initialSaves,
  } = usePromptTemplate();

  // Local toggled state & counts
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const toggleLike = () => {
    setLikesCount(prev => prev + (liked ? -1 : 1));
    setLiked(!liked);
  };

  const [commentsCount, setCommentsCount] = useState(initialComments);
  const [commented, setCommented] = useState(false);
  const toggleComment = () => {
    setCommentsCount(prev => prev + (commented ? -1 : 1));
    setCommented(!commented);
  };

  const [sharesCount, setSharesCount] = useState(initialShares);
  const [shared, setShared] = useState(false);
  const toggleShare = () => {
    setSharesCount(prev => prev + (shared ? -1 : 1));
    setShared(!shared);
  };

  const [savesCount, setSavesCount] = useState(initialSaves);
  const [saved, setSaved] = useState(false);
  const toggleSave = () => {
    setSavesCount(prev => prev + (saved ? -1 : 1));
    setSaved(!saved);
  };


  return (
    <PromptTemplateActions className="flex items-center justify-between">
      <div className="flex items-center">
        <PromptTemplateAction>
          <Button variant="ghost" size="sm" type="button" className={cn("gap-1", liked && "opacity-100 text-[color:var(--like-active)] hover:text-[color:var(--like-active)]")} onClick={toggleLike}>
            <Icon name="heart" weight={liked ? "fill" : "bold"} className="size-4" />
            {likesCount > 0 && <span className="text-xs">{likesCount}</span>}
          </Button>
        </PromptTemplateAction>
        <PromptTemplateAction>
          <Button variant="ghost" size="sm" type="button" className="gap-1" onClick={toggleComment}>
            <Icon name="chat" weight="bold" className="size-4" />
            {commentsCount > 0 && <span className="text-xs">{commentsCount}</span>}
          </Button>
        </PromptTemplateAction>
        <PromptTemplateAction>
          <Button variant="ghost" size="sm" type="button" className="gap-1" onClick={toggleShare}>
            <Icon name="share" className="size-4" />
            {sharesCount > 0 && <span className="text-xs">{sharesCount}</span>}
          </Button>
        </PromptTemplateAction>
        <PromptTemplateAction>
          <Button variant="ghost" size="sm" type="button" className={cn("gap-1", saved && "opacity-100")} onClick={toggleSave}>
            <Icon name="bookmark" weight={saved ? "fill" : "bold"} className="size-4" />
            {savesCount > 0 && <span className="text-xs">{savesCount}</span>}
          </Button>
        </PromptTemplateAction>
      </div>
      <div className="flex items-center gap-1">
        <PromptTemplateAction>
          <Button size="icon" type="button" variant="outline" className="gap-1 shadow-none size-8" onClick={toggleExpanded}>
            <Icon name={expanded ? "caret-up" : "caret-down"} className="size-4" />
          </Button>
        </PromptTemplateAction>
        <PromptTemplateAction>
          <Button size="sm" type="button" className="gap-1">
            <Icon name="copyPrompt" className="size-4" />
            Copy
          </Button>
        </PromptTemplateAction>
      </div>
    </PromptTemplateActions>
  );
}

export {
  PromptTemplate,
  PromptTemplateTextarea,
  PromptTemplateActions,
  PromptTemplateAction,
}
