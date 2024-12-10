"use client";

import type { LatLngLiteral } from "leaflet";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import { RERENDER_LOGS } from "@f3/shared/common/constants";

import type { SparseF3Marker } from "~/utils/types";
import { api } from "~/trpc/react";
import { filterData } from "~/utils/filtered-data";
import { filterStore } from "~/utils/store/filter";
import { mapStore } from "~/utils/store/map";

export type LocationMarkerWithDistance = SparseF3Marker & {
  distance: number | null;
};

const FilteredMapResultsContext = createContext<{
  isLoading: boolean;
  nearbyLocationCenter: (LatLngLiteral & { name?: string }) | null;
  filteredLocationMarkers: SparseF3Marker[] | undefined;
  locationOrderedLocationMarkers: LocationMarkerWithDistance[] | undefined;
  allLocationMarkersWithLatLngAndFilterData: SparseF3Marker[] | undefined;
}>({
  isLoading: true,
  nearbyLocationCenter: null,
  filteredLocationMarkers: undefined,
  locationOrderedLocationMarkers: undefined,
  allLocationMarkersWithLatLngAndFilterData: undefined,
});

export const FilteredMapResultsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  RERENDER_LOGS && console.log("FilteredMapResultsProvider rerender");
  const nearbyLocationCenter = mapStore.use.nearbyLocationCenter();

  const { data: allLocationMarkers, isLoading } =
    api.location.getLocationMarkersSparse.useQuery();
  const { data: allLocationMarkerFilterData } =
    api.location.allLocationMarkerFilterData.useQuery();
  const filters = filterStore.useBoundStore();

  const allLocationMarkersWithLatLngAndFilterData = useMemo(() => {
    if (!allLocationMarkers || !allLocationMarkerFilterData) return undefined;

    const locationIdToLatLng = allLocationMarkers.reduce(
      (acc, location) => {
        acc[location.id] = {
          lat: location.lat,
          lon: location.lon,
          locationDescription: location.locationDescription,
        };
        return acc;
      },
      {} as Record<
        number,
        {
          lat: number | null;
          lon: number | null;
          locationDescription: string | null;
        }
      >,
    );

    return allLocationMarkerFilterData.map((location) => {
      return {
        ...location,
        lat: locationIdToLatLng[location.id]?.lat ?? null,
        lon: locationIdToLatLng[location.id]?.lon ?? null,
        locationDescription:
          locationIdToLatLng[location.id]?.locationDescription ?? null,
      };
    });
  }, [allLocationMarkerFilterData, allLocationMarkers]);

  const filteredLocationMarkers = useMemo(() => {
    if (!allLocationMarkersWithLatLngAndFilterData) return undefined;

    const filteredLocationMarkers = filterData(
      allLocationMarkersWithLatLngAndFilterData,
      filters,
    );
    return filteredLocationMarkers;
  }, [allLocationMarkersWithLatLngAndFilterData, filters]);

  const locationOrderedLocationMarkers = useMemo(() => {
    if (!filteredLocationMarkers || !nearbyLocationCenter) {
      return undefined;
    }

    const locationMarkersWithDistances = filteredLocationMarkers.map(
      (location) => {
        const distance = latLngToDistance(
          location.lat ?? null,
          location.lon ?? null,
          nearbyLocationCenter?.lat ?? null,
          nearbyLocationCenter?.lng ?? null,
        );
        return { ...location, distance };
      },
    );
    return locationMarkersWithDistances.sort((a, b) => {
      if (a.distance === null || b.distance === null) return 0;
      return a.distance - b.distance;
    });
  }, [nearbyLocationCenter, filteredLocationMarkers]);

  return (
    <FilteredMapResultsContext.Provider
      value={{
        filteredLocationMarkers,
        locationOrderedLocationMarkers,
        allLocationMarkersWithLatLngAndFilterData,
        nearbyLocationCenter,
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
