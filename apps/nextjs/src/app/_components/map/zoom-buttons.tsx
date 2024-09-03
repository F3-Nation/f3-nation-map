"use client";

import { useCallback } from "react";
import { useWindowSize } from "@react-hook/window-size";
import { Minus, Plus } from "lucide-react";

import { SIDEBAR_WIDTH } from "@f3/shared/app/constants";

import { mapStore } from "~/utils/store/map";

export const ZoomButtons = () => {
  const mapRef = mapStore.use.ref();
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
        className="flex h-8 w-8 items-center justify-center rounded-md bg-background text-black shadow"
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
    </div>
  );
};
