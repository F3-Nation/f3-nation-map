"use client";

import type { ComponentProps } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Z_INDEX } from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { cn } from "@f3/ui";
import { Spinner } from "@f3/ui/spinner";

import { useSearchResultSize } from "~/utils/hooks/use-search-result-size";
import { selectedItemStore } from "~/utils/store/selected-item";
import { DesktopNearbyLocationItemSkeleton } from "./desktop-nearby-location-item-skeleton";
import { useFilteredMapResults } from "./filtered-map-results-provider";
import { MobileNearbyLocationsItem } from "./mobile-nearby-locations-item";

export const MobileNearbyLocations = (props: ComponentProps<"div">) => {
  const { className, ...rest } = props;
  RERENDER_LOGS && console.log("SelectedItem rerender");
  const { locationOrderedLocationMarkers } = useFilteredMapResults();
  const { itemWidth, itemGap, scrollBuffer } = useSearchResultSize();
  const [scrolledItemIndex, setScrolledItemIndex] = useState<number | null>(
    null,
  );
  const [visibleItemsCount, setVisibleItemsCount] = useState(6);
  const [status, setStatus] = useState("idle" as "idle" | "loading");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset state when the ordered location markers change
  useEffect(() => {
    setVisibleItemsCount(6);
    scrollRef.current?.scrollTo({ left: 0 });
  }, [locationOrderedLocationMarkers]);

  useEffect(() => {
    if (scrolledItemIndex === null) return;
    selectedItemStore.setState({
      locationId: locationOrderedLocationMarkers?.[scrolledItemIndex]?.id,
      eventId:
        locationOrderedLocationMarkers?.[scrolledItemIndex]?.events[0]?.id,
    });
  }, [locationOrderedLocationMarkers, scrolledItemIndex]);

  const debounceIncreaseVisibleItemsCount = useCallback(() => {
    if (status === "loading") return;
    setStatus("loading");
    setTimeout(() => {
      setVisibleItemsCount((prev) => prev + 6);
      setStatus("idle");
    }, 250);
  }, [status]);

  return (
    <div
      className={cn(
        "absolute bottom-[65px] left-0 right-0 block lg:hidden",
        className,
      )}
      style={{ zIndex: Z_INDEX.MOBILE_NEARBY_LOCATIONS }}
      {...rest}
    >
      <div
        ref={scrollRef}
        style={{
          gap: itemGap,
          paddingLeft: itemGap,
          paddingRight: itemGap + scrollBuffer,
          paddingBottom: 2, // so scrollbar doesn't overlap items
        }}
        className="flex h-full flex-row items-end overflow-x-auto"
        onScroll={(e) => {
          const currentlyViewedIndex = Math.floor(
            (e.currentTarget.scrollLeft + scrollBuffer) / (itemWidth + itemGap),
          );
          const nearEnd =
            e.currentTarget.scrollWidth -
              e.currentTarget.scrollLeft -
              e.currentTarget.clientWidth <
            scrollBuffer;
          setScrolledItemIndex(currentlyViewedIndex);
          if (nearEnd) {
            debounceIncreaseVisibleItemsCount();
          }
        }}
      >
        {locationOrderedLocationMarkers === undefined
          ? Array.from({ length: 6 }).map((_, index) => (
              <DesktopNearbyLocationItemSkeleton key={index} />
            ))
          : locationOrderedLocationMarkers
              ?.slice(0, visibleItemsCount)
              .map((result) => (
                <MobileNearbyLocationsItem
                  key={result.id}
                  searchResult={result}
                />
              ))}
        {status === "loading" && (
          <div className="flex h-full items-center self-center">
            <Spinner className="border-foreground border-b-transparent" />
          </div>
        )}
      </div>
    </div>
  );
};
