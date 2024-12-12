"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { MIN_TEXT_LENGTH_FOR_SEARCH_RESULTS } from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { isTruthy } from "@f3/shared/common/functions";

import type { F3MapSearchResult, GeoMapSearchResult } from "~/utils/types";
import { placesAutocomplete } from "~/utils/place-autocomplete";
import { mapStore } from "~/utils/store/map";
import { searchStore } from "~/utils/store/search";
import { useFilteredMapResults } from "./filtered-map-results-provider";

const TextSearchResultsContext = createContext<{
  f3Results: F3MapSearchResult[];
  geoResults: GeoMapSearchResult[];
  combinedResults: (F3MapSearchResult | GeoMapSearchResult)[];
}>({
  f3Results: [],
  geoResults: [],
  combinedResults: [],
});

export const TextSearchResultsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  RERENDER_LOGS && console.log("TextSearchResultsProvider rerender");
  const text = searchStore.use.text();
  const { allLocationMarkersWithLatLngAndFilterData } = useFilteredMapResults();

  const [geoResults, setGeoResults] = useState<GeoMapSearchResult[]>([]);
  const [f3Results, setF3Results] = useState<F3MapSearchResult[]>([]);

  useEffect(() => {
    if (text.length >= MIN_TEXT_LENGTH_FOR_SEARCH_RESULTS) {
      // Use refs to prevent this from running on every center / zoom updated
      const _f3Results =
        allLocationMarkersWithLatLngAndFilterData
          ?.flatMap((location) =>
            location.events.map((event) => ({ event, location })),
          )
          .filter(({ event, location: itemLocation }, index, arr) => {
            if (
              arr.findIndex(
                ({ location: checkLocation }) =>
                  itemLocation.id === checkLocation.id,
              ) !== index
            ) {
              return null;
            }
            return event.name.toLowerCase().includes(text.toLowerCase());
          })
          .filter(isTruthy)
          .map(({ event, location }) => {
            const searchResult: F3MapSearchResult = {
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
          })
          .slice(0, 5) ?? [];

      setF3Results(_f3Results);

      void placesAutocomplete({
        input: text,
        center: mapStore.get("center") ?? { lat: 37.7937, lng: -122.3965 },
        zoom: mapStore.get("zoom"),
      }).then((results) => {
        setGeoResults(
          results.map((result) => ({
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
    }
  }, [allLocationMarkersWithLatLngAndFilterData, text]);

  const combinedResults = useMemo(
    () => [...geoResults.slice(0, 20), ...f3Results.slice(0, 20)],
    [f3Results, geoResults],
  );

  return (
    <TextSearchResultsContext.Provider
      value={{ f3Results, geoResults, combinedResults }}
    >
      {children}
    </TextSearchResultsContext.Provider>
  );
};

export const useTextSearchResults = (): {
  f3Results: F3MapSearchResult[];
  geoResults: GeoMapSearchResult[];
  combinedResults: (F3MapSearchResult | GeoMapSearchResult)[];
} => {
  return useContext(TextSearchResultsContext);
};
