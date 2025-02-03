"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { MIN_TEXT_LENGTH_FOR_SEARCH_RESULTS } from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";

import type {
  F3LocationMapSearchResult,
  F3RegionMapSearchResult,
  GeoMapSearchResult,
} from "~/utils/types";
import { api } from "~/trpc/react";
import { placesAutocomplete } from "~/utils/place-autocomplete";
import { mapStore } from "~/utils/store/map";
import { searchStore } from "~/utils/store/search";
import { useFilteredMapResults } from "./filtered-map-results-provider";

const TextSearchResultsContext = createContext<{
  f3RegionResults: F3RegionMapSearchResult[];
  f3LocationResults: F3LocationMapSearchResult[];
  geoResults: GeoMapSearchResult[];
  combinedResults: (
    | F3LocationMapSearchResult
    | GeoMapSearchResult
    | F3RegionMapSearchResult
  )[];
}>({
  f3RegionResults: [],
  f3LocationResults: [],
  geoResults: [],
  combinedResults: [],
});

export const TextSearchResultsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  RERENDER_LOGS && console.log("TextSearchResultsProvider rerender");
  const { data: regions } = api.location.getRegionsWithLocation.useQuery();
  const text = searchStore.use.text();
  const { filteredLocationMarkers } = useFilteredMapResults();

  const [geoResults, setGeoResults] = useState<GeoMapSearchResult[]>([]);
  const [f3LocationResults, setF3LocationResults] = useState<
    F3LocationMapSearchResult[]
  >([]);
  const [f3RegionResults, setF3RegionResults] = useState<
    F3RegionMapSearchResult[]
  >([]);

  useEffect(() => {
    if (text.length < MIN_TEXT_LENGTH_FOR_SEARCH_RESULTS) return;
    // Use refs to prevent this from running on every center / zoom updated

    const _f3RegionResults =
      regions
        ?.map((region) => ({
          header: region.name,
          type: "region" as const,
          destination: {
            id: region.id,
            lat: region.lat,
            lng: region.lon,
            logo: region.logo,
            locationId: region.locationId,
            placeId: null,
            item: null,
          },
        }))
        .filter(({ header }) => {
          return header.toLowerCase().includes(text.toLowerCase());
        }) ?? [];

    setF3RegionResults(_f3RegionResults);

    const _f3Results = [
      ...(filteredLocationMarkers
        ?.flatMap((location) =>
          location.events
            .filter((event) =>
              event.name.toLowerCase().includes(text.toLowerCase()),
            )
            .slice(0, 1)
            .map((event) => ({ event, location })),
        )
        // .filter(({ location: itemLocation }, index, arr) => {
        //   if (
        //     arr.findIndex(
        //       ({ event: checkLocation }) =>
        //         itemLocation.id === checkLocation.id,
        //     ) !== index
        //   ) {
        //     return false;
        //   }
        //   return true;
        // })
        .map(({ event, location }) => {
          const searchResult: F3LocationMapSearchResult = {
            type: "location",
            header: event.name,
            // description: location.locationDescription ?? "",
            destination: {
              id: event.id,
              lat: location.lat ?? 0,
              lng: location.lon ?? 0,
              logo: location.logo ?? "",
              item: { ...event, locationId: location.id },
              placeId: null,
            },
          };
          return searchResult;
        }) ?? []),
    ];

    setF3LocationResults(_f3Results);

    void placesAutocomplete({
      input: text,
      center: mapStore.get("center") ?? { lat: 37.7937, lng: -122.3965 },
      zoom: mapStore.get("zoom"),
    }).then((results) => {
      setGeoResults(
        results.map((result) => ({
          type: "geo",
          header: result?.placePrediction?.structuredFormat?.mainText?.text,
          description:
            result?.placePrediction?.structuredFormat?.secondaryText?.text,
          destination: {
            id: result?.placePrediction?.placeId,
            lat: null,
            lng: null,
            item: null,
            placeId: result?.placePrediction?.placeId,
          },
        })) ?? [],
      );
    });
  }, [filteredLocationMarkers, regions, text]);

  const combinedResults = useMemo(
    () => [
      ...geoResults.slice(0, 10),
      ...f3LocationResults.slice(0, 10),
      ...f3RegionResults.slice(0, 10),
    ],
    [f3LocationResults, f3RegionResults, geoResults],
  );

  return (
    <TextSearchResultsContext.Provider
      value={{
        f3RegionResults,
        f3LocationResults,
        geoResults,
        combinedResults,
      }}
    >
      {children}
    </TextSearchResultsContext.Provider>
  );
};

export const useTextSearchResults = (): {
  f3RegionResults: F3RegionMapSearchResult[];
  f3LocationResults: F3LocationMapSearchResult[];
  geoResults: GeoMapSearchResult[];
  combinedResults: (
    | F3LocationMapSearchResult
    | GeoMapSearchResult
    | F3RegionMapSearchResult
  )[];
} => {
  return useContext(TextSearchResultsContext);
};
