import dynamicImport from "next/dynamic";

import { RERENDER_LOGS } from "@f3/shared/common/constants";

import { api } from "~/trpc/server";
import { MapLayoutItems } from "../_components/map-layout-items";
import { MapPageWrapper } from "../_components/map-page-wrapper";

const LeafletMap = dynamicImport(
  () => import("~/app/_components/map/leaflet-map"),
  { ssr: false },
);

export default async function MapPage() {
  RERENDER_LOGS && console.log("MapPage rerender");
  const markerLocations = await api.location.getLocationMarkersSparse();
  return (
    <MapPageWrapper>
      {/* Must have relative so that absolute things show up on the map */}
      <main className="pointer-events-auto relative">
        <LeafletMap markerLocations={markerLocations} />
        <MapLayoutItems />
      </main>
    </MapPageWrapper>
  );
}
