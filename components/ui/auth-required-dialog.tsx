"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface AuthDialogState {
  open: boolean;
  message: string;
}

interface AuthDialogContextValue {
  showDialog: (message?: string) => void;
}

const AuthDialogContext = createContext<AuthDialogContextValue | undefined>(
  undefined
);

export function useAuthDialog(): AuthDialogContextValue {
  const ctx = useContext(AuthDialogContext);
  if (!ctx) {
    throw new Error("useAuthDialog must be used within AuthRequiredDialogProvider");
  }
  return ctx;
}

export function AuthRequiredDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<AuthDialogState>({
    open: false,
    message: "",
  });

  const showDialog = (message = "Like this? Sign up first.") => {
    setState({ open: true, message });
  };

  return (
    <AuthDialogContext.Provider value={{ showDialog }}>
      {children}
      <AlertDialog open={state.open} onOpenChange={(open) => setState((s) => ({ ...s, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign up required</AlertDialogTitle>
            <AlertDialogDescription>{state.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Close</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button asChild>
                <a href="/register">Sign up</a>
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthDialogContext.Provider>
  );
}
