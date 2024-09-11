"use client";

import { useCallback, useEffect, useState } from "react";
import { useWindowSize } from "@react-hook/window-size";
import { Minus, Plus } from "lucide-react";

import { SIDEBAR_WIDTH } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import { ThemeToggle } from "@f3/ui/theme";

import { mapStore } from "~/utils/store/map";

export const ZoomAndTileButtons = () => {
  const mapRef = mapStore.use.ref();
  const tiles = mapStore.use.tiles();
  const [width] = useWindowSize();
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const triggerSmoothZoom = useCallback(
    (direction: "in" | "out") => {
      if (mapRef.current) {
        const map = mapRef.current;
        const center = map.getCenter();
        const containerPoint = map.latLngToContainerPoint(center);
        const x =
          width >= 1024 ? SIDEBAR_WIDTH + containerPoint.x : containerPoint.x;
        const y = containerPoint.y;

        if (isTouchDevice) {
          if (mapRef.current) {
            const map = mapRef.current;
            const currentZoom = map.getZoom();
            const zoomChange = direction === "in" ? 1 : -1;
            const newZoom = currentZoom + zoomChange;

            map.setZoom(newZoom, {
              animate: true,
              duration: 0.25, // Adjust this value to control the animation speed
            });
          }
        } else {
          const wheelEvent = new WheelEvent("wheel", {
            deltaY: direction === "in" ? -333 : 333,
            clientX: x,
            clientY: y,
          });
          map.getContainer().dispatchEvent(wheelEvent);
        }
      }
    },
    [mapRef, width, isTouchDevice],
  );

  return (
    <div
      className="absolute left-2 top-2 flex flex-col gap-1"
      style={{
        zIndex: 1000,
      }}
    >
      <button
        className={cn(
          "pointer-events-auto flex size-[36px] items-center justify-center rounded-md bg-background text-black shadow",
          "hover:bg-accent",
        )}
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
        className="flex size-[36px] items-center justify-center rounded-md bg-background text-black shadow"
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
        className="flex size-[36px] items-center justify-center overflow-hidden rounded-md bg-background text-black shadow"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tiles === "street" ? "/satellite.png" : "/street.png"}
          alt={tiles}
          className="h-8 object-cover"
        />
      </button>
      <ThemeToggle />
    </div>
  );
};
