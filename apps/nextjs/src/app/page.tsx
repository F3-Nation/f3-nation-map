import { Suspense } from "react";
import dynamicImport from "next/dynamic";

import { RERENDER_LOGS } from "@acme/shared/common/constants";

import { MapLayoutItems } from "~/app/_components/map-layout-items";
import { MapPageWrapper } from "~/app/_components/map-page-wrapper";
import { ssg } from "~/trpc/ssg";
import { FilteredMapResultsProvider } from "./_components/map/filtered-map-results-provider";
import { TextSearchResultsProvider } from "./_components/map/search-results-provider";

const DynamicImportLeafletMap = dynamicImport(
  () => import("~/app/_components/map/leaflet-map"),
  { ssr: false },
);

export default async function MapPage() {
  const locationMarkersSparse =
    await ssg.location.getLocationMarkersSparse.fetch();
  const filteredMapResultsData =
    await ssg.location.allLocationMarkerFilterData.fetch();

  RERENDER_LOGS && console.log("MapPage rerender");

  return (
    <FilteredMapResultsProvider
      allLocationMarkers={locationMarkersSparse}
      lowBandwidthAllLocationMarkerFilterData={filteredMapResultsData}
    >
      {/* Textsearch results provider must be inside FilteredMapResultsProvider */}
      <TextSearchResultsProvider>
        <MapPageWrapper>
          {/* Must have relative so that absolute things show up on the map */}
          <main className="pointer-events-auto relative">
            <Suspense fallback={<div>Loading...</div>}>
              <DynamicImportLeafletMap
                sparseLocations={locationMarkersSparse}
              />
            </Suspense>
            <MapLayoutItems />
          </main>
        </MapPageWrapper>
      </TextSearchResultsProvider>
    </FilteredMapResultsProvider>
  );
}
