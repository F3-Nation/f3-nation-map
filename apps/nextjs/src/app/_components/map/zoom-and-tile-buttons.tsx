"use client";

import { useCallback } from "react";
import { useWindowSize } from "@react-hook/window-size";
import { Minus, Plus } from "lucide-react";

import { SIDEBAR_WIDTH } from "@f3/shared/app/constants";

import { mapStore } from "~/utils/store/map";

export const ZoomAndTileButtons = () => {
  const mapRef = mapStore.use.ref();
  const tiles = mapStore.use.tiles();
  const [width] = useWindowSize();
  // mapRef.current.SmoothWheelZoom.disable();

  const triggerSmoothZoom = useCallback(
    (direction: "in" | "out") => {
      if (mapRef.current) {
        const map = mapRef.current;
        const center = map.getCenter();
        const containerPoint = map.latLngToContainerPoint(center);

        const wheelEvent = new WheelEvent("wheel", {
          deltaY: direction === "in" ? -333 : 333,
          clientX:
            width >= 1024 ? SIDEBAR_WIDTH + containerPoint.x : containerPoint.x,
          clientY: containerPoint.y,
        });

        map.getContainer().dispatchEvent(wheelEvent);
      }
    },
    [mapRef, width],
  );

  return (
    <div
      className="absolute left-2 top-2 flex flex-col gap-1"
      style={{
        zIndex: 1000,
      }}
    >
      <button
        className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-md bg-background text-black shadow"
        onFocus={(e) => {
          triggerSmoothZoom("in");
          e.stopPropagation();
          e.preventDefault();
        }}
        onClick={(e) => {
          triggerSmoothZoom("in");
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <Plus size={16} className="text-foreground" />
      </button>
      <button
        onClick={(e) => {
          triggerSmoothZoom("out");
          e.stopPropagation();
          e.preventDefault();
        }}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-background text-black shadow"
      >
        <Minus size={16} className="text-foreground" />
      </button>
      <button
        onClick={(e) => {
          mapStore.setState((s) => ({
            tiles: s.tiles === "satellite" ? "street" : "satellite",
          }));
          e.stopPropagation();
          e.preventDefault();
        }}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-background text-black shadow"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tiles === "street" ? "/satellite.png" : "/street.png"}
          alt={tiles}
          className="h-8 object-cover"
        />
      </button>
    </div>
  );
};
