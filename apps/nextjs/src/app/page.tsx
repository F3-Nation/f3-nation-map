import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";

import { appRouter } from "@f3/api";
import { RERENDER_LOGS } from "@f3/shared/common/constants";

import type { RouterOutputs } from "~/trpc/types";
import { MapLayoutItems } from "~/app/_components/map-layout-items";
import { MapPageWrapper } from "~/app/_components/map-page-wrapper";
import { api } from "~/trpc/server";
import { clientUtils } from "~/trpc/server-side-react-helpers";
import { DynamicLeafletMap } from "./_components/map/dynamic-leaflet-map";

export async function generateStaticParams() {
  // const ssg = serverSideHelpers;
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: {},
    transformer: superjson,
  });

  // await ssg.location.getAllLocationMarkers.fetch({ count: 5 });
  // await ssg.location.getLocationMarkersSparse.fetch();
  const result = await ssg.location.getAllLocationMarkers.fetch();
  const previewResult = await ssg.location.getPreviewLocations.fetch();
  console.log("result", result);
  console.log("previewResult", previewResult);

  const markerLocationsSparse = await api.location.getLocationMarkersSparse();
  const markerLocations = await api.location.getAllLocationMarkers();
  return { markerLocations, markerLocationsSparse };
}

export default async function MapPage({
  params,
}: {
  params: {
    markerLocations: RouterOutputs["location"]["getAllLocationMarkers"];
    markerLocationsSparse: RouterOutputs["location"]["getLocationMarkersSparse"];
  };
}) {
  RERENDER_LOGS && console.log("MapPage rerender");

  clientUtils.location.getAllLocationMarkers.setData(
    undefined,
    params.markerLocations,
  );

  return (
    <MapPageWrapper>
      {/* Must have relative so that absolute things show up on the map */}
      <main className="pointer-events-auto relative">
        <DynamicLeafletMap markerLocations={params.markerLocationsSparse} />
        <MapLayoutItems />
      </main>
    </MapPageWrapper>
  );
}
