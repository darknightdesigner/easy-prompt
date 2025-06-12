import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { ContainerEffect } from '@/components/motion-primitives/container-effect';
import { CopyIcon } from "@/components/animated-icons/optiprompt"

export default function Home() {

  return (
    <section className="relative overflow-hidden py-32">
      <div className="absolute inset-x-0 top-0 flex h-full w-full items-center justify-center bg-dotted-pattern opacity-100 [mask-image:linear-gradient(to_top,transparent_5%,white_100%)]">
      </div>
      <div className="relative z-10 w-full">
        <div className="mx-auto flex max-w-lg flex-col items-center">
          <div className="flex flex-col items-center gap-6 text-center">
            <ContainerEffect preset="fade-in-blur" delay={0} transition={{ duration: 0.6 }}>
              <div>
                <CopyIcon size={42} />
              </div>
            </ContainerEffect>
            <div>
              <h1 className="mb-6 text-2xl font-semibold tracking-tight text-pretty lg:text-5xl">
                <TextEffect preset="fade-in-blur" delay={0.1} speedReveal={1} speedSegment={0.5}>
                  World-class prompts, made simple
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
    </section>
  );
}
