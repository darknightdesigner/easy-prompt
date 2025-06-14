"use client";
import { IconContext } from "@phosphor-icons/react";
import React from "react";

interface IconProviderProps {
  children: React.ReactNode;
}

export function IconProvider({ children }: IconProviderProps) {
  return (
    <IconContext.Provider value={{ weight: "bold" }}>
      {children}
    </IconContext.Provider>
  );
}
