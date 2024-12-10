"use client";

import { mapStore } from "~/utils/store/map";

export const TileButton = () => {
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
      className="flex size-16 items-center justify-center overflow-hidden rounded-md border-2 border-white bg-background text-black shadow"
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
