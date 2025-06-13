"use client";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { Book, Menu, Sunset, Trees, Zap } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "@/components/animated-icons/optiprompt";
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
    { title: "Home", url: "#" },
    { title: "Pricing", url: "#" },
    { title: "Blog", url: "#" },
  ],
  auth = {
    login: { title: "Login", url: "#" },
    signup: { title: "Sign up", url: "#" },
  },
}: Navbar2Props) => {
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <section
        className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 border-b border-border relative"
      style={{
        borderImage:
          'linear-gradient(to right, transparent 0%, var(--border) 50%, transparent 100%) 1',
      }}
    >
      <div className="mx-auto w-full max-w-screen-lg px-6 relative z-10">
        {/* Desktop Menu */}
        <nav className="hidden w-full items-center justify-between lg:flex">
          {/* Logo */}
          <a href={logo.url} className="flex items-center gap-2">
            <CopyIcon size={28} />
            <span className="text-lg font-semibold tracking-tighter">
              {logo.title}
            </span>
          </a>
          <div className="flex flex-1 items-center justify-center gap-6">
            <div className="flex items-center">
              <NavigationMenuWithoutViewport>
                <NavigationMenuList className="relative">
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenuWithoutViewport>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={auth.login.url}>{auth.login.title}</a>
            </Button>
            <Button asChild size="sm">
              <a href={auth.signup.url}>{auth.signup.title}</a>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <a href={logo.url} className="flex items-center gap-2">
              <CopyIcon size={28} />
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
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
                    <Button asChild variant="outline">
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

      {/* gradient shadow */}
      <div className="pointer-events-none absolute inset-x-0 top-full -z-10 h-4 bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10 blur-[10px]" />
      </section>
    </div>
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
      <NavigationMenuLink
        href={item.url}
        className="group inline-flex h-10 w-max items-center justify-center rounded-full bg-background px-4 py-2 text-sm font-medium opacity-70 hover:opacity-100 transition-colors hover:bg-muted hover:text-accent-foreground"
      >
        {item.title}
      </NavigationMenuLink>
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
    <a key={item.title} href={item.url} className="text-md font-semibold">
      {item.title}
    </a>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="flex flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none opacity-70 hover:opacity-100 hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      <div className="text-muted-foreground">{item.icon}</div>
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
