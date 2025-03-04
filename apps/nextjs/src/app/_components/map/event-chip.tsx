// Must disable these since we can't use a button in a button
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
"use client";

import type { DayOfWeek } from "@acme/shared/app/enums";
import { getReadableDayOfWeek } from "@acme/shared/app/functions";
import { cn } from "@acme/ui";

import { dayjs } from "~/utils/frontendDayjs";
import { isTouchDevice } from "~/utils/is-touch-device";
import { setView } from "~/utils/set-view";
import { openPanel, setSelectedItem } from "~/utils/store/selected-item";
import BootSvgComponent from "../SVGs/boot-camp";
import RuckSvgComponent from "../SVGs/ruck";
import RunSvgComponent from "../SVGs/run";
import SwimSvgComponent from "../SVGs/swim";

export const EventChip = (props: {
  variant?: "interactive" | "non-interactive";
  size?: "small" | "medium" | "large";
  selected?: boolean;
  onClick?: () => void;
  event: {
    name?: string;
    dayOfWeek: DayOfWeek | null;
    startTime: string | null;
    endTime?: string | null;
    id: number;
    locationId?: number | null;
    types: string[];
  };
  location: {
    id: number | null;
    lat: number | null;
    lon: number | null;
  };
  hideName?: boolean;
}) => {
  const {
    event,
    location,
    size = "medium",
    selected,
    variant = "interactive",
  } = props;
  const startTimeRaw =
    event.startTime === null
      ? undefined
      : dayjs(event.startTime, "HHmm").format("h:mmA");

  const iconSize = size === "small" ? 16 : size === "medium" ? 16 : 24;

  const isInteractive = variant === "interactive";

  const startTime =
    size === "large" ? startTimeRaw : startTimeRaw?.replace(":00", "");

  const name =
    event.name && !props.hideName ? (
      <>
        <b>{event.name}</b> -
      </>
    ) : null;

  const duration = event.endTime
    ? dayjs(event.endTime, "HHmm").diff(
        dayjs(event.startTime, "HHmm"),
        "minutes",
      )
    : null;
  return (
    <div
      key={event.id}
      className={cn(
        "flex flex-row items-center ",
        "rounded-sm",
        "text-xs text-white",
        "px-2 shadow",
        { "pointer-events-none bg-muted": !isInteractive },
        { "bg-red-600": selected && isInteractive },
        { "bg-muted": !selected && isInteractive },
        { "gap-1 py-[1px]": size === "small" },
        { "gap-1 py-[2px]": size === "medium" },
        { "gap-2 py-[3px]": size === "large" },
      )}
      onMouseOver={(e) => {
        const isMobile = isTouchDevice();
        if (!isMobile) {
          setSelectedItem({
            locationId: event.locationId,
            eventId: event.id,
          });
        } else {
          props.onClick?.();
        }
        e.stopPropagation();
      }}
      onFocus={(e) => {
        setSelectedItem({
          locationId: event.locationId,
          eventId: event.id,
        });
        e.stopPropagation();
      }}
      onClick={
        props.onClick ??
        ((e) => {
          openPanel({ locationId: event.locationId, eventId: event.id });
          // TODO: Do we need this?
          // setSelectedItem({
          //   locationId: event.locationId,
          //   eventId: event.id,
          // });
          if (location.lat !== null && location.lon !== null) {
            setView({ lat: location.lat, lng: location.lon });
          }
          e.stopPropagation();
        })
      }
    >
      <div
        className={cn("flex flex-1 gap-2 text-foreground", {
          "text-base": size === "large",
          "text-background": selected && isInteractive,
          "justify-start": size === "small",
          "justify-center": size !== "small",
        })}
      >
        {name ? (
          <div className="line-clamp-1 whitespace-break-spaces text-left">
            {name}
          </div>
        ) : null}
        <div className="line-clamp-1 flex-shrink-0 text-left">
          {getReadableDayOfWeek(event.dayOfWeek)} {startTime}
        </div>
        {size === "small" || !duration ? null : ` (${duration}m)`}
      </div>
      <div>
        {event.types.includes("Bootcamp") ? (
          <BootSvgComponent height={iconSize} width={iconSize} />
        ) : event.types.includes("Swimming") ? (
          <SwimSvgComponent height={iconSize} width={iconSize} />
        ) : event.types.includes("Ruck") ? (
          <RuckSvgComponent height={iconSize} width={iconSize} />
        ) : event.types.includes("Run") ? (
          <RunSvgComponent height={iconSize} width={iconSize} />
        ) : null}
      </div>
    </div>
  );
};
