"use client";

import Link from "next/link";
import isNumber from "lodash/isNumber";

import { CLOSE_ZOOM } from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { onlyUnique } from "@f3/shared/common/functions";
import { cn } from "@f3/ui";

import type { LocationMarkerWithDistance } from "./filtered-map-results-provider";
import { mapStore } from "~/utils/store/map";
import { selectedItemStore } from "~/utils/store/selected-item";
import { ImageWithFallback } from "../image-with-fallback";
import { EventChip } from "./event-chip";

export const DesktopNearbyLocationItem = (props: {
  item: LocationMarkerWithDistance;
}) => {
  RERENDER_LOGS && console.log("SelectedItem rerender");

  const eventId = selectedItemStore.use.eventId();
  const locationId = selectedItemStore.use.locationId();
  const { item } = props;
  const isSelected = item.id === locationId;
  const mapRef = mapStore.use.ref();

  const name = item.events
    .map((event) => event.name)
    .filter(onlyUnique)
    .join(", ");
  return (
    <button
      className={cn(
        "text-left text-sm text-foreground",
        "relative h-32 w-full max-w-[450px] cursor-pointer p-2",
        "overflow-clip bg-background hover:bg-foreground/5",
        { "bg-foreground/5": isSelected },
      )}
      onMouseOver={() => {
        selectedItemStore.setState({
          locationId: item.id,
          eventId: null,
        });
      }}
      onFocus={() => {
        selectedItemStore.setState({
          locationId: item.id,
          eventId: null,
        });
      }}
      onClick={() => {
        selectedItemStore.setState({
          locationId: item.id,
          eventId: item.events[0]?.id,
        });
        if (item.lat !== null && item.lon !== null) {
          mapRef.current?.setView(
            { lat: item.lat, lng: item.lon },
            Math.max(mapStore.get("zoom"), CLOSE_ZOOM),
            { animate: mapStore.get("zoom") === CLOSE_ZOOM },
          );
        }
      }}
    >
      <div className="flex w-full flex-row items-center justify-between">
        <div className="line-clamp-1 text-lg font-bold">{name}</div>
        {isNumber(item.distance) ? (
          <div className="text-xs text-foreground/40">
            {item.distance?.toFixed(1)}mi
          </div>
        ) : null}
      </div>
      <div className="flex flex-row items-start gap-2">
        <div className="flex flex-shrink-0 flex-col items-center">
          <ImageWithFallback
            src={item.logo ? item.logo : "/f3_logo.png"}
            fallbackSrc="/f3_logo.png"
            loading="lazy"
            width={48}
            height={48}
            alt={item.logo ?? "F3 logo"}
          />
        </div>
        {/* Use flex-col to stack items vertically */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex flex-row flex-wrap gap-x-2 gap-y-1 ">
            {item.events
              .sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0))
              .map((event) => {
                return (
                  <EventChip
                    event={event}
                    key={event.id}
                    location={item}
                    condensed
                    selected={event.id === eventId && item.id === locationId}
                  />
                );
              })}
          </div>
          {item.locationDescription ? (
            <Link
              href={`https://maps.google.com/?q=${encodeURIComponent(item.locationDescription)}`}
              target="_blank"
              className="underline"
            >
              <p className="line-clamp-1">{item.locationDescription}</p>
            </Link>
          ) : null}
          {item.events[0]?.description ? (
            <div className="line-clamp-2">
              <span className="font-semibold">Notes: </span>
              {item.events[0]?.description}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
};
