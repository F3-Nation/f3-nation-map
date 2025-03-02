import { Suspense } from "react";
import dynamicImport from "next/dynamic";

import { RERENDER_LOGS } from "@acme/shared/common/constants";

import { MapLayoutItems } from "~/app/_components/map-layout-items";
import { MapPageWrapper } from "~/app/_components/map-page-wrapper";
import { ssg } from "~/trpc/ssg";

const DynamicImportLeafletMap = dynamicImport(
  () => import("~/app/_components/map/leaflet-map"),
  { ssr: false },
);

export default async function MapPage() {
  const locationMarkersSparse =
    await ssg.location.getLocationMarkersSparse.fetch();

  RERENDER_LOGS && console.log("MapPage rerender");

  return (
    <MapPageWrapper>
      {/* Must have relative so that absolute things show up on the map */}
      <main className="pointer-events-auto relative">
        <Suspense fallback={<div>Loading...</div>}>
          <DynamicImportLeafletMap sparseLocations={locationMarkersSparse} />
        </Suspense>
        <MapLayoutItems />
      </main>
    </MapPageWrapper>
  );
}
