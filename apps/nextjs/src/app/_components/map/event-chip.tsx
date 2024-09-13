"use client";

import { CLOSE_ZOOM, SHORT_DAY_ORDER } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";

import type { LocationMarkerWithDistance } from "./filtered-map-results-provider";
import { dayjs } from "~/utils/frontendDayjs";
import { mapStore } from "~/utils/store/map";
import { selectedItemStore } from "~/utils/store/selected-item";
import BootSvgComponent from "../SVGs/boot-camp";
import RuckSvgComponent from "../SVGs/ruck";
import RunSvgComponent from "../SVGs/run";
import SwimSvgComponent from "../SVGs/swim";

export const EventChip = (props: {
  condensed?: boolean;
  selected?: boolean;
  event: LocationMarkerWithDistance["events"][0];
  location: LocationMarkerWithDistance;
}) => {
  const mapRef = mapStore.use.ref();
  const { event, location, condensed = false, selected } = props;
  const dayOfWeek =
    event.dayOfWeek === null ? undefined : SHORT_DAY_ORDER[event.dayOfWeek];
  const startTimeRaw =
    event.startTime === null
      ? undefined
      : dayjs(event.startTime, "HH:mm:ss").format("h:mmA");

  const startTime = !condensed
    ? startTimeRaw
    : startTimeRaw?.replace(":00", "");

  const duration = dayjs(event.endTime, "HH:mm:ss").diff(
    dayjs(event.startTime, "HH:mm:ss"),
    "minutes",
  );
  return (
    <button
      key={event.id}
      className={cn(
        "flex flex-row items-center ",
        "rounded-sm hover:bg-red-400",
        "text-xs text-white",
        "gap-1 px-1 shadow",
        // { "gap-[2px] bg-transparent text-red-600 underline": condensed },
        { "bg-red-400": selected },
        { "bg-red-600": !selected },
        { "py-[1px]": condensed },
        { "py-[2px]": !condensed },
      )}
      onMouseOver={(e) => {
        selectedItemStore.setState({
          locationId: event.locationId,
          eventId: event.id,
        });
        e.stopPropagation();
      }}
      onFocus={(e) => {
        selectedItemStore.setState({
          locationId: event.locationId,
          eventId: event.id,
        });
        e.stopPropagation();
      }}
      onClick={() => {
        selectedItemStore.setState({
          locationId: event.locationId,
          eventId: event.id,
        });
        if (location.lat !== null && location.lon !== null) {
          mapRef.current?.setView(
            { lat: location.lat, lng: location.lon },
            CLOSE_ZOOM,
            { animate: mapStore.get("zoom") === CLOSE_ZOOM },
          );
        }
      }}
    >
      <p>
        {dayOfWeek} {startTime}
        {condensed ? null : ` (${duration}m)`}
      </p>
      <div>
        {event.type === "Bootcamp" ? (
          <BootSvgComponent height={16} width={16} />
        ) : event.type === "Swimming" ? (
          <SwimSvgComponent height={16} width={16} />
        ) : event.type === "Ruck" ? (
          <RuckSvgComponent height={16} width={16} />
        ) : event.type === "Run" ? (
          <RunSvgComponent height={16} width={16} />
        ) : null}
      </div>
    </button>
  );
};
