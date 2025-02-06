"use client";

import { SHORT_DAY_ORDER } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";

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
    dayOfWeek: number | null;
    startTime: string | null;
    endTime?: string | null;
    id: number;
    locationId?: number | null;
    types: { id: number; name: string }[];
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
  const calcDayOfWeek =
    event.dayOfWeek === null
      ? undefined
      : size === "large"
        ? SHORT_DAY_ORDER[event.dayOfWeek]
        : SHORT_DAY_ORDER[event.dayOfWeek];
  const startTimeRaw =
    event.startTime === null
      ? undefined
      : dayjs(event.startTime, "HH:mm:ss").format("h:mmA");

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
    ? dayjs(event.endTime, "HH:mm:ss").diff(
        dayjs(event.startTime, "HH:mm:ss"),
        "minutes",
      )
    : null;
  return (
    <button
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
          {calcDayOfWeek} {startTime}
        </div>
        {size === "small" || !duration ? null : ` (${duration}m)`}
      </div>
      <div>
        {event.types.some((type) => type.name === "Bootcamp") ? (
          <BootSvgComponent height={iconSize} width={iconSize} />
        ) : event.types.some((type) => type.name === "Swimming") ? (
          <SwimSvgComponent height={iconSize} width={iconSize} />
        ) : event.types.some((type) => type.name === "Ruck") ? (
          <RuckSvgComponent height={iconSize} width={iconSize} />
        ) : event.types.some((type) => type.name === "Run") ? (
          <RunSvgComponent height={iconSize} width={iconSize} />
        ) : null}
      </div>
    </button>
  );
};
