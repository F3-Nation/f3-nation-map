import dynamicImport from "next/dynamic";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";

import { appRouter, createTRPCContext } from "@f3/api";
import { RERENDER_LOGS } from "@f3/shared/common/constants";

import { MapLayoutItems } from "~/app/_components/map-layout-items";
import { MapPageWrapper } from "~/app/_components/map-page-wrapper";

const DynamicImportLeafletMap = dynamicImport(
  () => import("~/app/_components/map/leaflet-map"),
  { ssr: false },
);

export default async function MapPage() {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createTRPCContext({
      headers: null,
      session: "none",
    }),
    transformer: superjson,
  });

  // const locationMarkersSparse = await api.location.getLocationMarkersSparse()
  const locationMarkersSparse =
    await ssg.location.getLocationMarkersSparse.fetch();

  RERENDER_LOGS && console.log("MapPage rerender");

  return (
    <MapPageWrapper>
      {/* Must have relative so that absolute things show up on the map */}
      <main className="pointer-events-auto relative">
        <DynamicImportLeafletMap sparseLocations={locationMarkersSparse} />
        <MapLayoutItems />
      </main>
    </MapPageWrapper>
  );
}
