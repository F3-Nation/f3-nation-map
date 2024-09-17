"use client";

import type { ComponentProps } from "react";

import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { cn } from "@f3/ui";

import { VersionInfo } from "../version-info";
import { DesktopNearbyLocationItem } from "./desktop-nearby-location-item";
import { DesktopNearbyLocationItemSkeleton } from "./desktop-nearby-location-item-skeleton";
import { useFilteredMapResults } from "./filtered-map-results-provider";

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
          "flex flex-1 flex-wrap justify-center divide-y divide-solid overflow-scroll",
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
      <VersionInfo className=" w-full text-center text-xs" />
    </>
  );
};
