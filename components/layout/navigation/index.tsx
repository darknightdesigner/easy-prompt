"use client";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { BookOpen, List as MenuIcon, Users, User, BookmarkSimple, HouseSimple, SignIn as SignInIcon } from "@phosphor-icons/react";
import React, { useRef } from "react";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CopyIcon, type CopyIconHandle } from "@/components/animated-icons/optiprompt";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
  items?: MenuItem[];
}

interface Navbar2Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: {
      title: string;
      url: string;
    };
    signup: {
      title: string;
      url: string;
    };
  };
}

const Navbar2 = ({
  logo = {
    url: "/",
    src: "/optiprompt-logo.svg",
    alt: "OptiPrompt logo",
    title: "OptiPrompt",
  },
  menu = [
    { title: "Home", url: "", icon: <HouseSimple size={18} className="size-4.5" />, mobileOnly: true },
    { title: "Prompts", url: "#", icon: <BookOpen size={18} className="size-4.5" />, desktopOnly: true },
    { title: "Creators", url: "#", icon: <Users size={18} className="size-4.5" /> },
    { title: "Saved", url: "#", icon: <BookmarkSimple size={18} className="size-4.5" /> },
    { title: "Profile", url: "#", icon: <User size={18} className="size-4.5" />, mobileOnly: true },
  ],
  auth = {
    login: { title: "Login", url: "#" },
    signup: { title: "Sign up", url: "#" },
  },
}: Navbar2Props) => {
  const copyIconRef = useRef<CopyIconHandle>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  // CSS animation class names
  const navAnimation = isHome ? "animate-slide-fade-down" : "";
  const shadowAnimation = isHome ? "animate-fade-in" : "";
  // Use gradient border only on ≥sm
  const borderImage = typeof window !== 'undefined' && window.innerWidth >= 640
    ? 'linear-gradient(to right, transparent 10%, var(--border) 50%, transparent 90%) 1'
    : undefined;
  return (
    <>
      <div
        className={cn("fixed inset-x-0 bottom-0 sm:top-0 sm:bottom-auto z-50 h-[54px] sm:h-13 flex justify-center", navAnimation)}
        
      >
      <section
        className="navbar-border py-0 sm:py-2 border-t border-border sm:border-t-0 sm:border-b h-full w-full bg-card sm:bg-[linear-gradient(to_right,transparent_0%,var(--background)_25%,var(--background)_75%,transparent_100%)]"
        
      >
      <div className="mx-auto w-full h-full max-w-none sm:max-w-screen-lg relative z-10 px-0 sm:px-6" >
        {/* Desktop Menu */}
        <nav className="flex w-full h-full items-center justify-between">
          {/* Logo */}
          <a
            href={logo.url}
            className="hidden sm:flex items-center gap-2"
            onMouseEnter={() => copyIconRef.current?.startAnimation()}
            onMouseLeave={() => copyIconRef.current?.stopAnimation()}
          >
            <CopyIcon ref={copyIconRef} size={24} />
            <span className="text-base font-semibold tracking-tight">
              {logo.title}
            </span>
          </a>
          <div className="flex w-full sm:flex-1 items-center justify-center">
            <div className="flex w-full sm:w-auto items-center">
              <NavigationMenuWithoutViewport className="flex-1 basis-0 grow min-w-0 sm:flex-none sm:grow-0 w-full sm:w-auto max-w-none">
                <NavigationMenuList className="relative w-full sm:w-auto gap-0 sm:gap-1">
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenuWithoutViewport>
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            <Button asChild variant="ghost" className="h-auto rounded-full flex flex-col items-center gap-1 sm:h-8 sm:flex-row sm:gap-2">
              <a href={auth.login.url} className="flex items-center gap-1"><SignInIcon size={16} className="sm:hidden" />{auth.login.title}</a>
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <a href={auth.signup.url}>{auth.signup.title}</a>
            </Button>
          </div>
        </nav>
      </div>
      </section>
    </div>
            {/* border style: solid on mobile, gradient on sm+ */}
      <style jsx>{`
        .navbar-border {
          border-image: none;
        }
        @media (max-width: 639px) {
          :global([data-slot="navigation-menu"] > div) {
            width: 100%;
          }
        }
        @media (min-width: 640px) {
          .navbar-border {
            border-image: linear-gradient(to right, transparent 10%, var(--border) 50%, transparent 90%) 1;
          }
        }
      `}</style>
    {/* New fixed gradient shadow */}
    <div
        className={cn("pointer-events-none fixed inset-x-0 bottom-12 sm:top-12 sm:bottom-auto z-40 h-1 bg-[linear-gradient(to_right,transparent_25%,rgba(0,0,0,0.25)_50%,transparent_75%)] blur-[6px]", shadowAnimation)}
        
      />
    </>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title} className={`flex-1 basis-0 grow min-w-0 sm:flex-none sm:grow-0 w-full sm:w-auto ${item.desktopOnly ? 'hidden sm:flex' : ''}`}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="origin-top-center relative top-11 w-full overflow-hidden rounded-md border shadow data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-90 md:absolute md:left-1/2 md:w-80 md:-translate-x-1/2">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.url ?? subItem.title} className="w-full opacity-70 hover:opacity-100">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title} className={`flex-1 basis-0 grow min-w-0 sm:flex-none sm:grow-0 w-full sm:w-auto ${item.desktopOnly ? 'hidden sm:flex' : ''}`}>
      <Button variant="ghost" asChild className={`w-full sm:w-auto min-w-0 h-auto rounded-full flex flex-col items-center gap-1 sm:h-8 sm:flex-row sm:gap-2 ${item.mobileOnly ? 'sm:hidden' : ''}`}>
        <a href={item.url} className="flex-1 flex w-full sm:w-auto flex-col items-center gap-1 sm:flex-row sm:gap-2 px-0 sm:px-3">
          {item.icon && <span className="text-current">{item.icon}</span>}
          <span>{item.title}</span>
        </a>
      </Button>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.url ?? subItem.title} className="w-full opacity-70 hover:opacity-100">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Button
      variant="ghost"
      asChild
      className="w-full justify-start text-md font-semibold"
    >
      <a key={item.title} href={item.url} className="hidden sm:flex items-center gap-2">
        {item.icon && <span className="text-current">{item.icon}</span>}
        <span>{item.title}</span>
      </a>
    </Button>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="flex flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none opacity-70 hover:opacity-100 hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      <div className="text-current">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

const NavigationMenuWithoutViewport = ({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) => {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      {/* The Viewport needs to be removed to center align submenus under their parents. */}
    </NavigationMenuPrimitive.Root>
  );
};

export { Navbar2, Navbar2 as TopNav };
