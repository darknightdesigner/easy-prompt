"use client";

import * as Phosphor from "@phosphor-icons/react";
import React from "react";
import { CopyPromptIcon } from "@/components/ui/icons/copy-prompt-icon";
import { RiChatSmile2Line } from "react-icons/ri";
import { ChatSmileRoundedCustomIcon } from "@/components/ui/icons/chat-smile-rounded-custom-icon";

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
  linksimple: Phosphor.LinkSimpleIcon,
  twitter: Phosphor.XLogoIcon,
  "arrow-left": Phosphor.ArrowLeftIcon,
  "arrow-right": Phosphor.ArrowRightIcon,
  email: Phosphor.EnvelopeSimpleIcon,
  threads: Phosphor.ThreadsLogoIcon,
  check: Phosphor.CheckIcon,
  sliders: Phosphor.SlidersHorizontalIcon,
  search: Phosphor.MagnifyingGlassIcon,
  copyPrompt: CopyPromptIcon,
  "caret-down": Phosphor.CaretDownIcon,
  "caret-up": Phosphor.CaretUpIcon,
  verified: Phosphor.SealCheckIcon,
  profile: Phosphor.UserIcon,
  login: Phosphor.SignInIcon,
  logout: Phosphor.SignOutIcon,
  menu: Phosphor.ListIcon,
  pencil: Phosphor.PencilSimpleIcon,
  arrowcounterclockwise: Phosphor.ArrowCounterClockwiseIcon,
  CaretRight: Phosphor.CaretRightIcon,
  ChatCircleText: Phosphor.ChatCircleTextIcon,
  EyeSlash: Phosphor.EyeSlashIcon,
  EyeClosed: Phosphor.EyeClosedIcon,
  Eye: Phosphor.EyeIcon,
  PlusSquare: Phosphor.PlusSquareIcon,
  ChatTeardropText: Phosphor.ChatTeardropTextIcon,
  chatSmile2Line: RiChatSmile2Line,
  chatSmileRoundedCustom: ChatSmileRoundedCustomIcon,
  envelope: Phosphor.EnvelopeSimpleIcon,
  smiley: Phosphor.SmileyIcon,
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
