"use client";
import { YoutubeLogo, FigmaLogo, ImageSquare, FramerLogo, TwitterLogo, NotePencil, Table, Lightning, ChatCircleDots, MusicNotes, FilmSlate, GlobeHemisphereWest, BookOpen, Brain, ChartBar, RocketLaunch, ArrowUpRight } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Tile, TileHeader, TileIcon, TileIconSecondary, TileTitle, TileDescription } from "@/components/ui/tile";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { ContainerEffect } from '@/components/motion-primitives/container-effect';
import { CopyIcon } from "@/components/animated-icons/optiprompt"

export default function Home() {

  return (
    <section className="relative overflow-hidden py-32 flex flex-col gap-12 items-center justify-center bg-[linear-gradient(to_bottom,var(--background)_0%,var(--secondary)_100%)] sm:bg-[linear-gradient(to_bottom,var(--background)_50%,var(--secondary)_100%)]">
      <div className="absolute inset-x-0 top-0 flex h-full w-full items-center justify-center bg-dotted-pattern opacity-100 [mask-image:linear-gradient(to_bottom,transparent_25%,white_100%)]">
      </div>
      <div className="relative z-10 w-full">
        <div className="mx-auto flex flex-col items-center px-4 max-w-xs sm:max-w-md">
          <div className="flex flex-col items-center gap-3 text-center">
            <ContainerEffect preset="fade-in-blur" delay={0} transition={{ duration: 0.6 }}>
              <div>
                <CopyIcon size={42} />
              </div>
            </ContainerEffect>
            <div>
              <h1 className="mb-3 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl">
                <TextEffect preset="fade-in-blur" delay={0.1} speedReveal={1} speedSegment={0.5}>
                  Powerful prompts, made simple
                </TextEffect>
              </h1>
              <p className="mx-auto max-w-lg text-muted-foreground md:text-lg">
                <TextEffect as="span" preset="fade-in-blur" delay={0.5} speedReveal={4} speedSegment={1}>
                  Discover powerful prompts, and copy them simply.
                </TextEffect>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 w-full">
        <div className="mx-auto flex flex-col items-center sm:max-w-[48rem] px-2">
            <motion.div
              initial={{ opacity: 0, filter: 'blur(5px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.75, duration: 0.5 }}
              className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <YoutubeLogo weight="fill" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>YouTube Growth</TileTitle>
                  <TileDescription>590+ prompts</TileDescription>
                </div>
              </a>
            </Tile>
            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <FigmaLogo weight="regular" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Figma to Code</TileTitle>
                  <TileDescription>Generate code from your Figma designs.</TileDescription>
                </div>
              </a>
            </Tile>
            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <ImageSquare weight="regular" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Image Generation</TileTitle>
                  <TileDescription>Create stunning images with AI.</TileDescription>
                </div>
              </a>
            </Tile>
            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <FramerLogo weight="fill" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Framer Components</TileTitle>
                  <TileDescription>Reusable motion components for Framer.</TileDescription>
                </div>
              </a>
            </Tile>

            {/* Additional tiles */}
            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <TwitterLogo weight="fill" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Twitter Threads</TileTitle>
                  <TileDescription>Engaging thread templates.</TileDescription>
                </div>
              </a>
            </Tile>

            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <NotePencil weight="regular" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Blog Writer</TileTitle>
                  <TileDescription>SEO-friendly article prompts.</TileDescription>
                </div>
              </a>
            </Tile>

            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <Table weight="regular" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Excel Formulas</TileTitle>
                  <TileDescription>Generate complex formulas fast.</TileDescription>
                </div>
              </a>
            </Tile>

            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <Lightning weight="fill" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Code Optimizer</TileTitle>
                  <TileDescription>Refactor & speed-up code.</TileDescription>
                </div>
              </a>
            </Tile>
                         {/* Extra tiles */}
            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <ChatCircleDots weight="regular" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Chatbot Builder</TileTitle>
                  <TileDescription>Create custom chatbots with ease.</TileDescription>
                </div>
              </a>
            </Tile>

            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <MusicNotes weight="fill" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Music Composer</TileTitle>
                  <TileDescription>AI-driven song ideas.</TileDescription>
                </div>
              </a>
            </Tile>

            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <FilmSlate weight="regular" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Video Scripts</TileTitle>
                  <TileDescription>Compelling scripts in seconds.</TileDescription>
                </div>
              </a>
            </Tile>

            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <GlobeHemisphereWest weight="fill" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Localization</TileTitle>
                  <TileDescription>Translate & adapt content globally.</TileDescription>
                </div>
              </a>
            </Tile>
                         {/* Even more tiles */}
            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <BookOpen weight="regular" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Reading Coach</TileTitle>
                  <TileDescription>Summaries and study guides.</TileDescription>
                </div>
              </a>
            </Tile>

            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <Brain weight="fill" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Brainstorm Ideas</TileTitle>
                  <TileDescription>Creative sparks for any project.</TileDescription>
                </div>
              </a>
            </Tile>

            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <ChartBar weight="regular" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Data Insights</TileTitle>
                  <TileDescription>Analyze and visualize data.</TileDescription>
                </div>
              </a>
            </Tile>

            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <RocketLaunch weight="fill" />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Startup Pitch</TileTitle>
                  <TileDescription>Craft killer pitch decks.</TileDescription>
                </div>
              </a>
            </Tile>
             </motion.div>
        </div>
      </div>
    </section>
  );
}
