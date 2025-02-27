"use client";

import type { ComponentProps } from "react";
import { useMemo } from "react";

import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { cn } from "@f3/ui";

import { latLngToMeters } from "~/utils/lat-lng-to-meters";
import { mapStore } from "~/utils/store/map";
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
  const center = mapStore.use.center();

  const hasMovedAwayFromLocation = useMemo(() => {
    return (
      latLngToMeters(
        center?.lat,
        center?.lng,
        nearbyLocationCenter.lat,
        nearbyLocationCenter.lng,
      ) > 1000
    ); // one km
  }, [center, nearbyLocationCenter]);

  return (
    <>
      <div className="flex flex-row justify-center py-2">
        <NearbyLocationContent nearbyLocationCenter={nearbyLocationCenter} />
        {hasMovedAwayFromLocation && center && (
          <button
            className="ml-2 self-end text-sm text-foreground underline"
            onClick={() => {
              mapStore.setState({
                nearbyLocationCenter: {
                  ...center,
                  type: "manual-update",
                  name: null,
                },
              });
            }}
          >
            Update
          </button>
        )}
      </div>
      <div
        className={cn("flex flex-1 flex-col overflow-y-scroll", className)}
        {...rest}
      >
        <div className="flex flex-col justify-center divide-y divide-solid">
          {userLocationStatus === "loading" ||
          userLocationPermissions === "prompt" ||
          !locationOrderedLocationMarkers?.length
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

const NearbyLocationContent = ({
  nearbyLocationCenter,
}: {
  nearbyLocationCenter: ReturnType<typeof mapStore.use.nearbyLocationCenter>;
}) => {
  if (!nearbyLocationCenter)
    return (
      <div className="text-center text-sm">Loading nearby locations...</div>
    );

  if (!nearbyLocationCenter.name)
    return <div className="text-center text-sm">Nearby locations</div>;

  return (
    <div className="text-center text-sm">
      Locations near <b>{nearbyLocationCenter.name}</b>
    </div>
  );
};
