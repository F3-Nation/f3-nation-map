"use client";

// Importing necessary modules and components.

// Importing type definitions and constants.
import { useEffect, useRef } from "react";

import { BreakPoints, SnapPoint } from "@f3/shared/app/constants"; // Type import for SnapPoint.

import { RERENDER_LOGS } from "@f3/shared/common/constants";
import { cn } from "@f3/ui";

import { useTextSearchResults } from "~/app/_components/map/search-results-provider";
// Importing mock data and UI components.

import { Responsive } from "~/utils/responsive";
import { drawerStore } from "~/utils/store/drawer";
import { filterStore } from "~/utils/store/filter";
import { searchStore } from "~/utils/store/search";
import { isF3MapSearchResult } from "~/utils/types";
import { DrawerAllFilters } from "./drawer-all-filters";
import { DrawerSomeFilters } from "./drawer-some-filters";
import { MapSearchBoxMobile } from "./map-searchbox-mobile";
import { PlaceRowF3 } from "./place-row-f3";
import { PlaceRowMap } from "./place-row-map";
import SelectedItem from "./selected-item";
import { useSelectedItem } from "./use-selected-item";

// Defining items for the filter options with their names and corresponding SVG components or image paths.

// The main component for the map drawer.
const MapDrawer = () => {
  RERENDER_LOGS && console.log("MapDrawer rerender");
  const snap = drawerStore.use.snap();
  const shouldShowResults = searchStore.use.shouldShowResults();
  const { selectedLocation, selectedEvent } = useSelectedItem();
  const { combinedResults } = useTextSearchResults();
  const scrollRef = useRef<HTMLDivElement>(null);
  const allFilters = filterStore.use.allFilters();

  useEffect(() => {
    if (snap === SnapPoint["pt-150px"]) {
      filterStore.setState({ allFilters: false });
    }
  }, [snap]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 10000, behavior: "smooth" });
  }, [combinedResults]);

  const showResults = shouldShowResults && !!combinedResults.length;

  return (
    <Responsive maxWidth={BreakPoints.LG}>
      {allFilters ? (
        <div className="absolute inset-0 z-[1000] bg-background">
          <DrawerAllFilters />
        </div>
      ) : (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 z-[1000] flex flex-col",
            { "bg-background": shouldShowResults && !!combinedResults.length },
          )}
        >
          <div className="max-h-svh flex-1 overflow-y-scroll" ref={scrollRef}>
            {!showResults && !!selectedLocation && !!selectedEvent ? (
              <SelectedItem
                selectedLocation={selectedLocation}
                selectedEvent={selectedEvent}
              />
            ) : !showResults ? (
              <div className="flex w-full flex-row justify-center">
                <DrawerSomeFilters />
              </div>
            ) : (
              <div className="flex  flex-col-reverse justify-end pt-[100%]">
                {combinedResults.map((result) =>
                  isF3MapSearchResult(result) ? (
                    <PlaceRowF3 key={result.destination.id} result={result} />
                  ) : (
                    <PlaceRowMap key={result.destination.id} result={result} />
                  ),
                )}
              </div>
            )}
          </div>

          <MapSearchBoxMobile className="my-3" />
        </div>
      )}
    </Responsive>
  );
};

export default MapDrawer;
