"use client";

import Link from "next/link";
import isNumber from "lodash/isNumber";
import { SHORT_DAY_ORDER } from "node_modules/@f3/shared/src/app/constants";

import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { onlyUnique } from "@f3/shared/common/functions";
import { cn } from "@f3/ui";

import type { LocationMarkerWithDistance } from "./filtered-map-results-provider";
import { dayjs } from "~/utils/frontendDayjs";
import { mapStore } from "~/utils/store/map";
import { selectedItemStore } from "~/utils/store/selected-item";
import { ImageWithFallback } from "../image-with-fallback";
import BootSvgComponent from "../SVGs/boot-camp";
import RuckSvgComponent from "../SVGs/ruck";
import RunSvgComponent from "../SVGs/run";
import SwimSvgComponent from "../SVGs/swim";

const SearchResultItem = (props: {
  searchResult: LocationMarkerWithDistance;
}) => {
  RERENDER_LOGS && console.log("SelectedItem rerender");

  const locationId = selectedItemStore.use.locationId();
  const { searchResult } = props;
  const isSelected = searchResult.id === locationId;
  const mapRef = mapStore.use.ref();

  const name = searchResult.events
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
          locationId: searchResult.id,
          eventId: null,
        });
      }}
      onFocus={() => {
        selectedItemStore.setState({
          locationId: searchResult.id,
          eventId: null,
        });
      }}
      onClick={() => {
        selectedItemStore.setState({
          locationId: searchResult.id,
          eventId: searchResult.events[0]?.id,
        });
        if (searchResult.lat !== null && searchResult.lon !== null) {
          mapRef.current?.setView(
            {
              lat: searchResult.lat,
              lng: searchResult.lon,
            },
            13,
            { animate: true },
          );
        }
      }}
    >
      <div className="flex w-full flex-row items-center justify-between">
        <div className="line-clamp-1 text-lg font-bold">{name}</div>
        {isNumber(searchResult.distance) && searchResult.distance > 0.05 ? (
          <div className="text-xs text-foreground/40">
            {searchResult.distance?.toFixed(1)}mi
          </div>
        ) : null}
      </div>
      <div className="flex flex-row items-start gap-2">
        <div className="flex flex-shrink-0 flex-col items-center">
          <ImageWithFallback
            src={searchResult.logo ? searchResult.logo : "/f3_logo.png"}
            fallbackSrc="/f3_logo.png"
            loading="lazy"
            width={48}
            height={48}
            alt={searchResult.logo ?? "F3 logo"}
          />
        </div>
        {/* Use flex-col to stack items vertically */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex flex-row flex-wrap gap-x-2 gap-y-1 ">
            {searchResult.events.map((event) => {
              const dayOfWeek =
                event.dayOfWeek === null
                  ? undefined
                  : SHORT_DAY_ORDER[event.dayOfWeek];
              const startTime =
                event.startTime === null
                  ? undefined
                  : dayjs(event.startTime, "HH:mm:ss").format("h:mmA");

              const _endTime =
                event.endTime === null
                  ? undefined
                  : dayjs(event.endTime, "HH:mm:ss").format("h:mmA");

              const duration = dayjs(event.endTime, "HH:mm:ss").diff(
                dayjs(event.startTime, "HH:mm:ss"),
                "minutes",
              );
              return (
                <button
                  key={event.id}
                  className="flex flex-row items-center gap-1 rounded-sm bg-red-600 p-1 text-xs text-white shadow hover:bg-red-400"
                  onMouseOver={(e) => {
                    selectedItemStore.setState({
                      locationId: searchResult.id,
                      eventId: event.id,
                    });
                    e.stopPropagation();
                  }}
                  onFocus={(e) => {
                    selectedItemStore.setState({
                      locationId: searchResult.id,
                      eventId: event.id,
                    });
                    e.stopPropagation();
                  }}
                  onClick={() => {
                    selectedItemStore.setState({
                      locationId: searchResult.id,
                      eventId: event.id,
                    });
                    if (
                      searchResult.lat !== null &&
                      searchResult.lon !== null
                    ) {
                      mapRef.current?.setView(
                        {
                          lat: searchResult.lat,
                          lng: searchResult.lon,
                        },
                        13,
                      );
                    }
                  }}
                >
                  <p>
                    {dayOfWeek} {startTime} ({duration}m)
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
            })}
          </div>
          {searchResult.locationDescription ? (
            <Link
              href={`https://maps.google.com/?q=${encodeURIComponent(searchResult.locationDescription)}`}
              target="_blank"
              className="underline"
            >
              <p className="line-clamp-1">{searchResult.locationDescription}</p>
            </Link>
          ) : null}
          {searchResult.events[0]?.description ? (
            <div className="line-clamp-2">
              <span className="font-semibold">Notes: </span>
              {searchResult.events[0]?.description}
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
};

export default SearchResultItem;
