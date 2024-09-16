"use client";

import { CLOSE_ZOOM, SHORT_DAY_ORDER } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";

import { dayjs } from "~/utils/frontendDayjs";
import { mapStore } from "~/utils/store/map";
import { selectedItemStore } from "~/utils/store/selected-item";
import BootSvgComponent from "../SVGs/boot-camp";
import RuckSvgComponent from "../SVGs/ruck";
import RunSvgComponent from "../SVGs/run";
import SwimSvgComponent from "../SVGs/swim";

export const EventChip = (props: {
  size?: "small" | "medium" | "large";
  selected?: boolean;
  event: {
    dayOfWeek: number | null;
    startTime: string | null;
    endTime: string | null;
    id: number;
    locationId: number | null;
    type: string | null;
  };
  location: {
    lat: number | null;
    lon: number | null;
  };
}) => {
  const mapRef = mapStore.use.ref();
  const { event, location, size = "medium", selected } = props;
  const calcDayOfWeek =
    event.dayOfWeek === null ? undefined : SHORT_DAY_ORDER[event.dayOfWeek];
  const endTimeRaw =
    event.endTime === null
      ? undefined
      : dayjs(event.endTime, "HH:mm:ss").format("h:mmA");
  const startTimeRaw =
    event.startTime === null
      ? undefined
      : dayjs(event.startTime, "HH:mm:ss").format("h:mmA");

  const iconSize = size === "small" ? 16 : size === "medium" ? 16 : 32;

  const startTime =
    size === "large" ? startTimeRaw : startTimeRaw?.replace(":00", "");

  const endTime =
    size === "large" ? endTimeRaw : endTimeRaw?.replace(":00", "");

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
        { "bg-red-400": selected },
        { "bg-red-600": !selected },
        { "py-[1px]": size === "small" },
        { "py-[2px]": size === "medium" },
        { "py-[3px]": size === "large" },
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
            Math.max(mapStore.get("zoom"), CLOSE_ZOOM),
            { animate: mapStore.get("zoom") === CLOSE_ZOOM },
          );
        }
      }}
    >
      <p className={cn({ "text-base": size === "large" })}>
        {calcDayOfWeek} {startTime}
        {size === "small"
          ? null
          : size === "medium"
            ? ` (${duration}m)`
            : ` - ${endTime} (${duration}m)`}
      </p>
      <div>
        {event.type === "Bootcamp" ? (
          <BootSvgComponent height={iconSize} width={iconSize} />
        ) : event.type === "Swimming" ? (
          <SwimSvgComponent height={iconSize} width={iconSize} />
        ) : event.type === "Ruck" ? (
          <RuckSvgComponent height={iconSize} width={iconSize} />
        ) : event.type === "Run" ? (
          <RunSvgComponent height={iconSize} width={iconSize} />
        ) : null}
      </div>
    </button>
  );
};
