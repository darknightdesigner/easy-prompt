"use client";

import { Icon } from "@/components/ui/icon";
import { motion } from "motion/react";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { ContainerEffect } from "@/components/motion-primitives/container-effect";
import { CopyIcon } from "@/components/animated-icons/easyprompt";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCreateTemplate } from "@/components/ui/create-template-dialog";
import WavyCanvas from "@/components/graphics/WavyCanvas";
import {
  PromptTemplate,
  PromptTemplateTextarea,
} from "@/components/ui/prompt-template";

const HeroSection = React.memo(function HeroSection() {
  return (
    <>
      <h1 className="mb-2 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl">
        <TextEffect
          preset="fade-in-blur"
          delay={0.1}
          speedReveal={1}
          speedSegment={0.5}
        >
          Powerful prompts made simple
        </TextEffect>
      </h1>
      <p className="mx-auto text-foreground/70">
        <TextEffect
          as="span"
          preset="fade-in-blur"
          delay={0.5}
          speedReveal={4}
          speedSegment={1}
        >
          {"Discover world-class prompts and copy them simply, using {{ variables }}"}
        </TextEffect>
      </p>
    </>
  );
});

HeroSection.displayName = "HeroSection";

const HeroButtons = React.memo(function HeroButtons() {
  const { openDialog } = useCreateTemplate();
  
  const buttonContent = useMemo(() => (
    <ContainerEffect key="hero-buttons" preset="fade-in-blur" delay={0.6} transition={{ duration: 0.6 }}>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Button 
          variant="outline" 
          className="shadow-none"
          onClick={() => openDialog()}
        >
          <Icon name="plus" weight="bold" className="size-4.5" />
          Create Template
        </Button>
        <Button asChild variant="outline" className="shadow-none">
          <Link href="/home" className="flex items-center gap-1">
            <Icon name="chatSmileRoundedCustom" weight="bold" className="size-4.5" />
            Explore Prompts
          </Link>
        </Button>
      </div>
    </ContainerEffect>
  ), [openDialog]);
  
  return buttonContent;
});

HeroButtons.displayName = "HeroButtons";

export default function Home() {
  return (
    <section className="relative min-h-svh overflow-hidden py-16 sm:py-32 flex flex-col gap-8 justify-center bg-background">
      <div
        className="absolute inset-0 z-0 pointer-events-none before:absolute before:inset-0 before:content-[''] before:bg-[url('https://cdn.prod.website-files.com/61a6b59cc1578e2a2caf13c5/61ae57c4d73bf15eadf011b8_grain.gif')] before:bg-repeat before:mask-[linear-gradient(to_top,black_0%,black_25%,transparent_100%)] before:opacity-0"
      />
      {/* wavy background */}
      <div className="absolute top-0 left-0 w-screen h-svh flex items-center justify-center pointer-events-none z-0">
        <motion.div
          className="w-full sm:mb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 1 }}
        >
          <WavyCanvas />
        </motion.div>
      </div>
      <div className="relative z-10 w-full">
        <div className="mx-auto w-full flex flex-col items-stretch px-4">
          <div className="flex flex-col items-center gap-2 text-center mt-0 sm:mt-16 relative z-10">
            <HeroSection />
            <HeroButtons />
          </div>
        </div>
      </div>
      <ContainerEffect className="flex justify-center" preset="fade-in-blur" delay={0.7} transition={{ duration: 0.6 }}>
        <div className="relative w-full flex-1 sm:max-w-176 px-2 sm:px-4" style={{ minHeight: '425px' }}>
          <PromptTemplate
            initialExpanded={true}
            authorAvatar="https://ci3.googleusercontent.com/mail-sig/AIorK4yctzAmNSeWRCuUGwYHYlqVFpxrb40OIXsdWX-IOdVDk9b3GmtZUcGmrRLYDjMQnbTCcv9qFLpnpEEt"
            displayName="Andres Gonzalez"
            username="batman"
            title="The personalized $100M startup idea researcher that feels like a cheat code. Paste your unique profile, skills, etc... and get 5–7 sourced, founder‑fit opportunities in minutes."
            likesCount={25}
            commentsCount={5}
            sharesCount={4}
            savesCount={21}
            verified={true}
            shareUrl={"https://www.easyprompt.ai"}
            value={`You are a seasoned venture analyst with instant access to up‑to‑the‑minute market data, private funding databases, patent filings, and technology trend reports.

GOAL  
Identify 5–7 “golden‑zone” startup opportunities I should pursue next—ideas that (a) leverage my unique unfair advantages, (b) ride strong market tailwinds, and (c) have a credible path to $100M+ in yearly revenues within 7 years.

INPUTS  
• Founder profile: {{founder_profile}}  
• Core skills & unfair advantages: {{skills}}  
• Target/acceptable industries: {{industries}}  
• Capital constraints for MVP: {{capital_limit}} (e.g., <$250k)  
• Personal mission & values: {{mission}}  
• Time horizon to MVP: {{mvp_timeline}}  

DELIVERABLE (for **each** opportunity)  
1. 🔑 One‑sentence concept  
2. 📈 “Why Now”: key macro & micro trends enabling this idea (with sources)  
3. 🧩 Founder‑fit rationale (how my skills give me an edge)  
4. ⚠️ Top 3 execution or market risks  
5. ✅ First quick‑and‑cheap experiment to validate demand (with success metric)  
6. 💵 Comparable exits or recent funding rounds (size, year, investors)

CONSTRAINTS  
• Prioritize markets that are growing ≥15% CAGR or poised for regulatory tailwinds.  
• Favor business models that can reach breakeven within 18 months on projected unit economics.  
• Avoid ideas requiring >5 full‑time engineers before product‑market fit.  
• Reference at least three reputable, current sources per opportunity.  
• Present results in a clean Markdown table for easy comparison.

Begin.`}
        >
          <PromptTemplateTextarea
            className="w-full resize-none text-base placeholder:text-muted-foreground"
            placeholder="Write your prompt template here..."
          />

        </PromptTemplate>
        </div>
      </ContainerEffect>

    </section>
  );
}