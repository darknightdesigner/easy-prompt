import { Tile, TileHeader, TileIcon } from "./tile";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Skeleton placeholder for Tile used during loading states. */
export function TileSkeleton({ className }: { className?: string }) {
  return (
    <Tile aria-hidden className={cn("pointer-events-none", className)}>
      <TileHeader>
        <TileIcon>
          {/* Icon placeholder (matches TileIcon wrapper h-9 w-9) */}
          <Skeleton className="h-9 w-9 rounded-md" />
        </TileIcon>
        {/* Secondary arrow placeholder to preserve spacing */}
        <span className="absolute right-4 top-4 h-5 w-5" />
      </TileHeader>
      <div className="space-y-[2px] w-full">
        {/* title roughly matches text-lg leading-6 (~24px) */}
        <Skeleton className="h-[26px] w-3/4" />
        {/* description roughly matches text-sm leading-5 (~20px) */}
        <Skeleton className="h-5 w-1/2" />
      </div>
    </Tile>
  );
}

export default TileSkeleton;
