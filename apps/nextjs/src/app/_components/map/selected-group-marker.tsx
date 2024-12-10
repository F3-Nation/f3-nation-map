"use client";

import { memo } from "react";
import L from "leaflet";
import ReactDOMServer from "react-dom/server";
import { Marker } from "react-leaflet";

import { SHORT_DAY_ORDER } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";

import type { SparseF3Marker } from "~/utils/types";

export const MemoSelectedGroupMarker = memo(
  ({
    group,
    selectedEventIdInGroup,
    alwaysShowFillInsteadOfOutline,
    panel,
  }: {
    group: SparseF3Marker;
    selectedEventIdInGroup: number | null;
    alwaysShowFillInsteadOfOutline?: boolean;
    panel?: boolean;
  }) => {
    const { lat, lon, events, id } = group;
    if (lat === null || lon === null) return null;
    return (
      <Marker
        // Allow move movements to go to the zoomed marker pane below
        interactive={false}
        position={[lat, lon]}
        icon={L.divIcon({
          iconSize: [events.length * 30 + 4, 34],
          iconAnchor: [(events.length * 30 + 4) / 2, 34 + 15],
          className: "pointer-events-none",
          html: ReactDOMServer.renderToString(
            <div className="relative flex flex-col">
              <div className="flex flex-row" style={{ zIndex: 1 }}>
                {...events
                  .sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0))
                  .map((marker, markerIdx, markerArray) => {
                    const dotw = marker.dayOfWeek;
                    const isStart = markerIdx === 0;
                    const isEnd = markerIdx === markerArray.length - 1;
                    const dayText = dotw !== null ? SHORT_DAY_ORDER[dotw] : 0;
                    return (
                      <button
                        key={markerIdx + "-" + id}
                        className={cn(
                          "pointer-events-none flex-1 cursor-pointer border-b-2 border-t-2 border-foreground bg-foreground py-2 text-center text-background",
                          "border-l-2 border-r-2",
                          // Use a class name to find the event id
                          `leaflet-eventid-${marker.id}`,
                          {
                            "opacity-0": selectedEventIdInGroup !== marker.id,
                            "rounded-r-full": isEnd,
                            "rounded-l-full": isStart,
                            "border-red-600 font-bold dark:bg-red-400":
                              selectedEventIdInGroup === marker.id,
                            "bg-red-600":
                              (!!panel || alwaysShowFillInsteadOfOutline) &&
                              selectedEventIdInGroup === marker.id,
                          },
                        )}
                      >
                        {dayText}
                      </button>
                    );
                  })}
              </div>
              <svg
                viewBox="0 0 40 40"
                className="pointer-events-none -mt-[10.5px] w-[28px] self-center"
                style={{ zIndex: 0 }}
              >
                <path
                  className={cn("fill-foreground", {
                    "fill-[#dc2626] dark:fill-[#f87171]": false,
                  })}
                  // d="M6 10.392 Q0 0 12 0 L28 0 Q40 0 34 10.392 L26 24.249 Q20 34.641 14 24.249 Z"
                  d={
                    events.length === 1
                      ? "M34 10 L26 24.249 Q20 34.641 14 24.249 L6 10"
                      : "M34 14.5 L26 24.249 Q20 34.641 14 24.249 L6 14.5"
                  }
                  stroke="none"
                />
                <path
                  // className="stroke-background"
                  // d="M6 10.392 Q0 0 12 0 L28 0 Q40 0 34 10.392 L26 24.249 Q20 34.641 14 24.249 Z"
                  d={
                    events.length === 1
                      ? "M34 10 L26 24.249 Q20 34.641 14 24.249 L6 10"
                      : "M34 15 L26 24.249 Q20 34.641 14 24.249 L6 15"
                  }
                  stroke="background"
                  strokeWidth={0.5}
                  fill="none"
                />
              </svg>
            </div>,
          ),
        })}
      ></Marker>
    );
  },
  (prev, next) =>
    prev.panel === next.panel &&
    prev.group.id === next.group.id &&
    prev.group.events.length === next.group.events.length &&
    prev.selectedEventIdInGroup === next.selectedEventIdInGroup,
);

MemoSelectedGroupMarker.displayName = "MemoSelectedGroupMarker";
