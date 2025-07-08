"use client"

import { Textarea } from "@/components/ui/textarea"
import { PromptProgressBar } from "@/components/ui/prompt-progress-bar";
import { extractVariables } from "@/lib/prompt-variables";
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { SlidingNumber } from "@/components/motion-primitives/sliding-number"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
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
  useCallback,
} from "react"

type VariableMetadata = {
  question: string;
  defaultValue?: string;
}

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
  variableMetadata: Record<string, VariableMetadata>
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
  variableMetadata: {},
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
  variableQuestions?: Record<string, string> // Map of variable names to their questions
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
  variableQuestions,
  children,
}: PromptTemplateProps) {
  const [internalValue, setInternalValue] = useState(value || "");
  const [expanded, setExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1); // -1 means wizard inactive
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [variableMetadata, setVariableMetadata] = useState<Record<string, VariableMetadata>>({});
  const [buttonOpacity, setButtonOpacity] = useState(1) // Start with 100% opacity for mobile, will be adjusted for desktop
  const [isMobile, setIsMobile] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const clientUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareUrl = propShareUrl || clientUrl;
  const effectiveMaxHeight = expanded ? 10000 : maxHeight;

  // Extract unique template variables once per value change.
  const variables = React.useMemo(
    () => extractVariables(value ?? internalValue),
    [value, internalValue]
  );
  
  // Check if we're on mobile
  useEffect(() => {
    // Function to check if we're on mobile (less than 640px, Tailwind's sm breakpoint)
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Check initially
    checkIfMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Add scroll listener to update button opacity based on scroll position
  useEffect(() => {
    if (!contentRef.current || currentStep >= 0) return;
    
    const handleScroll = () => {
      // Only apply scroll-based opacity on non-mobile devices
      if (!isMobile) {
        const container = contentRef.current;
        if (!container) return;
        
        // Find the first scrollable element inside the container
        const scrollableElements = container.querySelectorAll('textarea, [class*="overflow-auto"], [class*="overflow-y-auto"]');
        if (scrollableElements.length === 0) return;
        
        const scrollable = scrollableElements[0] as HTMLElement;
        const scrollPercentage = scrollable.scrollTop / (scrollable.scrollHeight - scrollable.clientHeight) * 100;
        
        // Set opacity based on scroll percentage
        if (scrollPercentage <= 2) {
          setButtonOpacity(0); // Top 2% - hidden
        } else if (scrollPercentage >= 98) {
          setButtonOpacity(0); // Bottom 2% - hidden
        } else {
          setButtonOpacity(1); // Anywhere in between - fully visible
        }
      } else {
        // On mobile, always set to 100% opacity
        setButtonOpacity(1);
      }
    };
    
    // Find all scrollable elements and add listeners
    const scrollableElements = contentRef.current.querySelectorAll('textarea, [class*="overflow-auto"], [class*="overflow-y-auto"]');
    scrollableElements.forEach(el => {
      el.addEventListener('scroll', handleScroll);
    });
    
    // Initial check
    handleScroll();
    
    return () => {
      if (!contentRef.current) return;
      const scrollableElements = contentRef.current.querySelectorAll('textarea, [class*="overflow-auto"], [class*="overflow-y-auto"]');
      scrollableElements.forEach(el => {
        el.removeEventListener('scroll', handleScroll);
      });
    };
  }, [currentStep, contentRef.current]);
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

    // Update variable metadata with questions
    setVariableMetadata(prev => {
      const next: Record<string, VariableMetadata> = {};
      variables.forEach(v => {
        next[v] = {
          question: variableQuestions?.[v] || `Enter ${v.replace(/_/g, " ")}`,
          defaultValue: prev[v]?.defaultValue || ""
        };
      });
      return next;
    });

    // Clamp currentStep so it never exceeds new totalSteps
    setCurrentStep(prev => {
      if (prev === -1) return prev; // wizard inactive
      if (variables.length === 0) return -1; // no variables -> deactivate wizard
      return Math.min(prev, variables.length - 1);
    });
  }, [variables, variableQuestions]);
  // Calculate completedSteps - only show as fully complete on the final preview step
  // When on first question, we'll pass a fractional value to ensure 5% progress
  const completedSteps = 
    currentStep === -1 ? 0 : // inactive wizard
    currentStep === 0 ? 0.05 * totalSteps : // first question shows 5%
    currentStep === totalSteps ? totalSteps : // preview step shows 100%
    Math.min(currentStep, totalSteps - 1); // other steps show proportional progress

  // Helpers
  const currentVar = currentStep >= 0 ? variables[currentStep] ?? "" : "";
  const handleVariableChange = (val: string) =>
    setVariableValues((prev) => ({ ...prev, [currentVar]: val }));
    
  // Helper to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };
    
  // Handle Enter key to move to next step
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setCurrentStep((s) => s + 1);
    }
  };

  const startWizard = () => setCurrentStep(0);

  const generateFinalContent = React.useCallback(() => {
    let finalContent = value ?? internalValue;
    variables.forEach((v) => {
      const replacement = variableValues[v] ?? `{${v}}`;
      finalContent = finalContent.replace(new RegExp(`\\{${v}\\}`, "g"), replacement);
    });
    return finalContent;
  }, [value, internalValue, variables, variableValues]);

  // Show preview when all steps are completed
  useEffect(() => {
    // We no longer auto-copy or auto-reset after the preview step
    // The user can explicitly click the Copy or Reset buttons
  }, [currentStep, totalSteps]);


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
          variableMetadata,
          startWizard,
          currentStep,
          setCurrentStep,
        }}
      >
        <div className={cn("flex flex-col w-full min-w-full flex-shrink-0 border bg-secondary rounded-[28px] p-1 gap-1", className)}>
          {(displayName || title) && (
            <div className="flex items-start gap-2 p-2">
              {currentStep >= 0 ? (
                <div className="shrink-0 w-[38px] h-[38px] rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-semibold">
                  {currentStep === totalSteps ? (
                    <Icon name="check" weight="bold" className="size-5" />
                  ) : (
                    currentStep + 1
                  )}
                </div>
              ) : (
                authorAvatar && (
                  <Link href={username ? `/user/${username}` : "#"} className="shrink-0" prefetch={false}>
                    <img
                      src={authorAvatar}
                      alt={displayName ?? username}
                      className="w-[38px] h-[38px] rounded-full object-cover"
                    />
                  </Link>
                )
              )}
              <div className="flex flex-col">
                {currentStep >= 0 && currentStep < totalSteps && currentVar ? (
                  <div className="flex items-center gap-0 font-semibold text-foreground">
                    {variableMetadata[currentVar]?.question || `Enter ${currentVar.replace(/_/g, " ")}`}
                  </div>
                ) : currentStep === totalSteps ? (
                  <div className="flex items-center gap-0 font-semibold text-foreground">
                    Preview your completed prompt
                  </div>
                ) : (
                  <Link href={username ? `/user/${username}` : "#"} className="flex items-center gap-0 font-semibold text-foreground hover:underline">
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
                )}
                {title && (
                  <p className={cn("leading-none", currentStep >= 0 && "text-muted-foreground")}>
                    {currentStep >= 0 && currentStep < totalSteps && currentVar ? 
                      `{${truncateText(variableValues[currentVar] ? variableValues[currentVar] : currentVar, 30)}}` : 
                      currentStep === totalSteps ?
                      "Final prompt with all variables filled" :
                      title}
                  </p>
                )}
              </div>
            </div>
          )}
          <div 
            className="w-full flex-1 border-input bg-card rounded-[24px] border shadow-[0px_2px_6px_0px_rgba(0,0,0,0.05)] relative" 
            ref={contentRef}
          >
            {/* Wizard step input */}
            {variables.length > 0 && currentStep >= 0 && currentStep < totalSteps ? (
                <Textarea
                  value={variableValues[currentVar] ?? ""}
                  onChange={(e) => handleVariableChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Enter {${currentVar}}`}
                  className="text-base md:text-base text-card-foreground min-h-[240px] w-full p-4 resize-none overflow-hidden md:overflow-auto border-none !bg-transparent dark:!bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  rows={1}
                />
            ) : variables.length > 0 && currentStep === totalSteps ? (
              // Preview step - show filled template with fixed dimensions
              <div 
                className="text-base md:text-base text-card-foreground h-[240px] w-full p-4 overflow-hidden md:overflow-auto whitespace-pre-wrap prompt-preview-content"
                style={{ maxHeight: '240px' }}
              >
                {generateFinalContent()}
              </div>
            ) : (
              children
            )}
            {currentStep === -1 && (
              <div className={cn(
                "absolute bottom-16 right-3 z-10 transition-opacity duration-200", 
                isMobile ? "opacity-100" : ""
              )} style={{ opacity: isMobile ? 1 : buttonOpacity }}>
                <PromptTemplateAction>
                  <Button size="icon" type="button" variant="outline" className="gap-1 shadow-none size-8 bg-card/80 backdrop-blur-sm" onClick={() => setExpanded(prev => !prev)}>
                    <Icon name={expanded ? "caret-up" : "caret-down"} className="size-4.5" />
                  </Button>
                </PromptTemplateAction>
              </div>
            )}
            {totalSteps > 0 && (
              <PromptProgressBar
                totalSteps={totalSteps}
                completedSteps={completedSteps}
              />
            )}
            {footer ?? (<div className="p-2 sm:p-3"><DefaultPromptFooter /></div>)}
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
        "text-base md:text-base text-card-foreground/80 min-h-[240px] w-full p-4 resize-none overflow-hidden md:overflow-auto border-none !bg-transparent dark:!bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
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
      <div className={cn("flex items-center", className)} {...props as any /* cast since props are Tooltip props */}>
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

  const wizardActive = variables.length > 0 && currentStep >= 0 && currentStep <= totalSteps;

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
      <div className="flex items-center gap-0">
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
                    <SlidingNumber value={sharesCount} className="text-sm hidden sm:block" />
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
                <SlidingNumber value={savesCount} className="text-sm hidden sm:block" />
              )}
            </Button>
          </PromptTemplateAction>
        )}
      </div>
      <div className="flex items-center gap-1">
        {!wizardActive && (
          <PromptTemplateAction tooltip="Edit prompt">
            <Button size="icon" type="button" variant="outline" className="gap-1 shadow-none size-8">
              <Icon name="pencil" className="size-4.5" />
            </Button>
          </PromptTemplateAction>
        )}
        <PromptTemplateAction>
          {variables.length > 0 && currentStep >= 0 && currentStep <= totalSteps && (
            <>
              <Button variant="outline" size="sm" className="gap-1 shadow-none mr-1 leading-none" onClick={() => setCurrentStep(-1)}>
                {currentStep === totalSteps ? (
                  <>
                    <Icon name="arrowcounterclockwise" className="size-4 mr-1" />
                    Reset
                  </>
                ) : (
                  "Cancel"
                )}
              </Button>
              {currentStep === totalSteps ? (
                <ShimmerButton
                  size="sm"
                  className="gap-1 shadow-none hover:shadow-none w-[114px]"
                  background="var(--primary)"
                  shimmerColor="rgba(255, 255, 255, 0.4)"
                  onClick={() => {
                    // Copy to clipboard but stay on preview step
                    // Get the prompt content from the preview div
                    const previewEl = document.querySelector('.prompt-preview-content');
                    const finalContent = previewEl?.textContent || '';
                    
                    try {
                      navigator.clipboard.writeText(finalContent);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    } catch (error) {
                      console.error('Failed to copy:', error);
                    }
                  }}
                >
                  <Icon name={copied ? "check" : "copyPrompt"} className="size-4" weight={copied ? "bold" : "regular"} /> {copied ? "Copied" : "Copy"}
                </ShimmerButton>
              ) : (
                <Button 
                  size="sm" 
                  className="gap-1"
                  onClick={() => setCurrentStep(s => s + 1)}
                >

                {currentStep + 1 === totalSteps ? (
                  <>
                    Next<span className="text-[12px] bg-primary-foreground/15 px-1 py-0 rounded-xs font-semibold text-primary-foreground">enter</span> <Icon name="arrow-right" className="size-4" />
                  </>
                ) : (
                  <>
                    Next<span className="text-[12px] bg-primary-foreground/15 px-1 py-0 rounded-xs font-semibold text-primary-foreground">enter</span> <Icon name="arrow-right" className="size-4" />
                  </>
                )}
              </Button>
              )}
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
