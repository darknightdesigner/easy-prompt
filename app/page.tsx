"use client";
import { TwitterLogo, LinkedinLogo, GithubLogo, DiscordLogo, ArrowUpRight } from "@phosphor-icons/react";
import { Tile, TileHeader, TileIcon, TileTitle, TileDescription } from "@/components/ui/tile";
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
        <div className="mx-auto flex max-w-md flex-col items-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <ContainerEffect preset="fade-in-blur" delay={0} transition={{ duration: 0.6 }}>
              <div>
                <CopyIcon size={42} />
              </div>
            </ContainerEffect>
            <div>
              <h1 className="mb-3 text-3xl font-semibold tracking-tight text-pretty sm:text-4xl lg:text-5xl">
                <TextEffect preset="fade-in-blur" delay={0.1} speedReveal={1} speedSegment={0.5}>
                  Powerful prompts, made simple
                </TextEffect>
              </h1>
              <p className="mx-auto max-w-lg text-muted-foreground lg:text-lg">
                <TextEffect as="span" preset="fade-in-blur" delay={0.5} speedReveal={4} speedSegment={1}>
                  Discover powerful prompts, and copy them simply.
                </TextEffect>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 w-full">
        <div className="mx-auto flex flex-col items-center">
        <div className="w-full grid max-w-[32rem] sm:max-w-[40rem] lg:max-w-[48rem] grid-cols-1 sm:grid-cols-2 gap-2">
            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <TwitterLogo className="size-5" />
                  </TileIcon>
                  <TileIcon>
                    <ArrowUpRight className="size-4 -translate-x-2 translate-y-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                  </TileIcon>
                </TileHeader>
                <div>
                  <TileTitle>Twitter</TileTitle>
                  <TileDescription>Follow our latest updates and announcements.</TileDescription>
                </div>
              </a>
            </Tile>
            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <LinkedinLogo className="size-5" />
                  </TileIcon>
                  <TileIcon>
                    <ArrowUpRight className="size-4 -translate-x-2 translate-y-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                  </TileIcon>
                </TileHeader>
                <div>
                  <TileTitle>LinkedIn</TileTitle>
                  <TileDescription>Connect with us and explore career opportunities.</TileDescription>
                </div>
              </a>
            </Tile>
            <Tile asChild>
              <a href="#">
                <TileHeader>
                  <TileIcon>
                    <GithubLogo className="size-5" />
                  </TileIcon>
                  <TileIcon>
                    <ArrowUpRight className="size-4 -translate-x-2 translate-y-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                  </TileIcon>
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
                    <DiscordLogo className="size-5" />
                  </TileIcon>
                  <TileIcon>
                    <ArrowUpRight className="size-4 -translate-x-2 translate-y-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                  </TileIcon>
                </TileHeader>
                <div>
                  <TileTitle>Discord</TileTitle>
                  <TileDescription>Join our Discord and connect with other developers.</TileDescription>
                </div>
              </a>
            </Tile>
          </div>
        </div>
      </div>
    </section>
  );
}
