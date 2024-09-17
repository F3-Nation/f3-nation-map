"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { RERENDER_LOGS } from "@f3/shared/common/constants";

import type { F3MapSearchResult, GeoMapSearchResult } from "~/utils/types";
import { api } from "~/trpc/react";
import { placesAutocomplete } from "~/utils/place-autocomplete";
import { mapStore } from "~/utils/store/map";
import { searchStore } from "~/utils/store/search";

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
  const { data: allLocationMarkers } =
    api.location.getAllLocationMarkers.useQuery();

  const [geoResults, setGeoResults] = useState<GeoMapSearchResult[]>([]);
  const [f3Results, setF3Results] = useState<F3MapSearchResult[]>([]);

  useEffect(() => {
    if (text.length >= 2) {
      // Use refs to prevent this from running on every center / zoom updated
      setF3Results(
        allLocationMarkers
          ?.flatMap((location) =>
            location.events.map((event) => ({ event, location })),
          )
          .filter(({ event }) => {
            return event.name.toLowerCase().includes(text.toLowerCase());
          })
          .map(({ event, location }) => {
            return {
              header: event.name,
              description: location.locationDescription ?? "",
              destination: {
                id: event.id.toString(),
                lat: location.lat ?? 0,
                lng: location.lon ?? 0,
                item: event,
                placeId: null,
              },
            };
          })
          .slice(0, 5) ?? [],
      );

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
  }, [allLocationMarkers, text]);

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
