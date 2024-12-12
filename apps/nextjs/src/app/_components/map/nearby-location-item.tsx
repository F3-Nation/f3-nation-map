"use client";

import Link from "next/link";
import isNumber from "lodash/isNumber";

import { isProduction, RERENDER_LOGS } from "@f3/shared/common/constants";
import { onlyUnique } from "@f3/shared/common/functions";
import { cn } from "@f3/ui";

import type { LocationMarkerWithDistance } from "./filtered-map-results-provider";
import { isTouchDevice } from "~/utils/is-touch-device";
import { setView } from "~/utils/set-view";
import { appStore } from "~/utils/store/app";
import { searchStore } from "~/utils/store/search";
import {
  openPanel,
  selectedItemStore,
  setSelectedItem,
} from "~/utils/store/selected-item";
import { ImageWithFallback } from "../image-with-fallback";
import { EventChip } from "./event-chip";

const SHOW_ID = false;

export const NearbyLocationItem = (props: {
  item: LocationMarkerWithDistance;
}) => {
  RERENDER_LOGS && console.log("SelectedItem rerender");
  const searchBarRef = searchStore.use.searchBarRef();

  const eventId = selectedItemStore.use.eventId();
  const locationId = selectedItemStore.use.locationId();
  const ignoreNextNearbyItemMouseEnter =
    appStore.use.ignoreNextNearbyItemMouseEnter();
  const { item } = props;
  const isSelected = item.id === locationId;

  const name = item.events
    .map((event) => event.name)
    .filter(onlyUnique)
    .join(", ");
  return (
    <button
      className={cn(
        "text-left text-sm text-foreground",
        "relative w-full max-w-[450px] cursor-pointer px-2 py-2",
        "bg-background",
        { "bg-muted": isSelected },
      )}
      onMouseEnter={() => {
        const isMobile = isTouchDevice();
        // This is the click for mobile

        setSelectedItem({
          locationId: item.id,
          eventId: null,
        });

        if (isMobile) {
          searchBarRef.current?.blur();
          if (item.lat !== null && item.lon !== null) {
            setView({ lat: item.lat, lng: item.lon });
          }
          searchStore.setState({ shouldShowResults: false });
        } else {
          // Log to know if this was due to a mouse movement or element adjustment
          if (ignoreNextNearbyItemMouseEnter) {
            appStore.setState({ ignoreNextNearbyItemMouseEnter: false });
            return;
          }
        }
      }}
      onFocus={() => {
        console.log("onMouseEnter NearbyLocationItem", item);
        setSelectedItem({
          locationId: item.id,
          eventId: item.events[0]?.id,
        });
      }}
      onClick={() => {
        console.log("onClick NearbyLocationItem", item);
        // Open panel first so that the centering to the marker is offset if needed
        openPanel({ locationId: item.id });
        if (item.lat !== null && item.lon !== null) {
          setView({ lat: item.lat, lng: item.lon });
          setSelectedItem({
            locationId: null,
            eventId: null,
          });
          // prevent the next mouse enter from triggering a change
          appStore.setState({ ignoreNextNearbyItemMouseEnter: true });
        }
      }}
    >
      <div className="flex flex-row items-stretch gap-1">
        <div className="flex flex-shrink-0 flex-col items-center justify-center">
          <ImageWithFallback
            src={item.logo ? item.logo : "/f3_logo.png"}
            fallbackSrc="/f3_logo.png"
            loading="lazy"
            width={48}
            height={48}
            alt={item.logo ?? "F3 logo"}
            className="rounded-md bg-black" // many are white png
          />
        </div>
        {/* Use flex-col to stack items vertically */}
        <div className="flex w-full flex-col items-stretch justify-start overflow-hidden">
          <div className="flex w-full flex-1 flex-row items-center justify-between">
            <div className="line-clamp-1 pt-0 text-lg font-bold leading-6">
              {name}
            </div>
            {isNumber(item.distance) ? (
              <div className="text-xs">
                <span className="text-foreground/40">
                  {!isProduction && SHOW_ID ? <div>({item.id})</div> : null}
                </span>
                <span className="font-bold">{item.distance?.toFixed(1)}mi</span>
              </div>
            ) : null}
          </div>
          <div className="flex flex-row flex-wrap gap-x-2 gap-y-1 ">
            {item.events
              .sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0))
              .map((event) => {
                return (
                  <EventChip
                    event={event}
                    key={event.id}
                    location={item}
                    size="small"
                    hideName
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
          {/* {item.events[0]?.description ? (
            <div className="line-clamp-2">
              <span className="font-semibold">Notes: </span>
              {item.events[0]?.description}
            </div>
          ) : null} */}
        </div>
      </div>
    </button>
  );
};
