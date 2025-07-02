"use client";
import { usePathname } from "next/navigation";
import { TopNav } from "./navigation";

export function TopNavConditional() {
  const pathname = usePathname();
  // hide nav on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }
  return <TopNav />;
}
