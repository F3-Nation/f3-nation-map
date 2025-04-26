import { Suspense } from "react";

import { RERENDER_LOGS } from "@acme/shared/common/constants";

import { MapPageWrapper } from "~/app/_components/map-page-wrapper";
import { FilteredMapResultsProvider } from "~/app/_components/map/filtered-map-results-provider";
import { GoogleMapComponent } from "~/app/_components/map/google-map";
import { InitialLocationProvider } from "~/app/_components/map/initial-location-provider";
import { ReactQueryHydrator } from "~/app/_components/map/react-query-hydrator";
import { TextSearchResultsProvider } from "~/app/_components/map/search-results-provider";
import { ssg } from "~/trpc/ssg";
import { TouchDeviceProvider } from "~/utils/touch-device-provider";

export default async function MapPage() {
  const mapEventAndLocationData =
    await ssg.location.getMapEventAndLocationData.fetch();
  const regionsWithLocationData =
    await ssg.location.getRegionsWithLocation.fetch();

  RERENDER_LOGS && console.log("MapPage rerender");

  return (
    <ReactQueryHydrator mapEventAndLocationData={mapEventAndLocationData}>
      <TouchDeviceProvider>
        <InitialLocationProvider>
          <FilteredMapResultsProvider>
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
        </InitialLocationProvider>
      </TouchDeviceProvider>
    </ReactQueryHydrator>
  );
}
