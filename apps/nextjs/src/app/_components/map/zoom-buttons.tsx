"use client";

import { useCallback, useEffect, useState } from "react";
import { useWindowSize } from "@react-hook/window-size";
import { Minus, Plus } from "lucide-react";

import { SIDEBAR_WIDTH } from "@acme/shared/app/constants";
import { cn } from "@acme/ui";

import { useMapRef } from "./map-ref-provider";

export const ZoomButtons = () => {
  const { mapRef } = useMapRef();
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
          const map = mapRef.current;
          const overlayPane = map.getPane("overlayPane");
          const currentZoom = map.getZoom();
          const zoomChange = direction === "in" ? 1 : -1;
          const newZoom = currentZoom + zoomChange;

          overlayPane && (overlayPane.style.display = "none");
          map.setZoom(newZoom, {
            animate: true,
            duration: 0.25, // Adjust this value to control the animation speed
          });
          setTimeout(() => {
            overlayPane && (overlayPane.style.display = "block");
          }, 300); // Slightly longer than the animation duration to ensure it completes
        } else {
          const wheelEvent = new WheelEvent("wheel", {
            deltaY: direction === "in" ? -333 : 333,
            clientX: x,
            clientY: y,
          });
          mapRef.current?.getContainer().dispatchEvent(wheelEvent);
        }
      }
    },
    [mapRef, width, isTouchDevice],
  );

  return (
    <>
      <div className="overflow-hidden rounded-md shadow dark:border">
        <button
          className={cn(
            "pointer-events-auto flex size-[36px] items-center justify-center bg-background text-black",
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
        <div className="h-[1px] w-full bg-accent" />
        <button
          onClick={(e) => {
            triggerSmoothZoom("out");
            e.stopPropagation();
            e.preventDefault();
          }}
          className={cn(
            "pointer-events-auto flex size-[36px] items-center justify-center bg-background text-black",
            "hover:bg-accent",
          )}
        >
          <Minus size={16} className="text-foreground" />
        </button>
      </div>
    </>
  );
};
