'use client';
import { cn } from '@/lib/utils';
import {
  AnimatePresence,
  motion,
  type TargetAndTransition,
  type Transition,
  type Variant,
  type Variants,
} from 'motion/react';
import React, { useMemo } from 'react';

export type ContainerPresetType =
  | 'blur'
  | 'fade-in-blur'
  | 'scale'
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right';

export type ContainerEffectProps = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  preset?: ContainerPresetType;
  customVariants?: Variants;
  transition?: Transition;
  delay?: number;
  trigger?: boolean;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
};

const presetVariants: Record<ContainerPresetType, Variants> = {
  blur: {
    hidden: { opacity: 0, filter: 'blur(8px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(8px)' },
  },
  'fade-in-blur': {
    hidden: { opacity: 0, y: 20, filter: 'blur(12px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
      exit: { opacity: 0, y: 20, filter: 'blur(12px)' },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'slide-up': {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  'slide-down': {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
};

const hasTransition = (
  variant?: Variant
): variant is TargetAndTransition & { transition?: Transition } => {
  if (!variant) return false;
  return typeof variant === 'object' && 'transition' in variant;
};

const mergeTransitions = (
  baseTransition: Transition | undefined,
  overrideTransition: Transition | undefined
): Transition | undefined => {
  if (!overrideTransition) return baseTransition;
  if (!baseTransition) return overrideTransition;
  return { ...baseTransition, ...overrideTransition };
};

export const ContainerEffect: React.FC<ContainerEffectProps> = ({
  children,
  as: AsComponent = 'div',
  className,
  style,
  preset,
  customVariants,
  transition: propTransition,
  delay = 0,
  trigger = true,
  onAnimationComplete,
  onAnimationStart,
}) => {
  const MotionComponent = motion.create(AsComponent);

  const finalVariants = useMemo(() => {
    let variantsToUse = customVariants || (preset ? presetVariants[preset] : presetVariants.fade);

    if (propTransition || delay > 0) {
      const newVariants: Variants = { ...variantsToUse };
      const transitionWithDelay: Transition = { ...propTransition, delay };

      if (newVariants.visible) {
        newVariants.visible = {
          ...newVariants.visible,
          transition: mergeTransitions(
            hasTransition(newVariants.visible) ? newVariants.visible.transition : undefined,
            transitionWithDelay
          ),
        };
      }
      if (newVariants.exit && propTransition) {
         // Only apply propTransition to exit, not delay
        newVariants.exit = {
          ...newVariants.exit,
          transition: mergeTransitions(
            hasTransition(newVariants.exit) ? newVariants.exit.transition : undefined,
            propTransition 
          ),
        };
      }
      return newVariants;
    }
    return variantsToUse;
  }, [customVariants, preset, propTransition, delay]);

  return (
    <AnimatePresence>
      {trigger && (
        <MotionComponent
          key={String(trigger)} // Re-trigger animation when trigger changes
          className={cn(className)}
          style={style}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={finalVariants}
          onAnimationComplete={onAnimationComplete}
          onAnimationStart={onAnimationStart}
        >
          {children}
        </MotionComponent>
      )}
    </AnimatePresence>
  );
};

ContainerEffect.displayName = 'ContainerEffect';
