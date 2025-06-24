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
import React, { useEffect, useState } from "react";
import { TileSkeleton } from "@/components/ui/tile-skeleton";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Button } from "@/components/ui/button";
import WavyCanvas from "@/components/graphics/WavyCanvas";

const HeroSection = React.memo(function HeroSection() {
  return (
    <div className="relative z-10 w-full">
      <div className="mx-auto flex flex-col items-center px-4 max-w-md sm:max-w-lg">
        
          <div className="flex flex-col items-center gap-2 text-center mt-16 relative z-10">

          <h1 className="mb-2 text-5xl font-semibold tracking-tight text-pretty sm:text-6xl">
            <TextEffect
              preset="fade-in-blur"
              delay={0.1}
              speedReveal={1}
              speedSegment={0.5}
            >
              Powerful prompts made simple
            </TextEffect>
          </h1>
          <p className="mx-auto max-w-xs text-muted-foreground sm:text-xl">
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
          <ContainerEffect preset="fade-in-blur" delay={0.6} transition={{ duration: 0.6 }}>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <ShimmerButton>
                <Icons.Plus weight="bold" />
                Create Template
              </ShimmerButton>
              <Button variant="secondary">
                View Prompts
              </Button>
            </div>
          </ContainerEffect>
          </div>
        </div>
      </div>
  );
});

HeroSection.displayName = "HeroSection";

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
  const [loading, setLoading] = useState(true);
  const [showTiles, setShowTiles] = useState(false);

  useEffect(() => {
    supabase
      .from("featured_tags")
      .select(
        "id, name, icon, icon_weight, tagline, template_count"
      )
      .then(({ data, error }) => {
        if (error) console.error(error);
        else {
          setFeaturedTags(data ?? []);
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowTiles(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowTiles(false);
    }
  }, [loading]);

  return (
    <section className="relative overflow-hidden py-32 flex flex-col gap-12 items-center justify-center bg-[linear-gradient(to_bottom,var(--background)_25%,var(--secondary)_100%)] sm:bg-[linear-gradient(to_bottom,var(--background)_50%,var(--secondary)_100%)]">
      <div
        className="absolute inset-0 z-0 pointer-events-none before:absolute before:inset-0 before:content-[''] before:bg-[url('https://cdn.prod.website-files.com/61a6b59cc1578e2a2caf13c5/61ae57c4d73bf15eadf011b8_grain.gif')] before:bg-repeat before:[mask-image:linear-gradient(to_top,_black_0%,_black_25%,_transparent_100%)] before:opacity-0"
      />
      {/* wavy background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
        <motion.div
          className="w-full mb-[80dvh] sm:mb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          <WavyCanvas />
        </motion.div>
      </div>
      <HeroSection />
      {/* FEATURED CATEGORIES */}
      <motion.div
          className="relative z-10 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
        <div className="mx-auto flex flex-col items-center sm:max-w-[48rem] px-2">
          {loading ? (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <TileSkeleton key={idx} />
              ))}
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
              {featuredTags.map((tag) => {
                const IconCmp =
                  (Icons as Record<string, any>)[tag.icon ?? ""] ??
                  Icons.SquaresFour; // fallback icon

                return (
                  <Tile variant="solid" asChild key={tag.id}>
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
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}