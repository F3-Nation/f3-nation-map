"use client";

import type { ComponentProps } from "react";
import { useEffect } from "react";

import type { ExpansionUserResponse } from "@f3/shared/app/schema/ExpansionUserSchema";
import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { cn } from "@f3/ui";

import { api } from "~/trpc/react";
import { filterDataWithinMiles } from "~/utils/filtered-data";
import { getExpansionNearbyUsers } from "~/utils/get-expansion-nearby-users";
import { filterStore } from "~/utils/store/filter";
import { DesktopNearbyLocationItem } from "./desktop-nearby-location-item";
import { DesktopNearbyLocationItemSkeleton } from "./desktop-nearby-location-item-skeleton";
import { useFilteredMapResults } from "./filtered-map-results-provider";
import WithLove from "./with-love";

export const DesktopNearbyLocations = ({
  className,
  ...rest
}: ComponentProps<"div">) => {
  RERENDER_LOGS && console.log("DrawerSearchResults rerender");
  const { latitude, longitude } = filterStore.get("position");
  const { locationOrderedLocationMarkers, isLoading } = useFilteredMapResults();
  const { data: previewLocationMarkers } =
    api.location.getPreviewLocations.useQuery();
  const locationWithinRadius = filterDataWithinMiles({
    data: locationOrderedLocationMarkers,
  });
  const hasLocationMarkers = locationWithinRadius?.length ?? 0 > 0;
  const { data: expansionUsers } =
    api.expansionUsers.getExpansionUsers.useQuery();

  useEffect(() => {
    if (!hasLocationMarkers && expansionUsers) {
      getExpansionNearbyUsers({
        zoom: 13,
        expansionUsers: expansionUsers as unknown as ExpansionUserResponse[],
      });
    }
  }, [hasLocationMarkers, expansionUsers, longitude, latitude]);

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
          : previewLocationMarkers
            ? previewLocationMarkers?.map((result) => (
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
