// import dynamicImport from "next/dynamic";

import { RERENDER_LOGS } from "@f3/shared/common/constants";

import MapDrawer from "~/app/_components/map/map-drawer";
// import { api } from "~/trpc/server";
import { CustomMap } from "./server-leaflet-map";

// const LeafletMap = dynamicImport(
//   () => import("~/app/_components/map/leaflet-map"),
//   { ssr: false },
// );

export default async function MapPage() {
  RERENDER_LOGS && console.log("MapPage rerender");
  // const markerLocations = await api.location.getLocationMarkersSparse();
  return (
    <main className="pointer-events-auto">
      {/* <LeafletMap markerLocations={markerLocations} /> */}
      <CustomMap />
      <MapDrawer />
    </main>
  );
}
