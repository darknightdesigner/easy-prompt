"use client";

import * as Phosphor from "@phosphor-icons/react";
import React from "react";
import { CopyPromptIcon } from "@/components/ui/icons/copy-prompt-icon";
// (local CopyPromptIcon removed – using shared component)
// Map logical icon names to a concrete Phosphor glyph (or custom SVG component).
// Add or swap entries here to change icons application-wide.
const registry = {
  copy: Phosphor.CopyIcon,
  paperclip: Phosphor.PaperclipIcon,
  send: Phosphor.ArrowUpIcon,
  plus: Phosphor.PlusIcon,
  book: Phosphor.BookOpenIcon,
  house: Phosphor.HouseSimpleIcon,
  users: Phosphor.UsersIcon,
  bookmark: Phosphor.BookmarkSimpleIcon,
  heart: Phosphor.HeartIcon,
  chat: Phosphor.ChatCircleIcon,
  share: Phosphor.PaperPlaneTiltIcon,
  sliders: Phosphor.SlidersHorizontalIcon,
  copyPrompt: CopyPromptIcon,
  "caret-down": Phosphor.CaretDownIcon,
  "caret-up": Phosphor.CaretUpIcon,
  verified: Phosphor.SealCheckIcon,
  profile: Phosphor.UserIcon,
  login: Phosphor.SignInIcon,
  logout: Phosphor.SignOutIcon,
  menu: Phosphor.ListIcon,
} as const;

type Registry = typeof registry;
export type IconName = keyof Registry; // includes 'verified', 'caret-down', 'caret-up', 'copyPrompt'

type IconProps = {
  /** Key defined in the registry */
  name: IconName;
} & Record<string, any>;

export function Icon({ name, ...props }: IconProps) {
  const Glyph = registry[name];
  // If an invalid name is supplied, render nothing in production; warn in dev.
  if (!Glyph) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Icon '${name}' not found in registry.`);
    }
    return null;
  }
  return <Glyph {...props} />;
}
