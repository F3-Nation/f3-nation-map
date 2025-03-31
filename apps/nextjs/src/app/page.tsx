import { Suspense } from "react";

import { RERENDER_LOGS } from "@acme/shared/common/constants";

import { MapPageWrapper } from "~/app/_components/map-page-wrapper";
import { GoogleMapComponent } from "~/app/_components/map/google-map";
import { ssg } from "~/trpc/ssg";
import { FilteredMapResultsProvider } from "./_components/map/filtered-map-results-provider";
import { TextSearchResultsProvider } from "./_components/map/search-results-provider";

export default async function MapPage() {
  const locationMarkersSparse =
    await ssg.location.getLocationMarkersSparse.fetch();
  const filteredMapResultsData =
    await ssg.location.allLocationMarkerFilterData.fetch();
  const regionsWithLocationData =
    await ssg.location.getRegionsWithLocation.fetch();

  RERENDER_LOGS && console.log("MapPage rerender");

  return (
    <FilteredMapResultsProvider
      allLocationMarkers={locationMarkersSparse}
      lowBandwidthAllLocationMarkerFilterData={filteredMapResultsData}
    >
      {/* Textsearch results provider must be inside FilteredMapResultsProvider */}
      <TextSearchResultsProvider
        regionsWithLocationData={regionsWithLocationData}
      >
        <MapPageWrapper>
          <main className="pointer-events-auto relative h-dvh w-full">
            {/* Must have relative so that absolute things show up on the map */}
            <Suspense>
              <GoogleMapComponent />
            </Suspense>
          </main>
        </MapPageWrapper>
      </TextSearchResultsProvider>
    </FilteredMapResultsProvider>
  );
}
