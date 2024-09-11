"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import { RERENDER_LOGS } from "@f3/shared/common/constants";

import type { RouterOutputs } from "~/trpc/types";
import { api } from "~/trpc/react";
import { filterData } from "~/utils/filtered-data";
import { filterStore } from "~/utils/store/filter";
import { mapStore } from "~/utils/store/map";

export type LocationMarkerWithDistance =
  RouterOutputs["location"]["getAllLocationMarkers"][number] & {
    distance: number | null;
  };
const FilteredMapResultsContext = createContext<{
  isLoading: boolean;
  filteredLocationMarkers:
    | RouterOutputs["location"]["getAllLocationMarkers"]
    | undefined;
  locationOrderedLocationMarkers: LocationMarkerWithDistance[] | undefined;
}>({
  isLoading: true,
  filteredLocationMarkers: undefined,
  locationOrderedLocationMarkers: undefined,
});

export const FilteredMapResultsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  RERENDER_LOGS && console.log("FilteredMapResultsProvider rerender");
  const center = mapStore.use.center();
  const { data: allLocationMarkers, isLoading } =
    api.location.getAllLocationMarkers.useQuery();
  const filters = filterStore.useBoundStore();

  const filteredLocationMarkers = useMemo(
    () => filterData(allLocationMarkers ?? [], filters),
    [allLocationMarkers, filters],
  );

  const locationOrderedLocationMarkers = useMemo(() => {
    if (!filteredLocationMarkers || !center) return [];
    const locationMarkersWithDistances = filteredLocationMarkers.map(
      (location) => {
        const distance = latLngToDistance(
          location.lat,
          location.lon,
          center?.lat ?? null,
          center?.lng ?? null,
        );
        return { ...location, distance };
      },
    );
    return locationMarkersWithDistances.sort((a, b) => {
      if (a.distance === null || b.distance === null) return 0;
      return a.distance - b.distance;
    });
  }, [center, filteredLocationMarkers]);

  return (
    <FilteredMapResultsContext.Provider
      value={{
        filteredLocationMarkers,
        locationOrderedLocationMarkers,
        isLoading,
      }}
    >
      {children}
    </FilteredMapResultsContext.Provider>
  );
};

export const useFilteredMapResults = () => {
  return useContext(FilteredMapResultsContext);
};

const latLngToDistance = (
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null,
) => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null)
    return null;

  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return (R * c) / 1609.34; // in metres
};
