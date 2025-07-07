"use client"

import { Textarea } from "@/components/ui/textarea"
import { PromptProgressBar } from "@/components/ui/prompt-progress-bar";
import { extractVariables } from "@/lib/prompt-variables";
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { SlidingNumber } from "@/components/motion-primitives/sliding-number"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
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
  shareUrl: string
  variables: string[]
  startWizard: () => void
  currentStep: number
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
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
  shareUrl: '',
  variables: [],
  startWizard: () => {},
  currentStep: -1,
  setCurrentStep: () => {},
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
  /** Optional share URL (falls back to window.location.href) */
  shareUrl?: string
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
  shareUrl: propShareUrl,
  children,
}: PromptTemplateProps) {
  const [internalValue, setInternalValue] = useState(value || "");
  const [expanded, setExpanded] = useState(false);
  const clientUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareUrl = propShareUrl || clientUrl;
  const effectiveMaxHeight = expanded ? 10000 : maxHeight;

  // Step-by-step wizard state
  const [currentStep, setCurrentStep] = useState(-1); // -1 means wizard inactive
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // Extract unique template variables once per value change.
  const variables = React.useMemo(
    () => extractVariables(value ?? internalValue),
    [value, internalValue]
  );
  const totalSteps = variables.length;

  // Keep variableValues and currentStep in sync when variables list changes
  useEffect(() => {
    // Prune removed variables and add newly detected ones
    setVariableValues(prev => {
      const next: Record<string, string> = {};
      variables.forEach(v => {
        next[v] = prev[v] ?? "";
      });
      return next;
    });

    // Clamp currentStep so it never exceeds new totalSteps
    setCurrentStep(prev => {
      if (prev === -1) return prev; // wizard inactive
      if (variables.length === 0) return -1; // no variables -> deactivate wizard
      return Math.min(prev, variables.length - 1);
    });
  }, [variables]);
  const completedSteps = currentStep >= 0 ? Math.min(currentStep + 1, totalSteps) : 0;

  // Helpers
  const currentVar = currentStep >= 0 ? variables[currentStep] ?? "" : "";
  const handleVariableChange = (val: string) =>
    setVariableValues((prev) => ({ ...prev, [currentVar]: val }));

  const startWizard = () => setCurrentStep(0);

  const generateFinalContent = React.useCallback(() => {
    let finalContent = value ?? internalValue;
    variables.forEach((v) => {
      const replacement = variableValues[v] ?? `{${v}}`;
      finalContent = finalContent.replace(new RegExp(`\\{${v}\\}`, "g"), replacement);
    });
    return finalContent;
  }, [value, internalValue, variables, variableValues]);

  // Auto-copy to clipboard once all steps are completed
  useEffect(() => {
    if (totalSteps > 0 && currentStep >= totalSteps) {
      const final = generateFinalContent();
      navigator.clipboard.writeText(final).catch(() => {/* ignore */});
      // wizard complete -> reset after copy
      setCurrentStep(-1);
    }
  }, [currentStep, totalSteps, generateFinalContent]);


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
          shareUrl,
          variables,
          startWizard,
          currentStep,
          setCurrentStep,
        }}
      >
        <div className={cn("flex flex-col w-full min-w-full flex-shrink-0 border bg-secondary rounded-[28px] p-1 gap-1", className)}>
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
          <div className="w-full flex-1 border-input bg-card rounded-[24px] border shadow-[0px_2px_6px_0px_rgba(0,0,0,0.05)]">
            {/* Wizard step input */}
            {variables.length > 0 && currentStep >= 0 && currentStep < totalSteps ? (
                <Textarea
                  value={variableValues[currentVar] ?? ""}
                  onChange={(e) => handleVariableChange(e.target.value)}
                  placeholder={`Enter ${currentVar.replace(/_/g, " ")}`}
                  className="text-base md:text-base text-card-foreground min-h-[240px] w-full p-4 resize-none overflow-hidden md:overflow-auto border-none !bg-transparent dark:!bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  rows={1}
                />
            ) : (
              children
            )}
            {totalSteps > 0 && (
              <PromptProgressBar
                totalSteps={totalSteps}
                completedSteps={completedSteps}
              />
            )}
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
        "text-base md:text-base text-card-foreground min-h-[240px] w-full p-4 resize-none overflow-hidden md:overflow-auto border-none !bg-transparent dark:!bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
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
    shareUrl,
    variables,
    startWizard,
    currentStep,
    setCurrentStep,
    totalSteps,
    value: promptValue,
  } = usePromptTemplate();

  const wizardActive = variables.length > 0 && currentStep >= 0 && currentStep < totalSteps;

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
  const shareUrlSafe = typeof window !== 'undefined' ? shareUrl || window.location.href : shareUrl;

  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrlSafe);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const handleShareClick = () => {
    if (!shared) {
      setSharesCount(prev => prev + 1);
      setShared(true);
    }
  };

  const [savesCount, setSavesCount] = useState(initialSaves);
  const [saved, setSaved] = useState(false);
  const toggleSave = () => {
    setSavesCount(prev => prev + (saved ? -1 : 1));
    setSaved(!saved);
  };


  return (
    <PromptTemplateActions className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {wizardActive && (
          <>
            <PromptTemplateAction>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              >
                <Icon name="arrow-left" className="size-4.5" />
              </Button>
            </PromptTemplateAction>
            <PromptTemplateAction>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
              >
                <Icon name="arrow-right" className="size-4.5" />
              </Button>
            </PromptTemplateAction>
          </>
        )}
        {!wizardActive && (
          <PromptTemplateAction>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className={cn(
                "gap-1",
                liked &&
                  "opacity-100 text-[color:var(--like-active)] hover:text-[color:var(--like-active)]"
              )}
              onClick={toggleLike}
            >
              <Icon name="heart" weight={liked ? "fill" : "bold"} className="size-4.5" />
              {likesCount > 0 && (
                <SlidingNumber value={likesCount} className="text-sm" />
              )}
            </Button>
          </PromptTemplateAction>
        )}
        {!wizardActive && (
          <PromptTemplateAction>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="gap-1"
              onClick={toggleComment}
            >
              <Icon name="chat" weight="bold" className="size-4.5" />
              {commentsCount > 0 && (
                <SlidingNumber value={commentsCount} className="text-sm" />
              )}
            </Button>
          </PromptTemplateAction>
        )}
        {!wizardActive && (
          <PromptTemplateAction>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="gap-1"
                  onClick={handleShareClick}
                >
                  <Icon name="share" className="size-4.5" />
                  {sharesCount > 0 && (
                    <SlidingNumber value={sharesCount} className="text-sm" />
                  )}
                </Button>
              </PopoverTrigger>
            <PopoverContent align="start" className="p-1 w-44">
              <div className="flex flex-col">
                <Button variant="ghost" size="sm" className="justify-start" onClick={handleCopyLink}>
                  <Icon name={copied ? "check" : "link"} className="size-4.5" /> {copied ? "Copied" : "Copy link"}
                </Button>
                <Button asChild variant="ghost" size="sm" className="justify-start">
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrlSafe)}`} target="_blank" rel="noopener noreferrer">
                    <Icon name="twitter" className="size-4.5 mr-1" />X
                  </a>
                </Button>
                <Button asChild variant="ghost" size="sm" className="justify-start">
                  <a href={`https://www.threads.net/intent/post?text=${encodeURIComponent(shareUrlSafe)}`} target="_blank" rel="noopener noreferrer">
                    <Icon name="threads" className="size-4.5 mr-1" />Threads
                  </a>
                </Button>
                <Button asChild variant="ghost" size="sm" className="justify-start">
                  <a href={`mailto:?subject=Check%20this%20prompt&body=${encodeURIComponent(shareUrlSafe)}`}>
                      <Icon name="email" className="size-4.5 mr-1" />Email</a>
                </Button>
              </div>
            </PopoverContent>
            </Popover>
          </PromptTemplateAction>
        )}
        {!wizardActive && (
          <PromptTemplateAction>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className={cn("gap-1", saved && "opacity-100")}
              onClick={toggleSave}
            >
              <Icon name="bookmark" weight={saved ? "fill" : "bold"} className="size-4.5" />
              {savesCount > 0 && (
                <SlidingNumber value={savesCount} className="text-sm" />
              )}
            </Button>
          </PromptTemplateAction>
        )}
      </div>
      <div className="flex items-center gap-1">
        {!wizardActive && (
          <PromptTemplateAction>
            <Button size="icon" type="button" variant="outline" className="gap-1 shadow-none size-8" onClick={toggleExpanded}>
              <Icon name={expanded ? "caret-up" : "caret-down"} className="size-4.5" />
            </Button>
          </PromptTemplateAction>
        )}
        <PromptTemplateAction>
          {variables.length > 0 && currentStep >= 0 && currentStep < totalSteps && (
            <>
              <Button variant="outline" size="sm" className="gap-1 shadow-none mr-1 leading-none" onClick={() => setCurrentStep(-1)}>
                Cancel
              </Button>
              <Button size="sm" className="gap-1" onClick={() => setCurrentStep(s => s + 1)}>
                {currentStep + 1 === totalSteps ? (
                  <>
                    <Icon name="check" className="size-4" /> Copy
                  </>
                ) : (
                  <>
                    Next <Icon name="arrow-right" className="size-4" />
                  </>
                )}
              </Button>
            </>
          )}
        </PromptTemplateAction>
        {!wizardActive && (
          <PromptTemplateAction>
            <Button
              size="sm"
              type="button"
              className="gap-1"
              onClick={() => {
                if (variables.length > 0) {
                  startWizard();
                } else {
                  navigator.clipboard.writeText(promptValue).catch(() => {});
                }
              }}
          >
            <Icon name="copyPrompt" className="size-4.5" />
            Copy
          </Button>
        </PromptTemplateAction>
        )}
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
