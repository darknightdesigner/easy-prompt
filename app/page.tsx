"use client";

import { Icon } from "@/components/ui/icon";
import { motion } from "motion/react";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { ContainerEffect } from "@/components/motion-primitives/container-effect";
import { CopyIcon } from "@/components/animated-icons/optiprompt";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import WavyCanvas from "@/components/graphics/WavyCanvas";
import {
  PromptTemplate,
  PromptTemplateTextarea,
} from "@/components/ui/prompt-template";

const HeroSection = React.memo(function HeroSection() {
  return (
    <div className="relative z-10 w-full">
      <div className="mx-auto w-full flex flex-col items-stretch px-4">
        <div className="flex flex-col items-center gap-2 text-center mt-0 sm:mt-16 relative z-10">
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
              {"Discover world-class prompts and copy them simply, using {variables}"}
            </TextEffect>
          </p>
          <ContainerEffect preset="fade-in-blur" delay={0.6} transition={{ duration: 0.6 }}>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              <Button variant="outline" className="shadow-none">
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
        </div>
      </div>
    </div>
  );
});

HeroSection.displayName = "HeroSection";

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
      <HeroSection />
      <ContainerEffect className="flex justify-center" preset="fade-in-blur" delay={0.6} transition={{ duration: 0.6 }}>
        <div className="relative w-full flex-1 sm:max-w-176 px-2 sm:px-4">
          <PromptTemplate
            initialExpanded={true}
            authorAvatar="https://ci3.googleusercontent.com/mail-sig/AIorK4yctzAmNSeWRCuUGwYHYlqVFpxrb40OIXsdWX-IOdVDk9b3GmtZUcGmrRLYDjMQnbTCcv9qFLpnpEEt"
            displayName="Andres Gonzalez"
            username="batman"
            title="Create specialized YouTube video scripts based on your niche"
            likesCount={25}
            commentsCount={5}
            sharesCount={4}
            savesCount={21}
            verified={true}
            shareUrl={"https://www.optiprompt.ai"}
            variableQuestions={{
              niche: "What industry or topic is your channel about?",
              video_topic: "What specific topic will this video cover?",
              audience: "Who is your target audience?",
              video_goal: "What's the main goal of this video?",
              video_length: "How long should the video be (in minutes)?",
              tone_style: "What tone or style do you want for the video?",
              host_persona: "Describe the on-screen host's persona",
              key_points: "What key points must be covered?",
              supporting_material: "What examples or data can you provide?",
              cta: "What's your main call-to-action?",
              secondary_ctas: "Any secondary calls-to-action?",
              brand_voice_guidelines: "Describe your brand voice"
            }}
            value={`You are an award-winning YouTube scriptwriter and growth strategist.

TASK  
Create a complete, timestamped script for a YouTube video.

VIDEO BRIEF  
• Niche / industry: {niche}  
• Specific topic or angle: {video_topic}  
• Target viewer persona(s): {audience}  
• Goal of the video (educate / sell / build authority / entertain): {video_goal}  
• Desired video length (minutes): {video_length}  
• Tone & style (e.g., playful, cinematic, no-fluff, storytelling): {tone_style}  
• On-screen host’s persona or credibility blurb: {host_persona}  
• Key points or takeaways that **must** be covered (bullet list): {key_points}  
• Real-world examples, data, or case studies available: {supporting_material}  
• Primary call-to-action at the end: {cta}  
• Secondary CTAs or brand integrations (if any): {secondary_ctas}  

FORMAT REQUIREMENTS  
1. **Compelling Title**: 3 click-worthy title options (≤60 chars).  
2. **Hook (00:00-00:20)**: 1-2 punchy sentences that grab attention and preview the transformation/value.  
3. **Intro (00:20-00:45)**: Presenter intro + why the viewer should care, ending with a one-sentence promise.  
4. **Body**  
   - Break into logical chapters with timestamps (e.g., 01:15, 03:40…).  
   - Use storytelling frameworks (problem → insight → solution) where possible.  
   - Include dialogue, on-screen text cues, B-roll notes, and any graphics callouts.  
5. **Recap & CTA (final 30-45 sec)**: Summarize key takeaways, deliver {cta}, and tease the next video.  
6. **SEO Section (after the script)**:  
   - 15 high-intent tags/keywords.  
   - 150-word video description incorporating those keywords naturally.  
   - 3 thumbnail headline ideas.

CONSTRAINTS  
- Write at a 6th-to-8th-grade reading level unless {tone_style} states otherwise.  
- Keep sentences ≤20 words; use active voice.  
- Infuse the brand voice: {brand_voice_guidelines}.  
- Avoid filler phrases (“so yeah,” “basically”) and clichés.

DELIVERABLE  
Return everything in **markdown** with headings and bullet lists for easy pasting into Notion.

BEGIN.`}
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