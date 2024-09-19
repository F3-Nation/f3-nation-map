"use client";

import type { ComponentProps } from "react";

import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { cn } from "@f3/ui";

import { DesktopNearbyLocationItem } from "./desktop-nearby-location-item";
import { DesktopNearbyLocationItemSkeleton } from "./desktop-nearby-location-item-skeleton";
import { useFilteredMapResults } from "./filtered-map-results-provider";
import WithLove from "./with-love";

export const DesktopNearbyLocations = ({
  className,
  ...rest
}: ComponentProps<"div">) => {
  RERENDER_LOGS && console.log("DrawerSearchResults rerender");
  const { locationOrderedLocationMarkers, isLoading } = useFilteredMapResults();

  return (
    <>
      <div
        className={cn(
          "flex flex-1 flex-wrap justify-center divide-y divide-solid overflow-y-scroll",
          className,
        )}
        {...rest}
      >
        {!isLoading && !!locationOrderedLocationMarkers
          ? locationOrderedLocationMarkers
              ?.slice(0, 10)
              .map((result) => (
                <DesktopNearbyLocationItem key={result.id} item={result} />
              ))
          : Array.from({ length: 6 }).map((_, index) => (
              <DesktopNearbyLocationItemSkeleton key={index} />
            ))}
      </div>
      <WithLove />
    </>
  );
};
