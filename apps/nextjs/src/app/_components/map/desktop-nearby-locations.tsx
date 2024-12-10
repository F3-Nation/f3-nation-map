"use client";

import type { ComponentProps } from "react";

import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { cn } from "@f3/ui";

import { DesktopNearbyLocationItemSkeleton } from "./desktop-nearby-location-item-skeleton";
import { useFilteredMapResults } from "./filtered-map-results-provider";
import { NearbyLocationItem } from "./nearby-location-item";
import { useUserLocation } from "./user-location-provider";
import WithLove from "./with-love";

export const DesktopNearbyLocations = ({
  className,
  ...rest
}: ComponentProps<"div">) => {
  RERENDER_LOGS && console.log("DrawerSearchResults rerender");
  const { status: userLocationStatus, permissions: userLocationPermissions } =
    useUserLocation();
  const { locationOrderedLocationMarkers, nearbyLocationCenter } =
    useFilteredMapResults();

  return (
    <>
      {!nearbyLocationCenter ? (
        <div className="mt-2 text-center">Loading nearby locations...</div>
      ) : nearbyLocationCenter ? (
        <div className="mt-2 text-center text-sm">
          {!nearbyLocationCenter.name ? (
            "Nearby locations"
          ) : (
            <>
              Locations near <b>{nearbyLocationCenter.name}</b>
            </>
          )}
        </div>
      ) : null}
      <div
        className={cn("flex flex-1 flex-col overflow-y-scroll", className)}
        {...rest}
      >
        <div className="flex flex-col justify-center divide-y divide-solid">
          {userLocationStatus === "loading" ||
          userLocationPermissions === "prompt"
            ? Array.from({ length: 6 }).map((_, index) => (
                <DesktopNearbyLocationItemSkeleton key={index} />
              ))
            : locationOrderedLocationMarkers
                ?.slice(0, 20)
                .map((result) => (
                  <NearbyLocationItem key={result.id} item={result} />
                ))}
        </div>
      </div>
      <WithLove />
    </>
  );
};
