"use client";

import { useCallback, useEffect, useState } from "react";
import { useWindowSize } from "@react-hook/window-size";
import { Minus, Plus } from "lucide-react";

import { SIDEBAR_WIDTH } from "@acme/shared/app/constants";
import { cn } from "@acme/ui";

import { useIsSafari } from "~/utils/hooks/use-is-safari";
import { useMapRef } from "./map-ref-provider";

export const ZoomButtons = () => {
  const { mapRef } = useMapRef();
  const [width] = useWindowSize();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const isSafari = useIsSafari();

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const triggerSmoothZoom = useCallback(
    (direction: "in" | "out") => {
      if (mapRef.current) {
        const map = mapRef.current;

        if (isSafari || isTouchDevice) {
          const currentZoom = map.getZoom();
          const zoomChange = direction === "in" ? 1 : -1;
          const newZoom = currentZoom + zoomChange;

          const overlayPane = map.getPane("overlayPane");
          overlayPane && (overlayPane.style.display = "none");
          map.setZoom(newZoom, {
            animate: true,
            duration: 0.25,
          });
          setTimeout(() => {
            overlayPane && (overlayPane.style.display = "block");
          }, 300);
        } else {
          const center = map.getCenter();
          const containerPoint = map.latLngToContainerPoint(center);
          const x =
            width >= 1024 ? SIDEBAR_WIDTH + containerPoint.x : containerPoint.x;
          const y = containerPoint.y;

          const wheelEvent = new WheelEvent("wheel", {
            deltaY: direction === "in" ? -333 : 333,
            clientX: x,
            clientY: y,
          });
          map.getContainer().dispatchEvent(wheelEvent);
        }
      }
    },
    [mapRef, isSafari, isTouchDevice, width],
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
