"use client"

import { Textarea } from "@/components/ui/textarea"
import { PromptProgressBar } from "@/components/ui/prompt-progress-bar";
import { extractVariables } from "@/lib/prompt-variables";
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { SlidingNumber } from "@/components/motion-primitives/sliding-number"
import { useRequireAuth } from "@/lib/use-require-auth"
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import Link from "next/link"
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RichTextDisplay } from "@/components/ui/rich-text-display"
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



type PromptTemplateContextType = {
  isLoading: boolean
  value: string
  setValue: (value: string) => void
  expanded: boolean
  showPrompt: boolean
  setShowPrompt: (show: boolean) => void
  toggleExpanded: () => void
  maxHeight: number | string
  onSubmit?: () => void
  /** Initial interaction counts from props */
  likesCount: number
  commentsCount: number
  sharesCount: number
  savesCount: number
  /** Shared local counter states for UI */
  localLikesCount: number
  setLocalLikesCount: (count: number | ((prevCount: number) => number)) => void
  localCommentsCount: number
  setLocalCommentsCount: (count: number | ((prevCount: number) => number)) => void
  localSharesCount: number
  setLocalSharesCount: (count: number | ((prevCount: number) => number)) => void
  localSavesCount: number
  setLocalSavesCount: (count: number | ((prevCount: number) => number)) => void
  /** Shared social action states */
  liked: boolean
  setLiked: (liked: boolean) => void
  commented: boolean
  setCommented: (commented: boolean) => void
  saved: boolean
  setSaved: (saved: boolean) => void
  shared: boolean
  setShared: (shared: boolean) => void
  /** Event handlers for interactions */
  onLike?: () => void
  onSave?: () => void
  onShare?: () => void
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
  showPrompt: false,
  setShowPrompt: () => {},
  toggleExpanded: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  likesCount: 0,
  commentsCount: 0,
  sharesCount: 0,
  savesCount: 0,
  // Shared local counter states
  localLikesCount: 0,
  setLocalLikesCount: () => {},
  localCommentsCount: 0,
  setLocalCommentsCount: () => {},
  localSharesCount: 0,
  setLocalSharesCount: () => {},
  localSavesCount: 0,
  setLocalSavesCount: () => {},
  // Shared social action states
  liked: false,
  setLiked: () => {},
  commented: false,
  setCommented: () => {},
  saved: false,
  setSaved: () => {},
  shared: false,
  setShared: () => {},
  // Event handlers
  onLike: undefined,
  onSave: undefined,
  onShare: undefined,
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
  /** Container style overrides */
  borderClass?: string;
  backgroundClass?: string;
  roundedClass?: string;
  paddingClass?: string;
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
  /** Event handlers for interactions */
  onLike?: () => void
  onSave?: () => void
  onShare?: () => void
  /** Optional share URL (falls back to window.location.href) */
  shareUrl?: string
  children: React.ReactNode
  className?: string
  /** Whether the container is initially expanded */
  /** Whether this prompt requires the multi-step wizard (pre-derived flag).
   *  If omitted, the component falls back to `variables.length > 0` so that
   *  older callers remain compatible while we gradually roll the flag out
   *  through the data layer.
   */
  requiresWizard?: boolean;
  /** Whether the container is initially expanded */
  initialExpanded?: boolean
}

function PromptTemplate({
  className,
  authorAvatar,
  displayName,
  username,
  title,
  verified = false,
  isLoading = false,
  initialExpanded = false,
  requiresWizard: requiresWizardProp,
  maxHeight = 240,
  value,
  onValueChange,
  onSubmit,
  footer,
  likesCount,
  commentsCount,
  sharesCount,
  savesCount,
  onLike,
  onSave,
  onShare,
  shareUrl: propShareUrl,
  children,
  borderClass = "border",
  backgroundClass = "bg-secondary",
  roundedClass = "rounded-[28px]",
  paddingClass = "pr-1 pl-1 pt-1",
}: PromptTemplateProps) {
  const [internalValue, setInternalValue] = useState(value || "");
  // State for showing/hiding the prompt container via motion animation
  // Initialize as false to prevent hydration mismatch, then update in useEffect
  const [showPrompt, setShowPrompt] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  // State for expanding/collapsing the text area (original functionality)
  const [expanded, setExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1); // -1 means wizard inactive
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const [buttonOpacity, setButtonOpacity] = useState(1) // Start with 100% opacity for mobile, will be adjusted for desktop
  const [isMobile, setIsMobile] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const clientUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareUrl = propShareUrl || clientUrl;
  const router = useRouter();
  // Default height for collapsed text area
  const defaultHeight = typeof maxHeight === 'number' ? maxHeight : 240;
  // Calculate effective max height based on expanded state (for text area)
  const effectiveMaxHeight = expanded ? 10000 : defaultHeight;

  // Extract unique template variables once per value change.
  const variables = React.useMemo(
    () => extractVariables(value ?? internalValue),
    [value, internalValue]
  );
  
  // Check if we're on mobile
  useEffect(() => {
    // Function to get the actual sm breakpoint value from CSS
    const getSmBreakpointValue = () => {
      const style = getComputedStyle(document.documentElement);
      const smBreakpoint = style.getPropertyValue('--breakpoint-sm');
      // Convert rem to px (assuming 1rem = 16px)
      return parseFloat(smBreakpoint) * 16;
    };
    
    // Function to check if we're on mobile (less than sm breakpoint)
    const checkIfMobile = () => {
      const smBreakpointPx = getSmBreakpointValue();
      setIsMobile(window.innerWidth < smBreakpointPx);
    };
    
    // Check initially
    checkIfMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Handle hydration and initial state
  useEffect(() => {
    setIsHydrated(true);
    // Set the initial showPrompt state after hydration to prevent mismatch
    if (initialExpanded) {
      // Use setTimeout to ensure the animation runs after hydration
      setTimeout(() => setShowPrompt(true), 0);
    }
  }, [initialExpanded]);

  // Add scroll listener to update button opacity based on scroll position
  useEffect(() => {
    if (!contentRef.current || currentStep >= 0 || !showPrompt) return;
    
    const handleScroll = () => {
      // Only apply scroll-based opacity on non-mobile devices
      if (!isMobile) {
        const container = contentRef.current;
        if (!container) return;
        
        // Find the first scrollable element inside the container
        const scrollableElements = container.querySelectorAll('textarea, [class*="overflow-auto"], [class*="overflow-y-auto"]');
        if (scrollableElements.length === 0) return;
        
        const scrollable = scrollableElements[0] as HTMLElement;
        
        // Calculate opacity based on scroll position
        const scrollPosition = scrollable.scrollTop;
        const maxScroll = scrollable.scrollHeight - scrollable.clientHeight;
        
        // Hide button when scroll is at 0%
        if (scrollPosition === 0) {
          setButtonOpacity(0);
        }
        // Show button when scroll is at 1% or more, but less than 98%
        else if (scrollPosition > 0 && scrollPosition < maxScroll * 0.98) {
          // Calculate opacity - full opacity after 1% scroll
          const minScrollForFullOpacity = maxScroll * 0.01;
          const opacity = Math.min(1, scrollPosition / minScrollForFullOpacity);
          setButtonOpacity(opacity);
        }
        // Hide button when scroll is at 98-100%
        else if (scrollPosition >= maxScroll * 0.98) {
          const fadeRange = maxScroll * 0.02; // 2% range for fading out
          const opacity = 1 - Math.min(1, (scrollPosition - maxScroll * 0.98) / fadeRange);
          setButtonOpacity(opacity);
        }
      }
    };
    
    // Find and add scroll listeners to all scrollable elements
    const container = contentRef.current;
    if (container) {
      const scrollableElements = container.querySelectorAll('textarea, [class*="overflow-auto"], [class*="overflow-y-auto"]');
      scrollableElements.forEach(el => {
        el.addEventListener('scroll', handleScroll);
      });
      
      // Initial check
      handleScroll();
      
      // Clean up
      return () => {
        scrollableElements.forEach(el => {
          el.removeEventListener('scroll', handleScroll);
        });
      };
    }
  }, [contentRef.current, isMobile, currentStep, showPrompt]);

  const totalSteps = variables.length;
  // Ensure progress bar has at least one step so the initial border is visible even when no wizard is needed
  const displayTotalSteps = Math.max(1, totalSteps);
  // Final authoritative flag – either supplied by the data layer or derived locally
  const requiresWizard = typeof requiresWizardProp === 'boolean'
    ? requiresWizardProp
    : variables.length > 0;

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
  // Calculate completedSteps - only show as fully complete on the final preview step
  // When on first question, we'll pass a fractional value to ensure 5% progress
  const completedSteps = 
    currentStep === -1 ? 0 : // inactive wizard
    currentStep === totalSteps ? totalSteps : // preview step shows 100%
    0.25 * totalSteps + 0.75 * currentStep; // proportional progress starting at 25%

  // Helpers
  const currentVar = currentStep >= 0 ? variables[currentStep] ?? "" : "";
  const handleVariableChange = (value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [currentVar]: value
    }));
    
    // Auto-resize the textarea after value change
    setTimeout(() => autoResizeTextarea(variableInputRef.current), 0);
  };  
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

  // Reference to the variable input textarea
  const variableInputRef = useRef<HTMLTextAreaElement>(null);
  const previewTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea function is now disabled since we're using fixed height
  const autoResizeTextarea = (textarea: HTMLTextAreaElement | null) => {
    // Fixed height of 240px is now set directly on the textarea elements
    // This function is kept for compatibility but doesn't change the height
    return;
  };

  // Start wizard and focus the input field
  const startWizard = () => {
    setCurrentStep(0);
    
    // Show the prompt container so the wizard inputs are visible
    setShowPrompt(true);
    
    // Reset expanded state to default when starting the wizard
    setExpanded(false);
    
    // Focus and select the textarea content after animations complete
    setTimeout(() => {
      if (variableInputRef.current) {
        variableInputRef.current.focus();
        // Select all text in the textarea
        variableInputRef.current.select();
      }
    }, 50); // Delay to ensure animations complete
  };

  const generateFinalContent = React.useCallback(() => {
    let finalContent = value ?? internalValue;
    variables.forEach((v) => {
      const replacement = variableValues[v] ?? `{{ ${v} }}`;
      finalContent = finalContent.replace(new RegExp(`\\{\\{\\s*${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, "g"), replacement);
    });
    return finalContent;
  }, [value, internalValue, variables, variableValues]);

  // Show preview when all steps are completed
  useEffect(() => {
    // We no longer auto-copy or auto-reset after the preview step
    // The user can explicitly click the Copy or Reset buttons
  }, [currentStep, totalSteps]);

  // Auto-focus textarea when currentStep changes to a new variable input step or preview
  useEffect(() => {
    // Only focus if we're on a variable input step (not inactive)
    if (currentStep >= 0 && currentStep < totalSteps) {
      setTimeout(() => {
        if (variableInputRef.current) {
          variableInputRef.current.focus();
          // Select all text in the textarea for easy replacement
          variableInputRef.current.select();
        }
      }, 50); // Increased delay to ensure animations complete
    } else if (currentStep === totalSteps) {
      // Focus on preview textarea when reaching the final step
      // but don't select the text to avoid unwanted highlighting
      setTimeout(() => {
        if (previewTextareaRef.current) {
          previewTextareaRef.current.focus();
          // No text selection for preview - just focus
        }
      }, 50); // Increased delay to ensure animations complete
    }
  }, [currentStep, totalSteps]);
  
  // Auto-resize variable input textarea when its value changes
  useEffect(() => {
    if (currentStep >= 0 && currentStep < totalSteps) {
      autoResizeTextarea(variableInputRef.current);
    }
  }, [variableValues, currentVar, currentStep]);
  
  // Auto-resize preview textarea when content changes
  useEffect(() => {
    if (currentStep === totalSteps) {
      autoResizeTextarea(previewTextareaRef.current);
    }
  }, [generateFinalContent, currentStep]);


  const handleChange = (newValue: string) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  // Shared social action states
  const [liked, setLiked] = useState(false);
  const [commented, setCommented] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  
  // Shared counter states
  const [localLikesCount, setLocalLikesCount] = useState(likesCount || 0);
  const [localCommentsCount, setLocalCommentsCount] = useState(commentsCount || 0);
  const [localSharesCount, setLocalSharesCount] = useState(sharesCount || 0);
  const [localSavesCount, setLocalSavesCount] = useState(savesCount || 0);
  
  // Update local counts when props change
  useEffect(() => { setLocalLikesCount(likesCount || 0); }, [likesCount]);
  useEffect(() => { setLocalCommentsCount(commentsCount || 0); }, [commentsCount]);
  useEffect(() => { setLocalSharesCount(sharesCount || 0); }, [sharesCount]);
  useEffect(() => { setLocalSavesCount(savesCount || 0); }, [savesCount]);

  return (
    <TooltipProvider>
      <PromptTemplateContext.Provider
                value={{
          showPrompt,
          setShowPrompt,
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
          // Shared counter states
          localLikesCount,
          setLocalLikesCount,
          localCommentsCount,
          setLocalCommentsCount,
          localSharesCount,
          setLocalSharesCount,
          localSavesCount,
          setLocalSavesCount,
          // Shared social action states
          liked,
          setLiked,
          commented,
          setCommented,
          saved,
          setSaved,
          shared,
          setShared,
          // Event handlers
          onLike,
          onSave,
          onShare,
          totalSteps,
          completedSteps,
          shareUrl,
          variables,
          startWizard,
          currentStep,
          setCurrentStep,
        }}
      >
        <div
          role="link"
          tabIndex={0}
          onClick={(e)=>{
            const target = e.target as HTMLElement;
            if (target.closest('button,svg,input,a,[data-stop-nav]')) return;
            router.push(shareUrl);
          }}
          data-stop-nav-container
          className={cn(`group flex flex-col w-full min-w-full shrink-0 ${paddingClass} gap-0 ${borderClass} ${backgroundClass} ${roundedClass} cursor-pointer`, className)}
        >
          {(displayName || title) && (
            <div className="flex items-start gap-2 pt-2 pl-2 pr-2">
              {currentStep >= 0 ? (
                <div className="shrink-0 w-[40px] h-[40px] mt-1 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-semibold">
                  {currentStep === totalSteps ? (
                    <Icon name="check" weight="bold" className="size-5" />
                  ) : (
                    currentStep + 1
                  )}
                </div>
              ) : (
                (
                  <Link href={username ? `/${username}` : "#"} className="shrink-0" prefetch={false}>
                    {authorAvatar ? (
                      <img
                        src={authorAvatar}
                        alt={displayName ?? username}
                        className="w-[40px] h-[40px] mt-1 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-[40px] h-[40px] mt-1 rounded-full bg-muted flex items-center justify-center">
                        <Icon name="profile" className="size-5 text-muted-foreground" />
                      </div>
                    )}
                  </Link>
                )
              )}
              <div className="flex flex-col pr-3 sm:pr-4">
                {currentStep >= 0 && currentStep < totalSteps && currentVar ? (
                  <div className="flex items-center gap-0 font-semibold text-foreground">
                    {`Enter ${currentVar.replace(/_/g, " ")}`}
                  </div>
                ) : currentStep === totalSteps ? (
                  <div className="flex items-center gap-0 font-semibold text-foreground">
                    Preview your completed prompt
                  </div>
                ) : (
                  <Link href={username ? `/${username}` : "#"} className="inline-flex items-center gap-1 font-semibold text-foreground group/name w-fit">
                    <span className="group-hover/name:underline">{displayName}</span>
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
                  <div className={cn("leading-normal", currentStep >= 0 && "text-muted-foreground")}>
                    {currentStep >= 0 && currentStep < totalSteps && currentVar ? (
                      <span>{`{{ ${truncateText(variableValues[currentVar] ? variableValues[currentVar] : currentVar, 30)} }}`}</span>
                    ) : currentStep === totalSteps ? (
                      <span>Final prompt with all variables filled</span>
                    ) : (
                      <RichTextDisplay 
                        content={title} 
                        className="leading-normal"
                        linkClassName="text-primary hover:underline"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-col w-full relative">
            {/* Social action bar that mirrors the footer - includes toggle button */}
            <TopSocialActionBar />
            
            <motion.div data-stop-nav 
              className={cn(
                "w-full bg-card rounded-[24px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.05)] relative overflow-hidden cursor-auto",
                showPrompt ? (currentStep === totalSteps ? "border border-input mb-2 mt-2" : "border border-input mb-2 mt-2") : "border-0 mb-0"
              )}
              ref={contentRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: showPrompt ? "auto" : 0, 
                opacity: showPrompt ? 1 : 0,
                scale: showPrompt ? 1 : 0.98,
                transformOrigin: "top"
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 }
              }}
              layout="position"
              layoutDependency={[showPrompt, expanded]}
            >
            {/* Wizard step input without animations */}
            <div className="w-full">
              {variables.length > 0 && currentStep >= 0 && currentStep < totalSteps ? (
                <div
                  key={`step-${currentStep}`}
                  className="relative overflow-hidden"
                  style={{ minHeight: `${defaultHeight}px` }}
                >
                  <Textarea
                    ref={variableInputRef}
                    value={variableValues[currentVar] ?? ""}
                    onChange={(e) => handleVariableChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Enter {{ ${currentVar} }}`}
                    className="text-base md:text-base text-card-foreground w-full p-4 resize-none overflow-hidden md:overflow-auto border-none bg-transparent! dark:bg-transparent! shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    style={{ height: '240px' }}
                    rows={1}
                  />
                </div>
              ) : variables.length > 0 && currentStep === totalSteps ? (
                // Preview step - show filled template with fixed dimensions
                <div
                  key="preview-step"
                  className="relative overflow-hidden"
                  style={{ minHeight: `${defaultHeight}px` }}
                >
                  <Textarea
                    ref={previewTextareaRef}
                    value={generateFinalContent()}
                    readOnly
                    className="text-base md:text-base text-card-foreground w-full p-4 resize-none overflow-hidden md:overflow-auto border-none bg-transparent! dark:bg-transparent! shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 whitespace-pre-wrap prompt-preview-content"
                    style={{ height: '240px' }}
                    rows={expanded ? 8 : 1}
                    onFocus={() => autoResizeTextarea(previewTextareaRef.current)}
                    onClick={() => autoResizeTextarea(previewTextareaRef.current)}
                    onKeyDown={(e) => {
                      // Handle keyboard shortcuts for copy (Ctrl+C is handled by browser)
                      if (e.key === 'Escape') {
                        previewTextareaRef.current?.blur();
                      }
                    }}
                  />
                </div>
              ) : (
                <div
                  key="default-content"
                  className="relative overflow-hidden"
                  style={{ minHeight: `${defaultHeight}px` }}
                >
                  <div className="w-full">
                    {children}
                  </div>
                </div>
              )}
            </div>
            {/* This is the internal caret button that expands/collapses the text area */}
            {currentStep === -1 && showPrompt && (
              <div className={cn(
                "absolute bottom-16 right-3 z-10 transition-opacity duration-200", 
                isMobile || expanded ? "opacity-100" : ""
              )} style={{ opacity: isMobile || expanded ? 1 : buttonOpacity }}>
                <PromptTemplateAction>
                  <Button data-stop-nav 
                    size="icon" 
                    type="button" 
                    variant="outline" 
                    className="gap-1 shadow-none size-8 bg-card/80 backdrop-blur-sm" 
                    onClick={() => setExpanded(prev => !prev)}
                    aria-label={expanded ? "Collapse text area" : "Expand text area"}
                  >
                    <Icon name={expanded ? "caret-up" : "caret-down"} className="size-4.5" />
                  </Button>
                </PromptTemplateAction>
              </div>
            )}
                        <PromptProgressBar
              totalSteps={displayTotalSteps}
              completedSteps={completedSteps}
            />
            {footer ?? (<div className="p-2 sm:p-3"><DefaultPromptFooter /></div>)}
            </motion.div>
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
        "text-base md:text-base text-card-foreground/80 min-h-[240px] w-full p-4 resize-none overflow-hidden md:overflow-auto border-none bg-transparent! dark:bg-transparent! shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
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

// Top social action bar component that mirrors the footer buttons
function TopSocialActionBar() {
  // Track screen size for responsive height
  const [footerHeight, setFooterHeight] = useState('3rem');
  
  useEffect(() => {
    // Function to get the actual sm breakpoint value from CSS
    const getSmBreakpointValue = () => {
      const style = getComputedStyle(document.documentElement);
      const smBreakpoint = style.getPropertyValue('--breakpoint-sm');
      // Convert rem to px (assuming 1rem = 16px)
      return parseFloat(smBreakpoint) * 16;
    };
    
    // Set initial height based on screen size
    const updateHeight = () => {
      const smBreakpointPx = getSmBreakpointValue();
      setFooterHeight(window.innerWidth >= smBreakpointPx ? '3.5rem' : '3rem');
    };
    
    // Set initial value
    updateHeight();
    
    // Update on resize
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  const {
    variables,
    currentStep,
    totalSteps,
    onLike,
    onSave,
    onShare,
    shareUrl,
    showPrompt,
    setShowPrompt,
    // Use shared state from context
    liked,
    setLiked,
    commented,
    setCommented,
    saved,
    setSaved,
    shared,
    setShared,
    // Use shared counter states
    localLikesCount,
    setLocalLikesCount,
    localCommentsCount,
    setLocalCommentsCount,
    localSharesCount,
    setLocalSharesCount,
    localSavesCount,
    setLocalSavesCount
  } = usePromptTemplate();
  
  const [copied, setCopied] = useState(false);
  const [shareUrlSafe, setShareUrlSafe] = useState("");
  
  const { requireAuth } = useRequireAuth();
  const wizardActive = variables.length > 0 && currentStep >= 0 && currentStep <= totalSteps;

  useEffect(() => {
    // Default to current URL if no share URL provided
    setShareUrlSafe(typeof window !== 'undefined' ? (shareUrl || window.location.href) : "");
  }, [shareUrl]);

  // Event handlers
  const toggleLike = () => {
    if (!requireAuth("Like this? Sign up first.")) return;
    setLiked(!liked);
    setLocalLikesCount(count => count + (liked ? -1 : 1));
    if (onLike) onLike();
  };

  // Clicking comment icon just toggles UI state; counter updates after successful comment submission
  const toggleComment = () => {
    if (!requireAuth("Want to comment? Sign up first.")) return;
    setCommented(!commented);
    // No immediate counter change; will increment after comment is actually submitted
  };

  const toggleSave = () => {
    if (!requireAuth("Like this? Sign up first.")) return;
    setSaved(!saved);
    setLocalSavesCount(count => count + (saved ? -1 : 1));
    if (onSave) onSave();
  };

  const handleEditClick = () => {
    if (!requireAuth("Want to edit? Sign up first.")) return;
    // TODO: redirect to edit page or open editor
  };

  const handleShareClick = () => {
    if (!shared) {
      setLocalSharesCount(count => count + 1);
      if (onShare) onShare();
      setShared(true);
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrlSafe);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (

    <motion.div 
      className="flex w-full justify-between pr-2 sm:pr-3 items-center"
      animate={{
        height: showPrompt ? 0 : footerHeight,
        opacity: showPrompt ? 0 : 1,
        marginBottom: showPrompt ? 0 : '0rem'
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        opacity: { 
          duration: showPrompt ? 0.2 : 0.6,
          delay: showPrompt ? 0 : 0.3  // Delay opacity when hiding (showPrompt = true)
        }
      }}
    >
      <div className="flex items-center gap-0">
        {/* Spacer element that matches avatar width */}
        <div className="shrink-0 w-[40px] mr-2 sm:block"></div>
        {!wizardActive && (
          <PromptTemplateAction>
            <Button data-stop-nav
              variant="ghost"
              size="sm"
              type="button"
              className={`gap-0 sm:gap-1 ${liked ? "opacity-100 dark:opacity-100" : ""}`}
              onClick={(e)=>{e.stopPropagation(); toggleLike();}}
            >
              <Icon name="heart" weight={liked ? "fill" : "bold"} className={`size-4.5 ${liked ? "text-[#FF0034]" : ""}`} />
              {localLikesCount > 0 && (
                <SlidingNumber value={localLikesCount} className={`text-sm ${liked ? "text-[#FF0034]" : ""}`} />
              )}
            </Button>
          </PromptTemplateAction>
        )}
        {!wizardActive && (
          <PromptTemplateAction>
            <Button data-stop-nav
              variant="ghost"
              size="sm"
              type="button"
              className="gap-0 sm:gap-1"
              onClick={(e)=>{e.stopPropagation(); toggleComment();}}
            >
              <Icon name="chat" weight="bold" className="size-4.5" />
              {localCommentsCount > 0 && (
                <SlidingNumber value={localCommentsCount} className="text-sm" />
              )}
            </Button>
          </PromptTemplateAction>
        )}
        {!wizardActive && (
          <PromptTemplateAction>
            <Popover>
              <PopoverTrigger asChild>
                <Button data-stop-nav
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="gap-0 sm:gap-1"
                  onClick={(e)=>{e.stopPropagation(); handleShareClick();}}
                >
                  <Icon name="share" className="size-4.5" />
                  {localSharesCount > 0 && (
                    <SlidingNumber value={localSharesCount} className="text-sm hidden sm:inline-block" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-1" align="start" onClick={(e)=>e.stopPropagation()}>
                <div className="flex flex-col">
                  <Button data-stop-nav 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start gap-2 px-2 py-1.5"
                    onClick={(e)=>{e.stopPropagation(); handleCopyLink();}}
                  >
                    <Icon name={copied ? "check" : "linksimple"} className="size-4" />
                    {copied ? "Copied!" : "Copy link"}
                  </Button>
                  <Button data-stop-nav 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start gap-2 px-2 py-1.5"
                    onClick={(e)=>{e.stopPropagation(); window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrlSafe)}`, '_blank');}}
                  >
                    <Icon name="twitter" className="size-4" />
                    Twitter
                  </Button>
                  <Button data-stop-nav 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start gap-2 px-2 py-1.5"
                    onClick={(e)=>{e.stopPropagation(); window.open(`https://threads.net/intent/post?text=${encodeURIComponent(shareUrlSafe)}`, '_blank');}}
                  >
                    <Icon name="threads" className="size-4" />
                    Threads
                  </Button>
                  <Button data-stop-nav 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start gap-2 px-2 py-1.5"
                    onClick={(e)=>{e.stopPropagation(); window.open(`mailto:?subject=Check out this prompt&body=${encodeURIComponent(shareUrlSafe)}`, '_blank');}}
                  >
                    <Icon name="email" className="size-4" />
                    Email
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </PromptTemplateAction>
        )}
        {!wizardActive && (
          <PromptTemplateAction>
            <Button data-stop-nav
              variant="ghost"
              size="sm"
              type="button"
              className={cn("gap-0 sm:gap-1", saved && "opacity-100 dark:opacity-100")}
              onClick={(e)=>{e.stopPropagation(); toggleSave();}}
            >
              <Icon name="bookmark" weight={saved ? "fill" : "bold"} className="size-4.5" />
              {localSavesCount > 0 && (
                <SlidingNumber value={localSavesCount} className="text-sm hidden sm:inline-block" />
              )}
            </Button>
          </PromptTemplateAction>
        )}
      </div>
      <div>
        <Button data-stop-nav 
          size="sm" 
          variant="outline" 
          className="gap-2 text-foreground/90 hover:text-foreground shadow-none opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200" 
          onClick={(e)=>{e.stopPropagation(); setShowPrompt(!showPrompt);}}
        >
          <Icon name={showPrompt ? "EyeClosed" : "Eye"} className="size-4" />
          {showPrompt ? (
            <>
            <span className="sm:hidden">Prompt</span>
            <span className="hidden sm:inline">Show prompt</span>
          </>
          ) : (
            <>
              <span className="sm:hidden">Prompt</span>
              <span className="hidden sm:inline">Show prompt</span>
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

function DefaultPromptFooter() {
  const {
    variables,
    currentStep,
    setCurrentStep,
    totalSteps,
    value: promptValue,
    onLike,
    onSave,
    onShare,
    shareUrl,
    startWizard,
    showPrompt,
    setShowPrompt,
    // Use shared state from context
    liked,
    setLiked,
    commented,
    setCommented,
    saved,
    setSaved,
    shared,
    setShared,
    // Use shared counter states
    localLikesCount,
    setLocalLikesCount,
    localCommentsCount,
    setLocalCommentsCount,
    localSharesCount,
    setLocalSharesCount,
    localSavesCount,
    setLocalSavesCount
  } = usePromptTemplate();
  
  const [copied, setCopied] = useState(false);
  const [shareUrlSafe, setShareUrlSafe] = useState("");

  const { requireAuth } = useRequireAuth();
  const wizardActive = variables.length > 0 && currentStep >= 0 && currentStep <= totalSteps;

  const variableQuestion = currentStep >= 0 && currentStep < variables.length ? `Enter ${variables[currentStep].replace(/_/g, " ")}` : "";
  
  // We use separate states for showing/hiding the prompt and expanding/collapsing the text area
  
  useEffect(() => {
    // Default to current URL if no share URL provided
    setShareUrlSafe(typeof window !== 'undefined' ? (shareUrl || window.location.href) : "");
  }, [shareUrl]);
  
  // Reset shared state when a new prompt is loaded
  useEffect(() => {
    setShared(false);
  }, [shareUrl]);

  // Event handlers
  const toggleLike = () => {
    if (!requireAuth("Like this? Sign up first.")) return;
    // Update UI state
    setLiked(!liked);
    
    // Update local count for immediate feedback
    setLocalLikesCount(count => count + (liked ? -1 : 1));
    
    // Call the actual onLike handler for backend update
    // but don't let it modify our local count, since we already did that
    if (onLike) onLike();
  };

  // Clicking comment icon while prompt is visible – no counter change yet
  const toggleComment = () => {
    if (!requireAuth("Want to comment? Sign up first.")) return;
    setCommented(!commented);
    // Counter will update after comments feature posts successfully
  };

  const toggleSave = () => {
    if (!requireAuth("Like this? Sign up first.")) return;
    // Update UI state
    setSaved(!saved);
    
    // Update local count for immediate feedback
    setLocalSavesCount(count => count + (saved ? -1 : 1));
    
    // Call the actual onSave handler for backend update
    // but don't let it modify our local count, since we already did that
    if (onSave) onSave();
  };

  const handleEditClick = () => {
    if (!requireAuth("Want to edit? Sign up first.")) return;
    // TODO: redirect to edit page or open editor
  };

  const handleShareClick = () => {
    // Only increment if not already shared
    if (!shared) {
      // Increment local share count for immediate feedback
      setLocalSharesCount(count => count + 1);
      
      // Call the actual onShare handler for backend update
      if (onShare) onShare();
      
      // Mark as shared
      setShared(true);
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrlSafe);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  return (
    <PromptTemplateActions className="flex items-center justify-between">
      <div className="flex items-center gap-0">
        {wizardActive && (
          <>
            <PromptTemplateAction>
              <Button data-stop-nav
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
              <Button data-stop-nav
                variant="ghost"
                size="sm"
                type="button"
                disabled={currentStep === totalSteps}
                onClick={() => currentStep < totalSteps && setCurrentStep((s) => s + 1)}
              >
                <Icon name="arrow-right" className="size-4.5" />
              </Button>
            </PromptTemplateAction>
          </>
        )}
        {!wizardActive && (
          <PromptTemplateAction>
            <Button data-stop-nav
              variant="ghost"
              size="sm"
              type="button"
              className={`gap-0 sm:gap-1 ${liked ? "opacity-100 dark:opacity-100" : ""}`}
              onClick={(e)=>{e.stopPropagation(); toggleLike();}}
            >
              <Icon name="heart" weight={liked ? "fill" : "bold"} className={`size-4.5 ${liked ? "text-[#FF0034]" : ""}`} />
              {localLikesCount > 0 && (
                <SlidingNumber value={localLikesCount} className={`text-sm ${liked ? "text-[#FF0034]" : ""}`} />
              )}
            </Button>
          </PromptTemplateAction>
        )}
        {!wizardActive && (
          <PromptTemplateAction>
            <Button data-stop-nav
              variant="ghost"
              size="sm"
              type="button"
              className="gap-0 sm:gap-1"
              onClick={(e)=>{e.stopPropagation(); toggleComment();}}
            >
              <Icon name="chat" weight="bold" className="size-4.5" />
              {localCommentsCount > 0 && (
                <SlidingNumber value={localCommentsCount} className="text-sm" />
              )}
            </Button>
          </PromptTemplateAction>
        )}
        {!wizardActive && (
          <PromptTemplateAction>
            <Popover>
              <PopoverTrigger asChild>
                <Button data-stop-nav
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="gap-0 sm:gap-1"
                  onClick={(e)=>{e.stopPropagation(); handleShareClick();}}
                >
                  <Icon name="share" className="size-4.5" />
                  {localSharesCount > 0 && (
                    <SlidingNumber value={localSharesCount} className="text-sm hidden sm:inline-block" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-1" align="start" onClick={(e)=>e.stopPropagation()}>
                <div className="flex flex-col">
                  <Button data-stop-nav 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start gap-2 px-2 py-1.5"
                    onClick={(e)=>{e.stopPropagation(); handleCopyLink();}}
                  >
                    <Icon name={copied ? "check" : "linksimple"} className="size-4" />
                    {copied ? "Copied!" : "Copy link"}
                  </Button>
                  <Button data-stop-nav 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start gap-2 px-2 py-1.5"
                    onClick={(e)=>{e.stopPropagation(); window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrlSafe)}`, '_blank');}}
                  >
                    <Icon name="twitter" className="size-4" />
                    Twitter
                  </Button>
                  <Button data-stop-nav 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start gap-2 px-2 py-1.5"
                    onClick={(e)=>{e.stopPropagation(); window.open(`https://threads.net/intent/post?text=${encodeURIComponent(shareUrlSafe)}`, '_blank');}}
                  >
                    <Icon name="threads" className="size-4" />
                    Threads
                  </Button>
                  <Button data-stop-nav 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start gap-2 px-2 py-1.5"
                    onClick={(e)=>{e.stopPropagation(); window.open(`mailto:?subject=Check out this prompt&body=${encodeURIComponent(shareUrlSafe)}`, '_blank');}}
                  >
                    <Icon name="email" className="size-4" />
                    Email
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </PromptTemplateAction>
        )}
        {!wizardActive && (
          <PromptTemplateAction>
            <Button data-stop-nav
              variant="ghost"
              size="sm"
              type="button"
              className={cn("gap-0 sm:gap-1", saved && "opacity-100 dark:opacity-100")}
              onClick={(e)=>{e.stopPropagation(); toggleSave();}}
            >
              <Icon name="bookmark" weight={saved ? "fill" : "bold"} className="size-4.5" />
              {localSavesCount > 0 && (
                <SlidingNumber value={localSavesCount} className="text-sm hidden sm:inline-block" />
              )}
            </Button>
          </PromptTemplateAction>
        )}
      </div>
      <div className="flex items-center gap-1">
        {!wizardActive && (
          <>
            <PromptTemplateAction tooltip="Edit prompt">
              <Button data-stop-nav size="icon" type="button" variant="outline" className="gap-1 shadow-none size-8" onClick={(e)=>{e.stopPropagation(); handleEditClick();}}>
                <Icon name="pencil" className="size-4.5" />
              </Button>
            </PromptTemplateAction>
            <PromptTemplateAction tooltip="Hide prompt">
              <Button data-stop-nav 
                size="icon" 
                type="button" 
                variant="outline" 
                className="gap-1 shadow-none size-8 ml-1" 
                onClick={() => setShowPrompt(false)}
              >
                <Icon name="EyeClosed" className="size-4.5" />
              </Button>
            </PromptTemplateAction>
          </>
        )}
        <PromptTemplateAction>
          {variables.length > 0 && currentStep >= 0 && currentStep <= totalSteps && (
            <>
              <Button data-stop-nav variant="outline" size="sm" className="gap-1 shadow-none mr-1 leading-none" onClick={() => setCurrentStep(-1)}>
                {currentStep === totalSteps ? (
                  <>
                    <Icon name="arrowcounterclockwise" className="size-4 mr-1" />
                    Reset
                  </>
                ) : (
                  "Cancel"
                )}
              </Button>
              <Button data-stop-nav 
                size="sm" 
                className={`gap-1 ${currentStep === totalSteps ? 'w-[114px]' : ''}`}
                onClick={() => {
                  if (currentStep === totalSteps) {
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
                  } else {
                    // Normal next step behavior
                    setCurrentStep(s => s + 1);
                    // Focus will be handled by the useEffect that watches currentStep
                  }
                }}
              >
                {currentStep + 1 === totalSteps ? (
                  <>
                    Next<span className="text-[12px] bg-primary-foreground/15 px-1 py-0 rounded-xs font-semibold text-primary-foreground">enter</span><Icon name="CaretRight" className="size-4" />
                  </>
                ) : currentStep === totalSteps ? (
                  <>
                    <Icon name={copied ? "check" : "copyPrompt"} className="size-4.5" weight={copied ? "bold" : "regular"} /> {copied ? "Copied" : "Copy"}
                  </>
                ) : (
                  <>
                    Next<span className="text-[12px] bg-primary-foreground/15 px-1 py-0 rounded-xs font-semibold text-primary-foreground">enter</span><Icon name="CaretRight" className="size-4" />
                  </>
                )}
              </Button>
            </>
          )}
        </PromptTemplateAction>
        {!wizardActive && (
          <PromptTemplateAction>
            <Button data-stop-nav
              size="sm"
              type="button"
              className="gap-1"
              onClick={() => {
                if (variables.length > 0) {
                  startWizard();
                } else {
                  try {
                    navigator.clipboard.writeText(promptValue);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch (err) {
                    console.error('Failed to copy prompt', err);
                  }
                }
              }}
          >
            <Icon name={copied ? "check" : "copyPrompt"} className="size-4.5" weight={copied ? "bold" : "regular"} />
            {copied ? "Copied" : "Copy"}
            {variables.length > 0 && (
              <Icon name="CaretRight" className="size-4 hidden sm:inline-block" />
            )}
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
