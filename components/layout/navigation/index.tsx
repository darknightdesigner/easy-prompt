"use client";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { BookOpen, List as MenuIcon, Users, Lightning } from "@phosphor-icons/react";
import React, { useRef } from "react";
import { motion } from "motion/react";
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
    { title: "Prompts", url: "#", icon: <BookOpen size={18} className="size-4.5" /> },
    { title: "Creators", url: "#", icon: <Users size={18} className="size-4.5" /> },
    { title: "Extension", url: "#", icon: <Lightning size={18} className="size-4.5" /> },
  ],
  auth = {
    login: { title: "Login", url: "#" },
    signup: { title: "Sign up", url: "#" },
  },
}: Navbar2Props) => {
  const copyIconRef = useRef<CopyIconHandle>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Use gradient border only on ≥sm
  const borderImage = typeof window !== 'undefined' && window.innerWidth >= 640
    ? 'linear-gradient(to right, transparent 10%, var(--border) 50%, transparent 90%) 1'
    : undefined;
  return (
    <>
      <motion.div
        className="fixed inset-x-0 bottom-0 sm:top-0 sm:bottom-auto z-50 h-13 flex justify-center"
        initial={isHome ? { y: -5, opacity: 0 } : false}
        animate={isHome ? { y: 0, opacity: 1 } : false}
        transition={{ type: "spring", stiffness: 60, damping: 16, delay: 0.75 }}
      >
      <section
        className="navbar-border py-2 border-t border-border sm:border-t-0 sm:border-b h-full w-full bg-background sm:bg-[linear-gradient(to_right,transparent_0%,var(--background)_25%,var(--background)_75%,transparent_100%)]"
        
      >
      <div className="mx-auto w-full h-full max-w-screen-lg relative z-10 px-6" >
        {/* Desktop Menu */}
        <nav className="hidden w-full h-full items-center justify-between sm:flex">
          {/* Logo */}
          <a
            href={logo.url}
            className="flex items-center gap-2"
            onMouseEnter={() => copyIconRef.current?.startAnimation()}
            onMouseLeave={() => copyIconRef.current?.stopAnimation()}
          >
            <CopyIcon ref={copyIconRef} size={24} />
            <span className="text-base font-semibold tracking-tight">
              {logo.title}
            </span>
          </a>
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center">
              <NavigationMenuWithoutViewport>
                <NavigationMenuList className="relative">
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenuWithoutViewport>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href={auth.login.url}>{auth.login.title}</a>
            </Button>
            <Button asChild size="sm">
              <a href={auth.signup.url}>{auth.signup.title}</a>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between">
            <a href={logo.url} className="flex items-center gap-2">
              <CopyIcon size={28} />
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <MenuIcon size={16} />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="overflow-y-auto rounded-t-lg">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2">
                      <CopyIcon size={28} />
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>

                  <div className="flex flex-col gap-3">
                    <Button asChild variant="ghost">
                      <a href={auth.login.url}>{auth.login.title}</a>
                    </Button>
                    <Button asChild>
                      <a href={auth.signup.url}>{auth.signup.title}</a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      </section>
    </motion.div>
            {/* border style: solid on mobile, gradient on sm+ */}
      <style jsx>{`
        .navbar-border {
          border-image: none;
        }
        @media (min-width: 640px) {
          .navbar-border {
            border-image: linear-gradient(to right, transparent 10%, var(--border) 50%, transparent 90%) 1;
          }
        }
      `}</style>
    {/* New fixed gradient shadow */}
    <motion.div
        className="pointer-events-none fixed inset-x-0 bottom-12 sm:top-12 sm:bottom-auto z-40 h-1 bg-[linear-gradient(to_right,transparent_25%,rgba(0,0,0,0.25)_50%,transparent_75%)] blur-[6px]"
        initial={isHome ? { y: 0, opacity: 0 } : false}
        animate={isHome ? { y: 0, opacity: 1 } : false}
        transition={{ type: "spring", stiffness: 60, damping: 22, delay: 1.25 }}
      />
    </>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="origin-top-center relative top-11 w-full overflow-hidden rounded-md border shadow data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-90 md:absolute md:left-1/2 md:w-80 md:-translate-x-1/2">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-full opacity-70 hover:opacity-100">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <Button variant="ghost" asChild className="h-8 rounded-full flex items-center gap-2">
        <a href={item.url} className="flex items-center gap-2">
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
            <NavigationMenuLink asChild key={subItem.title} className="w-full opacity-70 hover:opacity-100">
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
      <a key={item.title} href={item.url} className="flex items-center gap-2">
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
