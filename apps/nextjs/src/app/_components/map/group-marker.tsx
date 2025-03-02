"use client";

import { memo } from "react";
import L from "leaflet";
import isNumber from "lodash/isNumber";
import ReactDOMServer from "react-dom/server";
import { Marker } from "react-leaflet";

import { DayOfWeek } from "@acme/shared/app/enums";
import { dayOfWeekToShortDayOfWeek } from "@acme/shared/app/functions";
import { safeParseInt } from "@acme/shared/common/functions";
import { cn } from "@acme/ui";

import type { SparseF3Marker } from "~/utils/types";
import { api } from "~/trpc/server-side-react-helpers";
import { groupMarkerClick } from "~/utils/actions/group-marker-click";
import { isTouchDevice } from "~/utils/is-touch-device";
import {
  clearSelectedItem,
  selectedItemStore,
  setSelectedItem,
} from "~/utils/store/selected-item";

export const MemoGroupMarker = memo(
  ({
    group,
    show,
    mode,
  }: {
    group: SparseF3Marker;
    show: boolean;
    mode: "edit" | "view";
  }) => {
    const utils = api.useUtils();
    const { lat, lon, events, id } = group;
    if (!show || lat === null || lon === null) return null;
    return (
      <Marker
        draggable={mode === "edit"}
        position={[lat, lon]}
        eventHandlers={{
          mouseout: () => {
            if (isTouchDevice()) return;
            if (selectedItemStore.get("locationId") !== id) return;
            clearSelectedItem();
          },

          // Main feature is a mouseover
          mouseover: (e) => {
            if (isTouchDevice()) return;
            const eventIdString = Array.from(
              (e.originalEvent.target as HTMLDivElement)?.classList,
            )
              // Use a class name to find the event id
              .find((className) => className.startsWith("leaflet-eventid-"))
              ?.split("-")[2];
            const eventId = safeParseInt(eventIdString);
            // Only send eventId if it is a valid number
            setSelectedItem({
              locationId: id,
              ...(isNumber(eventId) ? { eventId } : {}),
            });
          },
          // Use mousemove to update the selected item
          mousemove: (e) => {
            if (isTouchDevice()) return;
            if (selectedItemStore.get("locationId") !== id) return;
            const eventIdString = Array.from(
              (e.originalEvent.target as HTMLDivElement)?.classList,
            )
              // Use a class name to find the event id
              .find((className) => className.startsWith("leaflet-eventid-"))
              ?.split("-")[2];
            const eventId = safeParseInt(eventIdString);
            if (
              selectedItemStore.get("eventId") === eventId ||
              eventId === undefined
            )
              return;
            // Only send eventId if it is a valid number
            setSelectedItem({
              ...(isNumber(eventId) ? { eventId } : {}),
            });
          },
          dragstart: () => {
            selectedItemStore.setState({
              isEditDragging: true,
            });
          },
          drag: () => {
            selectedItemStore.setState({
              isEditDragging: true,
            });
          },
          dragend: (e: { target: L.Marker }) => {
            const lat = e.target.getLatLng().lat;
            const lon = e.target.getLatLng().lng;
            utils.location.getLocationMarker.setData({ id }, (prev) =>
              !prev ? undefined : { ...prev, lat, lon },
            );
            utils.location.getLocationMarkersSparse.setData(
              undefined,
              (prev) => {
                if (!prev) return undefined;
                return prev.map((location) => {
                  if (location.id === id) {
                    return { ...location, lat, lon };
                  }
                  return location;
                });
              },
            );
            // Slight delay to allow the marker to be updated
            setTimeout(() => {
              selectedItemStore.setState({
                isEditDragging: false,
              });
            }, 100);
          },
          click: (e) => {
            const eventIdString = Array.from(
              (e.originalEvent.target as HTMLDivElement)?.classList,
            )
              // Use a class name to find the event id
              .find((className) => className.startsWith("leaflet-eventid-"))
              ?.split("-")[2];
            const eventId = safeParseInt(eventIdString);
            groupMarkerClick({ locationId: id, eventId });
          },
        }}
        icon={L.divIcon({
          iconSize: [events.length * 30 + 4, 34],
          iconAnchor: [(events.length * 30 + 4) / 2, 34 + 15],
          className: "",
          html: ReactDOMServer.renderToString(
            <div className="flex flex-col">
              <div
                className="flex flex-row rounded-full ring-[1px] ring-gray-700"
                style={{ zIndex: 1 }}
              >
                {...events
                  .sort(
                    (a, b) =>
                      DayOfWeek.indexOf(a.dayOfWeek ?? "sunday") -
                      DayOfWeek.indexOf(b.dayOfWeek ?? "sunday"),
                  )
                  .map((marker, markerIdx, markerArray) => {
                    const dotw = marker.dayOfWeek;
                    const isStart = markerIdx === 0;
                    const isEnd = markerIdx === markerArray.length - 1;
                    const dayText =
                      dotw !== null ? dayOfWeekToShortDayOfWeek(dotw) : 0;
                    return (
                      <button
                        key={markerIdx + "-" + id}
                        className={cn(
                          "flex-1 cursor-pointer border-b-2 border-t-2 border-foreground bg-foreground py-2 text-center text-background",
                          "border-l-2 border-r-2",
                          // Use a class name to find the event id
                          `leaflet-eventid-${marker.id}`,
                          {
                            "rounded-r-full": isEnd,
                            "rounded-l-full": isStart,
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
                className="-mt-[10.5px] w-[28px] self-center"
                style={{ zIndex: 0 }}
              >
                {/* Line */}
                <path
                  className={cn("fill-foreground")}
                  d={
                    events.length === 1
                      ? "M34 10 L26 24.249 Q20 34.641 14 24.249 L6 10"
                      : "M34 14.5 L26 24.249 Q20 34.641 14 24.249 L6 14.5"
                  }
                  stroke="none"
                />
                <path
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
    prev.show === next.show &&
    prev.group.id === next.group.id &&
    prev.group.events.length === next.group.events.length &&
    prev.mode === next.mode,
);

MemoGroupMarker.displayName = "MemoGroupMarker";
