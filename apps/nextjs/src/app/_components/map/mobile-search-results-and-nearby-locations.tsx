import { Z_INDEX } from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { cn } from "@f3/ui";

import { searchStore } from "~/utils/store/search";
import { isF3MapSearchResult } from "~/utils/types";
import { useFilteredMapResults } from "./filtered-map-results-provider";
import { NearbyLocationItem } from "./nearby-location-item";
import { PlaceRowF3 } from "./place-row-f3";
import { PlaceRowMap } from "./place-row-map";
import { useTextSearchResults } from "./search-results-provider";

export const MobileSearchResultsAndNearbyLocations = () => {
  RERENDER_LOGS && console.log("MapDrawer rerender");
  const shouldShowResults = searchStore.use.shouldShowResults();
  const text = searchStore.use.text();
  const { combinedResults } = useTextSearchResults();
  const { locationOrderedLocationMarkers } = useFilteredMapResults();

  RERENDER_LOGS && console.log("SelectedItem rerender");

  // Reset state when the ordered location markers change
  return !shouldShowResults ? null : (
    <div
      style={{ zIndex: Z_INDEX.MOBILE_SEARCH_RESULTS }}
      className={cn(
        "absolute bottom-0 left-0 right-0 flex flex-col-reverse divide-y overflow-y-auto bg-background",
      )}
    >
      <div className="h-14 w-full flex-shrink-0 bg-background" />
      {text
        ? combinedResults.map((result, index) =>
            isF3MapSearchResult(result) ? (
              <PlaceRowF3 key={result.destination.id} result={result} />
            ) : (
              <PlaceRowMap
                key={result.destination.id}
                result={result}
                focused={index === 0}
              />
            ),
          )
        : locationOrderedLocationMarkers
            ?.slice(0, 15)
            .map((result) => (
              <NearbyLocationItem key={result.id} item={result} />
            ))}
    </div>
  );
};
