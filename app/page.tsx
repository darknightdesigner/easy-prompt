"use client";

import * as Icons from "@phosphor-icons/react";
import { motion } from "motion/react";
import {
  Tile,
  TileHeader,
  TileIcon,
  TileIconSecondary,
  TileTitle,
  TileDescription,
} from "@/components/ui/tile";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { ContainerEffect } from "@/components/motion-primitives/container-effect";
import { CopyIcon } from "@/components/animated-icons/optiprompt";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type FeaturedTag = {
  id: string;
  name: string;
  icon: string | null;
  icon_weight: string | null;
  tagline: string | null;
  template_count: number | null;
};

export default function Home() {
  const [featuredTags, setFeaturedTags] = useState<FeaturedTag[]>([]);

  useEffect(() => {
    supabase
      .from("featured_tags")
      .select(
        "id, name, icon, icon_weight, tagline, template_count"
      )
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setFeaturedTags(data ?? []);
      });
  }, []);

  return (
    <section className="relative overflow-hidden py-32 flex flex-col gap-12 items-center justify-center bg-[linear-gradient(to_bottom,var(--background)_0%,var(--secondary)_100%)] sm:bg-[linear-gradient(to_bottom,var(--background)_50%,var(--secondary)_100%)]">
      {/* background dots */}
      <div className="absolute inset-x-0 top-0 flex h-full w-full items-center justify-center bg-dotted-pattern opacity-100 [mask-image:linear-gradient(to_bottom,transparent_25%,white_100%)]" />

      {/* HERO */}
      <div className="relative z-10 w-full">
        <div className="mx-auto flex flex-col items-center px-4 max-w-xs sm:max-w-md">
          <div className="flex flex-col items-center gap-3 text-center">
            <ContainerEffect preset="fade-in-blur" delay={0} transition={{ duration: 0.6 }}>
              <CopyIcon size={42} />
            </ContainerEffect>

            <h1 className="mb-3 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl">
              <TextEffect
                preset="fade-in-blur"
                delay={0.1}
                speedReveal={1}
                speedSegment={0.5}
              >
                Powerful prompts, made simple
              </TextEffect>
            </h1>

            <p className="mx-auto max-w-lg text-muted-foreground md:text-lg">
              <TextEffect
                as="span"
                preset="fade-in-blur"
                delay={0.5}
                speedReveal={4}
                speedSegment={1}
              >
                Discover world-class prompts and copy them simply, using variables
              </TextEffect>
            </p>
          </div>
        </div>
      </div>

      {/* FEATURED CATEGORIES */}
      <div className="relative z-10 w-full">
        <div className="mx-auto flex flex-col items-center sm:max-w-[48rem] px-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {featuredTags.map((tag) => {
              const IconCmp =
                (Icons as Record<string, any>)[tag.icon ?? ""] ??
                Icons.SquaresFour; // fallback icon

              return (
                <Tile asChild key={tag.id}>
                  <a href="#">
                    <TileHeader>
                      <TileIcon>
                        <IconCmp weight={tag.icon_weight as any} />
                      </TileIcon>
                      <TileIconSecondary>
                        <Icons.ArrowUpRight className="opacity-0 transition-all group-hover:opacity-100" />
                      </TileIconSecondary>
                    </TileHeader>
                    <div>
                      <TileTitle>{tag.name}</TileTitle>
                      <TileDescription>
                        {tag.tagline ?? `${tag.template_count ?? 0} prompts`}
                      </TileDescription>
                    </div>
                  </a>
                </Tile>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}