import dynamicImport from "next/dynamic";

import type { RouterOutputs } from "~/trpc/types";

const DynamicImportLeafletMap = dynamicImport(
  () => import("~/app/_components/map/leaflet-map"),
  { ssr: false },
);

export const DynamicLeafletMap = async ({
  markerLocations,
}: {
  markerLocations: RouterOutputs["location"]["getLocationMarkersSparse"];
}) => {
  return <DynamicImportLeafletMap markerLocations={markerLocations} />;
};
