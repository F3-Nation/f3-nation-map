"use client";

// Importing necessary modules and components.

// Importing type definitions and constants.
import { useEffect, useRef } from "react";

import { BreakPoints, Z_INDEX } from "@f3/shared/app/constants"; // Type import for SnapPoint.

import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { classNames } from "@f3/shared/common/functions";
import { cn } from "@f3/ui";

import { useTextSearchResults } from "~/app/_components/map/search-results-provider";
import { filterDataWithinMiles } from "~/utils/filtered-data";
// Importing mock data and UI components.

import { Responsive } from "~/utils/responsive";
import { mapStore } from "~/utils/store/map";
import { searchStore } from "~/utils/store/search";
import { isF3MapSearchResult } from "~/utils/types";
import { useFilteredMapResults } from "./filtered-map-results-provider";
import { PlaceRowF3 } from "./place-row-f3";
import { PlaceRowMap } from "./place-row-map";

// Defining items for the filter options with their names and corresponding SVG components or image paths.

// The main component for the map drawer.
export const MobileSearchResults = () => {
  RERENDER_LOGS && console.log("MapDrawer rerender");
  const shouldShowResults = searchStore.use.shouldShowResults();
  const { combinedResults } = useTextSearchResults();
  const { locationOrderedLocationMarkers } = useFilteredMapResults();
  const locationWithinRadius = filterDataWithinMiles({
    data: locationOrderedLocationMarkers,
  });
  const expansionCenter = mapStore.use.expansionNearbyUsers().center;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 10000, behavior: "smooth" });
  }, [combinedResults]);

  const showResults = shouldShowResults && !!combinedResults.length;

  const hasLocationMarkers =
    expansionCenter === null ||
    !locationWithinRadius ||
    locationWithinRadius.length > 0;

  return !showResults ? null : (
    <div
      style={{
        zIndex: Z_INDEX.MOBILE_SEARCH_RESULTS,
      }}
      className={cn("pointer-events-none absolute inset-0 flex flex-col", {
        "bg-background": shouldShowResults && !!combinedResults.length,
      })}
    >
      <Responsive maxWidth={BreakPoints.LG}>
        <div
          className={classNames(
            "pointer-events-auto flex flex-1 items-end",
            hasLocationMarkers ? "max-h-svh" : "max-h-[43vh]",
          )}
          ref={scrollRef}
        >
          <div
            className={classNames(
              "mt-auto flex flex-1 flex-col-reverse overflow-y-scroll",
              hasLocationMarkers ? "" : "max-h-[43vh]",
            )}
          >
            {combinedResults.map((result, index) =>
              isF3MapSearchResult(result) ? (
                <PlaceRowF3 key={result.destination.id} result={result} />
              ) : (
                <PlaceRowMap
                  key={result.destination.id}
                  result={result}
                  focused={index === 0}
                />
              ),
            )}
          </div>
        </div>
        {/* Spacer to ensure searchbar is visible */}
        <div className="pointer-events-none h-14 w-full" />
      </Responsive>
    </div>
  );
};
