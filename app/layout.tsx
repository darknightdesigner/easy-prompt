import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./global.css";

import { ThemeProvider } from "@/components/ui/theme-provider";
import { SupabaseProvider } from "@/components/supabase-provider"
import { IconProvider } from "@/components/icon-provider";
import { TopNavConditional } from "@/components/layout/top-nav-conditional";
import { AuthRequiredDialogProvider } from "@/components/ui/auth-required-dialog";
import { CreateTemplateDialogProvider, CreateTemplateDialog } from "@/components/ui/create-template-dialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Easyprompt",
  description: "Discover world-class prompts and copy them simply, using {variables}",
};

import { supabaseServer } from "@/lib/supabaseServer";
import React from "react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  
  
  const supabase = await supabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
          

          <SupabaseProvider initialSession={session}>
          <CreateTemplateDialogProvider>
            <AuthRequiredDialogProvider>
              <IconProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <TopNavConditional />
                {children}
                <CreateTemplateDialog />
              </ThemeProvider>
            </IconProvider>
              </AuthRequiredDialogProvider>
            </CreateTemplateDialogProvider>
        </SupabaseProvider>
        </body>
      </html>
    
  );
}
