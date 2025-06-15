"use client";
import { TwitterLogo, Code, GithubLogo, DiscordLogo, ArrowUpRight } from "@phosphor-icons/react";
import { Tile, TileHeader, TileIcon, TileIconSecondary, TileTitle, TileDescription } from "@/components/ui/tile";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { ContainerEffect } from '@/components/motion-primitives/container-effect';
import { CopyIcon } from "@/components/animated-icons/optiprompt"

export default function Home() {

  return (
    <section className="relative overflow-hidden py-32 flex flex-col gap-12 items-center justify-center bg-[linear-gradient(to_bottom,var(--background)_50%,var(--secondary)_100%)]">
      <div className="absolute inset-x-0 top-0 flex h-full w-full items-center justify-center bg-dotted-pattern opacity-100 [mask-image:linear-gradient(to_bottom,transparent_25%,white_100%)]">
      </div>
      <div className="relative z-10 w-full">
        <div className="mx-auto flex max-w-md flex-col items-center px-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <ContainerEffect preset="fade-in-blur" delay={0} transition={{ duration: 0.6 }}>
              <div>
                <CopyIcon size={42} />
              </div>
            </ContainerEffect>
            <div>
              <h1 className="mb-3 text-4xl font-semibold tracking-tight text-pretty max-w-xs sm:max-w-full sm:text-5xl">
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
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <TwitterLogo  />
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
                    <Code  />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Vibe Coding</TileTitle>
                  <TileDescription>1K+ prompts</TileDescription>
                </div>
              </a>
            </Tile>
            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <GithubLogo  />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>GitHub</TileTitle>
                  <TileDescription>Contribute to our open-source projects.</TileDescription>
                </div>
              </a>
            </Tile>
            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <DiscordLogo  />
                  </TileIcon>
                  <TileIconSecondary>
                    <ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                  </TileIconSecondary>
                </TileHeader>
                <div>
                  <TileTitle>Discord</TileTitle>
                  <TileDescription>Join our Discord...</TileDescription>
                </div>
              </a>
            </Tile>
          </div>
        </div>
      </div>
    </section>
  );
}
