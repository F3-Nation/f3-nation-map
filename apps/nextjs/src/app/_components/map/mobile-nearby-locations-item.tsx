"use client";

import Link from "next/link";
import isNumber from "lodash/isNumber";

import { MOBILE_SEARCH_RESULT_ITEM_HEIGHT } from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { onlyUnique } from "@f3/shared/common/functions";
import { cn } from "@f3/ui";

import type { LocationMarkerWithDistance } from "./filtered-map-results-provider";
import { useSearchResultSize } from "~/utils/hooks/use-search-result-size";
import { mapStore } from "~/utils/store/map";
import { ModalType, useModalStore } from "~/utils/store/modal";
import { selectedItemStore } from "~/utils/store/selected-item";
import { ImageWithFallback } from "../image-with-fallback";
import { EventChip } from "./event-chip";

export const MobileNearbyLocationsItem = (props: {
  searchResult: LocationMarkerWithDistance;
}) => {
  RERENDER_LOGS && console.log("SelectedItem rerender");
  const { itemWidth } = useSearchResultSize();

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
      style={{ width: itemWidth, height: MOBILE_SEARCH_RESULT_ITEM_HEIGHT }}
      className={cn(
        "relative cursor-pointer overflow-clip rounded-md bg-background",
        "flex flex-col justify-start",
        "text-left text-sm text-foreground",
        "flex-shrink-0",
        "p-2",
        "h-32",
        "border-[0.5px] border-foreground",
        { "bg-accent": isSelected },
      )}
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
        <button
          className="flex flex-shrink-0 flex-col items-center"
          onClick={() =>
            useModalStore.setState({
              open: true,
              type: ModalType.HOW_TO_JOIN,
              content: searchResult.website ? (
                <Link
                  href={searchResult.website}
                  target="_blank"
                  className="mb-2 flex cursor-pointer text-blue-500 underline"
                >
                  Visit group site
                </Link>
              ) : null,
            })
          }
        >
          <ImageWithFallback
            src={searchResult.logo ? searchResult.logo : "/f3_logo.png"}
            fallbackSrc="/f3_logo.png"
            loading="lazy"
            width={48}
            height={48}
            alt={searchResult.logo ?? "F3 logo"}
          />
          <p className="cursor-pointer text-center text-xs text-blue-500 underline">
            How to join
          </p>
        </button>
        {/* Use flex-col to stack items vertically */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex flex-row flex-wrap gap-x-2 gap-y-1 ">
            {searchResult.events.map((event) => {
              return (
                <EventChip
                  key={event.id}
                  condensed
                  event={event}
                  location={searchResult}
                />
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
