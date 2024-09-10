import dynamicImport from "next/dynamic";

import { RERENDER_LOGS } from "@f3/shared/common/constants";

import MapDrawer from "~/app/_components/map/map-drawer";
import { api } from "~/trpc/server";

const LeafletMap = dynamicImport(
  () => import("~/app/_components/map/leaflet-map"),
  {
    ssr: false,
    loading: () => (
      <img src="/placeholder_map.png" className="h-full w-full object-cover" />
    ),
  },
);

export default async function MapPage() {
  RERENDER_LOGS && console.log("MapPage rerender");
  const markerLocations = await api.location.getLocationMarkersSparse();
  return (
    <main className="pointer-events-auto min-h-dvh">
      <LeafletMap markerLocations={markerLocations} />
      <MapDrawer />
    </main>
  );
}
