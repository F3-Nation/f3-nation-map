"use client";

import { cn } from "@acme/ui";

import { mapStore } from "~/utils/store/map";

export const TileButton = ({ className }: { className?: string }) => {
  const tiles = mapStore.use.tiles();

  return (
    <button
      onClick={(e) => {
        mapStore.setState((s) => ({
          tiles: s.tiles === "satellite" ? "street" : "satellite",
        }));
        e.stopPropagation();
        e.preventDefault();
      }}
      className={cn(
        "flex size-16 items-center justify-center overflow-hidden rounded-md border-2 border-white bg-background text-black shadow",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tiles === "street" ? "/satellite.jpg" : "/street.jpg"}
        alt={tiles}
        className="h-16 object-cover"
      />
    </button>
  );
};
